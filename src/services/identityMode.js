/**
 * identityMode.js — decide whether the game launched inside an LMS (SCORM) or
 * standalone. LMS launch => use the LMS learner identity (skip the login form).
 * Standalone => normal username/password sign-in.
 */
export function inLmsContext() {
  try {
    const p = new URLSearchParams(window.location.search)
    if (p.get('lms') === '1' || p.get('scorm') === '1') return true
    if (import.meta.env.VITE_FORCE_SCORM === 'true') return true
    // Embedded in an iframe (typical LMS launch).
    return window.self !== window.top
  } catch {
    // Cross-origin access to window.top throws => we are embedded in an LMS.
    return true
  }
}
