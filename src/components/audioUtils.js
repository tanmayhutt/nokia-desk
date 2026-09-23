// Procedural Web Audio sounds. The context is created lazily inside the first
// sound call, which always runs from a key press or tap, so browsers allow it.
let audioCtx = null
let enabled = true

export function setSoundEnabled(value) {
  enabled = Boolean(value)
  if (!enabled && audioCtx && audioCtx.state === 'running') {
    audioCtx.suspend().catch(() => {})
  }
}

function getContext() {
  if (!enabled || typeof window === 'undefined') return null
  const Ctor = window.AudioContext || window.webkitAudioContext
  if (!Ctor) return null
  try {
    if (!audioCtx) audioCtx = new Ctor()
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {})
    return audioCtx
  } catch {
    return null
  }
}

function tone(ctx, { type = 'square', from, to, start, duration, volume = 0.06, ramp = 'exp' }) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(from, start)
  if (to) osc.frequency.exponentialRampToValueAtTime(to, start + duration)
  gain.gain.setValueAtTime(volume, start)
  if (ramp === 'exp') gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  else gain.gain.linearRampToValueAtTime(0, start + duration)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(start)
  osc.stop(start + duration + 0.02)
}

function play(fn) {
  const ctx = getContext()
  if (!ctx) return
  try {
    fn(ctx, ctx.currentTime)
  } catch {
    // Audio is decorative. Never let it break input handling.
  }
}

export const playBeep = () =>
  play((ctx, t) => tone(ctx, { from: 2000, to: 800, start: t, duration: 0.03, volume: 0.05 }))

export const playSnakeEat = () =>
  play((ctx, t) => tone(ctx, { from: 800, to: 1200, start: t, duration: 0.1, volume: 0.08, ramp: 'linear' }))

export const playSnakeCrash = () =>
  play((ctx, t) => tone(ctx, { type: 'sawtooth', from: 200, to: 50, start: t, duration: 0.3, volume: 0.08, ramp: 'linear' }))

function melody(notes, type, volume) {
  play((ctx, t) => {
    let time = t
    notes.forEach(([f, d]) => {
      tone(ctx, { type, from: f, start: time, duration: d * 0.95, volume, ramp: 'linear' })
      time += d
    })
  })
}

// The classic Nokia tune, played as a boot chime.
export const playStartupChime = () =>
  melody(
    [
      [1318.51, 0.15], [1174.66, 0.15], [739.99, 0.3], [830.61, 0.3],
      [1108.73, 0.15], [987.77, 0.15], [587.33, 0.3], [659.25, 0.3],
      [987.77, 0.15], [880.0, 0.15], [554.37, 0.3], [659.25, 0.3], [880.0, 0.6],
    ],
    'sine',
    0.08,
  )

export const playSaulTheme = () =>
  melody([[196.0, 0.2], [293.66, 0.2], [392.0, 0.4], [349.23, 0.2], [293.66, 0.4]], 'square', 0.06)
