import {
  adminClient,
  assertAllowedOrigin,
  authenticatedUser,
  corsHeaders,
  enforceRateLimit,
  json,
  readJsonBody,
} from '../_shared/security.ts'
import { AppError, createFunctionHandler } from '../_shared/errors.ts'
import { configuredSiteUrl, stripeClient } from '../_shared/stripe.ts'

const allowedCurrencies = new Set(['usd', 'pkr', 'gbp', 'eur'])

Deno.serve(createFunctionHandler('create-donation-checkout', {
  fallback: {
    status: 500,
    code: 'DONATION_CHECKOUT_FAILED',
    message: 'Unable to start secure donation checkout.',
  },
  byStatus: {
    429: { code: 'DONATION_RATE_LIMITED', message: 'Too many checkout attempts. Please wait and try again.' },
  },
}, async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req) })
  if (req.method !== 'POST') throw new AppError(405, 'METHOD_NOT_ALLOWED', 'Only POST requests are accepted.')

  assertAllowedOrigin(req)
  const user = await authenticatedUser(req)
  const admin = adminClient()
  await enforceRateLimit('donation-checkout', user.id, 5, 600, admin)
  const payload = await readJsonBody(req, 4_096)
  const amount = Number(payload.amount)
  const currency = String(payload.currency ?? '').toLowerCase()

  if (!Number.isFinite(amount) || amount < 1 || amount > 100000) {
    throw new AppError(400, 'INVALID_DONATION_AMOUNT', 'Donation amount is outside the allowed range.')
  }
  if (!allowedCurrencies.has(currency)) {
    throw new AppError(400, 'UNSUPPORTED_CURRENCY', 'Unsupported donation currency.')
  }

  const amountMinor = Math.round(amount * 100)
  const stripe = stripeClient()
  const siteUrl = configuredSiteUrl()
  const { data: donation, error: donationError } = await admin
    .from('donations')
    .insert({
      user_id: user.id,
      provider: 'stripe',
      amount_minor: amountMinor,
      currency: currency.toUpperCase(),
      status: 'pending',
      metadata: { source: 'vytal_billing_page' },
    })
    .select('id')
    .single()
  if (donationError) throw donationError

  try {
    const checkout = await stripe.checkout.sessions.create(
        {
          mode: 'payment',
          submit_type: 'donate',
          customer_email: user.email,
          line_items: [
            {
              quantity: 1,
              price_data: {
                currency,
                unit_amount: amountMinor,
                product_data: { name: 'VYTAL community health donation' },
              },
            },
          ],
          metadata: { payment_kind: 'donation', donation_id: donation.id, user_id: user.id },
          payment_intent_data: {
            metadata: { payment_kind: 'donation', donation_id: donation.id, user_id: user.id },
          },
          success_url: `${siteUrl}/billing?donation=success&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${siteUrl}/billing?donation=cancelled`,
        },
        { idempotencyKey: `vytal-donation-${donation.id}` },
      )

    const { error: updateError } = await admin
      .from('donations')
      .update({ checkout_session_id: checkout.id })
      .eq('id', donation.id)
      .eq('user_id', user.id)
    if (updateError) throw updateError
    return json(req, { url: checkout.url })
  } catch (error) {
    await admin.from('donations').update({ status: 'failed' }).eq('id', donation.id).eq('user_id', user.id)
    throw error
  }
}))
