/**
 * scormService.js
 * Handles SCORM learner identity via window.postMessage from a SCORM wrapper iframe.
 *
 * isMockScormMode is hardcoded to true for the current prototype.
 * The SCORM production flow is preserved below for future use.
 *
 * TODO: When TalentLMS + SCORM wrapper is connected:
 *   1. Set isMockScormMode = false (or gate on VITE_USE_REAL_API env var).
 *   2. The SCORM wrapper iframe will postMessage { type: 'scorm-identity', learnerId, learnerName }.
 *   3. This service will resolve that identity and pass it to PlayerSetupScreen.
 */

const MOCK_LEARNER_IDENTITY = {
  learnerId: 'demo-001',
  learnerName: 'Demo Learner',
}

/**
 * isMockScormMode is hardcoded true for the prototype.
 * TODO: Change to rely on env var when real SCORM is connected:
 *   export const isMockScormMode = import.meta.env.VITE_USE_REAL_API !== 'true'
 */
export const isMockScormMode = true

/**
 * Returns a Promise that resolves with learner identity.
 *
 * In mock mode       -> resolves immediately with MOCK_LEARNER_IDENTITY.
 * In production mode -> waits for a 'scorm-identity' postMessage from the
 *                       SCORM wrapper, with a configurable timeout.
 */
export function receiveScormLearnerIdentity({ timeoutMs = 8000 } = {}) {
  if (isMockScormMode) {
    console.info('[SCORM] Mock mode active — using demo identity:', MOCK_LEARNER_IDENTITY)
    return Promise.resolve(MOCK_LEARNER_IDENTITY)
  }

  // TODO: Production SCORM flow (re-enable when TalentLMS wrapper is connected)
  return new Promise((resolve, reject) => {
    let settled = false

    const timer = setTimeout(() => {
      if (settled) return
      settled = true
      window.removeEventListener('message', handler)
      reject(new Error('SCORM identity timeout — no message received within ' + timeoutMs + 'ms'))
    }, timeoutMs)

    function handler(event) {
      const data = event.data
      if (!data || data.type !== 'scorm-identity') return
      if (!data.learnerId) return
      if (settled) return
      settled = true
      clearTimeout(timer)
      window.removeEventListener('message', handler)

      const identity = {
        learnerId: String(data.learnerId),
        learnerName: String(data.learnerName || data.studentName || 'Learner'),
      }

      console.info('[SCORM] Received learner identity:', identity)
      resolve(identity)
    }

    window.addEventListener('message', handler)
  })
}

/**
 * Dev utility: fires the same postMessage a real SCORM wrapper would send.
 * Call from the browser console to test the production flow locally.
 *
 * Usage:
 *   import { simulateScormMessage } from '@/services/scormService'
 *   simulateScormMessage({ learnerId: 'test-123', learnerName: 'Jane Doe' })
 */
export function simulateScormMessage(identity = MOCK_LEARNER_IDENTITY) {
  window.postMessage({ type: 'scorm-identity', ...identity }, '*')
}
