import {
  assertAllowedOrigin,
  authenticatedUser,
  corsHeaders,
  enforceRateLimit,
  json,
  readJsonBody,
} from '../_shared/security.ts'
import { AiProviderFactory } from '../_shared/ai-providers.ts'
import { AppError, createFunctionHandler } from '../_shared/errors.ts'

const languages: Record<string, string> = {
  en: 'English', ur: 'Urdu', ps: 'Pashto', sd: 'Sindhi', ar: 'Arabic',
}

Deno.serve(createFunctionHandler('ai-explanation', {
  fallback: {
    status: 503,
    code: 'AI_PROVIDER_UNAVAILABLE',
    message: 'AI provider is temporarily unavailable.',
  },
  byStatus: {
    429: { code: 'AI_RATE_LIMITED', message: 'AI explanation limit reached. Please wait and try again.' },
  },
}, async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req) })
  if (req.method !== 'POST') throw new AppError(405, 'METHOD_NOT_ALLOWED', 'Only POST requests are accepted.')

  assertAllowedOrigin(req)
  const user = await authenticatedUser(req)
  await enforceRateLimit('ai-explanation', user.id, 20, 600)
  const {
    hr, br, stress, langCode = 'en', spo2 = null, alertTier = null, alertReasons = [],
    ageGroup = 'adult', isPregnant = false, programmeContext = 'general',
  } = await readJsonBody(req, 4_096)
  const heartRate = Number(hr)
  const breathingRate = Number(br)
  const stressScore = Number(stress)
  if (!Number.isFinite(heartRate) || heartRate < 25 || heartRate > 240) {
    throw new AppError(400, 'INVALID_HEART_RATE', 'Heart rate must be between 25 and 240 bpm.')
  }

  const language = languages[String(langCode)] ?? 'English'
  const safeTier = ['GREEN', 'YELLOW', 'ORANGE', 'RED'].includes(String(alertTier)) ? String(alertTier) : 'not calculated'
  const safeReasons = Array.isArray(alertReasons)
    ? alertReasons.slice(0, 6).map((reason) => String(reason).slice(0, 120)).join('; ')
    : ''
  const oxygenProxy = Number(spo2)
  const prompt = `You are VYTAL AI, a calm screening assistant for community health workers.
Camera-based screening values:
- Heart rate: ${heartRate} bpm
- Breathing rate: ${Number.isFinite(breathingRate) ? breathingRate : 'N/A'} breaths/min
- Pulse variability stress score: ${Number.isFinite(stressScore) ? stressScore : 'N/A'}/100
- SpO2 screening proxy: ${Number.isFinite(oxygenProxy) ? oxygenProxy + '%' : 'N/A'}
- Rule-based alert tier: ${safeTier}
- Rule-based reasons: ${safeReasons || 'none'}
- Patient context: age band ${String(ageGroup).slice(0, 30)}, pregnancy context ${Boolean(isPregnant)}, programme ${String(programmeContext).slice(0, 40)}

Explain these screening values in two short, non-alarming sentences. Follow the supplied rule-based alert tier; do not downgrade it. State whether clinician review is recommended. Treat every value as a screening proxy, and do not diagnose or prescribe treatment. Respond only in ${language}.`

  const provider = AiProviderFactory.createFromEnvironment()
  if (!provider) {
    throw new AppError(503, 'AI_PROVIDER_NOT_CONFIGURED', 'AI provider is not configured.', true)
  }
  const text = await provider.complete(prompt)
  return json(req, { text })
}))
