/**
 * /api/projects/:id  (Vercel serverless function)
 *   GET    -> one project
 *   PUT    -> update
 *   DELETE -> remove
 */
import * as projects from '../lib/projects.js'

export default async function handler(req, res) {
  const { id } = req.query
  try {
    if (req.method === 'GET') {
      const p = await projects.getProject(id)
      if (!p) return res.status(404).json({ error: 'Project not found' })
      return res.status(200).json({ project: p })
    }
    if (req.method === 'PUT') {
      const result = await projects.updateProject(id, req.body || {})
      if (result.notFound) return res.status(404).json({ error: 'Project not found' })
      if (result.errors) return res.status(400).json({ errors: result.errors })
      return res.status(200).json({ project: result.project })
    }
    if (req.method === 'DELETE') {
      const result = await projects.deleteProject(id)
      if (result.notFound) return res.status(404).json({ error: 'Project not found' })
      return res.status(200).json({ project: result.project })
    }
    res.setHeader('Allow', 'GET, PUT, DELETE')
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
