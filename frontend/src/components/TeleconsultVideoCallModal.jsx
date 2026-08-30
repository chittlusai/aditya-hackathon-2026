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

  // Mobile Tabs: 'video' | 'prescription' | 'vision' | 'chat'
  const [activeTab, setActiveTab] = useState('video')

  // Interactive AI Doctor Voice State
  const [isDoctorSpeaking, setIsDoctorSpeaking] = useState(false)
  const [doctorSpeechText, setDoctorSpeechText] = useState('')
  const [isPatientListening, setIsPatientListening] = useState(false)
  const [patientSpokenText, setPatientSpokenText] = useState('')
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [savedToHistoryNotice, setSavedToHistoryNotice] = useState(false)

  // Live AI Facial Emotion & Injury Scanner State (Unbiased initial state)
  const [aiScanningActive, setAiScanningActive] = useState(true)
  const [facialAnalysisData, setFacialAnalysisData] = useState({
    emotion: 'Ready / Observing Face',
    painScore: 0,
    visualSigns: 'Camera live stream active for clinical inspection',
    injuryCheck: 'No trauma detected · Ready to scan',
    lastScanned: 'Awaiting Consultation',
  })

  // Clinical Prescription State (Clean initial state, generated ONLY after user speaks)
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

  // Natural Doctor Text-To-Speech Synthesis
  const speakDoctorVoice = useCallback((textToSpeak) => {
    if (!synthRef.current) return
    try {
      synthRef.current.cancel()
      const utterance = new SpeechSynthesisUtterance(textToSpeak)
      utterance.lang = speechCode
      utterance.rate = 0.92 // Natural doctor cadence
      utterance.pitch = 0.98

      // Select natural voice
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
  }, [speechCode, langKey])

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

  // Camera & Mic stream with flip support (user vs environment)
  useEffect(() => {
    if (!videoCallModalOpen) {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop())
        setCameraStream(null)
      }
      setSecondsElapsed(0)
      return
    }

    let stream = null
    const startCam = async () => {
      try {
        if (cameraStream) {
          cameraStream.getTracks().forEach((track) => track.stop())
        }
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: facingMode },
            audio: true,
          })
          setCameraStream(stream)
          if (patientVideoRef.current) {
            patientVideoRef.current.srcObject = stream
          }
        }
      } catch (err) {
        console.warn('Webcam error:', err)
        setCameraError(true)
      }
    }
    startCam()

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

  // Patient Voice Dictation Handler
  const startPatientSpeaking = () => {
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

  // Submit Patient Speech to Gemini AI with Video Frame Snapshot
  const handleSendProblem = async (textToSend = null) => {
    const text = (textToSend || patientSpokenText || chatInput).trim()
    if (!text) return

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

      // Doctor speaks the response aloud in chosen language!
      speakDoctorVoice(response.doctorReplySpeech)
    } catch (err) {
      setIsEvaluating(false)
      console.warn('Consultation generation failed:', err)
    }
  }

  // Save Prescription to SQLite Database & Dedicated Prescriptions Vault
  const handleSaveToPrescriptionsVault = () => {
    if (!consultDiagnosis || prescribedMedicines.length === 0) return

    const patient = activeVideoSession?.patient || {}
    const medSummary = prescribedMedicines.map(
      (m) => `${m.name} (${m.dosage} • ${m.schedule || m.frequency})`
    )

    saveAssessmentReport({
      id: `RX-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      name: patient.name || 'Citizen (Patient)',
      age: patient.age || 34,
      gender: patient.gender || 'Male',
      symptoms: patientSpokenText || 'Teleconsultation clinical diagnosis completed',
      urgency: 'Moderate',
      is_prescription: true,
      diagnosis: consultDiagnosis,
      doctor_name: `${DOCTOR_PROFILE.name} (${DOCTOR_PROFILE.qualifications})`,
      hospital_name: DOCTOR_PROFILE.facility,
      advice: recoveryAdviceList.join(' | '),
      prescribed_medicines: medSummary,
      medicines_list: prescribedMedicines,
      doctor_notes: `Facial Signs: ${facialAnalysisData.visualSigns}. Pain Score: ${facialAnalysisData.painScore}%. Injuries: ${facialAnalysisData.injuryCheck}.`,
    })

    setSavedToHistoryNotice(true)
    setTimeout(() => setSavedToHistoryNotice(false), 3500)
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-5xl bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[96vh] flex flex-col"
          role="dialog"
          aria-modal="true"
        >
          {/* 1. Light Medical Header Bar */}
          <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 text-white px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/20 border border-white/25 flex items-center justify-center shrink-0">
                <Video className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-2 py-0.2 rounded-full border border-white/25 flex items-center gap-1 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Live Clinical Teleconsultation
                  </span>
                  <span className="text-[11px] font-mono text-emerald-300 font-bold">
                    {formatTimer(secondsElapsed)}
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-white truncate mt-0.5">
                  {doctor.name} ({doctor.qualifications}) ↔ {patient.name}
                </h3>
              </div>
            </div>

            {/* Top Header Actions (108 SOS & End Call) */}
            <div className="flex items-center gap-1.5 shrink-0">
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
                onClick={endVideoCall}
                className="tap-press px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-950 text-white font-bold text-xs flex items-center gap-1 transition-all"
              >
                <PhoneOff className="w-3.5 h-3.5 text-red-400" />
                <span>End</span>
              </button>
            </div>
          </div>

          {/* 2. Main Content Grid (Left: Light Video feeds, Right: Rx Vault & Clinical Vision) */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-[380px] sm:min-h-[460px]">
            {/* Left 7 Cols: Video Stream Area (Light Medical Theme) */}
            <div className="lg:col-span-7 bg-slate-100/90 relative flex flex-col justify-between p-2.5 sm:p-4 overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-200">
              {/* Doctor Main Video Stream Card */}
              <div className="w-full h-full rounded-2xl bg-gradient-to-b from-blue-50 via-white to-slate-50 border border-slate-200/90 flex flex-col items-center justify-center relative overflow-hidden shadow-xs min-h-[240px] sm:min-h-[320px]">
                {/* Doctor Avatar / Presence */}
                <div className="flex flex-col items-center text-center p-4 space-y-2 relative z-10">
                  <div className="relative">
                    <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-3xl bg-blue-100 border-2 border-blue-300 flex items-center justify-center text-4xl sm:text-5xl shadow-sm">
                      👨‍⚕️
                    </div>
                    {isDoctorSpeaking && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-5 w-5 bg-emerald-600 text-white text-[10px] font-bold items-center justify-center shadow-xs">
                          🔊
                        </span>
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm sm:text-lg font-bold text-slate-900 font-display">
                      {doctor.name}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-blue-700 font-bold">
                      {doctor.title} · {doctor.qualifications}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {doctor.facility} • Reg: {doctor.regNo}
                    </p>
                  </div>

                  {/* Doctor Voice Bubble in Light Theme */}
                  <div className="bg-white border border-blue-200 rounded-2xl p-2.5 max-w-sm text-left text-xs shadow-xs space-y-1">
                    <div className="flex items-center justify-between gap-1 border-b border-slate-100 pb-1">
                      <span className="text-[10px] font-bold text-blue-700 uppercase flex items-center gap-1">
                        <Volume2 className={`w-3 h-3 ${isDoctorSpeaking ? 'animate-pulse text-emerald-600' : 'text-blue-600'}`} />
                        Doctor Spoken Advice ({language.toUpperCase()})
                      </span>
                      <button
                        type="button"
                        onClick={() => speakDoctorVoice(doctorSpeechText)}
                        className="tap-press text-[10px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-0.5"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        Replay
                      </button>
                    </div>
                    <p className="text-slate-800 text-[11px] leading-relaxed">
                      "{doctorSpeechText}"
                    </p>
                  </div>
                </div>

                {/* Patient Video (Natural True-to-Life Orientation + AI Vision Scan Overlay) */}
                <div className="absolute bottom-3 right-3 w-32 sm:w-44 h-24 sm:h-32 rounded-2xl bg-slate-900 border-2 border-blue-500 overflow-hidden shadow-xl z-20 flex items-center justify-center">
                  {videoActive && !cameraError ? (
                    <div className="relative w-full h-full">
                      <video
                        ref={patientVideoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{
                          transform: isMirrored ? 'scaleX(-1)' : 'none', // Natural orientation by default
                        }}
                        className="w-full h-full object-cover"
                      />

                      {/* AI Face & Injury Scanning Bounding Box Overlay */}
                      {aiScanningActive && (
                        <div className="absolute inset-2 border border-emerald-400/80 rounded-xl pointer-events-none flex flex-col justify-between p-1">
                          <div className="flex items-center justify-between text-[8px] font-bold font-mono text-emerald-400 bg-black/60 px-1 rounded">
                            <span className="flex items-center gap-0.5">
                              <Scan className="w-2.5 h-2.5 animate-spin" />
                              AI Vision
                            </span>
                            <span>{facialAnalysisData.painScore}% Pain</span>
                          </div>
                          <div className="w-full h-[1px] bg-emerald-400/80 shadow-[0_0_8px_#34d399] animate-pulse" />
                          <span className="text-[7.5px] font-mono text-emerald-300 bg-black/60 px-1 rounded truncate">
                            {facialAnalysisData.emotion}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-2 text-center text-white">
                      <User className="w-5 h-5 text-slate-400 mb-1" />
                      <span className="text-[9px] font-bold">{patient.name}</span>
                    </div>
                  )}

                  {/* Top-Right Camera Controls Overlay */}
                  <div className="absolute top-1 right-1 flex items-center gap-1 z-30">
                    {/* Camera Switcher (Front ↔ Back) */}
                    <button
                      type="button"
                      onClick={handleToggleCameraFacing}
                      className="tap-press bg-black/75 hover:bg-black text-white p-1 rounded-lg text-[9px] transition-all shadow-xs"
                      title="Switch Front / Rear Camera"
                    >
                      <SwitchCamera className="w-3 h-3 text-emerald-300" />
                    </button>

                    {/* Mirror / Natural Toggle */}
                    <button
                      type="button"
                      onClick={() => setIsMirrored((m) => !m)}
                      className="tap-press bg-black/75 hover:bg-black text-white px-1 py-0.5 rounded text-[8px] font-bold transition-all"
                      title="Toggle Mirror orientation"
                    >
                      {isMirrored ? 'Mirrored' : 'Natural'}
                    </button>
                  </div>

                  <span className="absolute bottom-1 left-1.5 text-[8px] font-bold text-white bg-black/70 px-1 py-0.2 rounded font-mono">
                    You
                  </span>
                </div>
              </div>

              {/* Patient Voice Dictation & Video Controls Strip */}
              <div className="pt-2 flex items-center justify-between gap-2">
                {/* Primary Voice Button for Patient */}
                <button
                  type="button"
                  onClick={isPatientListening ? stopPatientSpeaking : startPatientSpeaking}
                  className={`tap-press flex-1 py-2.5 px-3 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
                    isPatientListening
                      ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  <span>
                    {isPatientListening
                      ? 'Listening… Tap to Send'
                      : `🎤 Speak Symptoms to Doctor (${language.toUpperCase()})`}
                  </span>
                </button>

                {/* Control Toggles */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setVideoActive((v) => !v)}
                    className={`tap-press p-2.5 rounded-xl border transition-all ${
                      videoActive
                        ? 'bg-white text-slate-700 border-slate-300 shadow-2xs hover:bg-slate-50'
                        : 'bg-red-600 text-white border-red-600'
                    }`}
                    title={videoActive ? 'Turn Off Camera' : 'Turn On Camera'}
                  >
                    {videoActive ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setMicActive((m) => !m)}
                    className={`tap-press p-2.5 rounded-xl border transition-all ${
                      micActive
                        ? 'bg-white text-slate-700 border-slate-300 shadow-2xs hover:bg-slate-50'
                        : 'bg-red-600 text-white border-red-600'
                    }`}
                    title={micActive ? 'Mute Mic' : 'Unmute Mic'}
                  >
                    {micActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Patient Live Spoken Text Bubble */}
              {patientSpokenText && (
                <div className="mt-2 p-2.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 text-xs flex items-center justify-between gap-2 shadow-2xs">
                  <div className="truncate flex-1">
                    <strong className="text-blue-900 font-bold">You said:</strong> "{patientSpokenText}"
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSendProblem(patientSpokenText)}
                    disabled={isEvaluating}
                    className="tap-press px-3 py-1 rounded-xl bg-blue-600 text-white text-xs font-bold shrink-0 flex items-center gap-1 shadow-xs"
                  >
                    {isEvaluating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Analyze with Doctor</span>
                  </button>
                </div>
              )}
            </div>

            {/* Right 5 Cols: Prescriptions Vault, AI Vision Radar & Chat */}
            <div className="lg:col-span-5 bg-white flex flex-col overflow-hidden">
              {/* Tab Switcher */}
              <div className="p-2 bg-slate-50 border-b border-slate-200 grid grid-cols-3 gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('prescription')}
                  className={`tap-press py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === 'prescription'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
                  }`}
                >
                  <Pill className="w-3.5 h-3.5" />
                  <span>Rx Tablets</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('vision')}
                  className={`tap-press py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === 'vision'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
                  }`}
                >
                  <Scan className="w-3.5 h-3.5" />
                  <span>AI Vision</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('chat')}
                  className={`tap-press py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === 'chat'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Consult Chat</span>
                </button>
              </div>

              {/* Tab 1: Prescriptions & Tablets Vault */}
              {activeTab === 'prescription' && (
                <div className="p-3.5 sm:p-4 overflow-y-auto flex-1 space-y-3">
                  {!consultDiagnosis || prescribedMedicines.length === 0 ? (
                    <div className="text-center p-6 space-y-2 bg-slate-50 rounded-2xl border border-slate-200 my-auto">
                      <Pill className="w-8 h-8 text-emerald-600 mx-auto opacity-70" />
                      <h4 className="font-bold text-slate-800 text-xs sm:text-sm">Awaiting Symptom Consultation</h4>
                      <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                        Tap the microphone below to speak your symptoms or injuries. Gemini AI will analyze your live face and voice to formulate your verified prescription and recovery tablets.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                            Digital Prescription (Rx)
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 mt-1">
                            {consultDiagnosis}
                          </h4>
                        </div>

                        <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-bold">
                          {doctor.name}
                        </span>
                      </div>

                      {/* Categorized Medicines & Tablets List */}
                      <div className="space-y-2.5">
                        <span className="text-[11px] font-bold text-slate-800 flex items-center justify-between">
                          <span>💊 Prescribed Medicines & Exact Timings:</span>
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-mono">
                            {prescribedMedicines.length} Medicine(s) Scheduled
                          </span>
                        </span>

                        {prescribedMedicines.map((med, index) => (
                          <div
                            key={index}
                            className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3 text-xs space-y-2 shadow-2xs"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <strong className="text-slate-900 font-bold text-xs block">{med.name}</strong>
                                <span className="text-[10.5px] text-blue-700 font-medium">{med.purpose}</span>
                              </div>
                              <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                                {med.duration}
                              </span>
                            </div>

                            {/* Categorized Timing Chips */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                              <div className="p-2 rounded-xl bg-white border border-slate-200/80 text-[10.5px] space-y-0.5">
                                <span className="text-slate-500 block text-[9.5px] font-bold uppercase">🕒 Scheduled Timing:</span>
                                <strong className="text-slate-900 font-bold">{med.exactTime || '08:00 AM • 08:30 PM'}</strong>
                              </div>

                              <div className="p-2 rounded-xl bg-blue-50/70 border border-blue-200/80 text-[10.5px] space-y-0.5">
                                <span className="text-blue-600 block text-[9.5px] font-bold uppercase">🍽️ Food Instruction:</span>
                                <strong className="text-blue-950 font-bold">{med.timing || med.foodInstruction || 'After Food'}</strong>
                              </div>
                            </div>

                            {/* Dosage & Daily Frequency */}
                            <div className="text-[10.5px] text-slate-600 bg-slate-100/70 px-2.5 py-1 rounded-xl flex items-center justify-between">
                              <span>Dosage: <strong className="text-slate-800">{med.dosage}</strong></span>
                              <span className="font-mono text-slate-500">{med.frequency || 'Daily'}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Recovery Guidelines */}
                      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 text-xs space-y-1">
                        <span className="text-[11px] font-bold text-blue-950 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          Home Recovery & Care Steps:
                        </span>
                        <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-700">
                          {recoveryAdviceList.map((adv, idx) => (
                            <li key={idx}>{adv}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Hospital Red Flag Warning */}
                      {whenToVisitWarning && (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-2.5 text-[11px] text-red-900 flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                          <span>{whenToVisitWarning}</span>
                        </div>
                      )}

                      {savedToHistoryNotice && (
                        <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-1.5 shadow-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Prescription saved to your dedicated Medical History Vault!</span>
                        </div>
                      )}

                      {/* Save to History & Print Slip Buttons */}
                      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
                        <button
                          type="button"
                          onClick={handleSaveToPrescriptionsVault}
                          className="tap-press flex-1 py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Save to Prescriptions Vault</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setActiveSlip({
                              name: patient.name,
                              age: patient.age,
                              gender: patient.gender,
                              symptoms: consultDiagnosis,
                              urgency: 'Moderate',
                              advice: recoveryAdviceList.join(' | '),
                              vitals: patient.vitals,
                              hospital: { name: doctor.facility, distance_km: 3.2 },
                              date: new Date().toLocaleDateString('en-IN'),
                              refId: `RX-${Date.now().toString().slice(-6)}`,
                            })
                          }
                          className="tap-press py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print Slip</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Tab 2: AI Facial Emotion & Injury Scanner */}
              {activeTab === 'vision' && (
                <div className="p-3.5 sm:p-4 space-y-3 text-xs overflow-y-auto flex-1">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 flex items-center gap-1">
                      <Scan className="w-3 h-3 text-purple-600" />
                      Gemini Multimodal AI Vision Radar
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                      ● Active
                    </span>
                  </div>

                  {/* Emotion & Pain Score Cards */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                        <Smile className="w-3.5 h-3.5 text-blue-600" />
                        Emotion Detected:
                      </span>
                      <strong className="text-slate-900 text-xs block">{facialAnalysisData.emotion}</strong>
                    </div>

                    <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                      <span className="text-[10px] font-bold text-amber-800 flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-amber-600" />
                        Pain Distress Score:
                      </span>
                      <strong className="text-amber-950 text-xs block">{facialAnalysisData.painScore}% Index</strong>
                    </div>
                  </div>

                  {/* Visual Signs Check */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                      Facial Signs & Pallor Check:
                    </span>
                    <p className="text-slate-800 text-[11px] leading-relaxed">
                      {facialAnalysisData.visualSigns}
                    </p>
                  </div>

                  {/* Physical Injury Check */}
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                    <span className="text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Injury & Trauma Vision Check:
                    </span>
                    <p className="text-emerald-950 text-[11px] font-semibold">
                      {facialAnalysisData.injuryCheck}
                    </p>
                  </div>

                  {/* Manual AI Scan Refresh Button */}
                  <button
                    type="button"
                    onClick={() => handleSendProblem('Doctor, please analyze my facial expressions and check my condition for any injuries or pain.')}
                    className="tap-press w-full py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <Scan className="w-3.5 h-3.5" />
                    <span>Scan Face & Check Injuries with Gemini AI</span>
                  </button>
                </div>
              )}

              {/* Tab 3: Consultation Chat Log */}
              {activeTab === 'chat' && (
                <div className="flex-1 flex flex-col p-3 overflow-hidden">
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {chatMessages.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex flex-col text-xs max-w-[85%] rounded-2xl p-2.5 shadow-2xs ${
                          msg.sender === 'doctor'
                            ? 'bg-slate-100 text-slate-900 self-start border border-slate-200'
                            : 'bg-blue-600 text-white self-end'
                        }`}
                      >
                        <span className="text-[9px] opacity-75 mb-0.5 font-bold">
                          {msg.sender === 'doctor' ? doctor.name : 'You (Patient)'} • {msg.time}
                        </span>
                        <p className="leading-relaxed">{msg.text}</p>
                      </div>
                    ))}
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleSendProblem(chatInput)
                    }}
                    className="pt-2 flex items-center gap-1.5 border-t border-slate-100"
                  >
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={`Type message in ${language.toUpperCase()}...`}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 transition-all"
                    />
                    <button
                      type="submit"
                      className="tap-press p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
