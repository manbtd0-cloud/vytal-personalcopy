import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import {
  createBillingCheckout,
  createDonationCheckout,
  loadBillingOverview,
} from '../lib/account.js'

function money(amountMinor, currency) {
  return new Intl.NumberFormat('en', { style: 'currency', currency: currency || 'USD' }).format((amountMinor ?? 0) / 100)
}

export default function BillingPage() {
  const { configured, user } = useAuth()
  const [searchParams] = useSearchParams()
  const [amount, setAmount] = useState('25')
  const [currency, setCurrency] = useState('USD')
  const [busy, setBusy] = useState(false)
  const [billingBusy, setBillingBusy] = useState('')
  const [message, setMessage] = useState('')
  const [billing, setBilling] = useState({ products: [], invoices: [], donations: [] })
  const donationResult = searchParams.get('donation')
  const invoiceResult = searchParams.get('invoice')

  useEffect(() => {
    if (!user) return
    loadBillingOverview().then(setBilling).catch((error) => setMessage(error.message))
  }, [user, donationResult, invoiceResult])

  async function purchase(productCode) {
    setBillingBusy(productCode)
    setMessage('')
    try {
      const url = await createBillingCheckout(productCode)
      window.location.assign(url)
    } catch (error) {
      setMessage(error.message)
      setBillingBusy('')
    }
  }

  async function donate(event) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      const url = await createDonationCheckout({ amount, currency })
      window.location.assign(url)
    } catch (error) {
      setMessage(error.message)
      setBusy(false)
    }
  }

  return (
    <main className="page billing-page">
      <header className="dashboard-header billing-header">
        <div>
          <p className="eyebrow">Billing / donations</p>
          <h1 className="page-title">Support care, securely.</h1>
          <p className="page-subtitle">Hosted checkout handles payment details. VYTAL stores only provider IDs, status, amount, and receipt links.</p>
        </div>
        <span className="pill pill--ok"><span className="pill-dot" /> Server-side payment boundary</span>
      </header>

      {donationResult === 'success' && <div className="payment-banner payment-banner--success" role="status"><strong>Thank you.</strong> Payment confirmation is being verified by the signed webhook. Your receipt will appear below.</div>}
      {donationResult === 'cancelled' && <div className="payment-banner">Checkout was cancelled. You were not charged.</div>}
      {invoiceResult === 'success' && <div className="payment-banner payment-banner--success" role="status"><strong>Checkout complete.</strong> The signed payment webhook is verifying your account invoice and receipt.</div>}
      {invoiceResult === 'cancelled' && <div className="payment-banner">Account checkout was cancelled. The unpaid invoice was kept for audit history and will be voided when Stripe reports expiry.</div>}

      {!configured ? (
        <section className="card backend-setup"><span className="panel-index">PAYMENTS / SETUP</span><h2>Secure backend required</h2><p>Connect Supabase, deploy the payment Edge Functions, and set the Stripe merchant secrets before accepting money. The interface intentionally refuses to simulate a successful payment.</p></section>
      ) : !user ? (
        <section className="card backend-setup"><span className="panel-index">AUTH / REQUIRED</span><h2>Sign in before billing</h2><p>Invoices, donation attempts and receipts are tied to an authenticated account.</p><Link className="btn btn--primary" to="/account">Go to secure sign in</Link></section>
      ) : (
        <div className="billing-layout">
          {message && <div className="payment-banner billing-history--wide" role="alert">{message}</div>}
          <section className="card billing-products billing-history--wide">
            <div className="section-heading-row"><div><span className="panel-index">ACCOUNT SERVICES / 01</span><h2>Charges tied to your account</h2></div></div>
            <p>Prices come from the protected backend—not the browser. Checkout and payment details remain with Stripe.</p>
            {billing.products.length === 0 ? <p className="empty-state">No account services are available.</p> : (
              <div className="billing-product-grid">
                {billing.products.map((product) => (
                  <article className="billing-product" key={product.code}>
                    <div><span className="billing-product-kicker">ONE-TIME CHARGE</span><h3>{product.name}</h3><p>{product.description}</p></div>
                    <div className="billing-product-action"><strong>{money(product.amount_minor, product.currency)}</strong><button type="button" className="btn btn--primary" disabled={Boolean(billingBusy)} onClick={() => purchase(product.code)}>{billingBusy === product.code ? 'Opening checkout…' : 'Continue securely'}</button></div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="card donation-panel">
            <span className="panel-index">DONATE / 02</span>
            <h2>Fund a community screening</h2>
            <p>Payment card or wallet details stay on the payment provider’s hosted checkout—not in this application or database.</p>
            <form onSubmit={donate} className="donation-form">
              <div className="donation-presets">
                {['10', '25', '50', '100'].map((value) => <button type="button" className={amount === value ? 'is-selected' : ''} onClick={() => setAmount(value)} key={value}>{value}</button>)}
              </div>
              <div className="donation-custom">
                <label className="field-control"><span>Amount</span><input type="number" min="1" max="100000" step="1" value={amount} onChange={(e) => setAmount(e.target.value)} required /></label>
                <label className="field-control"><span>Currency</span><select value={currency} onChange={(e) => setCurrency(e.target.value)}><option>USD</option><option>PKR</option><option>GBP</option><option>EUR</option></select></label>
              </div>
              <button className="btn btn--primary donate-button" disabled={busy}>{busy ? 'Opening secure checkout…' : '♥ Donate securely'}</button>
            </form>
          </section>

          <section className="card billing-history">
            <div className="section-heading-row"><div><span className="panel-index">DONATION HISTORY / 03</span><h2>Donation receipts</h2></div></div>
            {billing.donations.length === 0 ? <p className="empty-state">No donation receipts yet.</p> : billing.donations.map((item) => (
              <div className="billing-row billing-row--invoice" key={item.id}>
                <div><strong>{money(item.amount_minor, item.currency)}</strong><span>{new Date(item.created_at).toLocaleDateString()}</span></div>
                <span className={`pill ${item.status === 'paid' ? 'pill--ok' : item.status === 'failed' ? 'pill--flag' : 'pill--pending'}`}><span className="pill-dot" /> {item.status}</span>
                {item.receipt_url ? <a href={item.receipt_url} target="_blank" rel="noreferrer">Receipt ↗</a> : <span className="billing-muted">Awaiting receipt</span>}
              </div>
            ))}
          </section>

          <section className="card billing-history billing-history--wide">
            <div className="section-heading-row"><div><span className="panel-index">INVOICES / 04</span><h2>Account billing</h2></div></div>
            {billing.invoices.length === 0 ? <p className="empty-state">No invoices on this account.</p> : billing.invoices.map((item) => (
              <div className="billing-row" key={item.id}>
                <div><strong>{item.invoice_number}</strong><span>{new Date(item.issued_at).toLocaleDateString()}</span></div>
                <span>{money(item.amount_minor, item.currency)}</span>
                <span className={`pill ${item.status === 'paid' ? 'pill--ok' : ['void', 'uncollectible'].includes(item.status) ? 'pill--flag' : 'pill--pending'}`}><span className="pill-dot" /> {item.status}</span>
                {item.receipt_url ? <a href={item.receipt_url} target="_blank" rel="noreferrer">Receipt ↗</a> : <span className="billing-muted">No receipt yet</span>}
              </div>
            ))}
          </section>
        </div>
      )}
    </main>
  )
}
