/**
 * MediaManager
 * Handles camera/microphone acquisition with:
 * - Permission error handling (NotAllowed, NotFound, OverConstrained)
 * - Device enumeration + selection
 * - Track cleanup on close
 */

import { logger } from '../utils/clientLogger';

export type MediaPermissionError =
  | 'permission_denied'
  | 'device_not_found'
  | 'device_in_use'
  | 'browser_not_supported'
  | 'unknown';

export interface MediaResult {
  stream: MediaStream | null;
  error: MediaPermissionError | null;
  errorMessage: string | null;
}

const DEFAULT_CONSTRAINTS: MediaStreamConstraints = {
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 48000,
  },
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30 },
    facingMode: 'user',
  },
};

export class MediaManager {
  private stream: MediaStream | null = null;

  async acquire(constraints: MediaStreamConstraints = DEFAULT_CONSTRAINTS): Promise<MediaResult> {
    if (!navigator.mediaDevices?.getUserMedia) {
      return { stream: null, error: 'browser_not_supported', errorMessage: 'getUserMedia not supported in this browser' };
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      logger.info('Media acquired', {
        audioTracks: this.stream.getAudioTracks().length,
        videoTracks: this.stream.getVideoTracks().length,
      });
      return { stream: this.stream, error: null, errorMessage: null };
    } catch (err: any) {
      const { error, message } = this.mapError(err);
      logger.warn('Media acquisition failed', { error, message });
      return { stream: null, error, errorMessage: message };
    }
  }

  async enumerateDevices(): Promise<{ audioInputs: MediaDeviceInfo[]; videoInputs: MediaDeviceInfo[] }> {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return {
      audioInputs: devices.filter((d) => d.kind === 'audioinput'),
      videoInputs: devices.filter((d) => d.kind === 'videoinput'),
    };
  }

  async switchCamera(deviceId: string): Promise<MediaResult> {
    const currentAudio = this.stream?.getAudioTracks()[0];
    const constraints: MediaStreamConstraints = {
      audio: currentAudio ? true : false,
      video: { deviceId: { exact: deviceId } },
    };
    this.release();
    return this.acquire(constraints);
  }

  getStream(): MediaStream | null {
    return this.stream;
  }

  release(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
      logger.info('Media tracks released');
    }
  }

  private mapError(err: DOMException): { error: MediaPermissionError; message: string } {
    switch (err.name) {
      case 'NotAllowedError':
      case 'PermissionDeniedError':
        return { error: 'permission_denied', message: 'Camera/microphone permission was denied.' };
      case 'NotFoundError':
      case 'DevicesNotFoundError':
        return { error: 'device_not_found', message: 'No camera or microphone found.' };
      case 'NotReadableError':
      case 'TrackStartError':
        return { error: 'device_in_use', message: 'Camera or microphone is already in use by another app.' };
      default:
        return { error: 'unknown', message: err.message };
    }
  }
}
