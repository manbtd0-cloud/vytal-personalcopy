import { useState } from 'react'
import { fetchAIExplanation } from '../lib/ai'
import { supabaseConfigured } from '../lib/supabase.js'

export default function AiConfigModal({ isOpen, onClose }) {
  const [testResult, setTestResult] = useState('')
  const [isTesting, setIsTesting] = useState(false)

  if (!isOpen) return null

  async function handleTestAi() {
    setIsTesting(true)
    setTestResult('')
    try {
      const res = await fetchAIExplanation({
        hr: 98,
        br: 18,
        stress: 65,
        langCode: 'en',
      })
      setTestResult(res)
    } catch (err) {
      setTestResult('API test failed: ' + err.message)
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-config-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <p className="modal-kicker">System configuration / 04</p>
            <h2 className="modal-title" id="ai-config-title">Clinical language engine</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close AI settings">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <p className="modal-sub">
          Configure the service that turns screening data into plain-language guidance. Vytal keeps a
          local clinical fallback available whenever the network is unavailable.
        </p>

        <div className="ai-status-box">
          <span className="ai-status-box__index">01</span>
          <div className="ai-status-row">
            <span className="status-label">Active route</span>
            <span className="pill pill--ok">
              <span className="pill-dot" />
              {supabaseConfigured ? 'Secure server proxy + local fallback' : 'Local clinical fallback'}
            </span>
          </div>
        </div>

        <div className="security-note">
          <strong>Provider keys stay server-side.</strong>
          <span>The browser never receives Groq, Qwen, database-secret, or payment credentials.</span>
        </div>

        {testResult && (
          <div className="ai-test-output">
            <p className="output-label">Live AI Response Output:</p>
            <p className="output-text">{testResult}</p>
          </div>
        )}

        <div className="modal-actions">
          <button className="btn btn--primary" onClick={handleTestAi} disabled={isTesting}>
            {isTesting ? 'Testing connection…' : 'Run connection test'}
          </button>
          <button className="btn btn--ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
