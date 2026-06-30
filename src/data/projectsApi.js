/**
 * projectsApi.js
 * Thin client for the game's project backend (Express locally, serverless in
 * production). All calls hit /api/projects and are proxied to the backend by
 * Vite in dev (see vite.config.js).
 */

const BASE = '/api'

async function asJson(res) {
  let body = null
  try { body = await res.json() } catch {}
  return { ok: res.ok, status: res.status, body }
}

/** Published catalogue for the game. Throws on network/HTTP error. */
export async function fetchPublishedProjects() {
  const res = await fetch(`${BASE}/projects`)
  if (!res.ok) throw new Error('Failed to load projects (' + res.status + ')')
  const data = await res.json()
  return data.projects || []
}

/** Full catalogue incl. drafts (admin view). */
export async function fetchAllProjects() {
  const res = await fetch(`${BASE}/projects?all=1`)
  if (!res.ok) throw new Error('Failed to load projects (' + res.status + ')')
  const data = await res.json()
  return data.projects || []
}

/** Allowed execution-team ids from the backend. */
export async function fetchTeams() {
  try {
    const res = await fetch(`${BASE}/teams`)
    if (!res.ok) return []
    return (await res.json()).teams || []
  } catch { return [] }
}

/** Create. Returns { ok, project } or { ok:false, errors }. */
export async function createProject(input) {
  const res = await fetch(`${BASE}/projects`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input),
  })
  const { ok, body } = await asJson(res)
  return ok ? { ok: true, project: body.project } : { ok: false, errors: body?.errors || { _: body?.error || 'Request failed' } }
}

/** Update by id. Returns { ok, project } or { ok:false, errors }. */
export async function updateProject(id, input) {
  const res = await fetch(`${BASE}/projects/${encodeURIComponent(id)}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input),
  })
  const { ok, body } = await asJson(res)
  return ok ? { ok: true, project: body.project } : { ok: false, errors: body?.errors || { _: body?.error || 'Request failed' } }
}

/** Delete by id. Returns { ok }. */
export async function deleteProject(id) {
  const res = await fetch(`${BASE}/projects/${encodeURIComponent(id)}`, { method: 'DELETE' })
  return { ok: res.ok }
}
