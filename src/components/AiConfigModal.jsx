import { useState } from 'react'
import { fetchAIExplanation } from '../lib/ai'

export default function AiConfigModal({ isOpen, onClose }) {
  const [testResult, setTestResult] = useState('')
  const [isTesting, setIsTesting] = useState(false)
  const [customKey, setCustomKey] = useState('')

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
        apiKey: customKey.trim(),
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
      <div className="modal-card card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">AI Engine Integration & Status</h2>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <p className="modal-sub">
          Vytal uses Qwen (Alibaba DashScope) and Groq (LLaMA 3.3 70B) for clinical triage explanations.
          When offline or without an API key, local clinical NLG rules generate instant guidance.
        </p>

        <div className="ai-status-box">
          <div className="ai-status-row">
            <span className="status-label">Active Provider:</span>
            <span className="pill pill--ok">
              <span className="pill-dot" />
              {customKey ? 'Custom API Key' : 'Groq LLaMA / Qwen + Local Clinical Fallback'}
            </span>
          </div>
        </div>

        <div className="key-input-group">
          <label htmlFor="custom-key-input" className="key-label">
            Optional API Key (Groq or DashScope):
          </label>
          <input
            id="custom-key-input"
            type="password"
            placeholder="Paste gsk_... or sk-..."
            value={customKey}
            onChange={(e) => setCustomKey(e.target.value)}
            className="key-input"
          />
        </div>

        {testResult && (
          <div className="ai-test-output">
            <p className="output-label">Live AI Response Output:</p>
            <p className="output-text">{testResult}</p>
          </div>
        )}

        <div className="modal-actions">
          <button className="btn btn--primary" onClick={handleTestAi} disabled={isTesting}>
            {isTesting ? 'Testing AI Call…' : '⚡ Test Live AI Request'}
          </button>
          <button className="btn btn--ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
