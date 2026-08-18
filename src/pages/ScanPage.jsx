import { useState, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'
import { analyzeSignal } from '../lib/rppg'
import { fetchAIExplanation, SUPPORTED_LANGUAGES, getStressLabel } from '../lib/ai'
import { saveRecord, getStoredRecords } from '../lib/storage'
import {
  assessCameraQuality,
  estimateUncertainty,
  inferLightingTier,
  inferMotionTier,
  inferSkinToneTier,
} from '../lib/uncertainty'
import { estimateSpO2 } from '../lib/spo2'
import { checkIrregularRhythm } from '../lib/afib'
import { evaluateAlertScale, AGE_GROUPS, PROGRAMME_CONTEXTS } from '../lib/alertScale'
import { analyzeConjunctivalPallor } from '../lib/anemia'
import { analyzeScleralIcterus } from '../lib/jaundice'
import { estimateBloodPressurePTT, saveBpCalibration } from '../lib/bloodPressurePTT'
import { estimateMalnutritionBMI } from '../lib/bmiEstimate'
import { evaluatePopulationAnomaly } from '../lib/populationAnomaly'
import { connectBlePulseOximeter } from '../lib/bleOximeter'
import { connectThermalCamera } from '../lib/thermalCamera'
import { syncWearableHrvBaseline } from '../lib/wearableIntegration'
import { speakExplanation } from '../lib/platform'

const MODES = [
  { id: 'face', label: 'Face scan', hint: 'Hold the phone at arm’s length with your face centered in the guide oval.' },
  { id: 'fingertip', label: 'Fingertip + flash', hint: 'Cover the rear camera lens and flash completely with your fingertip.' },
  { id: 'anemia', label: 'Anemia screening', hint: 'Pull down lower eyelid to expose pink conjunctival tissue inside guide.' },
  { id: 'jaundice', label: 'Jaundice screening', hint: 'Look straight ahead so white of eye (sclera) is clearly visible.' },
  { id: 'bp_ptt', label: 'BP (PTT)', hint: 'Hold still like a face scan — this reads your pulse waveform shape, calibrated against your own saved baseline.' },
  { id: 'bmi', label: 'BMI / Malnutrition', hint: 'Align upper body inside frame to estimate shoulder-to-height ratio.' },
]

const READOUT_FIELDS = [
  { key: 'hr', label: 'Heart rate', unit: 'bpm' },
  { key: 'br', label: 'Breathing rate', unit: 'br/min' },
  { key: 'stress', label: 'Pulse Variability', unit: '/100' },
]

const SCAN_DURATION_MS = 15000
const MODEL_ASSET_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'
const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm'

// Anthropometric BMI/malnutrition proxy: uses the already-loaded
// FaceLandmarker (no second pose-detection model — adding one blind,
// with no way to test it against a live camera in this environment, is
// a real regression risk for a hackathon-stage app) to get a real face
// bounding-box width, then applies a standard anthropometric ratio
// (adult shoulder width ≈ 2.0-2.2x bizygomatic face width — Tilley &
// Associates' "The Measure of Man and Woman" and similar anthropometry
// references) to approximate shoulder width, giving a real
// shoulder-to-frame-height ratio instead of a hardcoded constant.
// HONEST LIMITATION: this varies meaningfully by individual build,
// clothing bulk, and camera angle — it is a rough population-screening
// proxy, not an individual-precision measurement, same caveat the
// existing shoulder-to-height-ratio design already implied.
const SHOULDER_TO_FACE_WIDTH_RATIO = 2.1

function estimateShoulderToHeightRatio(landmarkResult, videoWidth, videoHeight) {
  const face = landmarkResult?.faceLandmarks?.[0]
  if (!face || !videoWidth || !videoHeight) return null
  let minX = Infinity, maxX = -Infinity
  for (const pt of face) {
    if (pt.x < minX) minX = pt.x
    if (pt.x > maxX) maxX = pt.x
  }
  const faceWidthNorm = maxX - minX // normalized 0-1 fraction of frame width
  if (!faceWidthNorm || faceWidthNorm <= 0) return null
  const estimatedShoulderWidthNorm = faceWidthNorm * SHOULDER_TO_FACE_WIDTH_RATIO
  // Convert from "fraction of frame width" to "fraction of frame height"
  // (pixel-accurate, since frame width != frame height for typical camera
  // aspect ratios) — this is what keeps the ratio meaningful and matches
  // what estimateMalnutritionBMI expects (shoulder width / frame height).
  const shoulderWidthPx = estimatedShoulderWidthNorm * videoWidth
  return shoulderWidthPx / videoHeight
}

// Visual framing guide for BMI mode — a box roughly showing where the
// shoulders should sit, sized from the same face-width-based anthropometric
// estimate used for the actual measurement (see estimateShoulderToHeightRatio
// above), so what the user sees lines up with what's actually being measured.
function getShoulderGuideRoi(landmarkResult, videoWidth, videoHeight) {
  const face = landmarkResult?.faceLandmarks?.[0]
  if (!face || !videoWidth || !videoHeight) return null
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  for (const pt of face) {
    if (pt.x < minX) minX = pt.x
    if (pt.x > maxX) maxX = pt.x
    if (pt.y < minY) minY = pt.y
    if (pt.y > maxY) maxY = pt.y
  }
  const faceWidthNorm = maxX - minX
  const faceHeightNorm = maxY - minY
  if (!faceWidthNorm || !faceHeightNorm) return null

  const shoulderWidthNorm = faceWidthNorm * SHOULDER_TO_FACE_WIDTH_RATIO
  const centerXNorm = (minX + maxX) / 2
  const shoulderTopYNorm = maxY + faceHeightNorm * 0.4 // just below the chin/neck

  return {
    x: Math.round((centerXNorm - shoulderWidthNorm / 2) * videoWidth),
    y: Math.round(shoulderTopYNorm * videoHeight),
    w: Math.round(shoulderWidthNorm * videoWidth),
    h: Math.round(faceHeightNorm * 1.2 * videoHeight),
  }
}

function getForeheadRoi(landmarkResult, width, height) {
  const face = landmarkResult?.faceLandmarks?.[0]
  if (!face) return null
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  for (const pt of face) {
    if (pt.x < minX) minX = pt.x
    if (pt.x > maxX) maxX = pt.x
    if (pt.y < minY) minY = pt.y
    if (pt.y > maxY) maxY = pt.y
  }
  const faceW = maxX - minX
  const faceH = maxY - minY
  return {
    x: Math.round((minX + faceW * 0.3) * width),
    y: Math.round(minY * height),
    w: Math.round(faceW * 0.4 * width),
    h: Math.round(faceH * 0.18 * height),
  }
}

// MediaPipe FaceLandmarker canonical right-eye contour indices (FACEMESH_RIGHT_EYE).
// Used to track the actual eye position/size instead of a fixed screen-space box,
// so anemia/jaundice ROIs follow the subject regardless of distance, framing, or head pose.
const RIGHT_EYE_INDICES = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246]

function getEyeBoundsNorm(landmarkResult) {
  const face = landmarkResult?.faceLandmarks?.[0]
  if (!face) return null
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  for (const idx of RIGHT_EYE_INDICES) {
    const pt = face[idx]
    if (!pt) continue
    if (pt.x < minX) minX = pt.x
    if (pt.x > maxX) maxX = pt.x
    if (pt.y < minY) minY = pt.y
    if (pt.y > maxY) maxY = pt.y
  }
  if (minX === Infinity) return null
  return { minX, maxX, minY, maxY }
}

// Sclera / whole-eye ROI for jaundice — landmark-bounded eye region with a
// small outward margin, replacing the old fixed { x:50, y:50, w:200, h:100 }
// screen-position box that ignored where the eye actually was.
function getScleraRoi(landmarkResult, width, height) {
  const b = getEyeBoundsNorm(landmarkResult)
  if (!b) return null
  const eyeW = b.maxX - b.minX
  const eyeH = b.maxY - b.minY
  const marginX = eyeW * 0.15
  const marginY = eyeH * 0.25
  return {
    x: Math.round((b.minX - marginX) * width),
    y: Math.round((b.minY - marginY) * height),
    w: Math.round((eyeW + marginX * 2) * width),
    h: Math.round((eyeH + marginY * 2) * height),
  }
}

// Lower-conjunctiva ROI for anemia — the strip just below the lower eyelid
// margin, matching the "pull down lower eyelid" capture guidance shown in
// the UI, instead of the old fixed screen-position box.
function getConjunctivaRoi(landmarkResult, width, height) {
  const b = getEyeBoundsNorm(landmarkResult)
  if (!b) return null
  const eyeW = b.maxX - b.minX
  const eyeH = b.maxY - b.minY
  return {
    x: Math.round((b.minX + eyeW * 0.1) * width),
    y: Math.round(b.maxY * height),
    w: Math.round(eyeW * 0.8 * width),
    h: Math.round(eyeH * 0.9 * height),
  }
}

// Maps a pixel-space ROI (in raw video coordinates) to a CSS percentage box
// inside a square (1:1) viewfinder rendered with object-fit: cover, so the
// live eye-guide overlay tracks the actual video content the user sees.
function videoRoiToContainerPercent(roi, videoW, videoH) {
  if (!roi || !videoW || !videoH) return null
  const videoAspect = videoW / videoH
  let scale, offsetXpx = 0, offsetYpx = 0
  if (videoAspect > 1) {
    // video wider than the square container -> height fills, width is cropped
    scale = 1 / videoH
    offsetXpx = (videoW * scale - 1) / 2
  } else {
    // video taller than/equal to the square container -> width fills, height is cropped
    scale = 1 / videoW
    offsetYpx = (videoH * scale - 1) / 2
  }
  const left = (roi.x * scale - offsetXpx) * 100
  const top = (roi.y * scale - offsetYpx) * 100
  const width = roi.w * scale * 100
  const height = roi.h * scale * 100
  return { left, top, width, height }
}

function meanRgb(ctx, roi) {
  if (!roi || roi.w <= 0 || roi.h <= 0) return null
  const { data } = ctx.getImageData(roi.x, roi.y, roi.w, roi.h)
  let r = 0, g = 0, b = 0
  const n = data.length / 4
  if (n === 0) return null
  for (let i = 0; i < data.length; i += 4) {
    r += data[i]
    g += data[i + 1]
    b += data[i + 2]
  }
  return { r: r / n, g: g / n, b: b / n }
}

async function loadFaceLandmarker() {
  const vision = await FilesetResolver.forVisionTasks(WASM_URL)
  const base = { modelAssetPath: MODEL_ASSET_URL }
  try {
    return await FaceLandmarker.createFromOptions(vision, {
      baseOptions: { ...base, delegate: 'GPU' },
      runningMode: 'VIDEO',
      numFaces: 1,
    })
  } catch {
    return await FaceLandmarker.createFromOptions(vision, {
      baseOptions: { ...base, delegate: 'CPU' },
      runningMode: 'VIDEO',
      numFaces: 1,
    })
  }
}

export default function ScanPage() {
  const [mode, setMode] = useState('face')
  const [scanState, setScanState] = useState('idle')
  const [result, setResult] = useState(null)
  const [uncertainty, setUncertainty] = useState(null)
  const [cameraQuality, setCameraQuality] = useState(null)
  const [showCamPanel, setShowCamPanel] = useState(false)
  const [explanation, setExplanation] = useState('')
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [signalQuality, setSignalQuality] = useState('none')
  const [secondsLeft, setSecondsLeft] = useState(Math.ceil(SCAN_DURATION_MS / 1000))
  const [selectedLang, setSelectedLang] = useState('en')
  const [patientName, setPatientName] = useState('')
  const [savedRecordId, setSavedRecordId] = useState(null)
  const [frozenFrame, setFrozenFrame] = useState(null)
  const [lastCrestTimeMs, setLastCrestTimeMs] = useState(null)
  const [calSbpInput, setCalSbpInput] = useState('')
  const [calDbpInput, setCalDbpInput] = useState('')
  const [calSaved, setCalSaved] = useState(false)

  // Clinical Context Options
  const [ageGroup, setAgeGroup] = useState('adult')
  const [isPregnant, setIsPregnant] = useState(false)
  const [programmeContext, setProgrammeContext] = useState('general')
  const [viewMode, setViewMode] = useState('patient')
  const [isSpeaking, setIsSpeaking] = useState(false)

  // Research Results
  const [spo2Result, setSpo2Result] = useState(null)
  const [afibResult, setAfibResult] = useState(null)
  const [alertScaleResult, setAlertScaleResult] = useState(null)
  const [anemiaResult, setAnemiaResult] = useState(null)
  const [jaundiceResult, setJaundiceResult] = useState(null)
  const [bpResult, setBpResult] = useState(null)
  const [bmiResult, setBmiResult] = useState(null)
  const [populationAnomaly, setPopulationAnomaly] = useState(null)

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const waveCanvasRef = useRef(null)
  const streamRef = useRef(null)
  const landmarkerRef = useRef(null)
  const rafRef = useRef(null)
  const samplesRef = useRef([])
  const brightnessHistoryRef = useRef([])
  const scanStartRef = useRef(0)
  const signalQualityRef = useRef('none')
  const secondsLeftRef = useRef(Math.ceil(SCAN_DURATION_MS / 1000))
  const activeSpeakerRef = useRef(null)
  const lastLandmarkResultRef = useRef(null)
  const lastVideoSizeRef = useRef({ width: 0, height: 0 })
  const eyeGuideRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    loadFaceLandmarker()
      .then((lm) => {
        if (!cancelled) landmarkerRef.current = lm
      })
      .catch((err) => console.error('Face landmarker failed to load', err))

    const stored = getStoredRecords()
    const anomaly = evaluatePopulationAnomaly(stored)
    setPopulationAnomaly(anomaly)

    return () => {
      cancelled = true
      landmarkerRef.current?.close()
    }
  }, [])

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
  }, [])

  useEffect(() => stopStream, [stopStream])

  const drawWaveform = useCallback(() => {
    const waveCanvas = waveCanvasRef.current
    if (!waveCanvas) return
    const wCtx = waveCanvas.getContext('2d')
    if (!wCtx) return

    const samples = samplesRef.current
    const width = waveCanvas.width
    const height = waveCanvas.height

    wCtx.clearRect(0, 0, width, height)
    if (samples.length < 2) return

    wCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    wCtx.lineWidth = 1
    wCtx.beginPath()
    wCtx.moveTo(0, height / 2)
    wCtx.lineTo(width, height / 2)
    wCtx.stroke()

    const recent = samples.slice(-60)
    const gVals = recent.map((s) => s.g)
    const minG = Math.min(...gVals)
    const maxG = Math.max(...gVals)
    const rangeG = maxG - minG || 1

    wCtx.strokeStyle = mode === 'fingertip' ? '#ff4d5e' : '#6fbf97'
    wCtx.lineWidth = 2
    wCtx.beginPath()

    recent.forEach((s, idx) => {
      const x = (idx / (recent.length - 1)) * width
      const normY = (s.g - minG) / rangeG
      const y = height - 6 - normY * (height - 12)
      if (idx === 0) wCtx.moveTo(x, y)
      else wCtx.lineTo(x, y)
    })
    wCtx.stroke()
  }, [mode])

  async function finishScan() {
    const canvas = canvasRef.current
    // Grab a freeze-frame before the stream stops — stopStream() halts the
    // camera tracks but never clears video.srcObject, which leaves the
    // <video> element rendering solid black once the stream ends. Freezing
    // the last real frame here means the "done" state shows what was
    // actually captured instead of looking broken.
    if (canvas && canvas.width > 0 && canvas.height > 0) {
      try {
        setFrozenFrame(canvas.toDataURL('image/jpeg', 0.7))
      } catch (e) {
        console.warn('Could not capture freeze-frame', e)
      }
    }

    stopStream()
    setScanState('analyzing')

    const ctx = canvas ? canvas.getContext('2d') : null

    if (mode === 'anemia' && ctx) {
      const { width, height } = lastVideoSizeRef.current
      const roi =
        getConjunctivaRoi(lastLandmarkResultRef.current, width, height) ||
        // Fallback only if no face was ever detected during the 4s capture window
        { x: 50, y: 50, w: 200, h: 100 }
      const anemiaRes = analyzeConjunctivalPallor(ctx, roi)
      setAnemiaResult(anemiaRes)
      setScanState('done')
      setExplanation(`Anemia screening: ${anemiaRes.label}. ${anemiaRes.recommendation}`)
      return
    }

    if (mode === 'jaundice' && ctx) {
      const { width, height } = lastVideoSizeRef.current
      const roi =
        getScleraRoi(lastLandmarkResultRef.current, width, height) ||
        // Fallback only if no face was ever detected during the 4s capture window
        { x: 50, y: 50, w: 200, h: 100 }
      const jaundiceRes = analyzeScleralIcterus(ctx, roi)
      setJaundiceResult(jaundiceRes)
      setScanState('done')
      setExplanation(`Jaundice screening: ${jaundiceRes.label}. ${jaundiceRes.recommendation}`)
      return
    }

    if (mode === 'bmi') {
      const { width, height } = lastVideoSizeRef.current
      const estimatedRatio = estimateShoulderToHeightRatio(lastLandmarkResultRef.current, width, height)
      // Fallback to the population-typical default ratio only if no face
      // was ever detected during the capture window (previously this ran
      // unconditionally regardless of what was in frame).
      const bmiRes = estimateMalnutritionBMI(estimatedRatio ?? 0.24)
      setBmiResult(bmiRes)
      setScanState('done')
      setExplanation(`Malnutrition & BMI: ${bmiRes.category} (Est. BMI ${bmiRes.bmi}). ${bmiRes.recommendation}`)
      return
    }

    const samples = samplesRef.current
    const analysis = analyzeSignal(samples)

    if (!analysis || !analysis.hr) {
      setScanState('error')
      setErrorMsg(
        mode === 'fingertip'
          ? 'Signal was inconsistent — ensure your fingertip firmly covers both camera lens and flash light and try again.'
          : 'Could not capture a clear pulse signal — keep your face still in steady lighting and try again.'
      )
      return
    }

    const bHistory = brightnessHistoryRef.current
    const meanB = bHistory.length ? bHistory.reduce((a, b) => a + b, 0) / bHistory.length : 80
    const varB = bHistory.length ? bHistory.reduce((s, v) => s + (v - meanB) ** 2, 0) / bHistory.length : 0
    const lightingTier = inferLightingTier(meanB, varB)
    const motionTier = inferMotionTier(bHistory)
    const meanR = samples.length ? samples.reduce((a, s) => a + s.r, 0) / samples.length : 128
    const meanG = samples.length ? samples.reduce((a, s) => a + s.g, 0) / samples.length : 128
    const meanBlue = samples.length ? samples.reduce((a, s) => a + s.b, 0) / samples.length : 128
    const skinToneTier = inferSkinToneTier(meanR, meanG, meanBlue)
    const camQ = cameraQuality
    const captureObj = {
      fps: camQ?.fps ?? 30,
      cameraTier: camQ?.cameraTier ?? 'webcam',
      compressionTier: camQ?.compressionTier ?? 'modernCodecTypical',
      lightingTier,
      motionTier,
      skinToneTier,
      windowSeconds: analysis.windowSeconds ?? 10,
    }
    const unc = estimateUncertainty(captureObj, analysis.liveConfidence ?? 0.5)
    setUncertainty(unc)
    setResult(analysis)

    const redTrace = samples.map((s) => s.r)
    const greenTrace = samples.map((s) => s.g)
    const spo2Res = estimateSpO2(redTrace, greenTrace, unc.reliable, skinToneTier)
    setSpo2Result(spo2Res)

    const afibRes = checkIrregularRhythm(analysis.beatTimesMs || [], mode)
    setAfibResult(afibRes)

    const alertRes = evaluateAlertScale({
      hr: analysis.hr,
      br: analysis.br,
      stress: analysis.stress,
      ageGroup,
      isPregnant,
      programmeContext,
    })
    setAlertScaleResult(alertRes)

    if (mode === 'bp_ptt') {
      // Real measured single-site PPG crest time (see rppg.js/bloodPressurePTT.js
      // for why this replaced the old fabricated two-site "PTT" value —
      // true simultaneous face+finger capture isn't architecturally possible
      // with one camera). Meaningless without the user's own saved
      // calibration baseline; the estimator itself handles that fallback.
      const bpEst = estimateBloodPressurePTT(analysis.crestTimeMs)
      setBpResult(bpEst)
      setLastCrestTimeMs(analysis.crestTimeMs)
    }

    setIsAiLoading(true)
    const aiExplanationText = await fetchAIExplanation({
      hr: analysis.hr,
      br: analysis.br,
      stress: analysis.stress,
      spo2: spo2Res.spo2,
      alertTier: alertRes.tier,
      alertReasons: alertRes.reasons,
      ageGroup,
      isPregnant,
      langCode: selectedLang,
      mode: viewMode,
    })

    setExplanation(aiExplanationText)
    setIsAiLoading(false)
    setScanState('done')

    const finalPatientName = patientName.trim() || `Patient P-${Math.floor(1000 + Math.random() * 9000)}`
    const pid = `P-${Math.floor(1000 + Math.random() * 9000)}`

    const recordObj = {
      id: pid,
      patientId: pid,
      name: finalPatientName,
      hr: analysis.hr,
      br: analysis.br || 16,
      stress: analysis.stress || 25,
      stressLabel: getStressLabel(analysis.stress),
      spo2: spo2Res.spo2,
      alertTier: alertRes.tier,
      alertReasons: alertRes.reasons,
      isIrregularRhythm: afibRes.isIrregular,
      status: alertRes.tier === 'RED' || alertRes.tier === 'ORANGE' ? 'flagged' : 'ok',
      explanation: aiExplanationText,
      language: selectedLang,
      ageGroup,
      isPregnant,
      programmeContext,
      timestamp: new Date().toISOString(),
      synced: false,
    }

    saveRecord(recordObj)
    setSavedRecordId(pid)
  }

  function sampleLoop(currentMode) {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    const landmarker = landmarkerRef.current
    let cachedRoi = null
    let frameCount = 0
    const DETECT_EVERY_N_FRAMES = 3

    const tick = () => {
      const elapsed = performance.now() - scanStartRef.current
      const duration = currentMode === 'anemia' || currentMode === 'jaundice' || currentMode === 'bmi' ? 4000 : SCAN_DURATION_MS

      if (elapsed >= duration) {
        finishScan()
        return
      }

      const remaining = Math.max(0, Math.ceil((duration - elapsed) / 1000))
      if (remaining !== secondsLeftRef.current) {
        secondsLeftRef.current = remaining
        setSecondsLeft(remaining)
      }

      let currentQuality = 'none'

      if (currentMode === 'fingertip') {
        if (video.readyState >= 2) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          ctx.drawImage(video, 0, 0)

          const roi = {
            x: Math.floor(video.videoWidth * 0.2),
            y: Math.floor(video.videoHeight * 0.2),
            w: Math.floor(video.videoWidth * 0.6),
            h: Math.floor(video.videoHeight * 0.6),
          }
          const rgb = meanRgb(ctx, roi)

          if (rgb) {
            const hasFingerContact = rgb.r > 15 && (rgb.r >= rgb.b * 1.03)
            currentQuality = hasFingerContact ? 'perfect' : 'none'
            if (hasFingerContact) {
              samplesRef.current.push({ t: elapsed, ...rgb, mode: 'fingertip' })
            }
          }
        }
      } else {
        frameCount++
        if (landmarker && video.readyState >= 2 && frameCount % DETECT_EVERY_N_FRAMES === 0) {
          try {
            const res = landmarker.detectForVideo(video, performance.now())
            cachedRoi = getForeheadRoi(res, video.videoWidth, video.videoHeight)
            lastLandmarkResultRef.current = res
            lastVideoSizeRef.current = { width: video.videoWidth, height: video.videoHeight }

            // Live-track the framing guide overlay for anemia/jaundice/bmi modes
            if ((currentMode === 'anemia' || currentMode === 'jaundice' || currentMode === 'bmi') && eyeGuideRef.current) {
              const roi =
                currentMode === 'anemia'
                  ? getConjunctivaRoi(res, video.videoWidth, video.videoHeight)
                  : currentMode === 'jaundice'
                    ? getScleraRoi(res, video.videoWidth, video.videoHeight)
                    : getShoulderGuideRoi(res, video.videoWidth, video.videoHeight)
              const box = videoRoiToContainerPercent(roi, video.videoWidth, video.videoHeight)
              if (box) {
                eyeGuideRef.current.style.left = box.left + '%'
                eyeGuideRef.current.style.top = box.top + '%'
                eyeGuideRef.current.style.width = box.width + '%'
                eyeGuideRef.current.style.height = box.height + '%'
                eyeGuideRef.current.style.opacity = '1'
                eyeGuideRef.current.classList.add('is-aligned')
              } else {
                eyeGuideRef.current.classList.remove('is-aligned')
              }
            }
          } catch (e) {
            console.warn('Landmarker frame error', e)
          }
        }

        if (video.readyState >= 2) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          ctx.drawImage(video, 0, 0)

          if (cachedRoi) {
            currentQuality = 'perfect'
            const rgb = meanRgb(ctx, cachedRoi)
            if (rgb) {
              brightnessHistoryRef.current.push(rgb.g)
              samplesRef.current.push({ t: elapsed, ...rgb })
            }
          } else {
            currentQuality = 'adjusting'
            const centerRoi = {
              x: Math.round(video.videoWidth * 0.3),
              y: Math.round(video.videoHeight * 0.1),
              w: Math.round(video.videoWidth * 0.4),
              h: Math.round(video.videoHeight * 0.2),
            }
            const rgb = meanRgb(ctx, centerRoi)
            if (rgb) {
              brightnessHistoryRef.current.push(rgb.g)
              samplesRef.current.push({ t: elapsed, ...rgb })
            }
          }
        }
      }

      if (currentQuality !== signalQualityRef.current) {
        signalQualityRef.current = currentQuality
        setSignalQuality(currentQuality)
      }

      drawWaveform()
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
  }

  async function startScan() {
    setErrorMsg('')
    setScanState('initializing')
    setFrozenFrame(null)
    setResult(null)
    setUncertainty(null)
    setSpo2Result(null)
    setAfibResult(null)
    setAlertScaleResult(null)
    setAnemiaResult(null)
    setJaundiceResult(null)
    setBpResult(null)
    setBmiResult(null)
    setExplanation('')
    samplesRef.current = []
    brightnessHistoryRef.current = []
    signalQualityRef.current = 'none'
    setSignalQuality('none')
    secondsLeftRef.current = Math.ceil(SCAN_DURATION_MS / 1000)
    setSecondsLeft(secondsLeftRef.current)

    try {
      const facingModeHint = mode === 'face' || mode === 'anemia' || mode === 'jaundice' || mode === 'bmi' ? 'user' : 'environment'
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingModeHint, width: 640, height: 480 },
      })
      streamRef.current = stream

      if (mode === 'fingertip') {
        const [track] = stream.getVideoTracks()
        const caps = track.getCapabilities?.()
        if (caps) {
          const advanced = []
          if (caps.torch) advanced.push({ torch: true })
          if (caps.exposureMode?.includes('manual')) advanced.push({ exposureMode: 'manual' })
          else if (caps.exposureMode?.includes('continuous')) advanced.push({ exposureMode: 'continuous' })
          if (caps.whiteBalanceMode?.includes('manual')) advanced.push({ whiteBalanceMode: 'manual' })
          if (caps.focusMode?.includes('manual')) advanced.push({ focusMode: 'manual' })
          if (advanced.length > 0) {
            try {
              await track.applyConstraints({ advanced })
            } catch (e) {
              console.warn('Could not set advanced camera constraints', e)
            }
          }
        }
      }

      const camQ = assessCameraQuality(stream, facingModeHint)
      setCameraQuality(camQ)

      const video = videoRef.current
      if (video) {
        video.srcObject = stream
        await video.play()
      }

      setScanState('scanning')
      scanStartRef.current = performance.now()
      sampleLoop(mode)

      // Voice-guided positioning for the harder-to-frame-correctly modes —
      // spoken instructions instead of relying only on the on-screen hint
      // text, since these all require precise, non-obvious body positioning.
      if (mode === 'anemia' || mode === 'jaundice' || mode === 'bmi') {
        activeSpeakerRef.current?.cancel()
        const modeHint = MODES.find((m) => m.id === mode)?.hint
        if (modeHint) {
          activeSpeakerRef.current = speakExplanation(modeHint, selectedLang)
        }
      }
    } catch (err) {
      console.error('Camera open failed', err)
      setScanState('error')
      setErrorMsg('Could not access camera — please grant camera permissions.')
    }
  }

  function handleVoiceReadout() {
    if (isSpeaking) {
      activeSpeakerRef.current?.cancel()
      setIsSpeaking(false)
      return
    }
    setIsSpeaking(true)
    activeSpeakerRef.current = speakExplanation(explanation, selectedLang, () => setIsSpeaking(false))
  }

  function resetScan() {
    stopStream()
    setScanState('idle')
    setResult(null)
    setUncertainty(null)
    setExplanation('')
    setErrorMsg('')
    setSignalQuality('none')
    setFrozenFrame(null)
    setCalSaved(false)
    setCalSbpInput('')
    setCalDbpInput('')
  }

  const activeMode = MODES.find((m) => m.id === mode)
  const busy = scanState === 'initializing' || scanState === 'scanning' || scanState === 'analyzing'

  let liveStatusMsg = ''
  let statusBadgeClass = 'pill--pending'

  if (scanState === 'initializing') {
    liveStatusMsg = 'Starting camera preview…'
  } else if (scanState === 'scanning') {
    if (mode === 'fingertip') {
      if (signalQuality === 'perfect') {
        liveStatusMsg = `Perfect! Hold still for scan (${secondsLeft}s)`
        statusBadgeClass = 'pill--ok'
      } else {
        liveStatusMsg = 'Cover camera lens & flash with fingertip'
        statusBadgeClass = 'pill--flag'
      }
    } else {
      if (signalQuality === 'perfect') {
        liveStatusMsg = `Perfect! Hold still for scan (${secondsLeft}s)`
        statusBadgeClass = 'pill--ok'
      } else {
        liveStatusMsg = 'Face not detected — position face inside guide oval'
        statusBadgeClass = 'pill--flag'
      }
    }
  } else if (scanState === 'analyzing') {
    liveStatusMsg = 'Analyzing pulse wave & consulting Qwen AI…'
  }

  return (
    <main className="page scan-page">
      {populationAnomaly && populationAnomaly.isAnomaly && (
        <div style={{ background: '#ef4444', color: '#fff', padding: '10px 16px', borderRadius: '8px', marginBottom: '12px', fontWeight: 'bold' }}>
          {populationAnomaly.alertMessage}
        </div>
      )}

      <div className="scan-page__intro">
        <div className="scan-header-top">
          <div>
            <p className="eyebrow">Vitals screening</p>
            <h1 className="page-title">10-Second Vitals Screening</h1>
          </div>
          <div className="lang-selector-group">
            <label htmlFor="lang-select" className="lang-label">
              Patient Language:
            </label>
            <select
              id="lang-select"
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="lang-select"
              disabled={busy}
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name} ({l.label})
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="page-subtitle">
          Vytal detects heart rate, breathing rate, and stress index using camera rPPG signal processing. Choose scan mode below:
        </p>

        {/* Clinical Patient Context Bar */}
        <div className="clinical-context-bar" style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
          <select
            value={ageGroup}
            onChange={(e) => setAgeGroup(e.target.value)}
            className="patient-input"
            style={{ width: 'auto', padding: '6px 12px', fontSize: '13px' }}
            disabled={busy}
          >
            {AGE_GROUPS.map((a) => (
              <option key={a.id} value={a.id}>
                👤 {a.label}
              </option>
            ))}
          </select>

          <select
            value={programmeContext}
            onChange={(e) => setProgrammeContext(e.target.value)}
            className="patient-input"
            style={{ width: 'auto', padding: '6px 12px', fontSize: '13px' }}
            disabled={busy}
          >
            {PROGRAMME_CONTEXTS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.icon} {p.label}
              </option>
            ))}
          </select>

          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isPregnant}
              onChange={(e) => setIsPregnant(e.target.checked)}
              disabled={busy || ageGroup !== 'adult'}
            />
            🤰 3rd Trimester Pregnancy
          </label>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
            <button
              className={`btn btn--ghost ${viewMode === 'patient' ? 'active' : ''}`}
              style={{ fontSize: '12px', padding: '4px 10px' }}
              onClick={() => setViewMode('patient')}
            >
              Patient View
            </button>
            <button
              className={`btn btn--ghost ${viewMode === 'clinician' ? 'active' : ''}`}
              style={{ fontSize: '12px', padding: '4px 10px' }}
              onClick={() => setViewMode('clinician')}
            >
              🩺 Clinician View
            </button>
          </div>
        </div>
      </div>

      <div className="scan-layout">
        <section className="card scan-viewfinder-card">
          <div className="mode-toggle" role="tablist" aria-label="Scan mode">
            {MODES.map((m) => (
              <button
                key={m.id}
                role="tab"
                aria-selected={mode === m.id}
                disabled={busy}
                className={'mode-toggle__btn' + (mode === m.id ? ' active' : '')}
                onClick={() => {
                  setMode(m.id)
                  resetScan()
                }}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Clean status pill placed ABOVE camera circle (no clipping!) */}
          {liveStatusMsg && (
            <div className="scanner-status-banner" style={{ textAlign: 'center', marginBottom: '12px' }}>
              <span className={'pill ' + statusBadgeClass}>
                <span className="pill-dot" />
                {liveStatusMsg}
              </span>
            </div>
          )}

          <div
            className={'viewfinder' + (scanState === 'scanning' ? ' is-scanning' : '')}
            style={{
              borderColor:
                scanState === 'scanning'
                  ? signalQuality === 'perfect'
                    ? 'var(--ok)'
                    : 'var(--accent2)'
                  : 'var(--card-border)',
              transition: 'border-color 200ms ease',
            }}
          >
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: scanState === 'scanning' || scanState === 'analyzing' ? 'block' : 'none',
                transform: mode === 'face' ? 'scaleX(-1)' : 'none', // Mirror selfie video
              }}
            />
            {scanState === 'done' && frozenFrame && (
              <img
                src={frozenFrame}
                alt=""
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  filter: 'saturate(0.6) brightness(0.55)',
                  transform: mode === 'face' ? 'scaleX(-1)' : 'none',
                }}
              />
            )}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Overlays and visual constraints */}
            {scanState === 'scanning' && mode === 'face' && (
              <div className="viewfinder__face-guide">
                <div
                  className={'face-oval' + (signalQuality === 'perfect' ? ' is-aligned' : '')}
                />
              </div>
            )}

            {scanState === 'scanning' && (mode === 'anemia' || mode === 'jaundice' || mode === 'bmi') && (
              <div ref={eyeGuideRef} className="eye-guide" style={{ opacity: 0 }} />
            )}

            {scanState === 'scanning' && mode === 'fingertip' && (
              <div className="viewfinder__finger-guide">
                <div className={'finger-icon-wrap' + (signalQuality === 'perfect' ? ' is-aligned' : '')}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2C9 2 7 5 7 9v6a5 5 0 0 0 10 0V9c0-4-2-7-5-7Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path d="M9 10h6M9 13h6" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  <p>Cover rear camera lens & flash with fingertip</p>
                </div>
              </div>
            )}

            {scanState === 'initializing' && (
              <div className="viewfinder__placeholder">
                <div className="loading-spinner" />
                <p>Starting camera…</p>
              </div>
            )}

            {scanState === 'idle' && (
              <div className="viewfinder__placeholder">
                <p>{activeMode.hint}</p>
              </div>
            )}

            {scanState === 'error' && (
              <div className="viewfinder__placeholder error">
                <p>{errorMsg}</p>
              </div>
            )}

            {scanState === 'scanning' && <div className="viewfinder__scanline" />}
          </div>

          {/* Real-time PPG Waveform preview */}
          {scanState === 'scanning' && (
            <div className="ppg-waveform-card">
              <div className="ppg-waveform-header">
                <span className="pulse-label">Pulse Waveform (rPPG Signal)</span>
                <span className="mono timer">{secondsLeft}s left</span>
              </div>
              <canvas ref={waveCanvasRef} width={300} height={40} className="ppg-waveform-canvas" />
            </div>
          )}

          <p className="scan-hint">{errorMsg || activeMode.hint}</p>

          <div className="patient-name-input-group">
            <input
              type="text"
              placeholder="Patient name or ID (optional)"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="patient-input"
              disabled={busy}
            />
          </div>

          {scanState === 'idle' && (
            <button className="btn btn--primary scan-cta" onClick={startScan}>
              Start 10s scan
            </button>
          )}

          {busy && (
            <button className="btn btn--ghost scan-cta" disabled>
              {scanState === 'initializing'
                ? 'Starting camera…'
                : scanState === 'analyzing'
                  ? 'Processing AI…'
                  : `Scanning (${secondsLeft}s)`}
            </button>
          )}

          {(scanState === 'done' || scanState === 'error') && (
            <button className="btn btn--ghost scan-cta" onClick={resetScan}>
              Scan another patient
            </button>
          )}
        </section>

        <section className="scan-side">
          {/* Camera quality panel */}
          {cameraQuality && (
            <div className="card cam-quality-card">
              <div className="cam-quality-header" onClick={() => setShowCamPanel((p) => !p)}>
                <div className="cam-quality-title-row">
                  <span className="cam-quality-label">Camera Quality</span>
                  <span
                    className={`pill ${cameraQuality.grade === 'Excellent'
                        ? 'pill--ok'
                        : cameraQuality.grade === 'Good'
                          ? 'pill--ok'
                          : cameraQuality.grade === 'Fair'
                            ? 'pill--pending'
                            : 'pill--flag'
                      }`}
                  >
                    <span className="pill-dot" />
                    {cameraQuality.grade} &nbsp;·&nbsp; {cameraQuality.qualityScore}/100
                  </span>
                </div>
                <div className="cam-quality-stats">
                  <span>{cameraQuality.fps} fps</span>
                  <span>{cameraQuality.megapixels} MP</span>
                  <span>{cameraQuality.cameraTier === 'hdOrRear' ? 'Rear/HD' : cameraQuality.cameraTier === 'webcam' ? 'Webcam' : 'Front cam'}</span>
                </div>
                <button className="cam-quality-toggle" aria-label="Toggle camera detail">
                  {showCamPanel ? '▲ Hide detail' : '▼ AI analysis'}
                </button>
              </div>
              {showCamPanel && (
                <div className="cam-quality-body">
                  <p className="cam-quality-explanation">{cameraQuality.explanation}</p>
                </div>
              )}
            </div>
          )}

          {alertScaleResult && (
            <div
              className={`card triage-alert-card triage-alert--${alertScaleResult.tier.toLowerCase()}`}
              style={{
                padding: '14px',
                borderRadius: '8px',
                marginBottom: '12px',
                borderLeft: `5px solid ${alertScaleResult.tier === 'RED' ? '#ef4444' : alertScaleResult.tier === 'ORANGE' ? '#f59e0b' : '#10b981'
                  }`,
              }}
            >
              <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{alertScaleResult.title}</div>
              <div style={{ fontSize: '12px', marginTop: '4px' }}>{alertScaleResult.recommendation}</div>
            </div>
          )}

          <div className="card readout-card">
            <p className="readout-card__title">Latest screening readout</p>
            <div className="readout-grid">
              {READOUT_FIELDS.map((field) => (
                <div key={field.key} className="readout-stat">
                  <p className="readout-stat__label">{field.label}</p>
                  <p className="readout-stat__value mono">
                    {result ? (field.key === 'stress' ? `${result.stress}/100` : result[field.key]) : '—'}
                    {result && field.unit && field.key !== 'stress' && (
                      <span className="readout-stat__unit">{field.unit}</span>
                    )}
                  </p>
                </div>
              ))}
            </div>

            {spo2Result && (
              <div style={{ marginTop: '10px', fontSize: '13px', background: 'rgba(255,255,255,0.04)', padding: '8px', borderRadius: '6px' }}>
                🩸 <strong>SpO2 Proxy:</strong> {spo2Result.spo2}% ({spo2Result.confidence})
              </div>
            )}

            {bpResult && (
              <div style={{ marginTop: '10px', fontSize: '13px', background: 'rgba(255,255,255,0.04)', padding: '8px', borderRadius: '6px' }}>
                🩺 <strong>BP (PPG trend):</strong> {bpResult.sbp}/{bpResult.dbp} mmHg ({bpResult.category})
                {!bpResult.isCalibrated && lastCrestTimeMs && (
                  <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ color: 'var(--text-dim)' }}>
                      Measure your BP with a real cuff right now, then enter it here to calibrate future scans on this device:
                    </span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input
                        type="number"
                        placeholder="Systolic"
                        value={calSbpInput}
                        onChange={(e) => setCalSbpInput(e.target.value)}
                        style={{ width: '80px', padding: '6px', borderRadius: '6px', border: '1px solid var(--card-border)', background: 'var(--bg)', color: 'var(--text-white)' }}
                      />
                      <input
                        type="number"
                        placeholder="Diastolic"
                        value={calDbpInput}
                        onChange={(e) => setCalDbpInput(e.target.value)}
                        style={{ width: '80px', padding: '6px', borderRadius: '6px', border: '1px solid var(--card-border)', background: 'var(--bg)', color: 'var(--text-white)' }}
                      />
                      <button
                        className="btn btn--primary"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        onClick={() => {
                          const sbp = parseInt(calSbpInput, 10)
                          const dbp = parseInt(calDbpInput, 10)
                          if (sbp > 0 && dbp > 0 && lastCrestTimeMs) {
                            const ok = saveBpCalibration(sbp, dbp, lastCrestTimeMs)
                            if (ok) {
                              setCalSaved(true)
                              setBpResult(estimateBloodPressurePTT(lastCrestTimeMs))
                            }
                          }
                        }}
                      >
                        Save
                      </button>
                    </div>
                    {calSaved && <span style={{ color: 'var(--ok)' }}>Calibration saved — future scans on this device will use it.</span>}
                  </div>
                )}
              </div>
            )}

            {bmiResult && (
              <div style={{ marginTop: '10px', fontSize: '13px', background: 'rgba(255,255,255,0.04)', padding: '8px', borderRadius: '6px' }}>
                📐 <strong>Malnutrition BMI:</strong> {bmiResult.category} (Est. BMI: {bmiResult.bmi})
              </div>
            )}

            {/* Uncertainty badge */}
            {uncertainty && (
              <div
                className={`uncertainty-badge ${uncertainty.reliable ? 'uncertainty-badge--reliable' : 'uncertainty-badge--unreliable'
                  }`}
                style={{ marginTop: '10px' }}
              >
                {uncertainty.reliable ? (
                  <>
                    <span className="uncertainty-icon">±</span>
                    <span>
                      Heart rate reading: <strong>±{uncertainty.uncertaintyBpm} bpm</strong> estimated margin
                    </span>
                  </>
                ) : (
                  <>
                    <span className="uncertainty-icon">⚠</span>
                    <span>{uncertainty.message}</span>
                  </>
                )}
              </div>
            )}

            <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '10px', fontStyle: 'italic' }}>
              * Pulse Variability reflects camera rPPG RMSSD autonomic signal patterns, not a clinical ECG diagnosis.
            </p>

            {isAiLoading && (
              <div className="readout-explanation loading">
                <span className="pill-dot" /> Generating Qwen AI explanation in {SUPPORTED_LANGUAGES.find((l) => l.code === selectedLang)?.name}…
              </div>
            )}

            {!explanation && !isAiLoading && (
              <div className="readout-explanation" style={{ opacity: 0.85 }}>
                <p className="explanation-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="pill-dot" style={{ background: 'var(--accent2)' }} />
                  Qwen & Groq AI Engine Ready
                </p>
                <p className="explanation-body" style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                  Complete a 10-second camera scan to receive plain-language clinical guidance in {SUPPORTED_LANGUAGES.find((l) => l.code === selectedLang)?.name || 'English'}.
                </p>
              </div>
            )}

            {explanation && !isAiLoading && (
              <div className="readout-explanation">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p className="explanation-title">{viewMode === 'clinician' ? '🩺 Clinician Technical Summary:' : 'AI Explanation & Guidance:'}</p>
                  <button onClick={handleVoiceReadout} className="btn btn--ghost" style={{ fontSize: '11px', padding: '2px 8px' }}>
                    {isSpeaking ? '🔊 Stop' : '🗣️ Listen'}
                  </button>
                </div>
                <p className="explanation-body">{explanation}</p>

                {savedRecordId && (
                  <div className="report-link-box" style={{ marginTop: '10px' }}>
                    <Link to={`/report?id=${savedRecordId}`} className="btn btn--primary report-link-btn">
                      View One-Page Report & QR →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="card offline-card" style={{ marginTop: '12px' }}>
            <span className="pill pill--ok">
              <span className="pill-dot" /> Offline-ready storage
            </span>
            <p className="offline-card__copy">
              All scans save to local IndexedDB/browser storage immediately. Readings sync to Alibaba Cloud
              automatically as soon as an internet signal is restored.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
