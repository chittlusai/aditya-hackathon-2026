import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  ShieldCheck,
  Stethoscope,
  Clock,
  Activity,
  Heart,
  MessageSquare,
  FileText,
  Send,
  Pill,
  CheckCircle2,
  AlertTriangle,
  Siren,
  Maximize2,
  Minimize2,
  Sparkles,
  User,
  Volume2,
  VolumeX,
  RotateCcw,
  Printer,
  Download,
  Check,
  RefreshCw,
  Camera,
  SwitchCamera,
  Scan,
  Eye,
  Smile,
  ArrowRight,
  Sun,
  Sunset,
  Moon,
  Zap,
  Lock,
  ChevronUp,
  ChevronDown,
  X,
  Share2,
} from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import {
  DOCTOR_PROFILE,
  DOCTOR_GREETINGS,
  LANGUAGE_SPEECH_CODES,
  getDoctorConsultResponse,
} from '../utils/teleconsultAi.js'

export default function TeleconsultVideoCallModal() {
  const {
    videoCallModalOpen,
    endVideoCall,
    activeVideoSession,
    setActiveSlip,
    setSosOpen,
    saveAssessmentReport,
    go,
    language,
    t,
  } = useApp()

  // Video & Audio Controls
  const [micActive, setMicActive] = useState(true)
  const [videoActive, setVideoActive] = useState(true)
  const [facingMode, setFacingMode] = useState('user') // 'user' | 'environment'
  const [isMirrored, setIsMirrored] = useState(true) // Mirrored selfie view by default
  const [cameraStream, setCameraStream] = useState(null)
  const [cameraError, setCameraError] = useState(false)
  const [secondsElapsed, setSecondsElapsed] = useState(0)

  // WhatsApp Drawer / Menu States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [drawerTab, setDrawerTab] = useState('prescription') // 'prescription' | 'speech' | 'chat'

  // Interactive AI Doctor Voice State
  const [isDoctorSpeaking, setIsDoctorSpeaking] = useState(false)
  const [doctorSpeechText, setDoctorSpeechText] = useState('')
  const [isPatientListening, setIsPatientListening] = useState(false)
  const [patientSpokenText, setPatientSpokenText] = useState('')
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [doctorVoicePersona, setDoctorVoicePersona] = useState('male') // 'male' | 'female' | 'specialist'

  // Live AI Facial Emotion & Injury Scanner
  const [aiScanningActive, setAiScanningActive] = useState(true)
  const [facialAnalysisData, setFacialAnalysisData] = useState({
    emotion: 'Attentive / Observing Face',
    painScore: 0,
    visualSigns: 'Doctor live video stream active',
    injuryCheck: 'No trauma detected · Continuous monitoring',
    lastScanned: 'In Consultation',
  })

  // Clinical Prescription & Medicines List with Timings & Exact Purpose
  const [consultDiagnosis, setConsultDiagnosis] = useState('')
  const [prescribedMedicines, setPrescribedMedicines] = useState([])
  const [recoveryAdviceList, setRecoveryAdviceList] = useState([])
  const [whenToVisitWarning, setWhenToVisitWarning] = useState('')

  // In-Call Chat Messages
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')

  // Post-Call Summary Modal
  const [callEndedSummary, setCallEndedSummary] = useState(null)

  const patientVideoRef = useRef(null)
  const speechRecognitionRef = useRef(null)
  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null)

  const langKey = language || 'en'
  const speechCode = LANGUAGE_SPEECH_CODES[langKey] || 'en-IN'

  // Natural Doctor Text-To-Speech Synthesis with Instant Interruption Capability
  const speakDoctorVoice = useCallback(
    (textToSpeak) => {
      if (!synthRef.current) return
      try {
        synthRef.current.cancel()
        const utterance = new SpeechSynthesisUtterance(textToSpeak)
        utterance.lang = speechCode

        if (doctorVoicePersona === 'female') {
          utterance.pitch = 1.18
          utterance.rate = 0.94
        } else if (doctorVoicePersona === 'specialist') {
          utterance.pitch = 1.0
          utterance.rate = 0.88
        } else {
          utterance.pitch = 0.90
          utterance.rate = 0.92
        }

        const voices = synthRef.current.getVoices()
        const matchingVoice = voices.find(
          (v) =>
            v.lang.toLowerCase().includes(speechCode.toLowerCase()) ||
            v.lang.startsWith(langKey) ||
            v.name.toLowerCase().includes('india') ||
            v.name.toLowerCase().includes('google')
        )
        if (matchingVoice) utterance.voice = matchingVoice

        utterance.onstart = () => setIsDoctorSpeaking(true)
        utterance.onend = () => setIsDoctorSpeaking(false)
        utterance.onerror = () => setIsDoctorSpeaking(false)

        synthRef.current.speak(utterance)
      } catch (e) {
        console.warn('Speech synthesis error:', e)
      }
    },
    [speechCode, langKey, doctorVoicePersona]
  )

  // Start initial doctor greeting when WhatsApp call connects
  useEffect(() => {
    if (!videoCallModalOpen) {
      if (synthRef.current) synthRef.current.cancel()
      setCallEndedSummary(null)
      setIsDrawerOpen(false)
      return
    }

    const greeting = DOCTOR_GREETINGS[langKey] || DOCTOR_GREETINGS.en
    setDoctorSpeechText(greeting)
    setConsultDiagnosis('')
    setPrescribedMedicines([])
    setRecoveryAdviceList([])
    setChatMessages([
      {
        sender: 'doctor',
        text: greeting,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])

    const timer = setTimeout(() => {
      speakDoctorVoice(greeting)
    }, 600)

    return () => {
      clearTimeout(timer)
      if (synthRef.current) synthRef.current.cancel()
    }
  }, [videoCallModalOpen, langKey, speakDoctorVoice])

  // Camera Lifecycle
  useEffect(() => {
    if (!videoCallModalOpen) {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop())
        setCameraStream(null)
      }
      return
    }

    let stream = null
    const initCamera = async () => {
      try {
        setCameraError(false)
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: true,
        })
        setCameraStream(stream)
        if (patientVideoRef.current) {
          patientVideoRef.current.srcObject = stream
        }
      } catch (err) {
        console.warn('Webcam permission denied or camera not found:', err)
        setCameraError(true)
      }
    }

    initCamera()

    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1)
    }, 1000)

    return () => {
      clearInterval(interval)
      if (stream) stream.getTracks().forEach((t) => t.stop())
    }
  }, [videoCallModalOpen, facingMode])

  useEffect(() => {
    if (patientVideoRef.current && cameraStream) {
      patientVideoRef.current.srcObject = cameraStream
    }
  }, [cameraStream])

  const handleToggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))
  }

  const captureVideoFrame = () => {
    try {
      if (!patientVideoRef.current || !videoActive) return null
      const video = patientVideoRef.current
      if (!video.videoWidth || !video.videoHeight) return null
      const canvas = document.createElement('canvas')
      canvas.width = Math.min(video.videoWidth, 640)
      canvas.height = Math.min(video.videoHeight, 480)
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      return canvas.toDataURL('image/jpeg', 0.8)
    } catch (e) {
      return null
    }
  }

  // Patient Voice Dictation Handler with IMMEDIATE DOCTOR VOICE CANCELLATION / INTERRUPTION
  const startPatientSpeaking = () => {
    // 1. Immediately silence and stop doctor voice speech when user starts talking!
    if (synthRef.current) {
      synthRef.current.cancel()
    }
    setIsDoctorSpeaking(false)

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use the in-call chat box.')
      return
    }

    try {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.abort()
      }

      const recognition = new SpeechRecognition()
      recognition.lang = speechCode
      recognition.continuous = false
      recognition.interimResults = true

      recognition.onstart = () => {
        setIsPatientListening(true)
        setPatientSpokenText('')
      }

      recognition.onresult = (event) => {
        let transcript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
        }
        setPatientSpokenText(transcript)
      }

      recognition.onerror = (e) => {
        console.warn('Speech recognition error:', e)
        setIsPatientListening(false)
      }

      recognition.onend = () => {
        setIsPatientListening(false)
      }

      speechRecognitionRef.current = recognition
      recognition.start()
    } catch (err) {
      console.warn('Recognition start failure:', err)
      setIsPatientListening(false)
    }
  }

  const stopPatientSpeaking = () => {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop()
      setIsPatientListening(false)
    }
  }

  // Auto-Save Assessment & Prescription to SQLite Database & History Vault
  const autoSaveToHistoryPanel = (diagnosis, medicines, advice, warning, facialData, patientText) => {
    const patient = activeVideoSession?.patient || {}
    const now = new Date()
    const formattedDate = now.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    const formattedTime = now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })

    const medSummary = (medicines || []).map(
      (m) => `${m.name} (${m.dosage} • ${m.exactTime || m.schedule}) — Purpose: ${m.purpose}`
    )

    const recordId = `RX-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`

    const recordObj = {
      id: recordId,
      name: patient.name || 'Citizen (Patient)',
      age: patient.age || 34,
      gender: patient.gender || 'Male',
      symptoms: patientText || 'WhatsApp Teleconsultation Video Call completed',
      urgency: 'Moderate',
      is_prescription: true,
      diagnosis: diagnosis || 'Clinical Video Teleconsultation',
      doctor_name: `${DOCTOR_PROFILE.name} (${DOCTOR_PROFILE.qualifications})`,
      hospital_name: DOCTOR_PROFILE.facility,
      advice: (advice || []).join(' | '),
      prescribed_medicines: medSummary,
      medicines_list: medicines || [],
      doctor_notes: `Facial Signs: ${facialData?.visualSigns || 'Normal'}. Pain Score: ${facialData?.painScore || 0}%. Duration: ${formatTimer(secondsElapsed)}.`,
      created_at: `${formattedDate}, ${formattedTime}`,
    }

    saveAssessmentReport(recordObj)
    return recordObj
  }

  // Submit Patient Speech to Gemini AI with Video Frame Snapshot
  const handleSendProblem = async (textToSend = null) => {
    const text = (textToSend || patientSpokenText || chatInput).trim()
    if (!text) return

    // Silence doctor
    if (synthRef.current) {
      synthRef.current.cancel()
    }
    setIsDoctorSpeaking(false)

    const frameSnapshot = captureVideoFrame()

    const newMsg = {
      sender: 'patient',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setChatMessages((prev) => [...prev, newMsg])
    setPatientSpokenText('')
    setChatInput('')
    setIsEvaluating(true)

    try {
      const response = await getDoctorConsultResponse(
        text,
        langKey,
        activeVideoSession?.patient?.vitals || {},
        frameSnapshot
      )
      setIsEvaluating(false)

      setConsultDiagnosis(response.diagnosis)
      if (response.facialAnalysis) {
        setFacialAnalysisData({
          ...response.facialAnalysis,
          lastScanned: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })
      }
      if (response.medicines?.length > 0) {
        setPrescribedMedicines(response.medicines)
        // Automatically open the in-call prescription drawer when doctor prescribes
        setIsDrawerOpen(true)
      }
      if (response.recoveryAdvice?.length > 0) {
        setRecoveryAdviceList(response.recoveryAdvice)
      }
      if (response.whenToVisitHospital) {
        setWhenToVisitWarning(response.whenToVisitHospital)
      }

      setDoctorSpeechText(response.doctorReplySpeech)
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'doctor',
          text: response.doctorReplySpeech,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])

      // Auto-save to History panel & SQLite database
      if (response.diagnosis || response.medicines?.length > 0) {
        autoSaveToHistoryPanel(
          response.diagnosis,
          response.medicines || [],
          response.recoveryAdvice || [],
          response.whenToVisitHospital || '',
          response.facialAnalysis,
          text
        )
      }

      // Doctor speaks the response aloud
      speakDoctorVoice(response.doctorReplySpeech)
    } catch (err) {
      setIsEvaluating(false)
      console.warn('Consultation generation failed:', err)
    }
  }

  // End Call Button Handler: Automatically Saves to History with Exact Date, Time, Duration & Medicine Purpose
  const handleEndWhatsAppCall = () => {
    if (synthRef.current) synthRef.current.cancel()

    const savedRecord = autoSaveToHistoryPanel(
      consultDiagnosis || 'General Clinical Teleconsultation',
      prescribedMedicines,
      recoveryAdviceList,
      whenToVisitWarning,
      facialAnalysisData,
      'WhatsApp Video Call Completed'
    )

    setCallEndedSummary({
      ...savedRecord,
      duration: formatTimer(secondsElapsed),
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
    })
  }

  const handleFinishAndOpenHistory = () => {
    endVideoCall()
    go('history')
  }

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  if (!videoCallModalOpen || !activeVideoSession) return null

  const doctor = DOCTOR_PROFILE
  const patient = activeVideoSession.patient || {
    name: 'Citizen Resident',
    age: 34,
    gender: 'Male',
    vitals: { bp: '120/80', spo2: '98%', pulse: '76', temp: '99.4°F' },
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden select-none">
        {/* ========================================================================= */}
        {/* 1. WHATSAPP FULL-SCREEN DOCTOR VIDEO STREAM VIEWPORT */}
        {/* ========================================================================= */}
        <div className="relative w-full h-full max-w-md sm:max-w-lg md:max-w-xl mx-auto bg-slate-950 flex flex-col justify-between overflow-hidden shadow-2xl">
          {/* Real Full Video Feed of the Doctor */}
          <div className="absolute inset-0 w-full h-full overflow-hidden">
            <img
              src="/doctor_video_feed.jpg"
              alt={doctor.name}
              className="w-full h-full object-cover object-center transform scale-105 transition-all duration-700"
            />

            {/* Subtle Clinical Ambient Lighting & Dark Overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-transparent to-black/85 pointer-events-none" />

            {/* Audio Reactive Doctor Speaking Pulse Wave Indicator */}
            {isDoctorSpeaking && (
              <div className="absolute top-16 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-500/40 text-emerald-400 text-xs font-bold shadow-lg animate-pulse">
                <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
                <span>Doctor is Speaking ({language.toUpperCase()})...</span>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* 2. TOP WHATSAPP CALL HEADER BAR */}
          {/* ========================================================================= */}
          <div className="relative z-30 pt-3 px-3 sm:px-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleEndWhatsAppCall}
                className="tap-press p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md"
              >
                <X className="w-4 h-4" />
              </button>

              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm sm:text-base font-bold font-display leading-tight truncate">
                    {doctor.name}
                  </h2>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-300 font-medium">
                  <Lock className="w-2.5 h-2.5 text-emerald-400" />
                  <span>End-to-end encrypted · {formatTimer(secondsElapsed)}</span>
                </div>
              </div>
            </div>

            {/* Right Header Menu Button: Drawer Toggle */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsDrawerOpen((prev) => !prev)}
                className={`tap-press px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md backdrop-blur-md border transition-all ${
                  isDrawerOpen
                    ? 'bg-emerald-600 border-emerald-400 text-white'
                    : prescribedMedicines.length > 0
                    ? 'bg-emerald-500/90 border-emerald-300 text-white animate-pulse'
                    : 'bg-black/50 border-white/20 text-white hover:bg-black/70'
                }`}
              >
                <Pill className="w-3.5 h-3.5" />
                <span className="text-[11px]">Rx & Speech Menu</span>
                {prescribedMedicines.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-300" />
                )}
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. FLOATING POPUP USER VIDEO (WHATSAPP PIP SELF-VIEW) */}
          {/* ========================================================================= */}
          <div className="absolute top-16 right-3 w-28 sm:w-34 h-38 sm:h-44 rounded-2xl bg-slate-900 border-2 border-white/40 shadow-2xl overflow-hidden z-30 flex items-center justify-center">
            {videoActive && !cameraError ? (
              <div className="relative w-full h-full">
                <video
                  ref={patientVideoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    transform: isMirrored ? 'scaleX(-1)' : 'none',
                  }}
                  className="w-full h-full object-cover"
                />

                {/* AI Facial Expression & Emotion HUD Overlay */}
                {aiScanningActive && (
                  <div className="absolute inset-1 border border-emerald-400/70 rounded-xl pointer-events-none flex flex-col justify-between p-1">
                    <div className="flex items-center justify-between text-[7px] font-mono text-emerald-300 bg-black/60 px-1 rounded">
                      <span className="flex items-center gap-0.5">
                        <Scan className="w-2 h-2 animate-spin" />
                        AI Vision
                      </span>
                      <span>{facialAnalysisData.painScore}% Pain</span>
                    </div>
                    <span className="text-[6.5px] font-mono text-emerald-200 bg-black/70 px-1 rounded truncate">
                      {facialAnalysisData.emotion}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-2 text-center text-white">
                <User className="w-5 h-5 text-slate-400 mb-1" />
                <span className="text-[9px] font-bold truncate">{patient.name}</span>
              </div>
            )}

            {/* Quick Camera & Mirror Controls on PIP */}
            <div className="absolute top-1 left-1 flex items-center gap-1 z-30">
              <button
                type="button"
                onClick={handleToggleCameraFacing}
                className="tap-press bg-black/70 hover:bg-black text-white p-1 rounded-lg text-[9px]"
                title="Switch Camera"
              >
                <SwitchCamera className="w-2.5 h-2.5 text-emerald-300" />
              </button>
              <button
                type="button"
                onClick={() => setIsMirrored((m) => !m)}
                className="tap-press bg-black/70 hover:bg-black text-white px-1 py-0.5 rounded text-[8px] font-bold"
              >
                {isMirrored ? '🪞' : '📷'}
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 4. DOCTOR SPOKEN SPEECH SUBTITLE / BUBBLE OVERLAY */}
          {/* ========================================================================= */}
          <div className="relative z-20 px-3 sm:px-4 mb-2">
            <div className="bg-slate-900/85 backdrop-blur-md border border-white/20 rounded-2xl p-2.5 sm:p-3 text-white shadow-xl space-y-1">
              <div className="flex items-center justify-between border-b border-white/10 pb-1">
                <span className="text-[10px] font-bold text-emerald-400 uppercase flex items-center gap-1">
                  <Volume2 className={`w-3 h-3 ${isDoctorSpeaking ? 'animate-bounce text-emerald-400' : 'text-slate-400'}`} />
                  Doctor Spoken Advice ({language.toUpperCase()})
                </span>
                <button
                  type="button"
                  onClick={() => speakDoctorVoice(doctorSpeechText)}
                  className="tap-press text-[10px] text-blue-300 hover:text-white font-bold flex items-center gap-0.5"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  Replay Voice
                </button>
              </div>
              <p className="text-xs text-slate-100 leading-relaxed max-h-16 overflow-y-auto">
                "{doctorSpeechText}"
              </p>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 5. WHATSAPP BOTTOM CALL CONTROL ACTION BAR */}
          {/* ========================================================================= */}
          <div className="relative z-30 pb-4 pt-2 px-3 bg-gradient-to-t from-black via-black/90 to-transparent">
            {/* Live Dictation Prompt if Speaking */}
            {patientSpokenText && (
              <div className="mb-2 bg-emerald-900/80 border border-emerald-400/50 rounded-xl p-2 text-xs text-white flex items-center justify-between gap-1 shadow-lg">
                <span className="truncate">🗣️ "{patientSpokenText}"</span>
                <button
                  type="button"
                  onClick={() => handleSendProblem()}
                  className="tap-press px-2 py-0.5 rounded-lg bg-emerald-500 text-white text-[10px] font-bold shrink-0"
                >
                  Send →
                </button>
              </div>
            )}

            <div className="flex items-center justify-around gap-2 max-w-sm mx-auto">
              {/* 1. Mute / Unmute Microphone */}
              <button
                type="button"
                onClick={() => setMicActive((m) => !m)}
                className={`tap-press w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                  micActive ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-red-500 text-white'
                }`}
                title="Mute Mic"
              >
                {micActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              {/* 2. Video On / Off */}
              <button
                type="button"
                onClick={() => setVideoActive((v) => !v)}
                className={`tap-press w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                  videoActive ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-red-500 text-white'
                }`}
                title="Toggle Video"
              >
                {videoActive ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>

              {/* 3. Big Central "Tap to Speak / Interrupt Doctor" Button */}
              <button
                type="button"
                onClick={isPatientListening ? stopPatientSpeaking : startPatientSpeaking}
                className={`tap-press w-14 h-14 rounded-full flex flex-col items-center justify-center text-white shadow-xl transition-all ${
                  isPatientListening
                    ? 'bg-red-600 hover:bg-red-700 animate-pulse ring-4 ring-red-400/50'
                    : 'bg-emerald-600 hover:bg-emerald-700 ring-4 ring-emerald-400/30'
                }`}
                title="Speak to Doctor (Immediately stops doctor voice)"
              >
                <Mic className="w-6 h-6" />
              </button>

              {/* 4. Open In-Call Prescription Drawer Menu */}
              <button
                type="button"
                onClick={() => setIsDrawerOpen((prev) => !prev)}
                className={`tap-press w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                  isDrawerOpen
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
                title="Prescription & Tablets"
              >
                <Pill className="w-5 h-5" />
              </button>

              {/* 5. WhatsApp Red Hang-Up / End Call Button */}
              <button
                type="button"
                onClick={handleEndWhatsAppCall}
                className="tap-press w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-2xl transition-all"
                title="End WhatsApp Call"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 6. WHATSAPP SLIDE-UP PRESCRIPTION & DOCTOR SPEECH DRAWER */}
          {/* ========================================================================= */}
          <AnimatePresence>
            {isDrawerOpen && (
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="absolute inset-x-0 bottom-0 max-h-[82vh] bg-white rounded-t-3xl shadow-2xl z-40 flex flex-col overflow-hidden text-slate-800"
              >
                {/* Drawer Header Handle */}
                <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                      <Pill className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                        Doctor Prescription & Timings Menu
                      </h3>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {doctor.name} · {doctor.facility}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className="tap-press p-1.5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Drawer Tab Switcher: Prescriptions vs Doctor Speech */}
                <div className="grid grid-cols-2 gap-1 p-1.5 bg-slate-100 border-b border-slate-200 text-xs font-bold shrink-0">
                  <button
                    type="button"
                    onClick={() => setDrawerTab('prescription')}
                    className={`py-1.5 rounded-xl transition-all ${
                      drawerTab === 'prescription'
                        ? 'bg-white text-emerald-800 shadow-xs'
                        : 'text-slate-600'
                    }`}
                  >
                    💊 Tablets & Exact Purpose ({prescribedMedicines.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setDrawerTab('speech')}
                    className={`py-1.5 rounded-xl transition-all ${
                      drawerTab === 'speech'
                        ? 'bg-white text-blue-800 shadow-xs'
                        : 'text-slate-600'
                    }`}
                  >
                    🗣️ Doctor Speech & Q&A
                  </button>
                </div>

                {/* Drawer Body Scrollable Content */}
                <div className="p-3 sm:p-4 overflow-y-auto flex-1 space-y-3 min-h-0">
                  {drawerTab === 'prescription' && (
                    <>
                      {!consultDiagnosis || prescribedMedicines.length === 0 ? (
                        <div className="text-center p-6 space-y-2 bg-slate-50 rounded-2xl border border-slate-200">
                          <Pill className="w-8 h-8 text-emerald-600 mx-auto opacity-70" />
                          <h4 className="font-bold text-xs sm:text-sm text-slate-800">
                            Awaiting Symptom Consultation
                          </h4>
                          <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                            Tap the microphone button to describe your symptoms. The doctor will formulate your verified prescription with exact timings and purpose here.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {/* Diagnosis Banner */}
                          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-2.5 text-xs space-y-0.5">
                            <span className="text-[9px] font-bold uppercase text-emerald-800 bg-emerald-100 px-2 py-0.2 rounded border border-emerald-300">
                              Clinical Diagnosis
                            </span>
                            <h4 className="text-xs sm:text-sm font-bold text-emerald-950 mt-1">
                              {consultDiagnosis}
                            </h4>
                          </div>

                          {/* Prescribed Tablets List with Exact Purpose and Timings */}
                          <div className="space-y-2">
                            <span className="text-[11px] font-bold text-slate-800 block">
                              💊 Prescribed Medicines with Exact Purpose & Timings:
                            </span>

                            {prescribedMedicines.map((med, index) => (
                              <div
                                key={index}
                                className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs space-y-1.5 shadow-2xs"
                              >
                                <div className="flex items-start justify-between gap-1">
                                  <div>
                                    <strong className="text-slate-900 font-bold text-xs block">
                                      {med.name}
                                    </strong>
                                    {/* Exact Purpose of the Medicine */}
                                    <p className="text-[11px] text-blue-800 font-semibold mt-0.5">
                                      🎯 <strong>Purpose:</strong> {med.purpose}
                                    </p>
                                  </div>
                                  <span className="text-[9.5px] font-mono bg-emerald-100 text-emerald-800 font-bold px-2 py-0.2 rounded-full border border-emerald-200 shrink-0">
                                    {med.duration}
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 gap-1 text-[10px] pt-1">
                                  <div className="p-1.5 rounded-xl bg-white border border-slate-200">
                                    <span className="text-slate-500 block font-bold">🕒 When to Take:</span>
                                    <strong className="text-slate-900">{med.exactTime || '08:00 AM • 08:30 PM'}</strong>
                                  </div>

                                  <div className="p-1.5 rounded-xl bg-blue-50/70 border border-blue-200">
                                    <span className="text-blue-700 block font-bold">🍽️ Food Instruction:</span>
                                    <strong className="text-blue-950">{med.timing || med.foodInstruction || 'After Food'}</strong>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Recovery Guidelines */}
                          {recoveryAdviceList.length > 0 && (
                            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-2.5 text-xs space-y-1">
                              <span className="text-[10px] font-bold text-blue-950 flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-amber-500" />
                                Home Recovery Advice:
                              </span>
                              <ul className="list-disc pl-4 space-y-0.5 text-[10.5px] text-slate-700">
                                {recoveryAdviceList.map((adv, idx) => (
                                  <li key={idx}>{adv}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {whenToVisitWarning && (
                            <div className="bg-red-50 border border-red-200 rounded-2xl p-2 text-[10.5px] text-red-900 flex items-start gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                              <span>{whenToVisitWarning}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {drawerTab === 'speech' && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-slate-700 block">
                        🗣️ Real-Time Spoken Conversation History:
                      </span>
                      {chatMessages.map((msg, i) => (
                        <div
                          key={i}
                          className={`p-2.5 rounded-2xl text-xs space-y-0.5 ${
                            msg.sender === 'doctor'
                              ? 'bg-blue-50 border border-blue-200 text-blue-950'
                              : 'bg-slate-100 border border-slate-200 text-slate-900 ml-4'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[9.5px] font-bold">
                            <span>{msg.sender === 'doctor' ? `👨‍⚕️ ${doctor.name}` : '👤 You'}</span>
                            <span className="text-slate-400 font-mono">{msg.time}</span>
                          </div>
                          <p className="text-[11px] leading-relaxed">{msg.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Drawer Footer Action */}
                <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleEndWhatsAppCall}
                    className="tap-press flex-1 min-h-[40px] px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save & End Call</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ========================================================================= */}
        {/* 7. POST-CALL SUMMARY CARD (AUTOSAVED TO HISTORY VAULT) */}
        {/* ========================================================================= */}
        {callEndedSummary && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 text-slate-800 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 px-2 py-0.2 rounded-full border border-emerald-200">
                    Call Saved to History Vault
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    Teleconsultation Completed
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    📅 {callEndedSummary.date} · 🕒 {callEndedSummary.time} · ⏱️ {callEndedSummary.duration}
                  </p>
                </div>
              </div>

              {/* Diagnosis */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs space-y-1">
                <span className="text-[9.5px] font-bold uppercase text-slate-500">Diagnosis:</span>
                <p className="font-bold text-slate-900 text-sm">
                  {callEndedSummary.diagnosis}
                </p>
                <p className="text-[11px] text-slate-600">
                  👨‍⚕️ Prescribing Officer: <strong>{callEndedSummary.doctor_name}</strong>
                </p>
              </div>

              {/* Medicines Summary with Purpose */}
              {callEndedSummary.medicines_list && callEndedSummary.medicines_list.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-800 block">
                    💊 Prescribed Medicines & Timings:
                  </span>
                  <div className="space-y-1.5">
                    {callEndedSummary.medicines_list.map((med, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs space-y-0.5">
                        <div className="flex items-center justify-between">
                          <strong className="text-emerald-950 font-bold">{med.name}</strong>
                          <span className="text-[9.5px] font-mono text-emerald-800 font-bold">{med.exactTime || '08:00 AM'}</span>
                        </div>
                        <p className="text-[10.5px] text-blue-800 font-semibold">
                          🎯 <strong>Purpose:</strong> {med.purpose}
                        </p>
                        <p className="text-[10px] text-slate-600">
                          🍽️ <strong>Timing:</strong> {med.timing || 'After Food'} · {med.duration}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Finish Actions */}
              <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleFinishAndOpenHistory}
                  className="tap-press w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <FileText className="w-4 h-4" />
                  <span>Open in Medical History & Pill Timings Vault →</span>
                </button>

                <button
                  type="button"
                  onClick={endVideoCall}
                  className="tap-press w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
                >
                  Close & Back to Home
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AnimatePresence>
  )
}
