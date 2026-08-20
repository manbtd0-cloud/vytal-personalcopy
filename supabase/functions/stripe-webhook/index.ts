import type Stripe from 'npm:stripe@^22'
import { adminClient, readTextBody } from '../_shared/security.ts'
import { AppError, createFunctionHandler } from '../_shared/errors.ts'
import {
  stripeClient,
  stripeCryptoProvider,
  stripeWebhookSecret,
} from '../_shared/stripe.ts'

type PaymentKind = 'donation' | 'invoice'
type PaymentOutcome = 'pending' | 'paid' | 'failed' | 'expired'

const SUPPORTED_EVENT_TYPES = new Set([
  'checkout.session.completed',
  'checkout.session.async_payment_succeeded',
  'checkout.session.async_payment_failed',
  'checkout.session.expired',
])

function paymentIntentId(session: Stripe.Checkout.Session) {
  if (typeof session.payment_intent === 'string') return session.payment_intent
  return session.payment_intent?.id ?? null
}

async function receiptFor(stripe: Stripe, intentId: string | null) {
  if (!intentId) return null
  const intent = await stripe.paymentIntents.retrieve(intentId, { expand: ['latest_charge'] })
  if (!intent.latest_charge || typeof intent.latest_charge === 'string') return null
  return 'deleted' in intent.latest_charge ? null : intent.latest_charge.receipt_url
}

Deno.serve(createFunctionHandler('stripe-webhook', {
  fallback: {
    status: 500,
    code: 'WEBHOOK_PROCESSING_FAILED',
    message: 'Webhook processing failed.',
  },
}, async (req, trace) => {
  if (req.method !== 'POST') throw new AppError(405, 'METHOD_NOT_ALLOWED', 'Only POST requests are accepted.')

  let stripe: Stripe
  let webhookSecret: string
  try {
    stripe = stripeClient()
    webhookSecret = stripeWebhookSecret()
  } catch {
    throw new AppError(503, 'WEBHOOK_NOT_CONFIGURED', 'Webhook is not configured.', true)
  }

  let body: string
  try {
    body = await readTextBody(req, 524_288)
  } catch (error) {
    if (error instanceof Response) throw error
    throw new AppError(400, 'WEBHOOK_BODY_INVALID', 'Unable to read webhook body.')
  }

  const signature = req.headers.get('stripe-signature') ?? ''
  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      stripeCryptoProvider(),
    )
  } catch {
    throw new AppError(400, 'INVALID_WEBHOOK_SIGNATURE', 'Webhook signature is invalid.')
  }

  const admin = adminClient()
  const { data: claimed, error: claimError } = await admin.rpc('claim_payment_event', {
    p_event_id: event.id,
    p_provider: 'stripe',
    p_event_type: event.type,
  })
  if (claimError) {
    throw new AppError(503, 'WEBHOOK_CLAIM_UNAVAILABLE', 'Webhook is temporarily unavailable.', true)
  }
  if (!claimed) {
    trace.log('info', 'payment_event.duplicate', { provider: 'stripe' })
    return Response.json({ received: true, duplicate: true })
  }

  try {
    if (SUPPORTED_EVENT_TYPES.has(event.type)) {
      const session = event.data.object as Stripe.Checkout.Session
      const kind = session.metadata?.payment_kind as PaymentKind | undefined
      const userId = session.metadata?.user_id
      if (!kind || !userId || !['donation', 'invoice'].includes(kind)) {
        throw new Error('Payment metadata is incomplete.')
      }

      const recordId = kind === 'donation'
        ? session.metadata?.donation_id
        : session.metadata?.invoice_id
      const amountMinor = session.amount_total
      const currency = session.currency?.toUpperCase()
      if (!recordId || amountMinor === null || !Number.isInteger(amountMinor) || !currency) {
        throw new Error('Checkout metadata is incomplete.')
      }

      const succeeded = event.type === 'checkout.session.async_payment_succeeded'
        || (event.type === 'checkout.session.completed' && session.payment_status === 'paid')
      const failed = event.type === 'checkout.session.async_payment_failed'
      const expired = event.type === 'checkout.session.expired'
      const outcome: PaymentOutcome = succeeded ? 'paid' : failed ? 'failed' : expired ? 'expired' : 'pending'

      let intentId: string | null = null
      let receiptUrl: string | null = null
      if (outcome === 'paid') {
        intentId = paymentIntentId(session)
        receiptUrl = await receiptFor(stripe, intentId)
      }

      const { error: applyError } = await admin.rpc('apply_checkout_event', {
        p_kind: kind,
        p_record_id: recordId,
        p_user_id: userId,
        p_checkout_session_id: session.id,
        p_outcome: outcome,
        p_amount_minor: amountMinor,
        p_currency: currency,
        p_provider_payment_id: intentId,
        p_receipt_url: receiptUrl,
      })
      if (applyError) throw applyError
    }

    const { error: finishError } = await admin.rpc('finish_payment_event', {
      p_event_id: event.id,
      p_succeeded: true,
      p_error: null,
    })
    if (finishError) throw finishError
    return Response.json({ received: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown webhook processing error.'
    await admin.rpc('finish_payment_event', {
      p_event_id: event.id,
      p_succeeded: false,
      p_error: message,
    })
    throw new AppError(500, 'WEBHOOK_EVENT_FAILED', 'Webhook processing failed.', true)
  }
}))
