/**
 * api/server.js
 * Local development backend (Express) for the HNI Way game.
 *
 *   npm run dev:api      # starts this on http://localhost:3001
 *   npm run dev          # Vite on 5173, proxies /api -> 3001 (see vite.config.js)
 *
 * In production these same routes deploy as serverless functions; the storage
 * adapter (local JSON vs Supabase) is chosen automatically from env vars.
 */

import express from 'express'
import cors from 'cors'
import * as projects from './lib/projects.js'

const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' }))

const PORT = process.env.PORT || 3001

app.get('/api/health', (req, res) => {
  res.json({ ok: true, storage: projects.STORAGE_BACKEND })
})

// List teams the admin can assign as execution teams.
app.get('/api/teams', (req, res) => {
  res.json({ teams: projects.VALID_TEAM_IDS })
})

// ── Projects CRUD ────────────────────────────────────────────────────────────
app.get('/api/projects', async (req, res) => {
  try {
    const includeUnpublished = req.query.all === '1' || req.query.all === 'true'
    const list = await projects.listProjects({ includeUnpublished })
    res.json({ projects: list })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.get('/api/projects/:id', async (req, res) => {
  try {
    const p = await projects.getProject(req.params.id)
    if (!p) return res.status(404).json({ error: 'Project not found' })
    res.json({ project: p })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.post('/api/projects', async (req, res) => {
  try {
    const result = await projects.createProject(req.body || {})
    if (result.errors) return res.status(400).json({ errors: result.errors })
    res.status(201).json({ project: result.project })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.put('/api/projects/:id', async (req, res) => {
  try {
    const result = await projects.updateProject(req.params.id, req.body || {})
    if (result.notFound) return res.status(404).json({ error: 'Project not found' })
    if (result.errors) return res.status(400).json({ errors: result.errors })
    res.json({ project: result.project })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.delete('/api/projects/:id', async (req, res) => {
  try {
    const result = await projects.deleteProject(req.params.id)
    if (result.notFound) return res.status(404).json({ error: 'Project not found' })
    res.json({ project: result.project })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.listen(PORT, () => {
  console.log(`[api] HNI game backend on http://localhost:${PORT} (storage: ${projects.STORAGE_BACKEND})`)
})
