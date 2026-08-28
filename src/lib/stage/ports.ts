/**
 * Voice/media port — implemented by RTCClient / mediasoup in Hubzz pre-alpha.
 * This HUD never imports mediasoup; bind a port when mounting StageShell for
 * a live native session.
 */

export interface VoicePort {
  setMicEnabled(on: boolean): Promise<void> | void
  setCamEnabled(on: boolean): Promise<void> | void
  setOutputMuted(muted: boolean): Promise<void> | void
}

let bound: VoicePort | null = null

export function bindVoicePort(port: VoicePort | null) {
  bound = port
}

export function getVoicePort() {
  return bound
}

/** Swallow port errors so a missing SFU never takes down the HUD. */
export function notifyVoicePort(fn: (port: VoicePort) => Promise<void> | void) {
  const port = bound
  if (!port) return
  try {
    void Promise.resolve(fn(port)).catch(() => undefined)
  } catch {
    /* port is best-effort */
  }
}
