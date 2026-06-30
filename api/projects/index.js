/**
 * /api/projects  (Vercel serverless function)
 *   GET  -> list projects (?all=1 includes unpublished/drafts)
 *   POST -> create a project (validates input)
 */
import * as projects from '../../lib/projects.js'

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const all = req.query.all === '1' || req.query.all === 'true'
      const list = await projects.listProjects({ includeUnpublished: all })
      return res.status(200).json({ projects: list })
    }
    if (req.method === 'POST') {
      const result = await projects.createProject(req.body || {})
      if (result.errors) return res.status(400).json({ errors: result.errors })
      return res.status(201).json({ project: result.project })
    }
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
