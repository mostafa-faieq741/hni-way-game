/**
 * projectsSupabase.js
 * Production storage adapter backed by Supabase (Postgres).
 * Table `projects` columns mirror the project fields (see api/data/schema.sql).
 * Activated automatically when SUPABASE_URL + SUPABASE_SERVICE_KEY are set.
 */

import { validateProject, decorateProject, nextProjectId, HAS_ERRORS } from './projectsValidate.js'

let _client = null
async function client() {
  if (_client) return _client
  const { createClient } = await import('@supabase/supabase-js')
  _client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  })
  return _client
}

// Row <-> app object mapping. The DB stores snake_case; the game uses camelCase.
function toRow(p) {
  return {
    id: p.id, code: p.code, title: p.title, stars: p.stars, level: p.level,
    duration_quarters: p.durationQuarters, min_reputation: p.minReputation,
    revenue: p.revenue, cost: p.cost, reputation_impact: p.reputationImpact,
    client_brief: p.clientBrief, cost_breakdown: p.costBreakdown,
    bonus_condition: p.bonusCondition, fail_condition: p.failCondition,
    execution_teams: p.executionTeams, sales_requirement: p.salesRequirement,
    available_from_quarter: p.availableFromQuarter, available_to_quarter: p.availableToQuarter,
    published: p.published, created_at: p.createdAt, updated_at: p.updatedAt,
  }
}
function fromRow(r) {
  if (!r) return null
  const v = {
    id: r.id, code: r.code, title: r.title, stars: r.stars,
    durationQuarters: r.duration_quarters, minReputation: r.min_reputation,
    revenue: r.revenue, cost: r.cost, reputationImpact: r.reputation_impact,
    clientBrief: r.client_brief, costBreakdown: r.cost_breakdown,
    bonusCondition: r.bonus_condition, failCondition: r.fail_condition,
    executionTeams: r.execution_teams || [], salesRequirement: r.sales_requirement,
    availableFromQuarter: r.available_from_quarter, availableToQuarter: r.available_to_quarter,
    published: r.published,
  }
  return decorateProject(v, { id: r.id, code: r.code, createdAt: r.created_at, updatedAt: r.updated_at })
}

export async function listProjects({ includeUnpublished = false } = {}) {
  const db = await client()
  let q = db.from('projects').select('*').order('id', { ascending: true })
  if (!includeUnpublished) q = q.eq('published', true)
  const { data, error } = await q
  if (error) throw error
  return (data || []).map(fromRow)
}

export async function getProject(id) {
  const db = await client()
  const { data, error } = await db.from('projects').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return fromRow(data)
}

export async function createProject(input) {
  const { value, errors } = validateProject(input)
  if (HAS_ERRORS(errors)) return { errors }
  const db = await client()
  const all = await listProjects({ includeUnpublished: true })
  const id = input.id && /^PRJ-\d+$/.test(input.id) && !all.some((p) => p.id === input.id)
    ? input.id : nextProjectId(all)
  const now = new Date().toISOString()
  const project = decorateProject(value, { id, code: input.code || id, createdAt: now, updatedAt: now })
  const { error } = await db.from('projects').insert(toRow(project))
  if (error) throw error
  return { project }
}

export async function updateProject(id, input) {
  const existing = await getProject(id)
  if (!existing) return { notFound: true }
  const { value, errors } = validateProject({ ...existing, ...input })
  if (HAS_ERRORS(errors)) return { errors }
  const db = await client()
  const project = decorateProject(value, {
    id, code: input.code || existing.code || id,
    createdAt: existing.createdAt, updatedAt: new Date().toISOString(),
  })
  const { error } = await db.from('projects').update(toRow(project)).eq('id', id)
  if (error) throw error
  return { project }
}

export async function deleteProject(id) {
  const existing = await getProject(id)
  if (!existing) return { notFound: true }
  const db = await client()
  const { error } = await db.from('projects').delete().eq('id', id)
  if (error) throw error
  return { project: existing }
}
