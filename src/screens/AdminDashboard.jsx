import React, { useState, useEffect } from 'react'
import HNILogo from '../components/HNILogo.jsx'
import Button from '../components/Button.jsx'
import ManageProjects from './admin/ManageProjects.jsx'
import ManageUsers from './admin/ManageUsers.jsx'
import { fetchStats } from '../services/authClient.js'

const QUALIFY = 100
const fmtMoney = (n) => '$' + Math.round(Number(n) || 0).toLocaleString()
const fmtShort = (n) => {
  n = Number(n) || 0
  const a = Math.abs(n)
  if (a >= 1_000_000) return '$' + (n / 1_000_000).toFixed(1) + 'M'
  if (a >= 1_000) return '$' + Math.round(n / 1_000) + 'k'
  return '$' + Math.round(n)
}
const getInitials = (n) => String(n || 'P').split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase()
const firstName = (n) => String(n || '').split(/\s+/)[0]

function StatCard({ label, value, sub }) {
  return (
    <div className="card" style={{ flex: 1, minWidth: 160 }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--c-text-muted)' }}>{label}</div>
      <div style={{ fontFamily: 'var(--f-heading)', fontWeight: 800, fontSize: 26, color: 'var(--c-primary)', marginTop: 6 }}>{value}</div>
      {sub ? <div style={{ fontSize: 12, color: 'var(--c-text-muted)', marginTop: 2 }}>{sub}</div> : null}
    </div>
  )
}

function BarChart({ title, subtitle, data }) {
  const H = 150
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div className="card" style={{ flex: 1, minWidth: 280 }}>
      <div className="game-section-title" style={{ marginBottom: 2 }}>{title}</div>
      {subtitle ? <div style={{ fontSize: 12, color: 'var(--c-text-muted)', marginBottom: 12 }}>{subtitle}</div> : null}
      {data.length === 0 ? <div style={{ fontSize: 13, color: 'var(--c-text-muted)' }}>No data yet.</div> : (
      <>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: H }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
            <div style={{ fontSize: 10, color: 'var(--c-text-muted)', marginBottom: 4, whiteSpace: 'nowrap' }}>{d.display}</div>
            <div title={d.label + ': ' + d.display}
              style={{ width: '70%', maxWidth: 46, height: Math.max(3, (d.value / max) * (H - 26)) + 'px', background: d.color || 'var(--c-primary)', borderRadius: '6px 6px 0 0' }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 10, color: 'var(--c-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.short}</div>
        ))}
      </div>
      </>
      )}
    </div>
  )
}

function StatusBadge({ status }) {
  const done = status === 'finished'
  const label = status === 'finished' ? 'Completed' : status === 'in_progress' ? 'In progress' : 'Not started'
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 'var(--r-full)',
      background: done ? 'var(--c-primary-lt)' : 'var(--c-bg)',
      color: done ? 'var(--c-primary)' : 'var(--c-text-muted)',
      border: '1px solid ' + (done ? 'var(--c-primary)' : 'var(--c-border)'), whiteSpace: 'nowrap',
    }}>{label}</span>
  )
}

function StatsTab() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true); setError(null)
    fetchStats()
      .then((list) => { if (!cancelled) setPlayers(Array.isArray(list) ? list : []) })
      .catch((e) => { if (!cancelled) setError(e.message || 'Could not load statistics.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const played = players.filter((p) => p.played)
  const total = players.length
  const avgNet = played.length ? played.reduce((s, p) => s + (Number(p.net_profit) || 0), 0) / played.length : 0
  const finished = players.filter((p) => p.game_status === 'finished').length
  const completionRate = total ? Math.round((finished / total) * 100) : 0
  const qualified = players.filter((p) => (Number(p.reputation) || 0) >= QUALIFY).length

  const repData = players.map((p) => ({
    label: p.display_name, short: firstName(p.display_name), value: Number(p.reputation) || 0, display: String(Number(p.reputation) || 0),
    color: (Number(p.reputation) || 0) >= QUALIFY ? 'var(--c-success)' : 'var(--c-primary-lt)',
  }))
  const profitData = players.map((p) => ({
    label: p.display_name, short: firstName(p.display_name), value: Math.max(0, Number(p.net_profit) || 0), display: fmtShort(p.net_profit),
    color: 'var(--c-primary)',
  }))
  const ranked = [...players].sort((a, b) => (Number(b.net_profit) || 0) - (Number(a.net_profit) || 0))

  if (loading) return <div className="card" style={{ color: 'var(--c-text-muted)' }}>Loading statistics…</div>
  if (error) return <div className="card" style={{ color: '#b00020' }}>{error}</div>

  return (
    <>
      <div>
        <span className="section-label" style={{ color: 'var(--c-primary)' }}>Statistics</span>
        <h1 style={{ fontFamily: 'var(--f-heading)', fontSize: 26, fontWeight: 800, margin: '6px 0 0' }}>Player Performance</h1>
        <p style={{ color: 'var(--c-text-muted)', fontSize: 13, marginTop: 4 }}>Live results from the database — real player accounts and their games.</p>
      </div>

      <div style={{ display: 'flex', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
        <StatCard label="Players" value={total} />
        <StatCard label="Avg Net Profit" value={fmtShort(avgNet)} sub={played.length + ' have played'} />
        <StatCard label="Completion" value={completionRate + '%'} sub="finished all 20 quarters" />
        <StatCard label="Qualified" value={qualified} sub={'reputation ≥ ' + QUALIFY} />
      </div>

      {total === 0 ? (
        <div className="card" style={{ color: 'var(--c-text-muted)', fontSize: 14 }}>
          No player accounts yet. Create accounts in the <strong>Add User</strong> tab — their stats appear here once they play.
        </div>
      ) : (
      <>
      <div style={{ display: 'flex', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
        <BarChart title="Reputation by player" subtitle={'Green = qualified (≥ ' + QUALIFY + ')'} data={repData} />
        <BarChart title="Net profit by player" subtitle="Final / current net profit" data={profitData} />
      </div>

      <div className="card">
        <div className="game-section-title" style={{ marginBottom: 12 }}>Leaderboard</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ranked.map((p, i) => (
            <div key={p.player_id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 10px', borderRadius: 'var(--r-md)', border: '1px solid var(--c-border)' }}>
              <span style={{ fontFamily: 'var(--f-heading)', fontWeight: 800, width: 24, textAlign: 'center', color: i < 3 ? 'var(--c-primary)' : 'var(--c-text-muted)' }}>{i + 1}</span>
              <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--c-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{getInitials(p.display_name)}</span>
              <span style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{p.display_name}</span>
              <span style={{ fontSize: 13, color: 'var(--c-text-muted)' }}>{p.reputation} rep</span>
              <span style={{ fontFamily: 'var(--f-heading)', fontWeight: 700, fontSize: 14, minWidth: 90, textAlign: 'right' }}>{fmtMoney(p.net_profit)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="game-section-title" style={{ marginBottom: 12 }}>All players</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, minWidth: 560 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--c-text-muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '8px 10px' }}>Player</th>
                <th style={{ padding: '8px 10px', textAlign: 'right' }}>Cash</th>
                <th style={{ padding: '8px 10px', textAlign: 'right' }}>Reputation</th>
                <th style={{ padding: '8px 10px', textAlign: 'right' }}>Net Profit</th>
                <th style={{ padding: '8px 10px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p) => (
                <tr key={p.player_id} style={{ borderTop: '1px solid var(--c-border)' }}>
                  <td style={{ padding: '10px', fontWeight: 600 }}>{p.display_name}</td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>{p.cash == null ? '—' : fmtMoney(p.cash)}</td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>{p.reputation}</td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>{fmtMoney(p.net_profit)}</td>
                  <td style={{ padding: '10px' }}><StatusBadge status={p.game_status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}
    </>
  )
}

export default function AdminDashboard({ onSignOut }) {
  const [tab, setTab] = useState('stats')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg)' }}>
      <header className="app-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <HNILogo height={32} />
          <div className="app-header__divider" aria-hidden="true" />
          <span className="app-header__title">Admin Dashboard</span>
        </div>
        <Button variant="secondary" size="sm" onClick={() => onSignOut?.()}>Sign out</Button>
      </header>

      <main className="app-main">
        <div className="screen" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[['stats', 'Player Statistics'], ['projects', 'Manage Projects'], ['users', 'Add User']].map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)}
                className={'btn ' + (tab === key ? 'btn--primary' : 'btn--secondary')} style={{ fontSize: 13 }}>
                {label}
              </button>
            ))}
          </div>

          {tab === 'projects' && <ManageProjects />}
          {tab === 'users' && <ManageUsers />}
          {tab === 'stats' && <StatsTab />}
        </div>
      </main>
    </div>
  )
}
