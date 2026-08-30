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
} from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import {
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
    language,
    t,
  } = useApp()

  // Video & Audio States
  const [micActive, setMicActive] = useState(true)
  const [videoActive, setVideoActive] = useState(true)
  const [isMirrored, setIsMirrored] = useState(false) // Default UNMIRRORED as requested
  const [cameraStream, setCameraStream] = useState(null)
  const [cameraError, setCameraError] = useState(false)
  const [secondsElapsed, setSecondsElapsed] = useState(0)

  // Mobile Tabs: 'video' | 'prescription' | 'chat' | 'vitals'
  const [activeTab, setActiveTab] = useState('video')

  // Interactive Voice & Speech State
  const [isDoctorSpeaking, setIsDoctorSpeaking] = useState(false)
  const [doctorSpeechText, setDoctorSpeechText] = useState('')
  const [isPatientListening, setIsPatientListening] = useState(false)
  const [patientSpokenText, setPatientSpokenText] = useState('')
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [savedToHistoryNotice, setSavedToHistoryNotice] = useState(false)

  // Clinical Prescription State
  const [consultDiagnosis, setConsultDiagnosis] = useState('Acute Viral Febrile Illness')
  const [prescribedMedicines, setPrescribedMedicines] = useState([
    {
      name: 'Paracetamol 650mg Tablet',
      dosage: '1 Tablet',
      frequency: '3 Times a day (After food)',
      duration: '3 to 5 Days',
      purpose: 'Fever & body ache relief',
    },
    {
      name: 'ORS (Oral Rehydration Solution)',
      dosage: '1 Sachet in 1 Litre boiled & cooled water',
      frequency: 'Drink throughout the day',
      duration: 'Until hydration normalizes',
      purpose: 'Prevents dehydration & weakness',
    },
    {
      name: 'Cetirizine 10mg Tablet',
      dosage: '1 Tablet',
      frequency: 'Once daily at night',
      duration: '3 Days',
      purpose: 'Relieves runny nose and throat irritation',
    },
  ])
  const [recoveryAdviceList, setRecoveryAdviceList] = useState([
    'Drink plenty of boiled warm water and ORS solution.',
    'Eat light, warm home-cooked meals (khichdi, porridge, warm soup).',
    'Get complete bed rest for 3 days and monitor body temperature.',
  ])
  const [whenToVisitWarning, setWhenToVisitWarning] = useState(
    'If fever stays above 102°F or if you experience chest pain / shortness of breath, visit PHC immediately.'
  )

  // In-Call Chat Messages
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')

  const patientVideoRef = useRef(null)
  const speechRecognitionRef = useRef(null)
  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null)

  const langKey = language || 'en'
  const speechCode = LANGUAGE_SPEECH_CODES[langKey] || 'en-IN'

  // Text-To-Speech Speaker Helper
  const speakDoctorVoice = useCallback((textToSpeak) => {
    if (!synthRef.current) return
    try {
      synthRef.current.cancel()
      const utterance = new SpeechSynthesisUtterance(textToSpeak)
      utterance.lang = speechCode
      utterance.rate = 0.95
      utterance.pitch = 1.0

      // Try to find native voice
      const voices = synthRef.current.getVoices()
      const matchingVoice = voices.find(
        (v) => v.lang.toLowerCase().includes(speechCode.toLowerCase()) || v.lang.startsWith(langKey)
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

  // Camera & Mic stream
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
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user' },
            audio: true,
          })
          setCameraStream(stream)
          if (patientVideoRef.current) {
            patientVideoRef.current.srcObject = stream
          }
        }
      } catch (err) {
        console.warn('Webcam not granted or unavailable:', err)
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
  }, [videoCallModalOpen])

  useEffect(() => {
    if (patientVideoRef.current && cameraStream) {
      patientVideoRef.current.srcObject = cameraStream
    }
  }, [cameraStream])

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

  // Submit Patient Speech to Doctor AI
  const handleSendProblem = async (textToSend = null) => {
    const text = (textToSend || patientSpokenText || chatInput).trim()
    if (!text) return

    // Add to chat history
    const newMsg = {
      sender: 'patient',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setChatMessages((prev) => [...prev, newMsg])
    setPatientSpokenText('')
    setChatInput('')
    setIsEvaluating(true)

    // Call Teleconsult AI
    try {
      const response = await getDoctorConsultResponse(text, langKey, activeVideoSession?.patient?.vitals || {})
      setIsEvaluating(false)

      setConsultDiagnosis(response.diagnosis)
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

      // Speak aloud in chosen language!
      speakDoctorVoice(response.doctorReplySpeech)
    } catch (err) {
      setIsEvaluating(false)
      console.warn('Consultation generation failed:', err)
    }
  }

  // Save Prescription to SQLite Medical History
  const handleSaveToHistory = () => {
    const patient = activeVideoSession?.patient || {}
    const medSummary = prescribedMedicines.map((m) => `${m.name} (${m.dosage} - ${m.frequency})`)

    saveAssessmentReport({
      name: patient.name || 'Citizen (Patient)',
      age: patient.age || 34,
      gender: patient.gender || 'Male',
      symptoms: patientSpokenText || 'Teleconsultation assessment completed',
      urgency: 'Moderate',
      advice: recoveryAdviceList.join(' | '),
      prescribed_medicines: medSummary,
      doctor_notes: `Diagnosis: ${consultDiagnosis}. Doctor: ${activeVideoSession?.doctor?.name || 'Dr. Rajesh Sharma'}.`,
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

  const doctor = activeVideoSession.doctor || {
    name: 'Dr. Rajesh Sharma',
    specialty: 'Chief Medical Officer (General Medicine)',
    hospitalName: 'Rampur Primary Health Centre (PHC)',
  }

  const patient = activeVideoSession.patient || {
    name: 'Citizen Resident',
    age: 34,
    gender: 'Male',
    vitals: { bp: '120/80', spo2: '98%', pulse: '76', temp: '99.4°F' },
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-5xl bg-slate-950 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[96vh] flex flex-col"
          role="dialog"
          aria-modal="true"
        >
          {/* 1. Header Bar with Call Meta */}
          <div className="bg-slate-900 px-3 sm:px-6 py-2.5 sm:py-3 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center shrink-0">
                <Video className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.2 rounded border border-emerald-500/30 flex items-center gap-1 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    HD Doctor Teleconsult
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">
                    {formatTimer(secondsElapsed)}
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-white truncate mt-0.5">
                  {doctor.name} ↔ {patient.name}
                </h3>
              </div>
            </div>

            {/* Top Quick Actions (108 SOS & End Call) */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setSosOpen(true)}
                className="tap-press inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-600/30 hover:bg-red-600/50 border border-red-500/40 text-red-300 text-[11px] font-bold transition-all"
                title="Dispatch 108 Ambulance"
              >
                <Siren className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                <span className="hidden sm:inline">108 SOS</span>
              </button>

              <button
                type="button"
                onClick={endVideoCall}
                className="tap-press px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                <span>End</span>
              </button>
            </div>
          </div>

          {/* 2. Main Content Grid (Left: Live Video feeds, Right: Rx & Spoken Advice) */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-[360px] sm:min-h-[440px]">
            {/* Left 7 Cols: Video Stream Area */}
            <div className="lg:col-span-7 bg-black relative flex flex-col justify-between p-2.5 sm:p-4 overflow-hidden">
              {/* Doctor Main Video Stream Simulation */}
              <div className="w-full h-full rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden shadow-inner min-h-[220px] sm:min-h-[300px]">
                {/* Doctor Avatar / Presence */}
                <div className="flex flex-col items-center text-center p-4 space-y-2 relative z-10">
                  <div className="relative">
                    <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-full bg-emerald-600/20 border-4 border-emerald-400/40 flex items-center justify-center text-4xl sm:text-6xl shadow-xl">
                      👨‍⚕️
                    </div>
                    {isDoctorSpeaking && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-5 w-5 bg-emerald-500 text-white text-[10px] font-bold items-center justify-center">
                          🔊
                        </span>
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm sm:text-lg font-bold text-white font-display">
                      {doctor.name}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-emerald-300 font-semibold">
                      {doctor.specialty}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {doctor.hospitalName}
                    </p>
                  </div>

                  {/* Doctor Voice Status Bubble */}
                  <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl p-2 max-w-sm text-left text-xs shadow-lg space-y-1">
                    <div className="flex items-center justify-between gap-1 border-b border-slate-800 pb-1">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase flex items-center gap-1">
                        <Volume2 className={`w-3 h-3 ${isDoctorSpeaking ? 'animate-pulse text-emerald-400' : ''}`} />
                        Doctor Spoken Advice ({language.toUpperCase()})
                      </span>
                      <button
                        type="button"
                        onClick={() => speakDoctorVoice(doctorSpeechText)}
                        className="tap-press text-[10px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-0.5"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        Replay
                      </button>
                    </div>
                    <p className="text-slate-200 text-[11px] leading-relaxed italic">
                      "{doctorSpeechText}"
                    </p>
                  </div>
                </div>

                {/* Patient Picture-in-Picture (Unmirrored Webcam feed) */}
                <div className="absolute bottom-3 right-3 w-28 sm:w-40 h-20 sm:h-28 rounded-2xl bg-slate-900/95 border-2 border-emerald-500/60 overflow-hidden shadow-2xl z-20 flex items-center justify-center">
                  {videoActive && !cameraError ? (
                    <video
                      ref={patientVideoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{
                        transform: isMirrored ? 'scaleX(-1)' : 'none', // Controlled mirror mode
                      }}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-2 text-center">
                      <User className="w-5 h-5 text-slate-400 mb-1" />
                      <span className="text-[9px] text-slate-300 font-bold">{patient.name}</span>
                    </div>
                  )}

                  {/* Mirror / Flip Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setIsMirrored((m) => !m)}
                    className="tap-press absolute top-1 right-1 bg-black/70 hover:bg-black text-white text-[8px] px-1 py-0.5 rounded font-bold transition-all"
                    title="Toggle Video Mirroring"
                  >
                    {isMirrored ? 'Mirrored' : 'Natural'}
                  </button>

                  <span className="absolute bottom-1 left-1.5 text-[8px] font-bold text-white bg-black/70 px-1 py-0.2 rounded font-mono">
                    You
                  </span>
                </div>
              </div>

              {/* In-Call Patient Voice Dictation Strip */}
              <div className="pt-2 flex items-center justify-between gap-2">
                {/* 1 Big Speech Button for Patient to Speak in Native Language */}
                <button
                  type="button"
                  onClick={isPatientListening ? stopPatientSpeaking : startPatientSpeaking}
                  className={`tap-press flex-1 py-2.5 px-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                    isPatientListening
                      ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  <span>
                    {isPatientListening
                      ? 'Listening… Tap to Finish & Send'
                      : `🎤 Speak Problem to Doctor (${language.toUpperCase()})`}
                  </span>
                </button>

                {/* Camera / Video Controls */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setVideoActive((v) => !v)}
                    className={`tap-press p-2.5 rounded-xl border transition-all ${
                      videoActive
                        ? 'bg-slate-800 text-white border-slate-700'
                        : 'bg-red-600 text-white border-red-500'
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
                        ? 'bg-slate-800 text-white border-slate-700'
                        : 'bg-red-600 text-white border-red-500'
                    }`}
                    title={micActive ? 'Mute Mic' : 'Unmute Mic'}
                  >
                    {micActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Real-Time Speech Recognition Buffer Feedback */}
              {patientSpokenText && (
                <div className="mt-2 p-2 rounded-xl bg-blue-950/80 border border-blue-600/40 text-blue-200 text-xs flex items-center justify-between gap-2">
                  <div className="truncate flex-1">
                    <strong className="text-white">You said:</strong> "{patientSpokenText}"
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSendProblem(patientSpokenText)}
                    disabled={isEvaluating}
                    className="tap-press px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-bold shrink-0 flex items-center gap-1"
                  >
                    {isEvaluating ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                    <span>Get Doctor Reply</span>
                  </button>
                </div>
              )}
            </div>

            {/* Right 5 Cols: Digital Prescription & Recovery Care Panel */}
            <div className="lg:col-span-5 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col overflow-hidden">
              {/* Tab Switcher */}
              <div className="p-2 bg-slate-950 border-b border-slate-800 grid grid-cols-3 gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('prescription')}
                  className={`tap-press py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === 'prescription'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Pill className="w-3.5 h-3.5" />
                  <span>Prescription (Rx)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('chat')}
                  className={`tap-press py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === 'chat'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Chat Log</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('vitals')}
                  className={`tap-press py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === 'vitals'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Vitals Pulse</span>
                </button>
              </div>

              {/* Tab 1: Digital Prescription & Tablet Recovery Plan */}
              {activeTab === 'prescription' && (
                <div className="p-3 sm:p-4 overflow-y-auto flex-1 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                        Official Teleconsult Rx
                      </span>
                      <h4 className="text-sm font-bold text-white">
                        {consultDiagnosis}
                      </h4>
                    </div>

                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      Doctor Verified
                    </span>
                  </div>

                  {/* Tablet List */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-300 block">
                      💊 Prescribed Tablets & Dosages:
                    </span>

                    {prescribedMedicines.map((med, index) => (
                      <div
                        key={index}
                        className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-2.5 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <strong className="text-emerald-300 font-bold text-xs">{med.name}</strong>
                          <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-800">
                            {med.duration}
                          </span>
                        </div>
                        <p className="text-slate-300 text-[11px]">
                          <strong>Dosage:</strong> {med.dosage} · <strong className="text-amber-300">{med.frequency}</strong>
                        </p>
                        {med.purpose && (
                          <p className="text-[10px] text-slate-400">
                            {med.purpose}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Recovery Advice */}
                  <div className="bg-blue-950/40 border border-blue-800/40 rounded-xl p-2.5 text-xs space-y-1">
                    <span className="text-[11px] font-bold text-blue-300 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      Recovery & Care Guidelines:
                    </span>
                    <ul className="list-disc pl-4 space-y-0.5 text-[10.5px] text-slate-300">
                      {recoveryAdviceList.map((adv, idx) => (
                        <li key={idx}>{adv}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Hospital Warning */}
                  {whenToVisitWarning && (
                    <div className="bg-red-950/40 border border-red-800/40 rounded-xl p-2 text-[10.5px] text-red-200 flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                      <span>{whenToVisitWarning}</span>
                    </div>
                  )}

                  {savedToHistoryNotice && (
                    <div className="p-2 rounded-xl bg-emerald-900/60 border border-emerald-500 text-emerald-200 text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Prescription successfully saved to your Medical History!</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={handleSaveToHistory}
                      className="tap-press flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Save to Health History</span>
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
                          hospital: { name: doctor.hospitalName, distance_km: 3.2 },
                          date: new Date().toLocaleDateString('en-IN'),
                          refId: `RX-${Date.now().toString().slice(-6)}`,
                        })
                      }
                      className="tap-press py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Official Slip</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 2: Chat Log */}
              {activeTab === 'chat' && (
                <div className="flex-1 flex flex-col p-3 overflow-hidden">
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {chatMessages.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex flex-col text-xs max-w-[85%] rounded-2xl p-2.5 ${
                          msg.sender === 'doctor'
                            ? 'bg-slate-800 text-slate-100 self-start border border-slate-700'
                            : 'bg-blue-600 text-white self-end'
                        }`}
                      >
                        <span className="text-[9px] opacity-60 mb-0.5 font-bold">
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
                    className="pt-2 flex items-center gap-1.5 border-t border-slate-800"
                  >
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={`Type symptoms in ${language.toUpperCase()}...`}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder:text-slate-500 outline-none focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      className="tap-press p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}

              {/* Tab 3: Patient Vitals */}
              {activeTab === 'vitals' && (
                <div className="p-4 space-y-3 text-xs overflow-y-auto flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">
                    Patient Live Telemetry Vitals
                  </span>
                  <div className="grid grid-cols-2 gap-2 font-mono">
                    <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                      <span className="text-slate-400 text-[10px] block">Blood Pressure</span>
                      <strong className="text-white text-sm">{patient.vitals?.bp || '120/80'}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                      <span className="text-slate-400 text-[10px] block">Oxygen (SpO2)</span>
                      <strong className="text-emerald-400 text-sm">{patient.vitals?.spo2 || '98%'}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                      <span className="text-slate-400 text-[10px] block">Pulse Rate</span>
                      <strong className="text-white text-sm">{patient.vitals?.pulse || '76'} bpm</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                      <span className="text-slate-400 text-[10px] block">Temperature</span>
                      <strong className="text-white text-sm">{patient.vitals?.temp || '99.2°F'}</strong>
                    </div>
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
