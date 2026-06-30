/**
 * GET /api/health  (Vercel serverless function)
 * Returns which storage backend is active (json locally, supabase in prod).
 */
import * as projects from '../lib/projects.js'

export default async function handler(req, res) {
  return res.status(200).json({ ok: true, storage: projects.STORAGE_BACKEND })
}
