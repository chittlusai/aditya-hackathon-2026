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

  // Video & Audio States
  const [micActive, setMicActive] = useState(true)
  const [videoActive, setVideoActive] = useState(true)
  const [facingMode, setFacingMode] = useState('user') // 'user' | 'environment'
  const [isMirrored, setIsMirrored] = useState(true) // Mirrored webcam feed by default
  const [cameraStream, setCameraStream] = useState(null)
  const [cameraError, setCameraError] = useState(false)
  const [secondsElapsed, setSecondsElapsed] = useState(0)

  // Doctor Voice Persona Settings
  const [doctorVoicePersona, setDoctorVoicePersona] = useState('male') // 'male' | 'female' | 'specialist'

  // Interactive AI Doctor Voice State
  const [isDoctorSpeaking, setIsDoctorSpeaking] = useState(false)
  const [doctorSpeechText, setDoctorSpeechText] = useState('')
  const [isPatientListening, setIsPatientListening] = useState(false)
  const [patientSpokenText, setPatientSpokenText] = useState('')
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [savedToHistoryNotice, setSavedToHistoryNotice] = useState(false)

  // Live AI Facial Emotion & Injury Scanner State
  const [aiScanningActive, setAiScanningActive] = useState(true)
  const [facialAnalysisData, setFacialAnalysisData] = useState({
    emotion: 'Observing Face & Posture',
    painScore: 0,
    visualSigns: 'Camera live stream active for clinical inspection',
    injuryCheck: 'No trauma detected · Observing',
    lastScanned: 'Awaiting Consultation',
  })

  // Clinical Prescription State
  const [consultDiagnosis, setConsultDiagnosis] = useState('')
  const [prescribedMedicines, setPrescribedMedicines] = useState([])
  const [recoveryAdviceList, setRecoveryAdviceList] = useState([])
  const [whenToVisitWarning, setWhenToVisitWarning] = useState('')

  // In-Call Chat Messages
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')

  const patientVideoRef = useRef(null)
  const speechRecognitionRef = useRef(null)
  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null)

  const langKey = language || 'en'
  const speechCode = LANGUAGE_SPEECH_CODES[langKey] || 'en-IN'

  // Natural Doctor Text-To-Speech Synthesis with Persona Settings & Interruptibility
  const speakDoctorVoice = useCallback((textToSpeak) => {
    if (!synthRef.current) return
    try {
      synthRef.current.cancel()
      const utterance = new SpeechSynthesisUtterance(textToSpeak)
      utterance.lang = speechCode

      // Set voice cadence & pitch based on doctor persona
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

      // Voice matching helper
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
  }, [speechCode, langKey, doctorVoicePersona])

  // Start initial greeting when call connects
  useEffect(() => {
    if (!videoCallModalOpen) {
      if (synthRef.current) synthRef.current.cancel()
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

  // Flip Camera between Front (user) and Rear (environment)
  const handleToggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))
  }

  // Capture current webcam frame for Gemini Multimodal AI vision analysis
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

  // Patient Voice Dictation Handler with IMMEDIATE DOCTOR SPEECH CUTOFF / INTERRUPTION
  const startPatientSpeaking = () => {
    // 1. Immediately silence and stop doctor speech when user starts talking!
    if (synthRef.current) {
      synthRef.current.cancel()
    }
    setIsDoctorSpeaking(false)

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type in the chat box.')
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

  // Auto-Save Assessment Report to SQLite Database & History Vault
  const autoSavePrescriptionRecord = (diagnosis, medicines, advice, warning, facialData, patientText) => {
    const patient = activeVideoSession?.patient || {}
    const medSummary = medicines.map(
      (m) => `${m.name} (${m.dosage} • ${m.exactTime || m.schedule || m.timing})`
    )

    saveAssessmentReport({
      id: `RX-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      name: patient.name || 'Citizen (Patient)',
      age: patient.age || 34,
      gender: patient.gender || 'Male',
      symptoms: patientText || 'Teleconsultation clinical diagnosis completed',
      urgency: 'Moderate',
      is_prescription: true,
      diagnosis: diagnosis || 'Clinical Teleconsultation',
      doctor_name: `${DOCTOR_PROFILE.name} (${DOCTOR_PROFILE.qualifications})`,
      hospital_name: DOCTOR_PROFILE.facility,
      advice: advice.join(' | '),
      prescribed_medicines: medSummary,
      medicines_list: medicines,
      doctor_notes: `Facial Signs: ${facialData?.visualSigns || 'Normal'}. Pain Score: ${facialData?.painScore || 0}%. Injuries: ${facialData?.injuryCheck || 'None'}.`,
    })

    setSavedToHistoryNotice(true)
  }

  // Submit Patient Speech to Gemini AI with Video Frame Snapshot
  const handleSendProblem = async (textToSend = null) => {
    const text = (textToSend || patientSpokenText || chatInput).trim()
    if (!text) return

    // Immediately stop any lingering doctor speech
    if (synthRef.current) {
      synthRef.current.cancel()
    }
    setIsDoctorSpeaking(false)

    // Capture visual frame snapshot from video element
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

      // Auto-save to History panel & SQLite database if medicines or diagnosis were generated
      if (response.diagnosis || response.medicines?.length > 0) {
        autoSavePrescriptionRecord(
          response.diagnosis,
          response.medicines || [],
          response.recoveryAdvice || [],
          response.whenToVisitHospital || '',
          response.facialAnalysis,
          text
        )
      }

      // Doctor speaks the response aloud in chosen language and voice persona!
      speakDoctorVoice(response.doctorReplySpeech)
    } catch (err) {
      setIsEvaluating(false)
      console.warn('Consultation generation failed:', err)
    }
  }

  // Handle End Call with auto-save & direct navigation to History Vault
  const handleEndCallWithHistorySync = () => {
    if (synthRef.current) synthRef.current.cancel()
    if (consultDiagnosis || prescribedMedicines.length > 0) {
      autoSavePrescriptionRecord(
        consultDiagnosis,
        prescribedMedicines,
        recoveryAdviceList,
        whenToVisitWarning,
        facialAnalysisData,
        'Teleconsultation call ended'
      )
    }
    endVideoCall()
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
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-1.5 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-5xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] sm:max-h-[88vh] flex flex-col my-auto"
          role="dialog"
          aria-modal="true"
        >
          {/* Top Medical Header Bar */}
          <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white px-3 sm:px-5 py-2 sm:py-3 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-white/20 border border-white/25 flex items-center justify-center shrink-0">
                <Video className="w-4 h-4 text-white animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[8.5px] sm:text-[9.5px] font-bold uppercase tracking-wider bg-white/20 text-white px-2 py-0.2 rounded-full border border-white/25 flex items-center gap-1 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Teleconsult OPD
                  </span>
                  <span className="text-[11px] font-mono text-emerald-300 font-bold">
                    {formatTimer(secondsElapsed)}
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                  {doctor.name} ↔ {patient.name}
                </h3>
              </div>
            </div>

            {/* Top Right Voice & End Call Controls */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Doctor Voice Persona Switcher */}
              <div className="hidden sm:flex items-center gap-1 bg-white/15 px-2 py-1 rounded-xl text-[10px] border border-white/20">
                <span className="text-blue-100 font-bold">Voice:</span>
                <button
                  type="button"
                  onClick={() => setDoctorVoicePersona('male')}
                  className={`px-1.5 py-0.5 rounded font-bold transition-all ${
                    doctorVoicePersona === 'male' ? 'bg-white text-blue-900 shadow-xs' : 'text-white/80'
                  }`}
                >
                  👨‍⚕️ Male
                </button>
                <button
                  type="button"
                  onClick={() => setDoctorVoicePersona('female')}
                  className={`px-1.5 py-0.5 rounded font-bold transition-all ${
                    doctorVoicePersona === 'female' ? 'bg-white text-blue-900 shadow-xs' : 'text-white/80'
                  }`}
                >
                  👩‍⚕️ Female
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSosOpen(true)}
                className="tap-press inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold shadow-xs transition-all"
                title="Dispatch 108 Ambulance"
              >
                <Siren className="w-3.5 h-3.5 animate-pulse" />
                <span className="hidden sm:inline">108 SOS</span>
              </button>

              <button
                type="button"
                onClick={handleEndCallWithHistorySync}
                className="tap-press inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-[11px] font-bold shadow-xs transition-all"
              >
                <PhoneOff className="w-3.5 h-3.5 text-red-400" />
                <span>End Call</span>
              </button>
            </div>
          </div>

          {/* MAIN 2-BLOCK MOBILE STACKED BODY (OVERFLOW SCROLLABLE) */}
          <div className="flex-1 overflow-y-auto min-h-0 divide-y lg:divide-y-0 lg:grid lg:grid-cols-12 bg-slate-100/70">
            {/* ============================================================ */}
            {/* BLOCK 1: VIDEO CALL STREAM & LIVE MIC CONTROLS (TOP BLOCK) */}
            {/* ============================================================ */}
            <div className="lg:col-span-6 p-2.5 sm:p-4 flex flex-col justify-between space-y-3 bg-white">
              {/* Doctor Main Video Display Card */}
              <div className="w-full rounded-2xl bg-gradient-to-b from-blue-50 via-white to-slate-50 border border-slate-200 flex flex-col items-center justify-center relative overflow-hidden shadow-xs min-h-[220px] sm:min-h-[260px] p-3">
                {/* Doctor Avatar & Speaking State */}
                <div className="flex flex-col items-center text-center space-y-1.5 relative z-10">
                  <div className="relative">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-100 border-2 border-blue-300 flex items-center justify-center text-3xl sm:text-4xl shadow-sm">
                      {doctorVoicePersona === 'female' ? '👩‍⚕️' : '👨‍⚕️'}
                    </div>
                    {isDoctorSpeaking && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-600 text-white text-[9px] font-bold items-center justify-center shadow-xs">
                          🔊
                        </span>
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-display">
                      {doctor.name}
                    </h4>
                    <p className="text-[10px] text-blue-700 font-bold">
                      {doctor.title} · {doctor.facility}
                    </p>
                  </div>

                  {/* Doctor Voice Bubble in Light Medical Theme */}
                  <div className="bg-white border border-blue-200 rounded-xl p-2 max-w-xs text-left text-xs shadow-2xs space-y-1">
                    <div className="flex items-center justify-between gap-1 border-b border-slate-100 pb-0.5">
                      <span className="text-[9px] font-bold text-blue-700 uppercase flex items-center gap-1">
                        <Volume2 className={`w-3 h-3 ${isDoctorSpeaking ? 'animate-pulse text-emerald-600' : 'text-blue-600'}`} />
                        Doctor Spoken Advice ({language.toUpperCase()})
                      </span>
                      <button
                        type="button"
                        onClick={() => speakDoctorVoice(doctorSpeechText)}
                        className="tap-press text-[9.5px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-0.5"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        Replay
                      </button>
                    </div>
                    <p className="text-slate-800 text-[10.5px] leading-relaxed">
                      "{doctorSpeechText}"
                    </p>
                  </div>
                </div>

                {/* Patient Live Video PIP (Natural Mirrored Orientation + AI Vision Scan Overlay) */}
                <div className="absolute bottom-2 right-2 w-28 sm:w-36 h-20 sm:h-26 rounded-xl bg-slate-900 border-2 border-blue-500 overflow-hidden shadow-xl z-20 flex items-center justify-center">
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

                      {/* AI Face & Injury Scanning Bounding Box Overlay */}
                      {aiScanningActive && (
                        <div className="absolute inset-1 border border-emerald-400/80 rounded-lg pointer-events-none flex flex-col justify-between p-0.5">
                          <div className="flex items-center justify-between text-[7px] font-bold font-mono text-emerald-400 bg-black/60 px-1 rounded">
                            <span className="flex items-center gap-0.5">
                              <Scan className="w-2 h-2 animate-spin" />
                              AI Vision
                            </span>
                            <span>{facialAnalysisData.painScore}% Pain</span>
                          </div>
                          <span className="text-[6.5px] font-mono text-emerald-300 bg-black/60 px-0.5 rounded truncate">
                            {facialAnalysisData.emotion}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-1 text-center text-white">
                      <User className="w-4 h-4 text-slate-400 mb-0.5" />
                      <span className="text-[8px] font-bold truncate">{patient.name}</span>
                    </div>
                  )}

                  {/* Camera Flip & Mirror Controls */}
                  <div className="absolute top-1 right-1 flex items-center gap-1 z-30">
                    <button
                      type="button"
                      onClick={handleToggleCameraFacing}
                      className="tap-press bg-black/75 hover:bg-black text-white p-0.5 rounded text-[8px] transition-all"
                      title="Switch Camera"
                    >
                      <SwitchCamera className="w-2.5 h-2.5 text-emerald-300" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsMirrored((m) => !m)}
                      className="tap-press bg-black/75 hover:bg-black text-white px-1 py-0.2 rounded text-[7.5px] font-bold transition-all"
                    >
                      {isMirrored ? '🪞' : '📷'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Patient Live Mic Bar & Voice Input (Interrupts Doctor Voice Instantly!) */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5 space-y-2">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-bold text-slate-700 flex items-center gap-1">
                    <Mic className={`w-3 h-3 ${isPatientListening ? 'text-red-500 animate-ping' : 'text-blue-600'}`} />
                    <span>Speak to Doctor (In Native Language):</span>
                  </span>
                  <span className="text-[9.5px] text-slate-400 font-mono">
                    {isPatientListening ? 'Listening...' : 'Tap Mic'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={isPatientListening ? stopPatientSpeaking : startPatientSpeaking}
                    className={`tap-press flex-1 min-h-[42px] px-3 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all ${
                      isPatientListening
                        ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                    <span>{isPatientListening ? '⏹️ Stop & Formulate Reply' : '🎙️ Tap to Speak Your Problem'}</span>
                  </button>

                  {(patientSpokenText || chatInput) && (
                    <button
                      type="button"
                      disabled={isEvaluating}
                      onClick={() => handleSendProblem()}
                      className="tap-press min-h-[42px] px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm shrink-0"
                    >
                      {isEvaluating ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <span>Consult</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  )}
                </div>

                {patientSpokenText && (
                  <p className="text-[11px] text-slate-800 bg-white p-2 rounded-xl border border-blue-200">
                    🗣️ "{patientSpokenText}"
                  </p>
                )}
              </div>
            </div>

            {/* ============================================================ */}
            {/* BLOCK 2: DIGITAL PRESCRIPTION & TABLETS (DIRECTLY UNDER VIDEO) */}
            {/* ============================================================ */}
            <div className="lg:col-span-6 p-2.5 sm:p-4 space-y-3 bg-slate-50/50">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    Live Doctor Digital Prescription (Rx)
                  </h3>
                </div>

                {savedToHistoryNotice && (
                  <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Auto-Saved to History!
                  </span>
                )}
              </div>

              {!consultDiagnosis || prescribedMedicines.length === 0 ? (
                <div className="text-center p-6 space-y-2 bg-white rounded-2xl border border-slate-200">
                  <Pill className="w-8 h-8 text-emerald-600 mx-auto opacity-70" />
                  <h4 className="font-bold text-slate-800 text-xs sm:text-sm">Awaiting Consultation</h4>
                  <p className="text-[10.5px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                    Tap the blue microphone button above to speak your symptoms. The doctor will formulate your verified prescription and exact tablet schedule here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Diagnosis & Urgency Card */}
                  <div className="bg-white border border-emerald-200 rounded-2xl p-3 shadow-2xs space-y-1">
                    <span className="text-[9.5px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200 inline-block">
                      Verified Clinical Diagnosis
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      {consultDiagnosis}
                    </h4>
                  </div>

                  {/* Categorized Medicines Timings List */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-800 block">
                      💊 Prescribed Tablets & Exact Daily Timings:
                    </span>

                    <div className="space-y-1.5">
                      {prescribedMedicines.map((med, index) => (
                        <div
                          key={index}
                          className="bg-white border border-slate-200 rounded-2xl p-2.5 text-xs space-y-1.5 shadow-2xs"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div>
                              <strong className="text-slate-900 font-bold text-xs block">{med.name}</strong>
                              <span className="text-[10px] text-blue-700 font-medium">{med.purpose}</span>
                            </div>
                            <span className="text-[9.5px] font-mono bg-emerald-100 text-emerald-800 font-bold px-2 py-0.2 rounded-full border border-emerald-200 shrink-0">
                              {med.duration}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-1 text-[10px]">
                            <div className="p-1.5 rounded-lg bg-amber-50/60 border border-amber-200">
                              <span className="text-amber-900 block font-bold">🕒 Scheduled Time:</span>
                              <strong className="text-slate-900">{med.exactTime || '08:00 AM • 08:30 PM'}</strong>
                            </div>

                            <div className="p-1.5 rounded-lg bg-blue-50/60 border border-blue-200">
                              <span className="text-blue-900 block font-bold">🍽️ Food Timing:</span>
                              <strong className="text-blue-950">{med.timing || med.foodInstruction || 'After Food'}</strong>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recovery Guidelines */}
                  {recoveryAdviceList.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-2.5 text-xs space-y-1">
                      <span className="text-[10px] font-bold text-blue-950 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        Home Recovery Steps:
                      </span>
                      <ul className="list-disc pl-4 space-y-0.5 text-[10.5px] text-slate-700">
                        {recoveryAdviceList.map((adv, idx) => (
                          <li key={idx}>{adv}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Red-Flag Hospital Warning */}
                  {whenToVisitWarning && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-2 text-[10.5px] text-red-900 flex items-start gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                      <span>{whenToVisitWarning}</span>
                    </div>
                  )}

                  {/* Direct Link to History Panel */}
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        endVideoCall()
                        go('history')
                      }}
                      className="tap-press flex-1 min-h-[38px] px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View in History & Pill Tracker Vault →</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
