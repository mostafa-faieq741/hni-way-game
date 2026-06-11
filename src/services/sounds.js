/**
 * sounds.js – tiny Web Audio sound engine (no audio files).
 * All effects are synthesized so the single-file build stays self-contained.
 * Respects a persisted mute flag (localStorage 'hni_muted').
 */

const MUTE_KEY = 'hni_muted'
let ctx = null
let muted = (() => { try { return localStorage.getItem(MUTE_KEY) === '1' } catch { return false } })()

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

export function isMuted() { return muted }
export function setMuted(v) {
  muted = !!v
  try { localStorage.setItem(MUTE_KEY, muted ? '1' : '0') } catch {}
}
export function toggleMuted() { setMuted(!muted); return muted }

function tone(freq, { t = 0, dur = 0.12, type = 'sine', vol = 0.16, slide = 0 } = {}) {
  const c = ac()
  if (!c) return
  const o = c.createOscillator()
  const g = c.createGain()
  const start = c.currentTime + t
  o.type = type
  o.frequency.setValueAtTime(freq, start)
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), start + dur)
  g.gain.setValueAtTime(0, start)
  g.gain.linearRampToValueAtTime(vol, start + 0.012)
  g.gain.exponentialRampToValueAtTime(0.0008, start + dur)
  o.connect(g).connect(c.destination)
  o.start(start)
  o.stop(start + dur + 0.05)
}

const FX = {
  click()    { tone(880, { dur: 0.05, type: 'triangle', vol: 0.08 }) },
  nav()      { tone(660, { dur: 0.06, type: 'triangle', vol: 0.09 }); tone(990, { t: 0.05, dur: 0.06, type: 'triangle', vol: 0.07 }) },
  coin()     { tone(990, { dur: 0.07, type: 'square', vol: 0.07 }); tone(1320, { t: 0.07, dur: 0.16, type: 'square', vol: 0.07 }) },
  spend()    { tone(440, { dur: 0.08, type: 'square', vol: 0.07 }); tone(330, { t: 0.08, dur: 0.12, type: 'square', vol: 0.06 }) },
  hire()     { tone(523, { dur: 0.08, type: 'triangle' }); tone(659, { t: 0.08, dur: 0.08, type: 'triangle' }); tone(784, { t: 0.16, dur: 0.14, type: 'triangle' }) },
  error()    { tone(220, { dur: 0.18, type: 'sawtooth', vol: 0.1, slide: -80 }) },
  alert()    { tone(587, { dur: 0.1, type: 'square', vol: 0.09 }); tone(587, { t: 0.16, dur: 0.1, type: 'square', vol: 0.09 }) },
  commit()   { tone(392, { dur: 0.1, type: 'triangle' }); tone(523, { t: 0.1, dur: 0.1, type: 'triangle' }); tone(659, { t: 0.2, dur: 0.18, type: 'triangle' }) },
  levelUp()  { [523, 659, 784, 1047].forEach((f, i) => tone(f, { t: i * 0.1, dur: 0.16, type: 'triangle', vol: 0.14 })) },
  fanfare()  { [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, { t: i * 0.09, dur: i === 4 ? 0.5 : 0.12, type: 'triangle', vol: 0.15 })) },
  badge()    { tone(1047, { dur: 0.09, type: 'triangle', vol: 0.12 }); tone(1319, { t: 0.09, dur: 0.22, type: 'triangle', vol: 0.12 }) },
  lose()     { [392, 349, 311, 262].forEach((f, i) => tone(f, { t: i * 0.16, dur: 0.22, type: 'triangle', vol: 0.13 })) },
}

export function play(name) {
  if (muted) return
  try { FX[name] && FX[name]() } catch {}
}
