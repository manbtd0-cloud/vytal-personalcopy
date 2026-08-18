import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getStoredRecords, syncPendingRecords } from '../lib/storage'
import { generateSparklinePath, evaluateLongitudinalRisk } from '../lib/longitudinalRisk'
import { syncQueueToAlibabaCloud } from '../lib/cloudSync'

const STATUS_META = {
  flagged: { label: 'Needs follow-up', className: 'pill--flag' },
  ok: { label: 'Normal', className: 'pill--ok' },
  pending: { label: 'Pending sync', className: 'pill--pending' },
}

function formatTimeAgo(isoString) {
  if (!isoString) return 'Just now'
  const diffMs = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diffMs / (1000 * 60))
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hr ago`
  return `${Math.floor(hrs / 24)} days ago`
}

export default function DashboardPage() {
  const [records, setRecords] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isSyncing, setIsSyncing] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setRecords(getStoredRecords())
  }, [])

  async function handleSyncAll() {
    setIsSyncing(true)
    await syncQueueToAlibabaCloud()
    const updated = syncPendingRecords()
    setRecords(updated)
    setIsSyncing(false)
  }

  const filtered = records.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.patientId.toLowerCase().includes(searchTerm.toLowerCase())
    if (filterStatus === 'all') return matchesSearch
    if (filterStatus === 'flagged') return matchesSearch && r.status === 'flagged'
    if (filterStatus === 'pending') return matchesSearch && (!r.synced || r.status === 'pending')
    if (filterStatus === 'ok') return matchesSearch && r.status === 'ok'
    return matchesSearch
  })

  const summary = {
    total: records.length,
    flagged: records.filter((r) => r.status === 'flagged' || r.alertTier === 'RED' || r.alertTier === 'ORANGE').length,
    pending: records.filter((r) => !r.synced || r.status === 'pending').length,
  }

  return (
    <main className="page dashboard-page">
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">Community health worker</p>
          <h1 className="page-title">Every patient you've checked.</h1>
          <p className="page-subtitle">
            Last reading, stress read-out, longitudinal trends, and who's waiting on a follow-up — all in one glance.
          </p>
        </div>

        <div className="dashboard-actions-top">
          <button
            className="btn btn--ghost sync-btn"
            onClick={handleSyncAll}
            disabled={isSyncing || summary.pending === 0}
          >
            <span className="pill-dot" />
            {isSyncing ? 'Syncing to Cloud…' : summary.pending > 0 ? `Sync ${summary.pending} Pending` : 'All Synced'}
          </button>
          <Link to="/" className="btn btn--primary">
            + New Scan
          </Link>
        </div>
      </div>

      <div className="stat-row">
        <div className="card stat-card" onClick={() => setFilterStatus('all')} style={{ cursor: 'pointer' }}>
          <p className="stat-card__value mono">{summary.total}</p>
          <p className="stat-card__label">Screened total</p>
        </div>
        <div className="card stat-card stat-card--flag" onClick={() => setFilterStatus('flagged')} style={{ cursor: 'pointer' }}>
          <p className="stat-card__value mono">{summary.flagged}</p>
          <p className="stat-card__label">Need follow-up</p>
        </div>
        <div className="card stat-card stat-card--pending" onClick={() => setFilterStatus('pending')} style={{ cursor: 'pointer' }}>
          <p className="stat-card__value mono">{summary.pending}</p>
          <p className="stat-card__label">Pending sync</p>
        </div>
      </div>

      <div className="table-filter-bar">
        <input
          type="text"
          placeholder="Search by patient name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <div className="filter-buttons">
          {['all', 'flagged', 'pending', 'ok'].map((st) => (
            <button
              key={st}
              className={`filter-btn ${filterStatus === st ? 'active' : ''}`}
              onClick={() => setFilterStatus(st)}
            >
              {st === 'all'
                ? 'All Patients'
                : st === 'flagged'
                ? 'Needs Follow-up'
                : st === 'pending'
                ? 'Pending Sync'
                : 'Normal'}
            </button>
          ))}
        </div>
      </div>

      <div className="card patient-table-card">
        <table className="patient-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Heart rate</th>
              <th>Breathing</th>
              <th>Trend (Sparkline)</th>
              <th>Status</th>
              <th>Last checked</th>
              <th>Report</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-dim)' }}>
                  No matching patient records found.
                </td>
              </tr>
            ) : (
              filtered.map((p) => {
                const meta = STATUS_META[p.status] || STATUS_META.ok
                // Collect patient history for sparkline
                const patientScans = records.filter((r) => r.patientId === p.patientId || r.name === p.name)
                const hrHistory = patientScans.map((r) => r.hr).reverse()
                const sparkPath = generateSparklinePath(hrHistory.length > 1 ? hrHistory : [p.hr - 3, p.hr + 2, p.hr])
                const longRisk = evaluateLongitudinalRisk(patientScans)

                return (
                  <tr
                    key={p.id}
                    className={p.status === 'flagged' || p.alertTier === 'RED' ? 'is-flagged' : undefined}
                    onClick={() => navigate(`/report?id=${p.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <p className="patient-table__name">{p.name}</p>
                      <p className="patient-table__id mono">{p.patientId || p.id}</p>
                    </td>
                    <td className="mono">{p.hr} bpm</td>
                    <td className="mono">{p.br || 16} br/min</td>
                    <td>
                      <svg width="80" height="24" style={{ overflow: 'visible' }}>
                        <polyline
                          fill="none"
                          stroke={p.status === 'flagged' ? '#ef4444' : '#10b981'}
                          strokeWidth="2"
                          points={sparkPath}
                        />
                      </svg>
                    </td>
                    <td>
                      <span className={'pill ' + (!p.synced ? STATUS_META.pending.className : meta.className)}>
                        <span className="pill-dot" />
                        {p.alertTier ? `Tier ${p.alertTier}` : (!p.synced ? 'Pending sync' : meta.label)}
                      </span>
                    </td>
                    <td className="patient-table__time">{formatTimeAgo(p.timestamp)}</td>
                    <td>
                      <Link
                        to={`/report?id=${p.id}`}
                        className="table-report-link"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Report →
                      </Link>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}
