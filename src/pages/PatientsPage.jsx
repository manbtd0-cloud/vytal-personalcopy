import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { patientRepository } from '../domain/repositories.js'

const emptyPatient = {
  full_name: '', date_of_birth: '', sex: 'prefer_not_to_say', phone: '',
  emergency_contact: { name: '', relationship: '', phone: '' }, consent_status: 'pending',
}

function ageFromDate(date) {
  if (!date) return 'Age not recorded'
  const birth = new Date(`${date}T00:00:00`)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const beforeBirthday = today.getMonth() < birth.getMonth()
    || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
  if (beforeBirthday) age -= 1
  return `${age} years`
}

export default function PatientsPage() {
  const { configured, loading: authLoading, user } = useAuth()
  const [patients, setPatients] = useState([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyPatient)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [updatingConsent, setUpdatingConsent] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (authLoading || (configured && !user)) {
      setLoading(false)
      return
    }
    let active = true
    setLoading(true)
    patientRepository.list()
      .then((items) => active && setPatients(items))
      .catch((error) => active && setMessage(error.message))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [authLoading, configured, user])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return patients
    return patients.filter((patient) =>
      patient.full_name.toLowerCase().includes(term)
      || patient.patient_code.toLowerCase().includes(term))
  }, [patients, search])

  function updateEmergency(key, value) {
    setForm((current) => ({
      ...current,
      emergency_contact: { ...current.emergency_contact, [key]: value },
    }))
  }

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const patient = await patientRepository.create(form)
      setPatients((current) => [patient, ...current])
      setForm(emptyPatient)
      setShowForm(false)
      setMessage(`${patient.full_name} is ready for a linked screening.`)
    } catch (error) {
      setMessage(error.message)
    } finally {
      setSaving(false)
    }
  }

  async function grantConsent(patient) {
    const confirmed = window.confirm(`Confirm that ${patient.full_name} or their guardian has agreed to store this profile and link screening records for follow-up.`)
    if (!confirmed) return

    setUpdatingConsent(patient.id)
    setMessage('')
    try {
      const updated = await patientRepository.updateConsent(patient.id, 'granted')
      setPatients((current) => current.map((item) => item.id === patient.id ? updated : item))
      setMessage(`Consent recorded. ${patient.full_name} is ready for a linked screening.`)
    } catch (error) {
      setMessage(error.message)
    } finally {
      setUpdatingConsent('')
    }
  }

  if (authLoading) return <main className="page"><p className="page-subtitle">Checking secure session…</p></main>

  if (configured && !user) {
    return (
      <main className="page patients-page">
        <section className="card backend-setup">
          <span className="panel-index">PATIENTS / PROTECTED</span>
          <h1>Sign in to open the patient register.</h1>
          <p>Patient demographics, emergency contacts, screenings and referrals are isolated by the authenticated health worker account.</p>
          <Link className="btn btn--primary" to="/account">Go to secure sign in</Link>
        </section>
      </main>
    )
  }

  return (
    <main className="page patients-page">
      <header className="dashboard-header patients-header">
        <div>
          <p className="eyebrow">Patient registry / consent first</p>
          <h1 className="page-title">Every reading has a person.</h1>
          <p className="page-subtitle">Register once, link every future screening, and keep follow-up history attached to the correct patient.</p>
        </div>
        <button className="btn btn--primary" onClick={() => setShowForm((value) => !value)}>
          {showForm ? 'Close form' : '+ Register patient'}
        </button>
      </header>

      {!configured && (
        <div className="preview-banner" role="status">
          Demo register: changes remain in memory until the protected database is configured.
        </div>
      )}

      {showForm && (
        <form className="card patient-register-form" onSubmit={submit}>
          <div className="section-heading-row">
            <div><span className="panel-index">NEW PATIENT / 01</span><h2>Identity and safe contact</h2></div>
            <span className="pill pill--pending"><span className="pill-dot" /> Consent required</span>
          </div>
          <div className="form-grid">
            <label className="field-control field-control--wide"><span>Full name</span><input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} maxLength="120" required /></label>
            <label className="field-control"><span>Date of birth</span><input type="date" max={new Date().toISOString().slice(0, 10)} value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} /></label>
            <label className="field-control"><span>Sex</span><select value={form.sex} onChange={(e) => setForm({ ...form, sex: e.target.value })}><option value="prefer_not_to_say">Prefer not to say</option><option value="female">Female</option><option value="male">Male</option><option value="intersex">Intersex</option><option value="other">Other</option></select></label>
            <label className="field-control"><span>Contact number</span><input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength="32" /></label>
            <label className="field-control"><span>Emergency contact</span><input value={form.emergency_contact.name} onChange={(e) => updateEmergency('name', e.target.value)} maxLength="120" /></label>
            <label className="field-control"><span>Relationship</span><input value={form.emergency_contact.relationship} onChange={(e) => updateEmergency('relationship', e.target.value)} maxLength="80" /></label>
            <label className="field-control"><span>Emergency phone</span><input type="tel" value={form.emergency_contact.phone} onChange={(e) => updateEmergency('phone', e.target.value)} maxLength="32" /></label>
          </div>
          <label className="consent-control">
            <input type="checkbox" checked={form.consent_status === 'granted'} onChange={(e) => setForm({ ...form, consent_status: e.target.checked ? 'granted' : 'pending' })} />
            <span>The patient or guardian has agreed to store this profile and link screening records for follow-up.</span>
          </label>
          <div className="profile-actions"><button className="btn btn--primary" disabled={saving}>{saving ? 'Registering securely…' : 'Register and start screening'}</button></div>
        </form>
      )}

      {message && <p className="form-message" role="status">{message}</p>}

      <div className="patient-directory-toolbar">
        <label className="search-control">
          <span className="sr-only">Search patient register</span>
          <input className="search-input" placeholder="Search name or patient code" value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
        <span className="mono">{filtered.length.toString().padStart(2, '0')} PATIENTS</span>
      </div>

      {loading ? <p className="empty-state">Loading protected patient register…</p> : (
        <section className="patient-directory-grid" aria-label="Patient directory">
          {filtered.map((patient) => (
            <article className="card patient-profile-card" key={patient.id}>
              <div className="patient-profile-card__top">
                <span className="mono">{patient.patient_code}</span>
                <span className={`pill ${patient.consent_status === 'granted' ? 'pill--ok' : 'pill--pending'}`}><span className="pill-dot" /> {patient.consent_status}</span>
              </div>
              <div>
                <h2>{patient.full_name}</h2>
                <p>{ageFromDate(patient.date_of_birth)} · {patient.sex.replaceAll('_', ' ')}</p>
              </div>
              <dl className="patient-contact-list">
                <div><dt>Contact</dt><dd>{patient.phone || 'Not recorded'}</dd></div>
                <div><dt>Emergency</dt><dd>{patient.emergency_contact?.name || 'Not recorded'}{patient.emergency_contact?.phone ? ` · ${patient.emergency_contact.phone}` : ''}</dd></div>
              </dl>
              {patient.consent_status === 'granted' ? (
                <Link className="btn btn--primary" to={`/?patient=${encodeURIComponent(patient.id)}`}>Start linked screening →</Link>
              ) : (
                <button className="btn btn--ghost" type="button" onClick={() => grantConsent(patient)} disabled={updatingConsent === patient.id}>
                  {updatingConsent === patient.id ? 'Recording consent…' : 'Record consent to screen'}
                </button>
              )}
            </article>
          ))}
          {filtered.length === 0 && <div className="card empty-state patient-directory-empty">No matching patients. Register the first profile to begin a traceable screening.</div>}
        </section>
      )}
    </main>
  )
}
