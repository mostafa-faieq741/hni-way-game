/**
 * GET /api/teams  (Vercel serverless function)
 * Execution-team ids the admin may assign to a project.
 */
import * as projects from '../lib/projects.js'

export default async function handler(req, res) {
  return res.status(200).json({ teams: projects.VALID_TEAM_IDS })
}
