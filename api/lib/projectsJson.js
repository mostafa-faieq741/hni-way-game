/**
 * projectsJson.js
 * Local development storage adapter: keeps projects in a JSON file.
 * Same function signatures as the Supabase adapter so they are interchangeable.
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateProject, decorateProject, nextProjectId, HAS_ERRORS } from './projectsValidate.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_FILE = path.join(__dirname, '..', 'data', 'projects.json')
const SEED_FILE = path.join(__dirname, '..', 'data', 'projects.seed.json')

async function readAll() {
  try {
    return JSON.parse(await fs.readFile(DATA_FILE, 'utf-8'))
  } catch (e) {
    if (e.code === 'ENOENT') {
      let seed = []
      try { seed = JSON.parse(await fs.readFile(SEED_FILE, 'utf-8')) } catch {}
      // Seed records may carry only raw admin fields (availableFromQuarter /
      // availableToQuarter). Run them through validate+decorate so the derived
      // fields the game needs (quarterAvailable, requiredDepartments, ...) exist.
      seed = seed.map((p) => decorateProject(validateProject(p).value, p))
      await writeAll(seed)
      return seed
    }
    throw e
  }
}

async function writeAll(list) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(list, null, 2), 'utf-8')
}

export async function listProjects({ includeUnpublished = false } = {}) {
  const all = await readAll()
  return includeUnpublished ? all : all.filter((p) => p.published !== false)
}

export async function getProject(id) {
  const all = await readAll()
  return all.find((p) => p.id === id) || null
}

export async function createProject(input) {
  const { value, errors } = validateProject(input)
  if (HAS_ERRORS(errors)) return { errors }
  const all = await readAll()
  const id = input.id && /^PRJ-\d+$/.test(input.id) && !all.some((p) => p.id === input.id)
    ? input.id : nextProjectId(all)
  const now = new Date().toISOString()
  const project = decorateProject(value, { id, code: input.code || id, createdAt: now, updatedAt: now })
  all.push(project)
  await writeAll(all)
  return { project }
}

export async function updateProject(id, input) {
  const all = await readAll()
  const idx = all.findIndex((p) => p.id === id)
  if (idx === -1) return { notFound: true }
  const { value, errors } = validateProject({ ...all[idx], ...input })
  if (HAS_ERRORS(errors)) return { errors }
  const project = decorateProject(value, {
    id, code: input.code || all[idx].code || id,
    createdAt: all[idx].createdAt, updatedAt: new Date().toISOString(),
  })
  all[idx] = project
  await writeAll(all)
  return { project }
}

export async function deleteProject(id) {
  const all = await readAll()
  const idx = all.findIndex((p) => p.id === id)
  if (idx === -1) return { notFound: true }
  const [removed] = all.splice(idx, 1)
  await writeAll(all)
  return { project: removed }
}
