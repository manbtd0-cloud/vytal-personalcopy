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

const productCodePattern = /^[a-z][a-z0-9_-]{2,63}$/

Deno.serve(createFunctionHandler('create-billing-checkout', {
  fallback: {
    status: 500,
    code: 'BILLING_CHECKOUT_FAILED',
    message: 'Unable to start secure billing checkout.',
  },
  byStatus: {
    429: { code: 'BILLING_RATE_LIMITED', message: 'Too many checkout attempts. Please wait and try again.' },
  },
}, async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req) })
  if (req.method !== 'POST') throw new AppError(405, 'METHOD_NOT_ALLOWED', 'Only POST requests are accepted.')

  assertAllowedOrigin(req)
  const user = await authenticatedUser(req)
  const admin = adminClient()
  await enforceRateLimit('billing-checkout', user.id, 5, 600, admin)

  const payload = await readJsonBody(req, 4_096)
  const productCode = String(payload.productCode ?? '').trim().toLowerCase()
  if (!productCodePattern.test(productCode)) {
    throw new AppError(400, 'INVALID_BILLING_PRODUCT', 'Invalid billing product.')
  }

  const stripe = stripeClient()
  const siteUrl = configuredSiteUrl()
  const { data: product, error: productError } = await admin
    .from('billing_products')
    .select('code, name, description, amount_minor, currency')
    .eq('code', productCode)
    .eq('is_active', true)
    .maybeSingle()
  if (productError) throw productError
  if (!product) throw new AppError(404, 'BILLING_PRODUCT_NOT_FOUND', 'Billing product is unavailable.')

  const { data: storedCustomer, error: customerReadError } = await admin
    .from('billing_customers')
    .select('provider_customer_id')
    .eq('user_id', user.id)
    .eq('provider', 'stripe')
    .maybeSingle()
  if (customerReadError) throw customerReadError

  let customerId = storedCustomer?.provider_customer_id
  if (!customerId) {
    const customer = await stripe.customers.create(
      {
        email: user.email,
        metadata: { vytal_user_id: user.id },
      },
      { idempotencyKey: `vytal-customer-${user.id}` },
    )
    customerId = customer.id
    const { error: customerWriteError } = await admin.from('billing_customers').upsert({
      user_id: user.id,
      provider: 'stripe',
      provider_customer_id: customerId,
    })
    if (customerWriteError) throw customerWriteError
  }

  const invoiceNumber = `VYT-${new Date().getUTCFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
  const lineItems = [{
    product_code: product.code,
    description: product.name,
    quantity: 1,
    amount_minor: product.amount_minor,
    currency: product.currency,
  }]

  const { data: invoice, error: invoiceError } = await admin
    .from('invoices')
    .insert({
      user_id: user.id,
      invoice_number: invoiceNumber,
      provider: 'stripe',
      amount_minor: product.amount_minor,
      currency: product.currency,
      status: 'open',
      line_items: lineItems,
      metadata: { product_code: product.code, source: 'vytal_billing_page' },
    })
    .select('id, invoice_number')
    .single()
  if (invoiceError) throw invoiceError

  try {
    const checkout = await stripe.checkout.sessions.create(
        {
          mode: 'payment',
          customer: customerId,
          line_items: [{
            quantity: 1,
            price_data: {
              currency: product.currency.toLowerCase(),
              unit_amount: product.amount_minor,
              product_data: {
                name: product.name,
                description: product.description,
              },
            },
          }],
          metadata: {
            payment_kind: 'invoice',
            invoice_id: invoice.id,
            user_id: user.id,
          },
          payment_intent_data: {
            metadata: { payment_kind: 'invoice', invoice_id: invoice.id, user_id: user.id },
          },
          success_url: `${siteUrl}/billing?invoice=success&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${siteUrl}/billing?invoice=cancelled`,
        },
        { idempotencyKey: `vytal-invoice-${invoice.id}` },
      )

    const { error: sessionUpdateError } = await admin
      .from('invoices')
      .update({ checkout_session_id: checkout.id })
      .eq('id', invoice.id)
      .eq('user_id', user.id)
    if (sessionUpdateError) throw sessionUpdateError

    return json(req, { url: checkout.url, invoiceNumber: invoice.invoice_number })
  } catch (error) {
    await admin.from('invoices').update({ status: 'void' }).eq('id', invoice.id).eq('user_id', user.id)
    throw error
  }
}))
