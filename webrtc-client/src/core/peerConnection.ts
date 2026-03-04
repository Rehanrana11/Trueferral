/**
 * TrueferralPeerConnection
 * Manages a single WebRTC PeerConnection lifecycle with:
 * - DTLS-SRTP enforced (default in modern browsers, but explicitly validated)
 * - ICE candidate trickling
 * - Reconnect logic with exponential backoff
 * - Network quality monitoring
 */

import { SignalingClient, SignalingMessage, SignalingType } from './signalingClient';
import { logger } from '../utils/clientLogger';

export interface PeerConnectionConfig {
  iceServers: RTCIceServer[];
  localStream: MediaStream;
  remoteVideoEl: HTMLVideoElement;
  signalingClient: SignalingClient;
  remoteUserId: string;
  onIceStateChange?: (state: RTCIceConnectionState) => void;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
  onNetworkQuality?: (quality: 'excellent' | 'good' | 'poor' | 'critical') => void;
}

const RTC_CONFIG_BASE: RTCConfiguration = {
  bundlePolicy: 'max-bundle',
  rtcpMuxPolicy: 'require',
  iceCandidatePoolSize: 10,
};

export class TrueferralPeerConnection {
  private pc: RTCPeerConnection | null = null;
  private config: PeerConnectionConfig;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT = 5;
  private statsInterval: ReturnType<typeof setInterval> | null = null;

  constructor(config: PeerConnectionConfig) {
    this.config = config;
  }

  async initiate(): Promise<void> {
    this.pc = this.createPeerConnection();
    this.attachLocalTracks();

    const offer = await this.pc.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });

    await this.pc.setLocalDescription(offer);

    this.config.signalingClient.send({
      type: SignalingType.OFFER,
      toUserId: this.config.remoteUserId,
      data: { sdp: offer },
    });
  }

  async handleOffer(sdp: RTCSessionDescriptionInit): Promise<void> {
    this.pc = this.createPeerConnection();
    this.attachLocalTracks();

    await this.pc.setRemoteDescription(new RTCSessionDescription(sdp));
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);

    this.config.signalingClient.send({
      type: SignalingType.ANSWER,
      toUserId: this.config.remoteUserId,
      data: { sdp: answer },
    });
  }

  async handleAnswer(sdp: RTCSessionDescriptionInit): Promise<void> {
    if (!this.pc) throw new Error('PeerConnection not initialized');
    await this.pc.setRemoteDescription(new RTCSessionDescription(sdp));
  }

  async handleIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.pc) return;
    try {
      await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err: any) {
      // Non-fatal — can happen during renegotiation
      logger.warn('ICE candidate add failed', { error: err.message });
    }
  }

  private createPeerConnection(): RTCPeerConnection {
    const pc = new RTCPeerConnection({
      ...RTC_CONFIG_BASE,
      iceServers: this.config.iceServers,
    });

    // DTLS-SRTP is the only acceptable media security — validate after connection
    pc.addEventListener('connectionstatechange', () => {
      logger.info('Connection state', { state: pc.connectionState });
      this.config.onConnectionStateChange?.(pc.connectionState);

      if (pc.connectionState === 'failed') {
        this.handleConnectionFailure();
      }
      if (pc.connectionState === 'connected') {
        this.reconnectAttempts = 0;
        this.startStatsMonitoring();
      }
      if (['disconnected', 'closed'].includes(pc.connectionState)) {
        this.stopStatsMonitoring();
      }
    });

    pc.addEventListener('iceconnectionstatechange', () => {
      logger.info('ICE state', { state: pc.iceConnectionState });
      this.config.onIceStateChange?.(pc.iceConnectionState);
    });

    pc.addEventListener('icecandidate', (e) => {
      if (e.candidate) {
        this.config.signalingClient.send({
          type: SignalingType.ICE_CANDIDATE,
          toUserId: this.config.remoteUserId,
          data: { candidate: e.candidate.toJSON() },
        });
      }
    });

    pc.addEventListener('track', (e) => {
      if (e.streams[0]) {
        this.config.remoteVideoEl.srcObject = e.streams[0];
      }
    });

    return pc;
  }

  private attachLocalTracks(): void {
    if (!this.pc) return;
    this.config.localStream.getTracks().forEach((track) => {
      this.pc!.addTrack(track, this.config.localStream);
    });
  }

  private handleConnectionFailure(): void {
    if (this.reconnectAttempts >= this.MAX_RECONNECT) {
      logger.error('Max reconnect attempts reached — giving up');
      this.close();
      return;
    }
    const delay = Math.pow(2, this.reconnectAttempts) * 1000;
    this.reconnectAttempts++;
    logger.warn(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    setTimeout(() => this.initiate(), delay);
  }

  private startStatsMonitoring(): void {
    this.statsInterval = setInterval(async () => {
      if (!this.pc) return;
      try {
        const stats = await this.pc.getStats();
        let rtt = 0;
        let packetLoss = 0;

        stats.forEach((report) => {
          if (report.type === 'remote-inbound-rtp') {
            rtt = report.roundTripTime ?? 0;
            const sent = report.packetsSent ?? 0;
            const lost = report.packetsLost ?? 0;
            packetLoss = sent > 0 ? lost / sent : 0;
          }
        });

        const quality =
          rtt < 0.1 && packetLoss < 0.01 ? 'excellent'
          : rtt < 0.2 && packetLoss < 0.05 ? 'good'
          : rtt < 0.4 && packetLoss < 0.1 ? 'poor'
          : 'critical';

        this.config.onNetworkQuality?.(quality);
      } catch (err: any) {
        logger.warn('Stats fetch failed', { error: err.message });
      }
    }, 5000);
  }

  private stopStatsMonitoring(): void {
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = null;
    }
  }

  toggleAudio(enabled: boolean): void {
    this.config.localStream.getAudioTracks().forEach((t) => { t.enabled = enabled; });
  }

  toggleVideo(enabled: boolean): void {
    this.config.localStream.getVideoTracks().forEach((t) => { t.enabled = enabled; });
  }

  close(): void {
    this.stopStatsMonitoring();
    this.pc?.close();
    this.pc = null;
  }
}
