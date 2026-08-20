import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { fetchAIExplanation, SUPPORTED_LANGUAGES, getStressLabel } from '../lib/ai'
import { patientRepository, screeningRepository } from '../domain/repositories.js'
import { CircularBuffer } from '../core/CircularBuffer.js'
import { ScanStrategyFactory } from '../domain/scanning/ScanStrategy.js'
import { signalAnalysisService } from '../services/SignalAnalysisService.js'
import { createQualityMask } from '../lib/qualityFlags.js'
import BioSignalVisual from '../components/BioSignalVisual.jsx'
import {
  assessCameraQuality,
  estimateUncertainty,
  inferLightingTier,
  inferMotionTier,
  inferSkinToneTier,
} from '../lib/uncertainty'
import { estimateSpO2 } from '../lib/spo2.js'
import { checkIrregularRhythm } from '../lib/afib.js'
import { AGE_GROUPS, PROGRAMME_CONTEXTS } from '../lib/alertScale.js'
import { analyzeConjunctivalPallor } from '../lib/anemia.js'
import { analyzeScleralIcterus } from '../lib/jaundice.js'
import { estimateBloodPressurePTT } from '../lib/bloodPressurePTT.js'
import { estimateMalnutritionBMI } from '../lib/bmiEstimate.js'
import { clinicalRiskPolicy } from '../domain/clinical/ClinicalRiskPolicy.js'

const MODES = [
  { id: 'face', label: 'Face scan', hint: 'Hold the phone at arm’s length with your face centered in the guide oval.' },
  { id: 'fingertip', label: 'Fingertip + flash', hint: 'Cover the rear camera lens and flash completely with your fingertip.' },
  { id: 'anemia', label: 'Anemia', hint: 'Pull down the lower eyelid so the pink conjunctiva is visible inside the guide.' },
  { id: 'jaundice', label: 'Jaundice', hint: 'Look straight ahead in even light so the white of the eye is visible.' },
  { id: 'bp_ptt', label: 'BP trend', hint: 'Use the face guide. This is a calibrated pulse-wave trend, not a cuff measurement.' },
  { id: 'bmi', label: 'BMI / nutrition', hint: 'Align the face and upper shoulders in the guide for a rough anthropometric proxy.' },
]

const VISUAL_MODES = new Set(['anemia', 'jaundice', 'bmi'])

const READOUT_FIELDS = [
  { key: 'hr', label: 'Heart rate', unit: 'bpm' },
  { key: 'br', label: 'Breathing rate', unit: 'br/min' },
  { key: 'stress', label: 'Pulse Variability', unit: '/100' },
]

const SCAN_DURATION_MS = 15000
const MAX_CAPTURE_SAMPLES = 900
const MAX_QUALITY_SAMPLES = 120
const MODEL_ASSET_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'
const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm'
let visionTasksPromise

const RIGHT_EYE_INDICES = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246]

function scanDuration(mode) {
  return VISUAL_MODES.has(mode) ? 4000 : SCAN_DURATION_MS
}

function getEyeRoi(landmarkResult, width, height, conjunctiva = false) {
  const face = landmarkResult?.faceLandmarks?.[0]
  if (!face || !width || !height) return null
  const points = RIGHT_EYE_INDICES.map((index) => face[index]).filter(Boolean)
  if (points.length === 0) return null
  const minX = Math.min(...points.map((point) => point.x))
  const maxX = Math.max(...points.map((point) => point.x))
  const minY = Math.min(...points.map((point) => point.y))
  const maxY = Math.max(...points.map((point) => point.y))
  const eyeW = maxX - minX
  const eyeH = maxY - minY
  const raw = conjunctiva
    ? { x: minX + eyeW * 0.1, y: maxY, w: eyeW * 0.8, h: eyeH * 0.9 }
    : { x: minX - eyeW * 0.15, y: minY - eyeH * 0.25, w: eyeW * 1.3, h: eyeH * 1.5 }
  return {
    x: Math.max(0, Math.round(raw.x * width)),
    y: Math.max(0, Math.round(raw.y * height)),
    w: Math.max(1, Math.min(width, Math.round(raw.w * width))),
    h: Math.max(1, Math.min(height, Math.round(raw.h * height))),
  }
}

function estimateShoulderToHeightRatio(landmarkResult, width, height) {
  const face = landmarkResult?.faceLandmarks?.[0]
  if (!face || !width || !height) return null
  const minX = Math.min(...face.map((point) => point.x))
  const maxX = Math.max(...face.map((point) => point.x))
  const faceWidthPx = (maxX - minX) * width
  return faceWidthPx > 0 ? (faceWidthPx * 2.1) / height : null
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
  visionTasksPromise ??= import('@mediapipe/tasks-vision')
  const { FaceLandmarker, FilesetResolver } = await visionTasksPromise
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
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState('face')
  const [scanState, setScanState] = useState('idle') // idle | initializing | scanning | analyzing | done | error
  const [result, setResult] = useState(null)
  const [uncertainty, setUncertainty] = useState(null)   // { reliable, uncertaintyBpm } | { reliable:false, message }
  const [cameraQuality, setCameraQuality] = useState(null) // from assessCameraQuality
  const [showCamPanel, setShowCamPanel] = useState(false)
  const [explanation, setExplanation] = useState('')
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [signalQuality, setSignalQuality] = useState('none') // none | adjusting | perfect
  const [secondsLeft, setSecondsLeft] = useState(Math.ceil(SCAN_DURATION_MS / 1000))
  const [selectedLang, setSelectedLang] = useState('en')
  const [patients, setPatients] = useState([])
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [patientLoadError, setPatientLoadError] = useState('')
  const [savedRecordId, setSavedRecordId] = useState(null)
  const [clinicalResult, setClinicalResult] = useState(null)
  const [ageGroup, setAgeGroup] = useState('adult')
  const [isPregnant, setIsPregnant] = useState(false)
  const [programmeContext, setProgrammeContext] = useState('general')

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const waveCanvasRef = useRef(null)
  const streamRef = useRef(null)
  const landmarkerRef = useRef(null)
  const rafRef = useRef(null)
  const samplesRef = useRef(new CircularBuffer(MAX_CAPTURE_SAMPLES))
  const brightnessHistoryRef = useRef(new CircularBuffer(MAX_QUALITY_SAMPLES))
  const scanStartRef = useRef(0)
  const signalQualityRef = useRef('none')
  const secondsLeftRef = useRef(Math.ceil(SCAN_DURATION_MS / 1000))
  const lastLandmarkResultRef = useRef(null)
  const lastVideoSizeRef = useRef({ width: 0, height: 0 })

  useEffect(() => () => landmarkerRef.current?.close(), [])

  useEffect(() => {
    let active = true
    patientRepository.list()
      .then((items) => {
        if (!active) return
        setPatients(items)
        const requestedPatient = searchParams.get('patient')
        if (requestedPatient && items.some((patient) => patient.id === requestedPatient)) {
          setSelectedPatientId(requestedPatient)
        }
      })
      .catch((error) => active && setPatientLoadError(error.message))
    return () => { active = false }
  }, [searchParams])

  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId) ?? null

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
  }, [])

  useEffect(() => stopStream, [stopStream])

  // Draw real-time PPG signal wave on waveCanvasRef
  const drawWaveform = useCallback(() => {
    const waveCanvas = waveCanvasRef.current
    if (!waveCanvas) return
    const wCtx = waveCanvas.getContext('2d')
    if (!wCtx) return

    const samples = samplesRef.current.toArray()
    const width = waveCanvas.width
    const height = waveCanvas.height

    wCtx.clearRect(0, 0, width, height)
    if (samples.length < 2) return

    // Draw baseline
    wCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    wCtx.lineWidth = 1
    wCtx.beginPath()
    wCtx.moveTo(0, height / 2)
    wCtx.lineTo(width, height / 2)
    wCtx.stroke()

    // Get last 60 samples
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

  async function persistCompletedScreening({ analysis = {}, extended = {}, risk, explanationText, source, qualityFlags = 0 }) {
    const recordObj = {
      id: `demo-screening-${crypto.randomUUID()}`,
      patientId: selectedPatient?.patient_code,
      patientCode: selectedPatient?.patient_code,
      patientDatabaseId: selectedPatient?.id,
      name: selectedPatient?.full_name || 'Unlinked patient',
      mode,
      hr: analysis.hr ?? null,
      br: analysis.br ?? null,
      stress: analysis.stress ?? null,
      rmssd: analysis.rmssd ?? null,
      stressLabel: Number.isFinite(Number(analysis.stress)) ? getStressLabel(analysis.stress) : null,
      status: risk.flagged ? 'flagged' : 'ok',
      alertTier: risk.tier,
      alertReasons: risk.reasons,
      referralPriority: risk.priority,
      explanation: explanationText,
      language: selectedLang,
      source,
      algorithmVersion: VISUAL_MODES.has(mode) ? 'clinical-vision-v1' : 'rppg-worker-v3',
      captureQuality: cameraQuality?.qualityScore ?? null,
      qualityFlags,
      ageGroup,
      isPregnant,
      programmeContext,
      timestamp: new Date().toISOString(),
      synced: false,
      ...extended,
    }

    try {
      const saved = await screeningRepository.save(recordObj)
      setSavedRecordId(saved.reportId || saved.databaseId || saved.id)
    } catch (error) {
      console.error('Secure record save failed', error)
      setErrorMsg('Screening completed, but the protected record could not be saved. Please sign in and try again.')
    }
  }

  async function finishScan() {
    stopStream()
    setScanState('analyzing')

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d', { willReadFrequently: true })
    const { width, height } = lastVideoSizeRef.current

    if (VISUAL_MODES.has(mode)) {
      let extended = {}
      let visualResult
      if (mode === 'anemia') {
        visualResult = analyzeConjunctivalPallor(ctx, getEyeRoi(lastLandmarkResultRef.current, width, height, true))
        extended = { anemiaResult: visualResult }
      } else if (mode === 'jaundice') {
        visualResult = analyzeScleralIcterus(ctx, getEyeRoi(lastLandmarkResultRef.current, width, height, false))
        extended = { jaundiceResult: visualResult }
      } else {
        const ratio = estimateShoulderToHeightRatio(lastLandmarkResultRef.current, width, height)
        visualResult = ratio == null
          ? { bmi: null, category: 'Low Confidence — Retry Scan', tier: 'UNKNOWN', recommendation: 'Face and shoulders were not detected together. Reframe and retry.' }
          : estimateMalnutritionBMI(ratio)
        extended = { bmiResult: visualResult }
      }

      const risk = clinicalRiskPolicy.evaluate({
        mode,
        anemia: extended.anemiaResult,
        jaundice: extended.jaundiceResult,
        bmi: extended.bmiResult,
      })
      const explanationText = `${visualResult.label || visualResult.category}. ${visualResult.recommendation}`
      setClinicalResult({ mode, ...visualResult, risk })
      setExplanation(explanationText)
      setScanState('done')
      if (risk.tier !== 'UNKNOWN') {
        await persistCompletedScreening({ extended, risk, explanationText, source: `camera_${mode}` })
      }
      return
    }

    const samples = samplesRef.current.toArray()
    const analysis = await signalAnalysisService.analyze(samples)
    if (!analysis || !analysis.hr) {
      setScanState('error')
      setErrorMsg(mode === 'fingertip'
        ? 'Signal was inconsistent — cover the lens and flash fully, hold steady, and try again.'
        : 'Could not capture a clear pulse signal — keep the face still in steady lighting and try again.')
      return
    }

    const bHistory = brightnessHistoryRef.current.toArray()
    const meanB = bHistory.length ? bHistory.reduce((sum, value) => sum + value, 0) / bHistory.length : 80
    const varB = bHistory.length ? bHistory.reduce((sum, value) => sum + (value - meanB) ** 2, 0) / bHistory.length : 0
    const lightingTier = inferLightingTier(meanB, varB)
    const motionTier = inferMotionTier(bHistory)
    const meanR = samples.reduce((sum, sample) => sum + sample.r, 0) / samples.length
    const meanG = samples.reduce((sum, sample) => sum + sample.g, 0) / samples.length
    const meanBChannel = samples.reduce((sum, sample) => sum + sample.b, 0) / samples.length
    const skinToneTier = inferSkinToneTier(meanR, meanG, meanBChannel)
    const unc = estimateUncertainty({
      fps: cameraQuality?.fps ?? 30,
      cameraTier: cameraQuality?.cameraTier ?? 'webcam',
      compressionTier: cameraQuality?.compressionTier ?? 'modernCodecTypical',
      lightingTier,
      motionTier,
      skinToneTier,
      windowSeconds: analysis.windowSeconds ?? scanDuration(mode) / 1000,
    }, analysis.liveConfidence ?? 0.5)
    const qualityFlags = createQualityMask({ camera: cameraQuality, lightingTier, motionTier, uncertainty: unc })
    const spo2Result = estimateSpO2(samples.map((sample) => sample.r), samples.map((sample) => sample.g), unc.reliable, skinToneTier)
    const rhythmResult = checkIrregularRhythm(analysis.beatTimesMs || [], mode)
    const bpResult = mode === 'bp_ptt' ? estimateBloodPressurePTT(analysis.crestTimeMs, null) : null
    const risk = clinicalRiskPolicy.evaluate({
      mode, heartRate: analysis.hr, breathingRate: analysis.br, stressScore: analysis.stress,
      ageGroup, isPregnant, programmeContext, spo2: spo2Result.spo2,
      isIrregularRhythm: rhythmResult.isIrregular,
    })

    setResult(analysis)
    setUncertainty(unc)
    setClinicalResult({ mode, spo2Result, rhythmResult, bpResult, risk })
    setIsAiLoading(true)
    const explanationText = await fetchAIExplanation({
      hr: analysis.hr, br: analysis.br, stress: analysis.stress, spo2: spo2Result.spo2,
      alertTier: risk.tier, alertReasons: risk.reasons, ageGroup, isPregnant,
      programmeContext, langCode: selectedLang,
    })
    setExplanation(explanationText)
    setIsAiLoading(false)
    setScanState('done')

    await persistCompletedScreening({
      analysis,
      extended: {
        spo2: spo2Result.spo2,
        isIrregularRhythm: rhythmResult.isIrregular,
        bpResult,
      },
      risk,
      explanationText,
      source: mode === 'fingertip' ? 'contact_ppg' : mode === 'bp_ptt' ? 'camera_bp_trend' : 'camera_rppg',
      qualityFlags,
    })
  }

  function sampleLoop(currentMode) {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    const landmarker = landmarkerRef.current
    const scanStrategy = ScanStrategyFactory.create(currentMode === 'fingertip' ? 'fingertip' : 'face')

    let cachedRoi = null
    let frameCount = 0
    const DETECT_EVERY_N_FRAMES = 3

    const tick = () => {
      const elapsed = performance.now() - scanStartRef.current
      const duration = scanDuration(currentMode)
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
        // Fingertip mode: Check red channel intensity and red dominance ratio
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
            const [track] = streamRef.current?.getVideoTracks() || []
            const caps = track?.getCapabilities?.()
            const hasTorch = Boolean(caps?.torch)

            // Track brightness for lighting/motion inference
            const brightness = (rgb.r + rgb.g + rgb.b) / 3
            brightnessHistoryRef.current.push(brightness)

            // Fingertip contact detection (Gudi et al. 2020 & contact PPG physics):
            // Finger tissue strongly absorbs blue light, so Red > Blue is the primary physical indicator.
            // Auto-white balance on webcams/mobile sensors can boost G/B channels, so redRatioG may be ~1.02-1.15.
            const { detected: hasFingerContact, strong: isVeryGoodContact } = scanStrategy.assessContact(rgb, hasTorch)

            if (hasFingerContact) {
              currentQuality = isVeryGoodContact ? 'perfect' : 'adjusting'
              // ALWAYS push samples continuously when finger is touching lens (prevents frame drops & gap noise)
              samplesRef.current.push({ t: elapsed, ...rgb, mode: 'fingertip' })
            } else {
              currentQuality = 'none'
            }
          }
        }
      } else {
        // Face mode: Run MediaPipe face landmarker
        frameCount++
        if (landmarker && video.readyState >= 2 && frameCount % DETECT_EVERY_N_FRAMES === 0) {
          try {
            const res = landmarker.detectForVideo(video, performance.now())
            cachedRoi = getForeheadRoi(res, video.videoWidth, video.videoHeight)
            lastLandmarkResultRef.current = res
            lastVideoSizeRef.current = { width: video.videoWidth, height: video.videoHeight }
          } catch (e) {
            console.warn('Face detection error', e)
          }
        }

        if (video.readyState >= 2) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          ctx.drawImage(video, 0, 0)
          lastVideoSizeRef.current = { width: video.videoWidth, height: video.videoHeight }
          currentQuality = cachedRoi ? 'perfect' : 'adjusting'
          if (!VISUAL_MODES.has(currentMode) && cachedRoi) {
            const rgb = meanRgb(ctx, cachedRoi)
            if (rgb) {
              samplesRef.current.push({ t: elapsed, ...rgb })
              const brightness = (rgb.r + rgb.g + rgb.b) / 3
              brightnessHistoryRef.current.push(brightness)
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
    if (!selectedPatient) {
      setErrorMsg('Select a registered patient before starting the screening.')
      return
    }
    if (selectedPatient.consent_status !== 'granted') {
      setErrorMsg('This patient profile does not have active consent for a new screening.')
      return
    }
    setScanState('initializing')
    setResult(null)
    setUncertainty(null)
    setClinicalResult(null)
    setSavedRecordId(null)
    setExplanation('')
    samplesRef.current.clear()
    brightnessHistoryRef.current.clear()
    signalQualityRef.current = 'none'
    setSignalQuality('none')
    lastLandmarkResultRef.current = null
    lastVideoSizeRef.current = { width: 0, height: 0 }
    secondsLeftRef.current = Math.ceil(scanDuration(mode) / 1000)
    setSecondsLeft(secondsLeftRef.current)

    try {
      const scanStrategy = ScanStrategyFactory.create(mode === 'fingertip' ? 'fingertip' : 'face')
      if (mode !== 'fingertip' && !landmarkerRef.current) {
        landmarkerRef.current = await loadFaceLandmarker()
      }

      const facingModeHint = scanStrategy.facingMode()
      const constraints = scanStrategy.cameraConstraints()

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      // ── Camera quality assessment (once, right after stream opens) ──────
      const camQ = assessCameraQuality(stream, facingModeHint)
      setCameraQuality(camQ)

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

      const video = videoRef.current
      if (video) {
        video.srcObject = stream
        await video.play()
        await new Promise((resolve) => {
          if (video.readyState >= 2) return resolve()
          video.onloadeddata = () => resolve()
        })
      }

      setScanState('scanning')
      scanStartRef.current = performance.now()
      sampleLoop(mode)
    } catch (err) {
      console.error('getUserMedia failed', err)
      setScanState('error')
      setErrorMsg(
        err.name === 'NotAllowedError'
          ? 'Camera permission was denied — please grant camera access in browser settings.'
          : 'Could not access camera on this device.'
      )
    }
  }

  function resetScan() {
    stopStream()
    setScanState('idle')
    setResult(null)
    setUncertainty(null)
    setClinicalResult(null)
    setSavedRecordId(null)
    setExplanation('')
    setErrorMsg('')
    setSignalQuality('none')
    brightnessHistoryRef.current.clear()
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
      } else if (signalQuality === 'adjusting') {
        liveStatusMsg = `Fingertip detected — hold steady (${secondsLeft}s)`
        statusBadgeClass = 'pill--pending'
      } else {
        liveStatusMsg = 'Cover camera or webcam lens with your fingertip'
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
    liveStatusMsg = VISUAL_MODES.has(mode) ? 'Analyzing the captured clinical region…' : 'Analyzing pulse wave and secure guidance…'
  }

  return (
    <main className="page scan-page">
      <div className="scan-page__intro health-hero">
        <div className="scan-intro__topline">
          <p className="eyebrow"><span className="eyebrow-dot" /> Camera health intelligence</p>
          <div className="lang-selector-group">
            <label htmlFor="lang-select" className="lang-label">
              Guidance language
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

        <div className="scan-intro__copy">
          <span className="health-hero__kicker">A clearer view of your everyday health</span>
          <h1 className="page-title">
            Your health.<br />
            <span>Clearly in view.</span>
          </h1>
          <p className="page-subtitle">
            Turn your camera into a simple health check. Vytal reads subtle pulse signals and
            translates them into useful guidance in seconds—without a wearable.
          </p>
          <div className="health-hero__actions">
            <button
              type="button"
              className="btn btn--primary health-hero__cta"
              onClick={() => document.getElementById('scan-console')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Start a health check <span aria-hidden="true">↓</span>
            </button>
              <span className="health-hero__microcopy"><strong>15 seconds.</strong> No extra device.</span>
          </div>
          <div className="health-hero__trust" aria-label="Product capabilities">
            <span><i className="health-dot health-dot--pink" /> Heart rate</span>
            <span><i className="health-dot health-dot--blue" /> Breathing</span>
            <span><i className="health-dot health-dot--purple" /> Variability</span>
          </div>
        </div>

        <div className="scan-intro__visual">
          <BioSignalVisual
            onStart={() => document.getElementById('scan-console')?.scrollIntoView({ behavior: 'smooth' })}
          />
        </div>
      </div>

      <div className="scan-layout" id="scan-console">
        <section className="card scan-viewfinder-card">
          <div className="scan-panel__masthead">
            <div>
              <span className="panel-index">CAM / 01</span>
              <p className="panel-title">Signal acquisition</p>
            </div>
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
          </div>

          <div className="clinical-context-row">
            <label>
              <span>Age band</span>
              <select value={ageGroup} onChange={(event) => setAgeGroup(event.target.value)} disabled={busy}>
                {AGE_GROUPS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </label>
            <label>
              <span>Programme</span>
              <select value={programmeContext} onChange={(event) => setProgrammeContext(event.target.value)} disabled={busy}>
                {PROGRAMME_CONTEXTS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </label>
            <label className="clinical-context-row__check">
              <input type="checkbox" checked={isPregnant} onChange={(event) => setIsPregnant(event.target.checked)} disabled={busy || ageGroup !== 'adult'} />
              Third-trimester context
            </label>
          </div>

          <div className="scan-device__statusline">
            <span className="mono">CAMERA FEED / RGB</span>
            {liveStatusMsg ? (
              <span className={'scanner-status-banner ' + statusBadgeClass}>
                <span className="pill-dot" />
                {liveStatusMsg}
              </span>
            ) : (
              <span className="mono">READY</span>
            )}
          </div>

          <div className="viewfinder-shell">
            <div
              className={'viewfinder' + (scanState === 'scanning' ? ' is-scanning' : '')}
              style={{
                borderColor:
                  scanState === 'scanning'
                    ? signalQuality === 'perfect'
                      ? 'var(--mint-strong)'
                      : 'var(--amber)'
                    : 'var(--line-on-dark)',
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
                  display: busy || scanState === 'done' ? 'block' : 'none',
                  transform: mode === 'fingertip' ? 'none' : 'scaleX(-1)',
                }}
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />

              {scanState === 'scanning' && mode !== 'fingertip' && (
                <div className="viewfinder__face-guide">
                  <div
                    className={(mode === 'anemia' || mode === 'jaundice' ? 'clinical-eye-guide' : 'face-oval') + (signalQuality === 'perfect' ? ' is-aligned' : '')}
                  />
                </div>
              )}

              {scanState === 'scanning' && mode === 'fingertip' && (
                <div className="viewfinder__finger-guide">
                  <div className={'finger-icon-wrap' + (signalQuality === 'perfect' ? ' is-aligned' : '')}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 2C9 2 7 5 7 9v6a5 5 0 0 0 10 0V9c0-4-2-7-5-7Z"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path d="M9 10h6M9 13h6" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>
                </div>
              )}

              {scanState === 'idle' && mode === 'face' && (
                <div className="viewfinder__placeholder">
                  <span className="viewfinder__step mono">STEP 01 / ALIGN</span>
                  <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 8a2 2 0 0 1 2-2h1.5l1-1.5h7l1 1.5H18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  <p>Center the face in the frame.<br />Keep the camera steady.</p>
                </div>
              )}

              {scanState === 'idle' && mode === 'fingertip' && (
                <div className="viewfinder__placeholder">
                  <span className="viewfinder__step mono">STEP 01 / COVER</span>
                  <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2C9 2 7 5 7 9v6a5 5 0 0 0 10 0V9c0-4-2-7-5-7Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path d="M9 10h6M9 13h6" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  <p>Cover the rear lens and flash.<br />Apply light, even pressure.</p>
                </div>
              )}

              {scanState === 'idle' && mode !== 'face' && mode !== 'fingertip' && (
                <div className="viewfinder__placeholder">
                  <span className="viewfinder__step mono">STEP 01 / POSITION</span>
                  <p>{activeMode.hint}</p>
                  <small>Screening proxy only — confirm concerning results with an approved clinical test.</small>
                </div>
              )}

              {scanState === 'error' && (
                <div className="viewfinder__placeholder error">
                  <span className="viewfinder__step mono">INPUT ERROR</span>
                  <p>{errorMsg}</p>
                </div>
              )}

              {scanState === 'scanning' && <div className="viewfinder__scanline" />}
            </div>
            <span className="viewfinder-shell__label viewfinder-shell__label--top mono">OPTICAL / rPPG</span>
            <span className="viewfinder-shell__label viewfinder-shell__label--bottom mono">LIVE / 30 FPS</span>
          </div>

          {/* Real-time PPG Waveform preview */}
          {scanState === 'scanning' && !VISUAL_MODES.has(mode) && (
            <div className="ppg-waveform-card">
              <div className="ppg-waveform-header">
                <span className="pulse-label">Pulse Waveform (rPPG Signal)</span>
                <span className="mono timer">{secondsLeft}s left</span>
              </div>
              <canvas ref={waveCanvasRef} width={300} height={40} className="ppg-waveform-canvas" />
            </div>
          )}

          <div className="scan-console__footer">
            <div className="scan-console__copy">
              <span className="mono">INSTRUCTION</span>
              <p className="scan-hint">{errorMsg || activeMode.hint}</p>
            </div>
            <div className="scan-console__actions">
              <div className="patient-name-input-group">
                <label htmlFor="patient-profile">Linked patient profile</label>
                <select
                  id="patient-profile"
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="patient-input"
                  disabled={busy}
                  required
                >
                  <option value="">Select a registered patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id} disabled={patient.consent_status !== 'granted'}>
                      {patient.patient_code} · {patient.full_name}{patient.consent_status !== 'granted' ? ' · consent required' : ''}
                    </option>
                  ))}
                </select>
                <Link className="patient-manage-link" to="/patients">+ Register or manage patients</Link>
                {patientLoadError && <span className="patient-load-error" role="alert">{patientLoadError}</span>}
              </div>

              {scanState === 'idle' && (
                <button className="btn btn--primary scan-cta" onClick={startScan}>
                  Start acquisition <span aria-hidden="true">↗</span>
                </button>
              )}
              {busy && (
                <button className="btn btn--ghost scan-cta" disabled>
                  {scanState === 'initializing'
                    ? 'Starting camera…'
                    : scanState === 'analyzing'
                    ? 'Processing guidance…'
                    : `Acquiring signal / ${secondsLeft}s`}
                </button>
              )}
              {(scanState === 'done' || scanState === 'error') && (
                <button className="btn btn--ghost scan-cta" onClick={resetScan}>
                  Run another scan
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="scan-side">
          {/* Camera quality panel */}
          {cameraQuality && (
            <div className="card cam-quality-card">
              <div className="cam-quality-header" onClick={() => setShowCamPanel(p => !p)}>
                <div className="cam-quality-title-row">
                  <span className="cam-quality-label">Camera Quality</span>
                  <span
                    className={`pill ${
                      cameraQuality.grade === 'Excellent' ? 'pill--ok'
                      : cameraQuality.grade === 'Good' ? 'pill--ok'
                      : cameraQuality.grade === 'Fair' ? 'pill--pending'
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

          <div className="card readout-card">
            <div className="readout-card__header">
              <div>
                <span className="panel-index">RESULT / 001</span>
                <p className="readout-card__title">Latest screening</p>
              </div>
              <span className="readout-state"><span className="pill-dot" /> Live</span>
            </div>
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

            {clinicalResult && (
              <div className="clinical-result-grid">
                {clinicalResult.risk && (
                  <div className={`clinical-result-card clinical-result-card--${String(clinicalResult.risk.tier).toLowerCase()}`}>
                    <span>Alert tier</span>
                    <strong>{clinicalResult.risk.tier}</strong>
                    <small>{clinicalResult.risk.reasons.join(' · ') || 'No referral threshold crossed'}</small>
                  </div>
                )}
                {clinicalResult.spo2Result && <div className="clinical-result-card"><span>SpO₂ proxy</span><strong>{clinicalResult.spo2Result.spo2 ?? 'Retry'}{clinicalResult.spo2Result.spo2 ? '%' : ''}</strong><small>{clinicalResult.spo2Result.disclaimer}</small></div>}
                {clinicalResult.rhythmResult && <div className="clinical-result-card"><span>Rhythm proxy</span><strong>{clinicalResult.rhythmResult.isIrregular ? 'Review' : 'Regular'}</strong><small>{clinicalResult.rhythmResult.message}</small></div>}
                {clinicalResult.bpResult && <div className="clinical-result-card"><span>BP trend</span><strong>{clinicalResult.bpResult.isCalibrated ? `${clinicalResult.bpResult.sbp}/${clinicalResult.bpResult.dbp}` : 'Calibration required'}</strong><small>{clinicalResult.bpResult.note}</small></div>}
                {clinicalResult.mode === 'anemia' && <div className="clinical-result-card"><span>Hemoglobin proxy</span><strong>{clinicalResult.hb == null ? 'Retry' : `${clinicalResult.hb} g/dL`}</strong><small>{clinicalResult.label}</small></div>}
                {clinicalResult.mode === 'jaundice' && <div className="clinical-result-card"><span>Scleral yellow index</span><strong>{clinicalResult.yellowIndex == null ? 'Retry' : clinicalResult.yellowIndex}</strong><small>{clinicalResult.label}</small></div>}
                {clinicalResult.mode === 'bmi' && <div className="clinical-result-card"><span>BMI proxy</span><strong>{clinicalResult.bmi == null ? 'Retry' : clinicalResult.bmi}</strong><small>{clinicalResult.category}</small></div>}
              </div>
            )}

            {/* Uncertainty badge */}
            {uncertainty && (
              <div className={`uncertainty-badge ${
                uncertainty.reliable ? 'uncertainty-badge--reliable' : 'uncertainty-badge--unreliable'
              }`}>
                {uncertainty.reliable ? (
                  <>
                    <span className="uncertainty-icon">±</span>
                    <span>
                      Heart rate reading: <strong>±{uncertainty.uncertaintyBpm} bpm</strong> estimated margin
                    </span>
                  </>
                ) : (
                  <>
                    <span className="uncertainty-icon">!</span>
                    <span>{uncertainty.message}</span>
                  </>
                )}
              </div>
            )}

            <p className="readout-disclaimer">
              * Pulse Variability reflects camera rPPG RMSSD autonomic signal patterns, not a clinical ECG diagnosis.
            </p>

            {isAiLoading && (
              <div className="readout-explanation loading">
                <span className="pill-dot" /> Generating Qwen AI explanation in {SUPPORTED_LANGUAGES.find((l) => l.code === selectedLang)?.name}…
              </div>
            )}

            {!explanation && !isAiLoading && (
              <div className="readout-explanation readout-explanation--standby">
                <p className="explanation-title">
                  <span className="pill-dot" />
                  Guidance engine on standby
                </p>
                <p className="explanation-body">
                  Complete a 15-second camera scan to receive plain-language screening guidance in {SUPPORTED_LANGUAGES.find((l) => l.code === selectedLang)?.name || 'English'}.
                </p>
              </div>
            )}

            {explanation && !isAiLoading && (
              <div className="readout-explanation">
                <p className="explanation-title">AI Explanation & Guidance:</p>
                <p className="explanation-body">{explanation}</p>

                {savedRecordId && (
                  <div className="report-link-box">
                    <Link to={`/report?id=${savedRecordId}`} className="btn btn--primary report-link-btn">
                      View One-Page Report & QR →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="card offline-card">
            <span className="offline-card__index mono">LOCAL / FIRST</span>
            <div>
              <p className="offline-card__title"><span className="pill-dot" /> Built for a weak signal.</p>
              <p className="offline-card__copy">
                Signal processing runs locally. Protected records are written only when the authenticated database is available.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
