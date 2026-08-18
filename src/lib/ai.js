// AI Explanation Service — Multilingual, Clinician-View, Coaching, Programme Context
// Supports Groq (LLaMA-3.3-70B) & Qwen-Plus (Alibaba DashScope) with offline fallback.

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English',   label: 'English'   },
  { code: 'ur', name: 'Urdu',      label: 'اردو'       },
  { code: 'ps', name: 'Pashto',    label: 'پښتو'       },
  { code: 'sd', name: 'Sindhi',    label: 'سنڌي'       },
  { code: 'ar', name: 'Arabic',    label: 'العربية'    },
  { code: 'sw', name: 'Swahili',   label: 'Kiswahili'  },
  { code: 'hi', name: 'Hindi',     label: 'हिन्दी'     },
  { code: 'bn', name: 'Bengali',   label: 'বাংলা'      },
]


export function getStressLabel(stressScore) {
  if (stressScore == null) return 'Normal'
  if (stressScore < 30)   return 'Normal'
  if (stressScore < 60)   return 'Slightly high'
  return 'High'
}


/**
 * Basic flagging helper — still used for backward compat with existing dashboard / report.
 */
export function isFlaggedReferral(hr, br, stressScore, alertTier = null) {
  if (alertTier) return alertTier === 'RED' || alertTier === 'ORANGE'
  if (!hr) return false
  const highHr    = hr > 100 || hr < 50
  const highBr    = br && (br > 22 || br < 10)
  const highStress = stressScore && stressScore >= 60
  return highHr || highBr || highStress
}


export function generateOfflineExplanation(hr, br, stressScore, langCode = 'en') {
  const stressLabel = getStressLabel(stressScore)
  const flagged     = isFlaggedReferral(hr, br, stressScore)

  if (langCode === 'ur') {
    return flagged
      ? `دل کی دھڑکن (${hr} bpm) سکون کے وقت عام حد سے مختلف ہے۔ قریبی لیڈی ہیلتھ ورکر یا ڈاکٹر سے معائنہ کروائیں۔`
      : `تمام وائٹلز (دل کی دھڑکن ${hr} bpm، سانس ${br || 16} فی منٹ) بالکل نارمل ہیں۔`
  }
  if (langCode === 'ps') {
    return flagged
      ? `د زړه درزا (${hr} bpm) لوړه ده. د ډاکټر سره لیدنه غوره ده.`
      : `ستاسو ټول وایټلز (د زړه درزا ${hr} bpm) عادي دي.`
  }
  if (langCode === 'sd') {
    return flagged
      ? `دل جي ڌڙڪن (${hr} bpm) معمولي کان وڌيڪ آھي. ڊاڪٽر کي ڏيکارو.`
      : `توهان جا وائٽلز (${hr} bpm) نارمل آهن.`
  }
  if (langCode === 'ar') {
    return flagged
      ? `معدل ضربات القلب (${hr} نبضة/دقيقة) أعلى من الطبيعي. يُوصى بمراجعة طبيب.`
      : `جميع المؤشرات الحيوية ضمن المعدل الطبيعي.`
  }
  if (langCode === 'hi') {
    return flagged
      ? `हृदय गति (${hr} bpm) सामान्य से अधिक है। डॉक्टर से जाँच करवाएं।`
      : `सभी वाइटल सामान्य हैं (हृदय गति ${hr} bpm)।`
  }
  if (langCode === 'bn') {
    return flagged
      ? `হৃদ স্পন্দন (${hr} bpm) স্বাভাবিকের বেশি। ডাক্তারের সাথে পরামর্শ করুন।`
      : `সমস্ত ভাইটাল স্বাভাবিক (হৃদ স্পন্দন ${hr} bpm)।`
  }

  // English
  return flagged
    ? `Heart rate (${hr} bpm) and stress indicators are elevated at rest. Not necessarily alarming, but a clinician review is recommended.`
    : `Vitals are steady (heart rate ${hr} bpm, ${br || 16} br/min). No clinical referral needed.`
}


/**
 * Build the AI prompt based on mode and context.
 */
function buildPrompt({ hr, br, stress, spo2, alertTier, alertReasons, ageGroup, isPregnant, langCode, mode }) {
  const langObj    = SUPPORTED_LANGUAGES.find((l) => l.code === langCode) || SUPPORTED_LANGUAGES[0]
  const stressLabel = getStressLabel(stress)
  const tierNote   = alertTier ? `Clinical alert tier: ${alertTier}` : ''
  const ageNote    = ageGroup && ageGroup !== 'adult' ? `Age group: ${ageGroup}` : ''
  const pregNote   = isPregnant ? 'Patient is pregnant (third trimester physiology applies).' : ''
  const spo2Note   = spo2 != null ? `SpO2 proxy estimate: ${spo2}% (NOT a medical device, proxy only)` : ''
  const alertNote  = alertReasons && alertReasons.length ? `Alert reasons: ${alertReasons.join('; ')}` : ''

  if (mode === 'clinician') {
    return `You are Vytal AI, a clinical triage summariser.
Scan data:
- Heart rate: ${hr} bpm | Breathing rate: ${br || 'N/A'} br/min | Stress index: ${stress ?? 'N/A'}/100 (${stressLabel})
${spo2Note}
${tierNote}
${ageNote}
${pregNote}
${alertNote}

Instructions:
1. Summarise for a supervising clinician — include raw values, uncertainty context, which threshold triggered any flag, and suggested differential diagnoses if values are abnormal.
2. Keep to 3 concise sentences.
3. Respond only in English (clinician view is always English).`
  }

  return `You are Vytal AI, a calm medical triage assistant for community health workers.
Patient vitals scanned via smartphone camera rPPG:
- Heart rate: ${hr} bpm (Normal resting: 60-100 bpm)
- Breathing rate: ${br || 'N/A'} br/min (Normal resting: 12-20 br/min)
- Stress index score: ${stress ?? 'N/A'}/100 (${stressLabel})
${spo2Note}
${tierNote}
${ageNote}
${pregNote}

Instructions:
1. Explain what these numbers mean in simple, calm, non-alarming language for a patient.
2. In 2 clear sentences, state if a clinical referral is recommended or if vitals look healthy.
3. CRITICAL: You MUST respond ONLY in ${langObj.name} (${langObj.label}). Do NOT use English if another language is requested.`
}


export async function fetchAIExplanation({
  hr, br, stress, spo2 = null,
  alertTier = null, alertReasons = [],
  ageGroup = 'adult', isPregnant = false,
  langCode = 'en', apiKey = '',
  mode = 'patient',   // 'patient' | 'clinician'
}) {
  const prompt = buildPrompt({ hr, br, stress, spo2, alertTier, alertReasons, ageGroup, isPregnant, langCode, mode })

  const groqKey      = apiKey || import.meta.env.VITE_GROQ_API_KEY
  const dashscopeKey = apiKey || import.meta.env.VITE_DASHSCOPE_API_KEY

  if (groqKey) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${groqKey}` },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 160,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        const text = data.choices?.[0]?.message?.content?.trim()
        if (text) return text
      }
    } catch (err) {
      console.warn('Groq API call failed, falling back', err)
    }
  }

  if (dashscopeKey) {
    try {
      const res = await fetch('https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${dashscopeKey}` },
        body: JSON.stringify({
          model: 'qwen-plus',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 160,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        const text = data.choices?.[0]?.message?.content?.trim()
        if (text) return text
      }
    } catch (err) {
      console.warn('Qwen API call failed, falling back', err)
    }
  }

  // Instant rule-based fallback
  return generateOfflineExplanation(hr, br, stress, langCode)
}
