/**
 * scormService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Handles SCORM learner identity, delivered via window.postMessage from a
 * SCORM wrapper iframe (future) or simulated via mock data in dev mode.
 *
 * Architecture
 * ────────────
 * 1. The hosted game app is embedded inside a SCORM wrapper iframe on TalentLMS.
 * 2. The SCORM wrapper reads cmi.core.student_id / cmi.learner_id from the LMS.
 * 3. The wrapper sends identity to this app via window.postMessage.
 * 4. This service listens for that message and resolves the learner identity.
 *
 * TODO (future):
 *   - Validate the message origin against a known SCORM wrapper domain.
 *   - Support SCORM 2004 cmi.learner_id / cmi.learner_name alongside SCORM 1.2.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** @typedef {{ learnerId: string, learnerName: string }} LearnerIdentity */

/**
 * Dev-only mock learner identity.
 * Used when VITE_DEV_MOCK_SCORM=true (set in .env.development).
 * Replace with real SCORM postMessage data in production.
 */
const MOCK_LEARNER_IDENTITY = {
  learnerId: 'demo-001',
  learnerName: 'Demo Learner',
}

/**
 * Whether mock SCORM mode is active.
 * Reads the Vite env variable; defaults to false in production.
 */
export const isMockScormMode =
  import.meta.env.VITE_DEV_MOCK_SCORM === 'true'

/**
 * receiveScormLearnerIdentity
 * ─────────────────────────────────────────────────────────────────────────────
 * Returns a Promise that resolves with learner identity.
 *
 * In dev/mock mode   → resolves immediately with MOCK_LEARNER_IDENTITY.
 * In production mode → waits for a 'scorm-identity' postMessage from the
 *                      SCORM wrapper, with a configurable timeout.
 *
 * @param {object}  [options]
 * @param {number}  [options.timeoutMs=8000]   – ms to wait before timing out
 * @returns {Promise<LearnerIdentity>}
 */
export function receiveScormLearnerIdentity({ timeoutMs = 8000 } = {}) {
  // ── DEV MOCK MODE ──────────────────────────────────────────────────────────
  if (isMockScormMode) {
    console.info('[SCORM] Mock mode active – using dev identity:', MOCK_LEARNER_IDENTITY)
    return Promise.resolve(MOCK_LEARNER_IDENTITY)
  }

  // ── PRODUCTION: listen for postMessage from SCORM wrapper ──────────────────
  return new Promise((resolve, reject) => {
    let settled = false

    const timer = setTimeout(() => {
      if (settled) return
      settled = true
      window.removeEventListener('message', handler)
      reject(new Error('SCORM identity timeout – no message received within ' + timeoutMs + 'ms'))
    }, timeoutMs)

    function handler(event) {
      // TODO: lock this down to your SCORM wrapper's origin, e.g.:
      // if (event.origin !== 'https://your-talentlms-domain.com') return

      const data = event.data
      if (!data || data.type !== 'scorm-identity') return
      if (!data.learnerId) return

      if (settled) return
      settled = true
      clearTimeout(timer)
      window.removeEventListener('message', handler)

      /** @type {LearnerIdentity} */
      const identity = {
        learnerId: String(data.learnerId),
        // SCORM 1.2 sends cmi.core.student_name; SCORM 2004 sends cmi.learner_name
        learnerName: String(data.learnerName || data.studentName || 'Learner'),
      }

      console.info('[SCORM] Received learner identity:', identity)
      resolve(identity)
    }

    window.addEventListener('message', handler)
  })
}

/**
 * simulateScormMessage
 * ─────────────────────────────────────────────────────────────────────────────
 * Utility for local development: fires the same postMessage that a real
 * SCORM wrapper would send. Call from the browser console to test the flow.
 *
 * Usage:
 *   import { simulateScormMessage } from '@/services/scormService'
 *   simulateScormMessage({ learnerId: 'test-123', learnerName: 'Jane Doe' })
 */
export function simulateScormMessage(identity = MOCK_LEARNER_IDENTITY) {
  window.postMessage({ type: 'scorm-identity', ...identity }, '*')
}
