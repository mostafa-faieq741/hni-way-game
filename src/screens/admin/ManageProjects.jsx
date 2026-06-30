import React, { useEffect, useState, useCallback } from 'react'
import { DEPARTMENTS_DATA } from '../../data/departments.js'
import {
  fetchAllProjects, createProject, updateProject, deleteProject,
} from '../../data/projectsApi.js'

// Execution teams the admin can assign (Sales surfaces work, it does not execute).
const EXEC_TEAMS = DEPARTMENTS_DATA.filter((d) => d.id !== 'sales')
const TEAM_NAME = DEPARTMENTS_DATA.reduce((m, d) => { m[d.id] = d.name; return m }, {})

const EMPTY = {
  title: '', stars: 1, durationQuarters: 1, minReputation: 0,
  revenue: 20000, cost: 8000, reputationImpact: 5, clientBrief: '',
  executionTeams: [], salesRequirement: { type: 'specialist', count: 1 },
  availableFromQuarter: 1, availableToQuarter: 20,
  costBreakdown: '', bonusCondition: '', failCondition: '', published: true,
}

const inputStyle = {
  width: '100%', padding: '9px 11px', borderRadius: 'var(--r-md)',
  border: '1px solid var(--c-border)', background: 'var(--c-bg)',
  color: 'var(--c-text)', fontSize: 14, fontFamily: 'inherit',
}

function Field({ label, error, children, hint }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-text-muted)' }}>{label}</span>
      {children}
      {hint && !error && <span style={{ fontSize: 11, color: 'var(--c-text-muted)' }}>{hint}</span>}
      {error && <span style={{ fontSize: 11, color: 'var(--c-error)' }}>{error}</span>}
    </label>
  )
}

export default function ManageProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [editing, setEditing] = useState(null)   // null | 'new' | project
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true); setLoadError(null)
    try { setProjects(await fetchAllProjects()) }
    catch (e) { setLoadError(e.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const openNew = () => { setForm(EMPTY); setErrors({}); setEditing('new') }
  const openEdit = (p) => {
    setForm({
      ...EMPTY, ...p,
      executionTeams: p.executionTeams || [],
      salesRequirement: p.salesRequirement || { type: 'specialist', count: 1 },
    })
    setErrors({}); setEditing(p)
  }
  const closeForm = () => { setEditing(null); setErrors({}) }

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const setNum = (k, v) => set(k, v === '' ? '' : Number(v))
  const toggleTeam = (id) => setForm((f) => ({
    ...f,
    executionTeams: f.executionTeams.includes(id)
      ? f.executionTeams.filter((t) => t !== id)
      : [...f.executionTeams, id],
  }))

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true); setErrors({})
    const isNew = editing === 'new'
    const res = isNew ? await createProject(form) : await updateProject(editing.id, form)
    setSaving(false)
    if (res.ok) { closeForm(); load() }
    else setErrors(res.errors || {})
  }

  const remove = async (p) => {
    if (!window.confirm('Delete "' + p.title + '"? This cannot be undone.')) return
    await deleteProject(p.id); load()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
        <div>
          <span className="section-label" style={{ color: 'var(--c-primary)' }}>Content</span>
          <h1 style={{ fontFamily: 'var(--f-heading)', fontSize: 26, fontWeight: 800, margin: '6px 0 0' }}>Manage Projects</h1>
          <p style={{ color: 'var(--c-text-muted)', fontSize: 13, marginTop: 4 }}>
            Add or edit the client briefs players receive. Published projects appear in the game.
          </p>
        </div>
        {!editing && <button className="btn btn--primary" onClick={openNew}>+ New Project</button>}
      </div>

      {editing && (
        <form className="card" onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          <div className="game-section-title">{editing === 'new' ? 'New project' : 'Editing ' + editing.id}</div>
          {errors._ && <div className="alert-box"><div className="alert-box__text">{errors._}</div></div>}

          <Field label="Title" error={errors.title}>
            <input style={inputStyle} value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Leadership Academy Rollout" />
          </Field>

          <Field label="Client brief" error={errors.clientBrief}>
            <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={form.clientBrief} onChange={(e) => set('clientBrief', e.target.value)} placeholder="What the client needs..." />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--sp-4)' }}>
            <Field label="Stars (difficulty)" error={errors.stars}>
              <select style={inputStyle} value={form.stars} onChange={(e) => setNum('stars', e.target.value)}>
                {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n} ★</option>)}
              </select>
            </Field>
            <Field label="Duration (quarters)" error={errors.durationQuarters}>
              <input type="number" min="1" max="20" style={inputStyle} value={form.durationQuarters} onChange={(e) => setNum('durationQuarters', e.target.value)} />
            </Field>
            <Field label="Min reputation" error={errors.minReputation}>
              <input type="number" min="0" style={inputStyle} value={form.minReputation} onChange={(e) => setNum('minReputation', e.target.value)} />
            </Field>
            <Field label="Revenue ($)" error={errors.revenue}>
              <input type="number" min="1" style={inputStyle} value={form.revenue} onChange={(e) => setNum('revenue', e.target.value)} />
            </Field>
            <Field label="Cost ($)" error={errors.cost} hint="Paid upfront; keep below revenue.">
              <input type="number" min="0" style={inputStyle} value={form.cost} onChange={(e) => setNum('cost', e.target.value)} />
            </Field>
            <Field label="Reputation on delivery" error={errors.reputationImpact}>
              <input type="number" min="0" style={inputStyle} value={form.reputationImpact} onChange={(e) => setNum('reputationImpact', e.target.value)} />
            </Field>
          </div>

          <Field label="Execution teams (each consumes 1 capacity slot)" error={errors.executionTeams}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {EXEC_TEAMS.map((d) => {
                const on = form.executionTeams.includes(d.id)
                return (
                  <button type="button" key={d.id} onClick={() => toggleTeam(d.id)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 11px',
                      borderRadius: 'var(--r-full)', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                      border: '1px solid ' + (on ? 'var(--c-primary)' : 'var(--c-border)'),
                      background: on ? 'var(--c-primary-lt)' : 'var(--c-bg)',
                      color: on ? 'var(--c-primary)' : 'var(--c-text-muted)',
                    }}>
                    <span aria-hidden="true">{d.icon}</span>{d.name}
                  </button>
                )
              })}
            </div>
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--sp-4)' }}>
            <Field label="Sales brings it via" error={errors.salesRequirement}>
              <select style={inputStyle} value={form.salesRequirement.type}
                onChange={(e) => set('salesRequirement', { ...form.salesRequirement, type: e.target.value })}>
                <option value="specialist">Sales Specialist</option>
                <option value="consultant">Sales Consultant</option>
              </select>
            </Field>
            <Field label="Sales count">
              <input type="number" min="1" style={inputStyle} value={form.salesRequirement.count}
                onChange={(e) => set('salesRequirement', { ...form.salesRequirement, count: Number(e.target.value) })} />
            </Field>
            <Field label="Available from quarter" error={errors.availableFromQuarter}>
              <input type="number" min="1" max="20" style={inputStyle} value={form.availableFromQuarter} onChange={(e) => setNum('availableFromQuarter', e.target.value)} />
            </Field>
            <Field label="Available to quarter" error={errors.availableToQuarter}>
              <input type="number" min="1" max="20" style={inputStyle} value={form.availableToQuarter} onChange={(e) => setNum('availableToQuarter', e.target.value)} />
            </Field>
          </div>

          <details>
            <summary style={{ cursor: 'pointer', fontSize: 13, fontWeight: 700, color: 'var(--c-text-muted)' }}>Optional flavour text</summary>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', marginTop: 'var(--sp-3)' }}>
              <Field label="Cost breakdown"><input style={inputStyle} value={form.costBreakdown} onChange={(e) => set('costBreakdown', e.target.value)} /></Field>
              <Field label="Bonus condition"><input style={inputStyle} value={form.bonusCondition} onChange={(e) => set('bonusCondition', e.target.value)} /></Field>
              <Field label="Fail condition"><input style={inputStyle} value={form.failCondition} onChange={(e) => set('failCondition', e.target.value)} /></Field>
            </div>
          </details>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600 }}>
            <input type="checkbox" checked={form.published} onChange={(e) => set('published', e.target.checked)} />
            Published (visible to players)
          </label>

          <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
            <button className="btn btn--primary" type="submit" disabled={saving}>{saving ? 'Saving…' : (editing === 'new' ? 'Create project' : 'Save changes')}</button>
            <button className="btn btn--secondary" type="button" onClick={closeForm}>Cancel</button>
          </div>
        </form>
      )}

      {!editing && (
        <div className="card">
          {loading ? <div style={{ color: 'var(--c-text-muted)', fontSize: 14 }}>Loading…</div>
            : loadError ? <div className="alert-box"><div className="alert-box__text">Could not reach the backend ({loadError}). Start it with <code>npm run dev:api</code>.</div></div>
            : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, minWidth: 620 }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: 'var(--c-text-muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <th style={{ padding: '8px 10px' }}>ID</th>
                      <th style={{ padding: '8px 10px' }}>Title</th>
                      <th style={{ padding: '8px 10px' }}>★</th>
                      <th style={{ padding: '8px 10px' }}>Teams</th>
                      <th style={{ padding: '8px 10px' }}>Quarters</th>
                      <th style={{ padding: '8px 10px' }}>Status</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((p) => (
                      <tr key={p.id} style={{ borderTop: '1px solid var(--c-border)' }}>
                        <td style={{ padding: '10px', whiteSpace: 'nowrap', color: 'var(--c-text-muted)' }}>{p.id}</td>
                        <td style={{ padding: '10px', fontWeight: 600 }}>{p.title}</td>
                        <td style={{ padding: '10px', whiteSpace: 'nowrap', color: 'var(--c-gold)' }}>{'★'.repeat(p.stars)}</td>
                        <td style={{ padding: '10px', fontSize: 12, color: 'var(--c-text-muted)' }}>{(p.executionTeams || []).map((t) => TEAM_NAME[t] || t).join(', ') || '—'}</td>
                        <td style={{ padding: '10px', whiteSpace: 'nowrap', fontSize: 12, color: 'var(--c-text-muted)' }}>Q{p.availableFromQuarter}–Q{p.availableToQuarter}</td>
                        <td style={{ padding: '10px' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 'var(--r-full)',
                            background: p.published ? 'var(--c-success-bg)' : 'var(--c-bg)',
                            color: p.published ? 'var(--c-success)' : 'var(--c-text-muted)',
                            border: '1px solid ' + (p.published ? '#a7d8bc' : 'var(--c-border)') }}>
                            {p.published ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td style={{ padding: '10px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <button className="btn btn--secondary btn--sm" onClick={() => openEdit(p)} style={{ marginRight: 6 }}>Edit</button>
                          <button className="btn btn--secondary btn--sm" onClick={() => remove(p)} style={{ color: 'var(--c-error)' }}>Delete</button>
                        </td>
                      </tr>
                    ))}
                    {projects.length === 0 && (
                      <tr><td colSpan={7} style={{ padding: '20px', textAlign: 'center', color: 'var(--c-text-muted)' }}>No projects yet. Click “New Project”.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
        </div>
      )}
    </div>
  )
}
