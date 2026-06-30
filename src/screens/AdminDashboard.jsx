import React, { useState } from 'react'
import HNILogo from '../components/HNILogo.jsx'
import Button from '../components/Button.jsx'
import { getAllPlayers, getKpis, rankByNetProfit, getInitials, QUALIFY } from '../data/adminData.js'
import ManageProjects from './admin/ManageProjects.jsx'

const fmtMoney = (n) => '$' + Math.round(n).toLocaleString()
const fmtShort = (n) => {
  const a = Math.abs(n)
  if (a >= 1_000_000) return '$' + (n / 1_000_000).toFixed(1) + 'M'
  if (a >= 1_000) return '$' + Math.round(n / 1_000) + 'k'
  return '$' + Math.round(n)
}

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
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: H }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
            <div style={{ fontSize: 10, color: 'var(--c-text-muted)', marginBottom: 4, whiteSpace: 'nowrap' }}>{d.display}</div>
            <div
              title={d.label + ': ' + d.display}
              style={{
                width: '70%', maxWidth: 46,
                height: Math.max(3, (d.value / max) * (H - 26)) + 'px',
                background: d.color || 'var(--c-primary)',
                borderRadius: '6px 6px 0 0',
              }}
            />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 10, color: 'var(--c-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.short}</div>
        ))}
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const done = status === 'Completed'
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 'var(--r-full)',
      background: done ? 'var(--c-primary-lt)' : 'var(--c-bg)',
      color: done ? 'var(--c-primary)' : 'var(--c-text-muted)',
      border: '1px solid ' + (done ? 'var(--c-primary)' : 'var(--c-border)'),
      whiteSpace: 'nowrap',
    }}>{status}</span>
  )
}

export default function AdminDashboard({ onSignOut }) {
  const [tab, setTab] = useState('stats')
  const players = getAllPlayers()
  const kpis = getKpis(players)
  const ranked = rankByNetProfit(players)

  const firstName = (n) => String(n).split(/\s+/)[0]
  const repData = players.map((p) => ({
    label: p.name, short: firstName(p.name), value: p.reputation, display: String(p.reputation),
    color: p.reputation > QUALIFY ? 'var(--c-success)' : 'var(--c-primary-lt)',
  }))
  const profitData = players.map((p) => ({
    label: p.name, short: firstName(p.name), value: Math.max(0, p.netProfit), display: fmtShort(p.netProfit),
    color: 'var(--c-primary)',
  }))

  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg)' }}>
      {/* Header */}
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
            {[['stats', 'Player Statistics'], ['projects', 'Manage Projects']].map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)}
                className={'btn ' + (tab === key ? 'btn--primary' : 'btn--secondary')} style={{ fontSize: 13 }}>
                {label}
              </button>
            ))}
          </div>

          {tab === 'projects' && <ManageProjects />}

          {tab === 'stats' && (<>
          <div>
            <span className="section-label" style={{ color: 'var(--c-primary)' }}>Statistics</span>
            <h1 style={{ fontFamily: 'var(--f-heading)', fontSize: 26, fontWeight: 800, margin: '6px 0 0' }}>Player Performance</h1>
            <p style={{ color: 'var(--c-text-muted)', fontSize: 13, marginTop: 4 }}>
              Live result from this browser plus sample players. (Prototype — central data connects later.)
            </p>
          </div>

          {/* KPI cards */}
          <div style={{ display: 'flex', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
            <StatCard label="Players" value={kpis.total} />
            <StatCard label="Avg Net Profit" value={fmtShort(kpis.avgNet)} />
            <StatCard label="Completion" value={kpis.completionRate + '%'} sub="finished all 20 quarters" />
            <StatCard label="Qualified" value={kpis.qualified} sub={'reputation > ' + QUALIFY} />
          </div>

          {/* Charts */}
          <div style={{ display: 'flex', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
            <BarChart title="Reputation by player" subtitle={'Green = qualified (> ' + QUALIFY + ')'} data={repData} />
            <BarChart title="Net profit by player" subtitle="Final / current net profit" data={profitData} />
          </div>

          {/* Leaderboard */}
          <div className="card">
            <div className="game-section-title" style={{ marginBottom: 12 }}>Leaderboard</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ranked.map((p) => (
                <div key={p.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '8px 10px',
                  borderRadius: 'var(--r-md)',
                  background: p.source === 'live' ? 'var(--c-primary-lt)' : 'transparent',
                  border: '1px solid ' + (p.source === 'live' ? 'var(--c-primary)' : 'var(--c-border)'),
                }}>
                  <span style={{ fontFamily: 'var(--f-heading)', fontWeight: 800, width: 24, textAlign: 'center', color: p.rank <= 3 ? 'var(--c-primary)' : 'var(--c-text-muted)' }}>{p.rank}</span>
                  <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--c-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{getInitials(p.name)}</span>
                  <span style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>
                    {p.name}{p.source === 'live' ? <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 800, color: 'var(--c-primary)' }}>YOU</span> : null}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--c-text-muted)' }}>{p.reputation} rep</span>
                  <span style={{ fontFamily: 'var(--f-heading)', fontWeight: 700, fontSize: 14, minWidth: 90, textAlign: 'right' }}>{fmtMoney(p.netProfit)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Players table */}
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
                    <tr key={p.id} style={{ borderTop: '1px solid var(--c-border)' }}>
                      <td style={{ padding: '10px' }}>
                        <span style={{ fontWeight: 600 }}>{p.name}</span>
                        {p.source === 'live' ? <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 800, color: 'var(--c-primary)' }}>YOU</span> : null}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'right' }}>{fmtMoney(p.cash)}</td>
                      <td style={{ padding: '10px', textAlign: 'right' }}>{p.reputation}</td>
                      <td style={{ padding: '10px', textAlign: 'right' }}>{fmtMoney(p.netProfit)}</td>
                      <td style={{ padding: '10px' }}><StatusBadge status={p.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          </>)}
        </div>
      </main>
    </div>
  )
}
