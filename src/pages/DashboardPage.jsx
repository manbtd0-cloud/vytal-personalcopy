import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { referralRepository, screeningRepository } from '../domain/repositories.js'
import { REFERRAL_STEPS, ReferralPriorityQueue, referralWorkflow } from '../domain/referrals/ReferralWorkflow.js'
import { networkMonitor } from '../services/NetworkMonitor.js'
import { clinicalRealtimeService } from '../services/ClinicalRealtimeService.js'
import { clinicalCommandOutbox } from '../services/ClinicalCommandOutbox.js'
import { evaluateLongitudinalRisk } from '../lib/longitudinalRisk.js'

const STATUS_META = {
  flagged: { label: 'Needs follow-up', className: 'pill--flag' },
  ok: { label: 'Normal', className: 'pill--ok' },
  pending: { label: 'Pending sync', className: 'pill--pending' },
}

const REFERRAL_LABELS = {
  flagged: 'Flagged',
  referred: 'Referred',
  contacted: 'Contacted',
  appointment_booked: 'Appointment',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const RECORD_PAGE_SIZE = 25

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

function screeningModeLabel(record) {
  const mode = record.mode || record.source || 'face'
  const labels = {
    face: 'Face rPPG', fingertip: 'Fingertip PPG', anemia: 'Anemia proxy',
    jaundice: 'Jaundice proxy', bmi: 'BMI proxy', bp_ptt: 'BP trend',
  }
  return labels[mode] || String(mode).replaceAll('_', ' ')
}

function primaryMeasurement(record) {
  const hasNumber = (value) => value !== null && value !== '' && Number.isFinite(Number(value))
  if (hasNumber(record.anemiaResult?.hb)) return `${record.anemiaResult.hb} g/dL Hb proxy`
  if (hasNumber(record.jaundiceResult?.yellowIndex)) return `${record.jaundiceResult.yellowIndex} yellow index`
  if (hasNumber(record.bmiResult?.bmi)) return `${record.bmiResult.bmi} kg/m²`
  if (record.bpResult?.isCalibrated) return `${record.bpResult.sbp}/${record.bpResult.dbp} mmHg trend`
  if (hasNumber(record.hr)) return `${record.hr} bpm`
  return 'No reliable result'
}

export default function DashboardPage() {
  const [records, setRecords] = useState([])
  const [referrals, setReferrals] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isSyncing, setIsSyncing] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [updatingReferral, setUpdatingReferral] = useState('')
  const [isOnline, setIsOnline] = useState(networkMonitor.online)
  const [recordCursor, setRecordCursor] = useState(null)
  const [hasMoreRecords, setHasMoreRecords] = useState(false)
  const [loadingMoreRecords, setLoadingMoreRecords] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    let active = true
    Promise.all([screeningRepository.listPage({ limit: RECORD_PAGE_SIZE }), referralRepository.list()])
      .then(([recordPage, referralItems]) => {
        if (!active) return
        setRecords(recordPage.items)
        setRecordCursor(recordPage.nextCursor)
        setHasMoreRecords(recordPage.hasMore)
        setReferrals(referralItems)
      })
      .catch((error) => active && setLoadError(error.message))
    return () => { active = false }
  }, [])

  useEffect(() => networkMonitor.subscribe((online) => {
    setIsOnline(online)
    if (!online || !clinicalCommandOutbox.size) return
    clinicalCommandOutbox.flush()
      .then(() => referralRepository.list())
      .then(setReferrals)
      .catch((error) => setLoadError(`Queued update could not sync: ${error.message}`))
  }), [])

  useEffect(() => {
    let active = true
    let unsubscribe = () => {}
    let refreshTimer = null
    const refresh = () => {
      clearTimeout(refreshTimer)
      refreshTimer = setTimeout(() => {
        Promise.all([screeningRepository.listPage({ limit: RECORD_PAGE_SIZE }), referralRepository.list()])
          .then(([recordPage, referralItems]) => {
            if (!active) return
            setRecords(recordPage.items)
            setRecordCursor(recordPage.nextCursor)
            setHasMoreRecords(recordPage.hasMore)
            setReferrals(referralItems)
          })
          .catch((error) => active && setLoadError(error.message))
      }, 150)
    }

    clinicalRealtimeService.subscribe(refresh)
      .then((cleanup) => {
        if (!active) cleanup()
        else unsubscribe = cleanup
      })
      .catch(() => {})

    return () => {
      active = false
      clearTimeout(refreshTimer)
      unsubscribe()
    }
  }, [])

  async function handleSyncAll() {
    setIsSyncing(true)
    setLoadError('')
    try {
      await screeningRepository.sync()
      const page = await screeningRepository.listPage({ limit: RECORD_PAGE_SIZE })
      setRecords(page.items)
      setRecordCursor(page.nextCursor)
      setHasMoreRecords(page.hasMore)
    } catch (error) {
      setLoadError(error.message)
    } finally {
      setIsSyncing(false)
    }
  }

  async function loadMoreRecords() {
    if (!recordCursor || loadingMoreRecords) return
    setLoadingMoreRecords(true)
    setLoadError('')
    try {
      const page = await screeningRepository.listPage({ limit: RECORD_PAGE_SIZE, cursor: recordCursor })
      setRecords((current) => {
        const existingIds = new Set(current.map((record) => record.id))
        return [...current, ...page.items.filter((record) => !existingIds.has(record.id))]
      })
      setRecordCursor(page.nextCursor)
      setHasMoreRecords(page.hasMore)
    } catch (error) {
      setLoadError(error.message)
    } finally {
      setLoadingMoreRecords(false)
    }
  }

  async function advanceReferral(referral) {
    const nextStatus = referralWorkflow.next(referral.status)
    if (!nextStatus) return
    if (!isOnline) {
      try {
        const queued = clinicalCommandOutbox.enqueueReferralTransition(referral.id, nextStatus)
        setLoadError(`Offline: referral update queued in memory (${queued} pending). It will sync after reconnection.`)
      } catch (error) {
        setLoadError(error.message)
      }
      return
    }
    setUpdatingReferral(referral.id)
    setLoadError('')
    try {
      const updated = await referralRepository.transition(referral.id, nextStatus)
      setReferrals((current) => current.map((item) => item.id === referral.id
        ? { ...item, ...updated }
        : item))
    } catch (error) {
      setLoadError(error.message)
    } finally {
      setUpdatingReferral('')
    }
  }

  const normalizedSearch = searchTerm.trim().toLowerCase()
  const filtered = records.filter((r) => {
    const matchesSearch =
      String(r.name ?? '').toLowerCase().includes(normalizedSearch) ||
      String(r.patientId ?? '').toLowerCase().includes(normalizedSearch)
    if (filterStatus === 'all') return matchesSearch
    if (filterStatus === 'flagged') return matchesSearch && r.status === 'flagged'
    if (filterStatus === 'pending') return matchesSearch && (!r.synced || r.status === 'pending')
    if (filterStatus === 'ok') return matchesSearch && r.status === 'ok'
    return matchesSearch
  })

  const summary = records.reduce((result, record) => {
    if (record.status === 'flagged') result.flagged++
    if (!record.synced || record.status === 'pending') result.pending++
    return result
  }, { total: records.length, flagged: 0, pending: 0, activeReferrals: 0 })
  for (const referral of referrals) {
    if (!['completed', 'cancelled'].includes(referral.status)) summary.activeReferrals++
  }
  const triageReferrals = new ReferralPriorityQueue(referrals).toSortedArray()
  const historiesByPatient = records.reduce((groups, record) => {
    const key = record.patientDatabaseId || record.patientId
    const current = groups.get(key) || []
    current.push(record)
    groups.set(key, current)
    return groups
  }, new Map())
  for (const history of historiesByPatient.values()) {
    history.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  }

  return (
    <main className="page dashboard-page">
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">Patient overview / live register</p>
          <h1 className="page-title">The day, at a glance.</h1>
          <p className="page-subtitle">
            See every screening, surface the people who need attention, and keep records moving even
            when the network does not.
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

      {loadError && <p className="form-message" role="alert">{loadError}</p>}
      {!isOnline && <div className="preview-banner" role="status">Offline mode: current data remains visible; protected updates resume after reconnection.</div>}

      <div className="stat-row">
        <button
          type="button"
          className={`card stat-card ${filterStatus === 'all' ? 'is-selected' : ''}`}
          onClick={() => setFilterStatus('all')}
        >
          <span className="stat-card__index mono">01 / TOTAL</span>
          <p className="stat-card__value mono">{summary.total}</p>
          <p className="stat-card__label">Screened total</p>
          <span className="stat-card__note">Protected account records</span>
        </button>
        <button
          type="button"
          className={`card stat-card stat-card--flag ${filterStatus === 'flagged' ? 'is-selected' : ''}`}
          onClick={() => setFilterStatus('flagged')}
        >
          <span className="stat-card__index mono">02 / ACTION</span>
          <p className="stat-card__value mono">{summary.flagged}</p>
          <p className="stat-card__label">Need follow-up</p>
          <span className="stat-card__note">Review priority cases</span>
        </button>
        <button
          type="button"
          className="card stat-card stat-card--pending"
          onClick={() => document.getElementById('referral-workflow')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <span className="stat-card__index mono">03 / REFERRALS</span>
          <p className="stat-card__value mono">{summary.activeReferrals}</p>
          <p className="stat-card__label">Active follow-ups</p>
          <span className="stat-card__note">Tracked through completion</span>
        </button>
      </div>

      <section id="referral-workflow" className="referral-workflow" aria-labelledby="referral-heading">
        <div className="referral-workflow__heading">
          <div>
            <span className="panel-index">CARE LOOP / LIVE</span>
            <h2 id="referral-heading">Referral follow-up</h2>
          </div>
          <span className="mono">{summary.activeReferrals.toString().padStart(2, '0')} ACTIVE</span>
        </div>
        <div className="referral-grid">
          {triageReferrals.slice(0, 6).map((referral) => {
            const currentIndex = referralWorkflow.index(referral.status)
            const nextStatus = referralWorkflow.next(referral.status)
            return (
              <article className={`card referral-card referral-card--${referral.priority}`} key={referral.id}>
                <div className="referral-card__top">
                  <div>
                    <span className="mono">{referral.patient?.patient_code || 'PATIENT'}</span>
                    <h3>{referral.patient?.full_name || 'Protected patient'}</h3>
                  </div>
                  <span className={`pill ${referral.status === 'completed' ? 'pill--ok' : referral.priority === 'urgent' ? 'pill--flag' : 'pill--pending'}`}>
                    <span className="pill-dot" /> {referral.status === 'completed' ? 'Completed' : referral.priority}
                  </span>
                </div>
                <p className="referral-card__reason">{referral.reason}</p>
                <ol className="referral-track" aria-label={`Referral status: ${REFERRAL_LABELS[referral.status]}`}>
                  {REFERRAL_STEPS.map((step, index) => (
                    <li className={index < currentIndex ? 'is-done' : index === currentIndex ? 'is-current' : ''} key={step}>
                      <span />
                      <small>{REFERRAL_LABELS[step]}</small>
                    </li>
                  ))}
                </ol>
                <div className="referral-card__action">
                  <span>Current: <strong>{REFERRAL_LABELS[referral.status]}</strong></span>
                  {nextStatus && (
                    <button className="btn btn--primary" onClick={() => advanceReferral(referral)} disabled={updatingReferral === referral.id}>
                      {updatingReferral === referral.id ? 'Updating…' : `Mark ${REFERRAL_LABELS[nextStatus]}`}
                    </button>
                  )}
                </div>
              </article>
            )
          })}
          {referrals.length === 0 && <div className="card empty-state referral-empty">No referrals yet. A flagged linked screening will appear here automatically.</div>}
        </div>
      </section>

      <div className="table-filter-bar">
        <label className="search-control">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="6" />
            <path d="m16 16 4 4" />
          </svg>
          <span className="sr-only">Search patients</span>
          <input
            type="text"
            placeholder="Search patient name or ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </label>

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
        <div className="patient-table-card__heading">
          <div>
            <span className="panel-index">REGISTER / TODAY</span>
            <p>Screening records</p>
          </div>
          <span className="mono">{filtered.length.toString().padStart(2, '0')} shown</span>
        </div>
        <table className="patient-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Screening</th>
              <th>Primary result</th>
              <th>Recent trend</th>
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
                const history = historiesByPatient.get(p.patientDatabaseId || p.patientId) || []
                const trend = evaluateLongitudinalRisk(history, { tier: p.alertTier || 'GREEN' })
                return (
                  <tr
                    key={p.id}
                    className={p.status === 'flagged' ? 'is-flagged' : undefined}
                    onClick={() => navigate(`/report?id=${p.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <p className="patient-table__name">{p.name}</p>
                      <p className="patient-table__id mono">{p.patientId || p.id}</p>
                    </td>
                    <td>{screeningModeLabel(p)}</td>
                    <td className="mono">{primaryMeasurement(p)}</td>
                    <td title={trend.message}>{trend.trendTier ? trend.trendLabel : 'Needs 3 visits'}</td>
                    <td>
                      <span className={'pill ' + (!p.synced ? STATUS_META.pending.className : meta.className)}>
                        <span className="pill-dot" />
                        {!p.synced ? 'Pending sync' : meta.label}
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
        {hasMoreRecords && (
          <div className="referral-card__action">
            <span>Showing the newest {records.length} records</span>
            <button className="btn btn--ghost" type="button" onClick={loadMoreRecords} disabled={loadingMoreRecords}>
              {loadingMoreRecords ? 'Loading…' : 'Load older records'}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
