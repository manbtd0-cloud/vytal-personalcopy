import { requireAuthenticatedUser, supabase } from './supabase.js'

export async function loadAccountProfile() {
  const user = await requireAuthenticatedUser()

  const [{ data: profile, error: profileError }, { data: baselines, error: baselineError }] =
    await Promise.all([
      supabase
        .from('profiles')
        .select('id, full_name, date_of_birth, sex, phone, address, emergency_contact, custom_fields')
        .eq('id', user.id)
        .maybeSingle(),
      supabase
        .from('health_baselines')
        .select('id, metric_key, value_numeric, value_text, unit, metadata')
        .eq('user_id', user.id)
        .is('patient_id', null)
        .order('metric_key')
        .limit(64),
    ])

  if (profileError) throw profileError
  if (baselineError) throw baselineError

  return {
    profile: profile ?? {
      id: user.id,
      full_name: user.user_metadata?.full_name ?? '',
      email: user.email ?? '',
      date_of_birth: '',
      sex: 'prefer_not_to_say',
      phone: '',
      address: {},
      emergency_contact: {},
      custom_fields: {},
    },
    baselines: baselines ?? [],
  }
}

export async function saveAccountProfile(profile, baselines) {
  await requireAuthenticatedUser()
  const safeProfile = {
    full_name: profile.full_name.trim(),
    date_of_birth: profile.date_of_birth || '',
    sex: profile.sex || 'prefer_not_to_say',
    phone: profile.phone.trim(),
    address: profile.address ?? {},
    emergency_contact: profile.emergency_contact ?? {},
    custom_fields: profile.custom_fields ?? {},
  }

  const rows = baselines
    .filter((item) => item.metric_key?.trim() && String(item.value ?? '').trim())
    .map((item) => {
      const numericValue = Number(item.value)
      return {
        metric_key: item.metric_key.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'),
        value_numeric: Number.isFinite(numericValue) ? numericValue : null,
        value_text: Number.isFinite(numericValue) ? null : String(item.value).trim(),
        unit: item.unit?.trim() || null,
        metadata: {},
      }
    })

  const { error } = await supabase.rpc('save_account_profile', {
    p_profile: safeProfile,
    p_baselines: rows,
  })
  if (error) throw error

  return loadAccountProfile()
}

export async function loadBillingOverview() {
  const user = await requireAuthenticatedUser()
  const [
    { data: products, error: productError },
    { data: invoices, error: invoiceError },
    { data: donations, error: donationError },
  ] =
    await Promise.all([
      supabase
        .from('billing_products')
        .select('code, name, description, amount_minor, currency')
        .eq('is_active', true)
        .order('amount_minor')
        .limit(20),
      supabase
        .from('invoices')
        .select('id, invoice_number, amount_minor, currency, status, issued_at, paid_at, receipt_url')
        .eq('user_id', user.id)
        .order('issued_at', { ascending: false })
        .limit(100),
      supabase
        .from('donations')
        .select('id, amount_minor, currency, status, created_at, paid_at, receipt_url')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100),
    ])

  if (productError) throw productError
  if (invoiceError) throw invoiceError
  if (donationError) throw donationError
  return { products: products ?? [], invoices: invoices ?? [], donations: donations ?? [] }
}

export async function createBillingCheckout(productCode) {
  await requireAuthenticatedUser()
  if (!/^[a-z][a-z0-9_-]{2,63}$/.test(productCode)) {
    throw new Error('Choose a valid account service.')
  }

  const { data, error } = await supabase.functions.invoke('create-billing-checkout', {
    body: { productCode },
  })
  if (error) throw error
  if (!data?.url) throw new Error('Payment provider did not return a checkout URL.')
  return data.url
}

export async function createDonationCheckout({ amount, currency }) {
  await requireAuthenticatedUser()
  const amountMajor = Number(amount)
  if (!Number.isFinite(amountMajor) || amountMajor < 1 || amountMajor > 100000) {
    throw new Error('Enter a donation between 1 and 100,000.')
  }

  const { data, error } = await supabase.functions.invoke('create-donation-checkout', {
    body: { amount: amountMajor, currency: currency.toLowerCase() },
  })
  if (error) throw error
  if (!data?.url) throw new Error('Payment provider did not return a checkout URL.')
  return data.url
}
