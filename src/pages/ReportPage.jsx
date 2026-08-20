import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import QRCode from 'qrcode'
import { screeningRepository } from '../domain/repositories.js'
import { SUPPORTED_LANGUAGES } from '../lib/ai'

const hasNumber = (value) => value !== null && value !== '' && Number.isFinite(Number(value))

export default function ReportPage() {
  const [searchParams] = useSearchParams()
  const recordId = searchParams.get('id')
  const [record, setRecord] = useState(null)
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let active = true
    setLoadError('')
    screeningRepository.findById(recordId)
      .then((loaded) => {
        if (!active) return
        setRecord(loaded)
        if (!loaded) return
        const baseOrigin =
          window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'https://vital-cyan.vercel.app'
            : window.location.origin
        const targetUrl = `${baseOrigin}/report?id=${recordId || loaded.id}`
        return QRCode.toDataURL(targetUrl, { width: 160, margin: 1, errorCorrectionLevel: 'H' })
      })
      .then((dataUrl) => dataUrl && active && setQrDataUrl(dataUrl))
      .catch((error) => active && setLoadError(error.message))
    return () => { active = false }
  }, [recordId])

  if (loadError) return <main className="page"><p className="form-message" role="alert">{loadError}</p></main>
  if (!record) return <main className="page"><p className="page-subtitle">Loading protected report…</p></main>

  const isFlagged = record.status === 'flagged' || ['RED', 'ORANGE'].includes(record.alertTier)
  const langName = SUPPORTED_LANGUAGES.find((l) => l.code === record.language)?.name || 'English'
  const observations = [
    hasNumber(record.hr) && { label: 'Heart rate', value: record.hr, unit: 'bpm' },
    hasNumber(record.br) && { label: 'Breathing rate', value: record.br, unit: 'br/min' },
    hasNumber(record.stress) && { label: 'Pulse variability', value: record.stress, unit: '/100' },
    hasNumber(record.spo2) && { label: 'SpO₂ proxy', value: record.spo2, unit: '%' },
    hasNumber(record.anemiaResult?.hb) && { label: 'Hemoglobin proxy', value: record.anemiaResult.hb, unit: 'g/dL' },
    hasNumber(record.jaundiceResult?.yellowIndex) && { label: 'Scleral yellow index', value: record.jaundiceResult.yellowIndex, unit: 'index' },
    hasNumber(record.bmiResult?.bmi) && { label: 'BMI proxy', value: record.bmiResult.bmi, unit: 'kg/m²' },
    record.bpResult?.isCalibrated && { label: 'BP trend', value: `${record.bpResult.sbp}/${record.bpResult.dbp}`, unit: 'mmHg' },
  ].filter(Boolean)

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="page report-page">
      <div className="report-header">
        <div>
          <p className="eyebrow">Referral record / print ready</p>
          <h1 className="page-title">A record that travels.</h1>
          <p className="page-subtitle">
            Every screening gets a printable page with a QR code back to the full record — so a paper
            trail exists even where printers and signal both come and go.
          </p>
        </div>
        <Link to="/dashboard" className="btn btn--ghost">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="report-sheet-wrap">
        <div className="report-sheet" id="report-print-area">
          <div className="report-sheet__protocol mono">
            <span>REPORT / 01</span>
            <span>{String(record.mode || record.source || 'camera').replaceAll('_', ' ').toUpperCase()} SCREENING</span>
          </div>
          <div className="report-sheet__header">
            <div>
              <p className="report-sheet__brand">VYTAL</p>
              <p className="report-sheet__brand-sub">Community Health Triage & Referral Record</p>
            </div>
            <div className="report-qr-container">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR Code Link" className="report-qr-img" />
              ) : (
                <div className="report-qr">QR</div>
              )}
            </div>
          </div>

          <div className="report-sheet__patient">
            <div>
              <p className="report-sheet__label">Patient Name & ID</p>
              <p className="report-sheet__patient-name">{record.name}</p>
              <p className="report-sheet__label mono">{record.patientId || record.id}</p>
            </div>
            <div className="report-sheet__date">
              <p className="report-sheet__label">Screened Date</p>
              <p className="report-sheet__patient-name">
                {new Date(record.timestamp || Date.now()).toLocaleString('en-GB', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
              <p className="report-sheet__label mono">Lang: {langName}</p>
            </div>
          </div>

          <div className="report-sheet__vitals">
            {observations.map((observation) => (
              <div key={observation.label}>
                <p className="report-sheet__label">{observation.label}</p>
                <p className="report-sheet__vital-value mono">
                  {observation.value} <span>{observation.unit}</span>
                </p>
              </div>
            ))}
          </div>

          {record.alertTier && (
            <p className="report-sheet__label">Unified alert tier: <strong>{record.alertTier}</strong></p>
          )}

          {isFlagged ? (
            <div className="report-sheet__flag">
              <span className="report-status-icon">!</span>
              <span><strong>CLINICAL REVIEW RECOMMENDED</strong> — This screening crossed a configured confirmation threshold.</span>
            </div>
          ) : (
            <div className="report-sheet__normal">
              <span className="report-status-icon">✓</span>
              <span><strong>NO REVIEW THRESHOLD CROSSED</strong> — Continue routine monitoring and assess symptoms clinically.</span>
            </div>
          )}

          <div className="report-sheet__explanation">
            <p className="report-sheet__label">Clinical guidance</p>
            <p>{record.explanation || 'No generated explanation is available for this screening.'}</p>
          </div>

          <p className="report-sheet__disclaimer">
            * Camera-derived results are screening proxies, not diagnoses or medical-device readings. Confirm abnormal or symptomatic findings with approved equipment and a qualified clinician.
          </p>
        </div>
      </div>

      <div className="report-actions">
        <button className="btn btn--primary" onClick={() => window.print()}>
          Print this report <span aria-hidden="true">↗</span>
        </button>
        <button className="btn btn--ghost" onClick={handleCopyLink}>
          {copied ? 'Link copied' : 'Copy record link'}
        </button>
      </div>
    </main>
  )
}
