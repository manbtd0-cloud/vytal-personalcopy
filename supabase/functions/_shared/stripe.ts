import Stripe from 'npm:stripe@^22'

let cachedStripe: Stripe | null = null
let cachedCryptoProvider: ReturnType<typeof Stripe.createSubtleCryptoProvider> | null = null

export function stripeClient() {
  if (cachedStripe) return cachedStripe
  const key = Deno.env.get('STRIPE_SECRET_KEY')
  if (!key) throw new Error('Payment service is not configured.')
  cachedStripe = new Stripe(key)
  return cachedStripe
}

export function stripeCryptoProvider() {
  cachedCryptoProvider ??= Stripe.createSubtleCryptoProvider()
  return cachedCryptoProvider
}

export function stripeWebhookSecret() {
  const secret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
  if (!secret) throw new Error('Webhook is not configured.')
  return secret
}

export function configuredSiteUrl() {
  const value = Deno.env.get('SITE_URL')?.trim()
  if (!value) throw new Error('Site URL is not configured.')
  return value.replace(/\/$/, '')
}
