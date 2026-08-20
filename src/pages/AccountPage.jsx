import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { loadAccountProfile, saveAccountProfile } from '../lib/account.js'

const emptyProfile = {
  full_name: '', date_of_birth: '', sex: 'prefer_not_to_say', phone: '',
  address: {}, emergency_contact: {}, custom_fields: {},
}

function BackendSetup() {
  return (
    <section className="card backend-setup">
      <span className="panel-index">SECURE CORE / SETUP</span>
      <h2>Connect the protected database</h2>
      <p>
        The application is running in non-persistent preview mode. Add only the Supabase URL and
        publishable key to the browser environment; secret and service-role keys belong exclusively
        in Edge Function secrets.
      </p>
      <pre><code>VITE_SUPABASE_URL=https://your-project.supabase.co{`\n`}VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...</code></pre>
    </section>
  )
}

function AuthForm() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('signin')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      if (mode === 'signup') {
        const result = await signUp(email.trim(), password, fullName)
        setMessage(result.session ? 'Account created securely.' : 'Check your email to confirm the account.')
      } else {
        await signIn(email.trim(), password)
      }
    } catch (error) {
      setMessage(error.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="card auth-card">
      <span className="panel-index">AUTH / 01</span>
      <h2>{mode === 'signin' ? 'Sign in to protected records' : 'Create a protected account'}</h2>
      <p>Authentication is required before the database will return any profile, vital, billing, or donation row.</p>
      <form onSubmit={submit} className="form-stack">
        {mode === 'signup' && (
          <label className="field-control">
            <span>Full name</span>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength="120" required />
          </label>
        )}
        <label className="field-control">
          <span>Email</span>
          <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="field-control">
          <span>Password</span>
          <input type="password" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} minLength="10" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {message && <p className="form-message" role="status">{message}</p>}
        <button className="btn btn--primary" disabled={busy}>
          {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in securely' : 'Create account'}
        </button>
      </form>
      <button className="text-button" type="button" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
        {mode === 'signin' ? 'Need an account? Create one' : 'Already registered? Sign in'}
      </button>
    </section>
  )
}

export default function AccountPage() {
  const { configured, loading: authLoading, user, signOut } = useAuth()
  const [profile, setProfile] = useState(emptyProfile)
  const [baselines, setBaselines] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!user) return
    setLoading(true)
    loadAccountProfile()
      .then((data) => {
        setProfile({ ...emptyProfile, ...data.profile })
        setBaselines(data.baselines.map((item) => ({
          id: item.id,
          metric_key: item.metric_key,
          value: item.value_numeric ?? item.value_text ?? '',
          unit: item.unit ?? '',
        })))
      })
      .catch((error) => setMessage(error.message))
      .finally(() => setLoading(false))
  }, [user])

  function updateNested(group, key, value) {
    setProfile((current) => ({ ...current, [group]: { ...(current[group] ?? {}), [key]: value } }))
  }

  function updateBaseline(index, key, value) {
    setBaselines((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item))
  }

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const result = await saveAccountProfile(profile, baselines)
      setProfile({ ...emptyProfile, ...result.profile })
      setMessage('Profile and baseline vitals saved securely.')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setSaving(false)
    }
  }

  if (authLoading) return <main className="page"><p className="page-subtitle">Checking secure session…</p></main>

  return (
    <main className="page account-page">
      <header className="dashboard-header account-header">
        <div>
          <p className="eyebrow">Identity / protected health profile</p>
          <h1 className="page-title">Your data. Your access.</h1>
          <p className="page-subtitle">Profile and medical baseline rows are isolated by authenticated user ID inside Postgres.</p>
        </div>
        {user && <button className="btn btn--ghost" onClick={signOut}>Sign out</button>}
      </header>

      {!configured ? <BackendSetup /> : !user ? <AuthForm /> : (
        <form className="account-grid" onSubmit={submit}>
          <section className="card profile-panel">
            <div className="section-heading-row">
              <div><span className="panel-index">PROFILE / 01</span><h2>Personal and contact details</h2></div>
              <span className="pill pill--ok"><span className="pill-dot" /> Authenticated</span>
            </div>
            {loading ? <p>Loading protected profile…</p> : (
              <div className="form-grid">
                <label className="field-control field-control--wide"><span>Full name</span><input value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} maxLength="120" required /></label>
                <label className="field-control"><span>Date of birth</span><input type="date" value={profile.date_of_birth ?? ''} onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })} /></label>
                <label className="field-control"><span>Sex</span><select value={profile.sex} onChange={(e) => setProfile({ ...profile, sex: e.target.value })}><option value="prefer_not_to_say">Prefer not to say</option><option value="female">Female</option><option value="male">Male</option><option value="intersex">Intersex</option><option value="other">Other</option></select></label>
                <label className="field-control"><span>Contact number</span><input type="tel" value={profile.phone ?? ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} maxLength="32" /></label>
                <label className="field-control"><span>City</span><input value={profile.address?.city ?? ''} onChange={(e) => updateNested('address', 'city', e.target.value)} maxLength="100" /></label>
                <label className="field-control field-control--wide"><span>Address</span><input value={profile.address?.line1 ?? ''} onChange={(e) => updateNested('address', 'line1', e.target.value)} maxLength="180" /></label>
              </div>
            )}
          </section>

          <section className="card profile-panel">
            <div className="section-heading-row"><div><span className="panel-index">SAFETY / 02</span><h2>Emergency contact</h2></div></div>
            <div className="form-grid">
              <label className="field-control field-control--wide"><span>Name</span><input value={profile.emergency_contact?.name ?? ''} onChange={(e) => updateNested('emergency_contact', 'name', e.target.value)} maxLength="120" /></label>
              <label className="field-control"><span>Relationship</span><input value={profile.emergency_contact?.relationship ?? ''} onChange={(e) => updateNested('emergency_contact', 'relationship', e.target.value)} maxLength="80" /></label>
              <label className="field-control"><span>Phone</span><input type="tel" value={profile.emergency_contact?.phone ?? ''} onChange={(e) => updateNested('emergency_contact', 'phone', e.target.value)} maxLength="32" /></label>
            </div>
          </section>

          <section className="card profile-panel profile-panel--wide">
            <div className="section-heading-row">
              <div><span className="panel-index">BASELINE / 03</span><h2>Extensible health baseline</h2><p>Add any metric without changing the profile schema.</p></div>
              <button className="btn btn--ghost" type="button" onClick={() => setBaselines([...baselines, { metric_key: '', value: '', unit: '' }])}>+ Add vital</button>
            </div>
            <datalist id="metric-options"><option value="heart_rate" /><option value="breathing_rate" /><option value="spo2_proxy" /><option value="systolic_bp_trend" /><option value="diastolic_bp_trend" /><option value="bmi_proxy" /><option value="temperature" /></datalist>
            <div className="baseline-list">
              {baselines.length === 0 && <p className="empty-state">No baseline metrics yet. Add only measurements you have consent to store.</p>}
              {baselines.map((item, index) => (
                <div className="baseline-row" key={item.id ?? index}>
                  <label className="field-control"><span>Metric key</span><input list="metric-options" value={item.metric_key} onChange={(e) => updateBaseline(index, 'metric_key', e.target.value)} placeholder="heart_rate" /></label>
                  <label className="field-control"><span>Value</span><input value={item.value} onChange={(e) => updateBaseline(index, 'value', e.target.value)} placeholder="72" /></label>
                  <label className="field-control"><span>Unit</span><input value={item.unit} onChange={(e) => updateBaseline(index, 'unit', e.target.value)} placeholder="bpm" /></label>
                  <button className="icon-remove" type="button" aria-label="Remove baseline" onClick={() => setBaselines(baselines.filter((_, i) => i !== index))}>×</button>
                </div>
              ))}
            </div>
            {message && <p className="form-message" role="status">{message}</p>}
            <div className="profile-actions"><button className="btn btn--primary" disabled={saving || loading}>{saving ? 'Saving securely…' : 'Save protected profile'}</button></div>
          </section>

          <aside className="security-grid profile-panel--wide" aria-label="Database security controls">
            {[
              ['Row-level isolation', 'Every query is constrained by auth.uid() inside Postgres.'],
              ['No browser secrets', 'Service-role, AI and payment keys are Edge Function secrets only.'],
              ['Flexible vitals', 'Measurements live in validated metric rows instead of fixed patient columns.'],
            ].map(([title, copy]) => <div className="card security-control" key={title}><span className="pill pill--ok"><span className="pill-dot" /> Active</span><h3>{title}</h3><p>{copy}</p></div>)}
          </aside>
        </form>
      )}
    </main>
  )
}

