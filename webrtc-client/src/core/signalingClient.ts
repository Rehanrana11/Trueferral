/**
 * SignalingClient
 * Manages the WebSocket connection to the Trueferral signaling server.
 * - Token-based auth (appended as query param, never in URL path)
 * - Auto-reconnect with exponential backoff
 * - Message queue during reconnect
 * - Strict message parsing
 */

import { logger } from '../utils/clientLogger';

export enum SignalingType {
  OFFER = 'offer',
  ANSWER = 'answer',
  ICE_CANDIDATE = 'ice-candidate',
  PEER_JOINED = 'peer-joined',
  PEER_LEFT = 'peer-left',
  ICE_CONFIG = 'ice-config',
  LEAVE = 'leave',
  MUTE_AUDIO = 'mute-audio',
  MUTE_VIDEO = 'mute-video',
  ERROR = 'error',
}

export interface SignalingMessage {
  type: SignalingType;
  fromUserId?: string;
  toUserId?: string;
  roomId?: string;
  data?: Record<string, unknown>;
}

export type MessageHandler = (msg: SignalingMessage) => void;

interface SignalingClientOptions {
  /** Base WSS URL, e.g. wss://signaling.trueferral.com/ws */
  serverUrl: string;
  /** Short-lived token from backend — never hardcoded */
  token: string;
  roomId: string;
  userId: string;
  onMessage: MessageHandler;
  onOpen?: () => void;
  onClose?: (code: number, reason: string) => void;
  onError?: (err: Event) => void;
}

const MAX_RECONNECT_ATTEMPTS = 10;

export class SignalingClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private messageQueue: string[] = [];
  private intentionalClose = false;
  private readonly opts: SignalingClientOptions;

  constructor(opts: SignalingClientOptions) {
    this.opts = opts;
  }

  connect(): void {
    this.intentionalClose = false;
    this.createSocket();
  }

  send(msg: Omit<SignalingMessage, 'fromUserId' | 'roomId'>): void {
    const full: SignalingMessage = {
      ...msg,
      fromUserId: this.opts.userId,
      roomId: this.opts.roomId,
    };
    const payload = JSON.stringify(full);

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(payload);
    } else {
      // Queue message for after reconnect
      this.messageQueue.push(payload);
      logger.warn('WS not open — message queued', { type: msg.type });
    }
  }

  disconnect(): void {
    this.intentionalClose = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close(1000, 'User disconnected');
  }

  private createSocket(): void {
    // Build URL — token is a query param, never a path segment
    const url = new URL(this.opts.serverUrl);
    url.searchParams.set('token', this.opts.token);
    url.searchParams.set('roomId', this.opts.roomId);

    this.ws = new WebSocket(url.toString());

    this.ws.onopen = () => {
      logger.info('Signaling WS connected');
      this.reconnectAttempts = 0;

      // Drain queue
      while (this.messageQueue.length > 0) {
        const msg = this.messageQueue.shift();
        if (msg) this.ws!.send(msg);
      }

      this.opts.onOpen?.();
    };

    this.ws.onmessage = (event) => {
      try {
        const msg: SignalingMessage = JSON.parse(event.data);
        if (!msg.type) throw new Error('Missing type');
        this.opts.onMessage(msg);
      } catch (err: any) {
        logger.error('Invalid signaling message', { error: err.message });
      }
    };

    this.ws.onclose = (event) => {
      logger.info('Signaling WS closed', { code: event.code });
      this.opts.onClose?.(event.code, event.reason);

      // Intentional closes (4000-4004) = do not retry
      if (!this.intentionalClose && event.code < 4000) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (event) => {
      logger.error('Signaling WS error');
      this.opts.onError?.(event);
    };
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      logger.error('Max signaling reconnect attempts reached');
      return;
    }
    const delay = Math.min(Math.pow(2, this.reconnectAttempts) * 1000, 30_000);
    this.reconnectAttempts++;
    logger.warn(`Reconnecting signaling in ${delay}ms (attempt ${this.reconnectAttempts})`);
    this.reconnectTimer = setTimeout(() => this.createSocket(), delay);
  }
}
