import { useState, useEffect, useRef } from 'react'
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
} from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

export default function TeleconsultVideoCallModal() {
  const {
    videoCallModalOpen,
    endVideoCall,
    activeVideoSession,
    setActiveSlip,
    setSosOpen,
    role,
  } = useApp()

  const [micActive, setMicActive] = useState(true)
  const [videoActive, setVideoActive] = useState(true)
  const [cameraStream, setCameraStream] = useState(null)
  const [cameraError, setCameraError] = useState(false)
  const [secondsElapsed, setSecondsElapsed] = useState(0)
  const [activeSideTab, setActiveSideTab] = useState('vitals') // 'vitals' | 'notes' | 'chat'
  const [chatMessages, setChatMessages] = useState([
    { sender: 'doctor', text: 'Namaste, I am Dr. Rajesh Sharma. How are you feeling today?', time: '00:05' },
    { sender: 'patient', text: 'Doctor, I have high fever and severe throat pain since yesterday.', time: '00:15' },
  ])
  const [newChatMessage, setNewChatMessage] = useState('')
  const [prescribedMeds, setPrescribedMeds] = useState([
    'Paracetamol 500mg (1 Tablet TDS after meals)',
    'Cetirizine 10mg (1 Tablet at night)',
  ])
  const [newMedInput, setNewMedInput] = useState('')
  const [callEndedSuccess, setCallEndedSuccess] = useState(false)

  const patientVideoRef = useRef(null)

  // Start real user camera stream when modal opens
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
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
          setCameraStream(stream)
          if (patientVideoRef.current) {
            patientVideoRef.current.srcObject = stream
          }
        }
      } catch (err) {
        console.warn('Webcam permission not granted or unavailable:', err)
        setCameraError(true)
      }
    }
    startCam()

    // Timer
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1)
    }, 1000)

    return () => {
      clearInterval(interval)
      if (stream) stream.getTracks().forEach((t) => t.stop())
    }
  }, [videoCallModalOpen])

  // Attach stream when video element renders
  useEffect(() => {
    if (patientVideoRef.current && cameraStream) {
      patientVideoRef.current.srcObject = cameraStream
    }
  }, [cameraStream])

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
    symptoms: 'Fever, cough, body pain',
    vitals: { bp: '120/80', spo2: '98%', pulse: '76', temp: '99.4°F' },
  }

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleToggleMic = () => {
    if (cameraStream) {
      cameraStream.getAudioTracks().forEach((track) => {
        track.enabled = !micActive
      })
    }
    setMicActive(!micActive)
  }

  const handleToggleVideo = () => {
    if (cameraStream) {
      cameraStream.getVideoTracks().forEach((track) => {
        track.enabled = !videoActive
      })
    }
    setVideoActive(!videoActive)
  }

  const handleSendMessage = (e) => {
    e?.preventDefault?.()
    if (!newChatMessage.trim()) return
    const isDoc = role === 'doctor' || activeVideoSession.isDoctorView
    setChatMessages((prev) => [
      ...prev,
      {
        sender: isDoc ? 'doctor' : 'patient',
        text: newChatMessage.trim(),
        time: formatTimer(secondsElapsed),
      },
    ])
    setNewChatMessage('')
  }

  const handleAddMedicine = (e) => {
    e?.preventDefault?.()
    if (!newMedInput.trim()) return
    setPrescribedMeds((prev) => [...prev, newMedInput.trim()])
    setNewMedInput('')
  }

  const handleEndCall = () => {
    setCallEndedSuccess(true)
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop())
    }

    setTimeout(() => {
      endVideoCall()
      // Generate teleconsultation digital slip
      setActiveSlip({
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        symptoms: patient.symptoms,
        urgency: 'Moderate (Teleconsulted)',
        advice: `Teleconsultation completed by ${doctor.name}. Prescribed: ${prescribedMeds.join(', ')}`,
        vitals: patient.vitals,
        hospital: { name: doctor.hospitalName, address: 'Teleconsultation Desk' },
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        refId: `TC-${Date.now().toString().slice(-6)}`,
        doctorNotes: `Follow up in 3 days if symptoms persist. Stay hydrated and rested.`,
      })
    }, 1200)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-6xl h-[92vh] max-h-[850px] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          role="dialog"
          aria-modal="true"
        >
          {/* Header Bar */}
          <div className="bg-slate-950 px-4 sm:px-6 py-3 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/30 flex items-center justify-center">
                <Video className="w-5 h-5 text-emerald-400 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Live Teleconsultation (HD Secure)
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 font-bold">
                    {formatTimer(secondsElapsed)}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white font-display mt-0.5">
                  {doctor.name} ↔ {patient.name}
                </h3>
              </div>
            </div>

            {/* Emergency SOS Shortcut inside Call */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSosOpen(true)}
                className="tap-press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/30 hover:bg-red-600/50 border border-red-500/40 text-red-300 text-xs font-bold transition-all"
                title="Dispatch 108 Ambulance during call"
              >
                <Siren className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                <span className="hidden sm:inline">Dispatch 108 SOS</span>
              </button>

              <button
                type="button"
                onClick={handleEndCall}
                className="tap-press px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End Call</span>
              </button>
            </div>
          </div>

          {/* Main Video & Interactive Side Panel Area */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
            {/* Left 8 Cols: Video Feeds */}
            <div className="lg:col-span-8 bg-black relative flex flex-col justify-between p-3 sm:p-4 overflow-hidden">
              {/* Doctor Main Video Stream Simulation */}
              <div className="w-full h-full rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
                {/* Doctor Avatar / Video Presence */}
                <div className="flex flex-col items-center text-center p-6 space-y-3 relative z-10">
                  <div className="relative">
                    <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-emerald-600/20 border-4 border-emerald-400/40 flex items-center justify-center text-5xl sm:text-6xl shadow-xl backdrop-blur-xs">
                      👨‍⚕️
                    </div>
                    <span className="absolute bottom-1 right-2 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-white text-xs font-bold">
                      ✓
                    </span>
                  </div>

                  <div>
                    <h4 className="text-lg sm:text-xl font-bold text-white font-display">
                      {doctor.name}
                    </h4>
                    <p className="text-xs text-emerald-300 font-medium mt-0.5">
                      {doctor.specialty}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {doctor.hospitalName}
                    </p>
                  </div>

                  {/* Audio Wave Visualizer Simulation */}
                  <div className="flex items-center gap-1 h-5 pt-1">
                    {[16, 24, 12, 28, 20, 14, 26, 18, 10, 22].map((height, i) => (
                      <span
                        key={i}
                        className="w-1 bg-emerald-400 rounded-full animate-pulse"
                        style={{
                          height: `${height}px`,
                          animationDelay: `${i * 100}ms`,
                          animationDuration: '600ms',
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Patient Picture-in-Picture (Live Webcam feed) */}
                <div className="absolute bottom-4 right-4 w-32 sm:w-44 h-24 sm:h-32 rounded-2xl bg-slate-900/90 border-2 border-emerald-500/60 overflow-hidden shadow-2xl z-20 flex items-center justify-center">
                  {videoActive && !cameraError ? (
                    <video
                      ref={patientVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-2 text-center">
                      <User className="w-6 h-6 text-slate-400 mb-1" />
                      <span className="text-[9px] text-slate-300 font-bold">{patient.name}</span>
                      <span className="text-[8px] text-slate-500">Camera Off</span>
                    </div>
                  )}
                  <span className="absolute bottom-1 left-2 text-[9px] font-bold text-white bg-black/60 px-1.5 py-0.2 rounded font-mono">
                    You (Patient)
                  </span>
                </div>

                {/* Vitals Bar Overlay at Top Left of Video */}
                <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-xl p-2 sm:p-2.5 text-[11px] text-slate-200 space-y-1 z-20 max-w-[200px] sm:max-w-xs shadow-lg">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                    <Activity className="w-3 h-3 text-emerald-400" />
                    Live Clinical Vitals Pulse
                  </span>
                  <div className="grid grid-cols-2 gap-x-2 text-[10.5px] font-mono">
                    <span>BP: <strong>{patient.vitals?.bp || '120/80'}</strong></span>
                    <span>SpO2: <strong className="text-emerald-400">{patient.vitals?.spo2 || '98%'}</strong></span>
                    <span>Pulse: <strong>{patient.vitals?.pulse || '76'} bpm</strong></span>
                    <span>Temp: <strong>{patient.vitals?.temp || '99.2°F'}</strong></span>
                  </div>
                </div>
              </div>

              {/* Bottom In-Call Control Strip */}
              <div className="pt-3 flex items-center justify-center gap-3 relative z-20">
                <button
                  type="button"
                  onClick={handleToggleMic}
                  className={`tap-press w-11 h-11 rounded-full flex items-center justify-center text-white transition-all shadow-md ${
                    micActive ? 'bg-slate-800 hover:bg-slate-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                  title={micActive ? 'Mute Microphone' : 'Unmute Microphone'}
                >
                  {micActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </button>

                <button
                  type="button"
                  onClick={handleToggleVideo}
                  className={`tap-press w-11 h-11 rounded-full flex items-center justify-center text-white transition-all shadow-md ${
                    videoActive ? 'bg-slate-800 hover:bg-slate-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                  title={videoActive ? 'Turn Video Off' : 'Turn Video On'}
                >
                  {videoActive ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </button>

                <button
                  type="button"
                  onClick={handleEndCall}
                  className="tap-press px-5 h-11 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>End Consultation</span>
                </button>
              </div>
            </div>

            {/* Right 4 Cols: Clinical Panel (Vitals, Rx, In-Call Chat) */}
            <div className="lg:col-span-4 bg-slate-950 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col justify-between text-xs">
              {/* Tab Navigation */}
              <div className="p-2.5 bg-slate-900 border-b border-slate-800 flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveSideTab('vitals')}
                  className={`tap-press flex-1 py-1.5 rounded-lg font-bold text-[11px] transition-all flex items-center justify-center gap-1 ${
                    activeSideTab === 'vitals'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Activity className="w-3 h-3" />
                  <span>Vitals</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSideTab('notes')}
                  className={`tap-press flex-1 py-1.5 rounded-lg font-bold text-[11px] transition-all flex items-center justify-center gap-1 ${
                    activeSideTab === 'notes'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Pill className="w-3 h-3" />
                  <span>Live Rx</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSideTab('chat')}
                  className={`tap-press flex-1 py-1.5 rounded-lg font-bold text-[11px] transition-all flex items-center justify-center gap-1 ${
                    activeSideTab === 'chat'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>Chat ({chatMessages.length})</span>
                </button>
              </div>

              {/* Side Tab Body */}
              <div className="p-3.5 sm:p-4 overflow-y-auto flex-1 space-y-3 text-slate-200">
                {/* TAB 1: VITALS & REPORTED SYMPTOMS */}
                {activeSideTab === 'vitals' && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Patient Chief Complaint
                      </span>
                      <p className="text-slate-100 font-medium text-xs leading-relaxed">
                        {patient.symptoms}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Clinical Triage Risk Level
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-400">Moderate Urgency</span>
                        <span className="text-[10px] font-mono text-slate-400">Protocol #WHO-PHC-22</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Doctor is reviewing upper respiratory symptoms and prescribing essential anti-pyretics.
                      </p>
                    </div>
                  </div>
                )}

                {/* TAB 2: LIVE RX PRESCRIPTION */}
                {activeSideTab === 'notes' && (
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Prescribed Medications (E-Prescription)
                      </span>
                      <p className="text-[11px] text-slate-500">
                        Automatically generated on call completion.
                      </p>
                    </div>

                    <div className="space-y-2">
                      {prescribedMeds.map((med, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between gap-2"
                        >
                          <span className="text-slate-200 font-medium">{med}</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleAddMedicine} className="flex items-center gap-1.5 pt-2">
                      <input
                        type="text"
                        value={newMedInput}
                        onChange={(e) => setNewMedInput(e.target.value)}
                        placeholder="Add medicine / dosage instruction..."
                        className="flex-1 p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-blue-500"
                      />
                      <button
                        type="submit"
                        className="tap-press px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                      >
                        Add
                      </button>
                    </form>
                  </div>
                )}

                {/* TAB 3: IN-CALL CHAT & SUBTITLES */}
                {activeSideTab === 'chat' && (
                  <div className="flex flex-col h-full justify-between space-y-3">
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {chatMessages.map((msg, idx) => {
                        const isDoc = msg.sender === 'doctor'
                        return (
                          <div
                            key={idx}
                            className={`p-2.5 rounded-xl text-xs ${
                              isDoc
                                ? 'bg-blue-950/80 border border-blue-800/60 text-blue-100 mr-4'
                                : 'bg-slate-900 border border-slate-800 text-slate-200 ml-4'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                              <span className="font-bold">{isDoc ? 'Dr. Rajesh Sharma' : 'Patient'}</span>
                              <span className="font-mono">{msg.time}</span>
                            </div>
                            <p className="leading-relaxed">{msg.text}</p>
                          </div>
                        )
                      })}
                    </div>

                    <form onSubmit={handleSendMessage} className="flex items-center gap-1.5 pt-2 border-t border-slate-800">
                      <input
                        type="text"
                        value={newChatMessage}
                        onChange={(e) => setNewChatMessage(e.target.value)}
                        placeholder="Type message..."
                        className="flex-1 p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-blue-500"
                      />
                      <button
                        type="submit"
                        className="tap-press p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                )}
              </div>

              {/* Bottom Teleconsult Summary Footnote */}
              <div className="p-3 bg-slate-900 border-t border-slate-800 text-[10.5px] text-slate-400 flex items-center justify-between shrink-0">
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="w-3 h-3" />
                  eSanjeevani Tele-OPD Certified
                </span>
                <span>Govt Free Healthcare</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
