/**
 * dev-server.js — local development backend (Express) for the HNI Way game.
 *   npm run dev:api   # http://localhost:3001
 * It simply mounts the same serverless handlers used on Vercel, so local and
 * production behaviour match. Production runs each api/*.js as its own function.
 */
import express from 'express'
import cors from 'cors'

import health      from './api/health.js'
import teams       from './api/teams.js'
import projectList from './api/projects/index.js'
import projectById from './api/projects/[id].js'
import auth        from './api/auth.js'
import users       from './api/users.js'
import progress    from './api/progress.js'
import leaderboard from './api/leaderboard.js'

const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' }))

const wrap = (fn) => (req, res) => Promise.resolve(fn(req, res)).catch((e) => {
  console.error(e); if (!res.headersSent) res.status(500).json({ error: e.message })
})
// Map an :id route param onto req.query.id (Vercel-style dynamic segment).
const withId = (fn) => (req, res) => { req.query = { ...req.query, id: req.params.id }; return wrap(fn)(req, res) }

app.get('/api/health', wrap(health))
app.get('/api/teams', wrap(teams))
app.all('/api/projects', wrap(projectList))
app.all('/api/projects/:id', withId(projectById))
app.post('/api/auth', wrap(auth))
app.all('/api/users', wrap(users))
app.all('/api/progress', wrap(progress))
app.get('/api/leaderboard', wrap(leaderboard))

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`[api] HNI game backend on http://localhost:${PORT}`))
