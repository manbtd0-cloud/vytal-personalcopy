import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import QRCode from 'qrcode'
import { getRecordById } from '../lib/storage'
import { SUPPORTED_LANGUAGES, getStressLabel } from '../lib/ai'
import { downloadFhirBundle, openSmsReferral, openWhatsAppShare, speakExplanation } from '../lib/platform'

export default function ReportPage() {
  const [searchParams] = useSearchParams()
  const recordId = searchParams.get('id')
  const [record, setRecord] = useState(null)
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  useEffect(() => {
    const loaded = getRecordById(recordId)
    setRecord(loaded)

    const baseOrigin =
      window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'https://vital-cyan.vercel.app'
        : window.location.origin

    const targetUrl = `${baseOrigin}/report?id=${recordId || loaded?.id || 'P-0231'}`

    QRCode.toDataURL(targetUrl, { width: 160, margin: 1, errorCorrectionLevel: 'H' })
      .then((dataUrl) => setQrDataUrl(dataUrl))
      .catch((err) => console.error('Failed to generate QR code', err))
  }, [recordId])

  if (!record) return null

  const isFlagged = record.status === 'flagged' || record.alertTier === 'RED' || record.alertTier === 'ORANGE'
  const langName = SUPPORTED_LANGUAGES.find((l) => l.code === record.language)?.name || 'English'

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleVoiceReadout() {
    if (isSpeaking) {
      speakExplanation('', 'en') // cancels speech
      setIsSpeaking(false)
      return
    }
    setIsSpeaking(true)
    speakExplanation(record.explanation, record.language || 'en', () => setIsSpeaking(false))
  }

  return (
    <main className="page report-page">
      <div className="report-header">
        <div>
          <p className="eyebrow">Clinical Triage & Referral Record</p>
          <h1 className="page-title">Printable & Exportable Patient Record</h1>
          <p className="page-subtitle">
            Includes QR code, Web Speech voice readouts, SMS fallback, WhatsApp sharing, and HL7 FHIR R4 JSON export.
          </p>
        </div>
        <Link to="/dashboard" className="btn btn--ghost">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="report-sheet-wrap">
        <div className="report-sheet" id="report-print-area">
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
            <div style={{ textAlign: 'right' }}>
              <p className="report-sheet__label">Screened Date</p>
              <p className="report-sheet__patient-name">
                {new Date(record.timestamp || Date.now()).toLocaleString('en-GB', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
              <p className="report-sheet__label mono">Lang: {langName} | Age: {record.ageGroup || 'adult'}</p>
            </div>
          </div>

          <div className="report-sheet__vitals">
            <div>
              <p className="report-sheet__label">Heart rate</p>
              <p className="report-sheet__vital-value mono">
                {record.hr} <span>bpm</span>
              </p>
            </div>
            <div>
              <p className="report-sheet__label">Breathing rate</p>
              <p className="report-sheet__vital-value mono">
                {record.br || 16} <span>br/min</span>
              </p>
            </div>
            <div>
              <p className="report-sheet__label">Stress Index</p>
              <p className="report-sheet__vital-value">
                {record.stressLabel || getStressLabel(record.stress)} ({record.stress ?? 0}/100)
              </p>
            </div>
            {record.spo2 && (
              <div>
                <p className="report-sheet__label">SpO2 Proxy</p>
                <p className="report-sheet__vital-value mono">
                  {record.spo2} <span>%</span>
                </p>
              </div>
            )}
          </div>

          {isFlagged ? (
            <div className="report-sheet__flag">
              ⚠️ <strong>CLINICAL REFERRAL RECOMMENDED [{record.alertTier || 'ALERT'}]</strong> — Patient vitals indicate follow-up required.
            </div>
          ) : (
            <div className="report-sheet__normal">
              ✓ <strong>VITALS IN NORMAL RESTING RANGE</strong> — No urgent clinical referral indicated.
            </div>
          )}

          <div className="report-sheet__explanation">
            <p className="report-sheet__label">AI Triage Explanation</p>
            <p>{record.explanation}</p>
          </div>

          <p className="report-sheet__disclaimer">
            * Not a standalone medical diagnostic device. Vytal explains and flags vitals. Clinical decisions remain with a registered medical practitioner.
          </p>
        </div>
      </div>

      <div className="report-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '16px' }}>
        <button className="btn btn--primary" onClick={() => window.print()}>
          🖨️ Print Report
        </button>

        <button className="btn btn--ghost" onClick={handleVoiceReadout}>
          {isSpeaking ? '🔊 Stop Voice' : '🗣️ Voice Readout'}
        </button>

        <button className="btn btn--ghost" onClick={() => openWhatsAppShare(record, window.location.href)}>
          💬 WhatsApp Share
        </button>

        <button className="btn btn--ghost" onClick={() => openSmsReferral('', record)}>
          📱 SMS Referral
        </button>

        <button className="btn btn--ghost" onClick={() => downloadFhirBundle(record)}>
          📂 FHIR R4 JSON Export
        </button>

        <button className="btn btn--ghost" onClick={handleCopyLink}>
          {copied ? '✓ Copied!' : '🔗 Copy Link'}
        </button>
      </div>
    </main>
  )
}
