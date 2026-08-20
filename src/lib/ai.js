// AI explanations are requested through a server-side Edge Function so provider
// credentials never enter the browser bundle. Local rules remain the offline fallback.

import { supabase, supabaseConfigured } from './supabase.js'
import { clinicalRiskPolicy } from '../domain/clinical/ClinicalRiskPolicy.js'

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', label: 'English' },
  { code: 'ur', name: 'Urdu', label: 'اردو' },
  { code: 'ps', name: 'Pashto', label: 'پښتو' },
  { code: 'sd', name: 'Sindhi', label: 'سنڌي' },
  { code: 'ar', name: 'Arabic', label: 'العربية' },
]

export function getStressLabel(stressScore) {
  return clinicalRiskPolicy.stressLabel(Number(stressScore))
}

export function isFlaggedReferral(hr, br, stressScore) {
  return clinicalRiskPolicy.evaluate({
    heartRate: Number(hr),
    breathingRate: Number(br),
    stressScore: Number(stressScore),
  }).flagged
}

export function generateOfflineExplanation(hr, br, stressScore, langCode = 'en', context = {}) {
  const risk = clinicalRiskPolicy.evaluate({
    heartRate: Number(hr), breathingRate: Number(br), stressScore: Number(stressScore),
    ageGroup: context.ageGroup, isPregnant: context.isPregnant, programmeContext: context.programmeContext,
  })
  const flagged = risk.flagged
  const breathingText = Number.isFinite(Number(br)) ? br : 'not available'

  if (langCode === 'ur') {
    if (flagged) {
      return `دل کی دھڑکن (${hr} bpm) اور تنفس کی رفتار سکون کے وقت عام حد سے تھوڑی مختلف ہے۔ گھبرانے کی ضرورت نہیں، لیکن مشورہ دیا جاتا ہے کہ قریبی لیڈی ہیلتھ ورکر یا ڈاکٹر سے معائنہ کروائیں۔`
    }
    return `آپ کے اسکریننگ وائٹلز (دل کی دھڑکن ${hr} bpm، سانس ${breathingText} فی منٹ) میں فوری ریفرل کی حد عبور نہیں ہوئی۔ علامات ہوں تو کلینیکل معائنہ کروائیں۔`
  }

  if (langCode === 'ps') {
    if (flagged) {
      return `د زړه درزا (${hr} bpm) او د ساه اخیستلو کچه پدې وخت کې لوړه ده. دا د اندیښنې خبره نده، مګر د روغتیا پالر یا ډاکټر سره لیدنه غوره ده.`
    }
    return `ستاسو ټول وایټلز (د زړه درزا ${hr} bpm) په عادي او روغ حالت کې دي. کوم ځانګړي درملنې ته اړتیا نشته.`
  }

  if (langCode === 'sd') {
    if (flagged) {
      return `دل جي ڌڙڪن (${hr} bpm) آرام واري حالت ۾ معمولي کان وڌيڪ آھي. گھٻرائڻ جي ضرورت ناھي، پر ڊاڪٽر يا سارسنڀال واري کي ڏيکارڻ بهتر آھي.`
    }
    return `توهان جا سڀ وائٽلز (دل جي ڌڙڪن ${hr} bpm) بالڪل نارمل ۽ بهتر آهن.`
  }

  if (langCode === 'ar') {
    if (flagged) {
      return `معدل ضربات القلب (${hr} نبضة/دقيقة) أعلى قليلاً من المعدل الطبيعي أثناء الراحة. لا داعي للقلق، ولكن يوصى بمراجعة طبيب أو عامل صحي.`
    }
    return `لم تتجاوز مؤشرات الفحص (النبض ${hr}، التنفس ${breathingText}) حد الإحالة الفورية. يلزم التقييم السريري عند وجود أعراض.`
  }

  // Default English
  if (flagged) {
    return `Heart rate (${hr} bpm) and stress indicators are elevated at rest. This does not mean something is wrong, but it is recommended to have a community clinician review the patient.`
  }
  return `This screening did not cross the configured referral threshold (heart rate ${hr} bpm, breathing ${breathingText} br/min). It is a camera-based proxy, so symptoms or concern still require clinical assessment.`
}

export async function fetchAIExplanation({ hr, br, stress, langCode = 'en', spo2 = null, alertTier = null, alertReasons = [], ageGroup = 'adult', isPregnant = false, programmeContext = 'general' }) {
  const context = { spo2, alertTier, alertReasons, ageGroup, isPregnant, programmeContext }
  if (supabaseConfigured) {
    try {
      const { data, error } = await supabase.functions.invoke('ai-explanation', {
        body: { hr, br, stress, langCode, ...context },
      })
      if (!error && data?.text) return data.text
    } catch (err) {
      console.warn('Secure AI proxy unavailable; using local clinical rules', err)
    }
  }

  return generateOfflineExplanation(hr, br, stress, langCode, context)
}
