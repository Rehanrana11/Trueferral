// ─── Shared Types — Trueferral WebRTC ────────────────────────────────────────
// Used by signaling-server AND webrtc-client to ensure contract alignment

export type UserRole = 'host' | 'participant' | 'moderator';
export type SessionStatus = 'scheduled' | 'live' | 'ended' | 'archived';

export interface VideoCallSession {
  sessionId: string;
  roomId: string;
  hostUserId: string;
  participantUserIds: string[];
  status: SessionStatus;
  createdAt: number;
  startedAt?: number;
  endedAt?: number;
}

export interface IceServerConfig {
  urls: string | string[];
  username?: string;
  credential?: string;
}

export interface RtcConfig {
  iceServers: IceServerConfig[];
  bundlePolicy: 'balanced' | 'max-compat' | 'max-bundle';
  rtcpMuxPolicy: 'negotiate' | 'require';
}

export interface NetworkQualityReport {
  roundTripTimeMs: number;
  packetLossPercent: number;
  quality: 'excellent' | 'good' | 'poor' | 'critical';
  timestamp: number;
}
