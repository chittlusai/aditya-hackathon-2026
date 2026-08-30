import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Clock,
  Search,
  Filter,
  Printer,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Siren,
  Stethoscope,
  Pill,
  Activity,
  MapPin,
  Video,
  Share2,
  ShieldCheck,
  Calendar,
  Sparkles,
  ArrowLeft,
  RefreshCw,
  PlusCircle,
  Eye,
  Smile,
  Volume2,
  Sun,
  Sunset,
  Moon,
  Zap,
  Check,
  Bell,
  HeartPulse,
} from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { LANGUAGE_SPEECH_CODES } from '../utils/teleconsultAi.js'

export default function HistoryView() {
  const {
    go,
    setActiveSlip,
    startVideoCall,
    currentUser,
    role,
    t,
    language,
  } = useApp()

  const [reports, setReports] = useState([])
  const [search, setSearch] = useState('')
  const [activeSection, setActiveSection] = useState('pill_tracker') // 'pill_tracker' | 'prescriptions' | 'triage' | 'all'
  const [filterUrgency, setFilterUrgency] = useState('all') // 'all' | 'Emergency' | 'Moderate' | 'Mild'
  const [loading, setLoading] = useState(false)
  const [syncNotice, setSyncNotice] = useState('')
  const [isSpeakingSchedule, setIsSpeakingSchedule] = useState(false)

  // Pill Adherence state: Map of "reportId_medIndex_slot" -> { taken: boolean, takenAt: string }
  const [takenMap, setTakenMap] = useState(() => {
    try {
      const saved = localStorage.getItem('asl:pill_adherence_v1')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  const langKey = language || 'en'
  const speechCode = LANGUAGE_SPEECH_CODES[langKey] || 'en-IN'

  // Load reports from backend SQLite database and localStorage
  const loadReports = async () => {
    setLoading(true)
    let loadedReports = []

    // 1. Fetch from SQLite backend API
    try {
      const res = await fetch('/api/reports')
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          loadedReports = data
        }
      }
    } catch (err) {
      console.warn('Backend SQLite reports API unavailable, using local cache:', err)
    }

    // 2. Merge with local cached reports
    try {
      const localSaved = localStorage.getItem('asl:patient_assessment_history_v1')
      if (localSaved) {
        const parsed = JSON.parse(localSaved)
        if (Array.isArray(parsed)) {
          const ids = new Set(loadedReports.map((r) => r.id))
          const uniqueLocal = parsed.filter((r) => !ids.has(r.id))
          loadedReports = [...loadedReports, ...uniqueLocal]
        }
      }
    } catch (e) {}

    // 3. Structured Default Initial Prescriptions if empty
    if (loadedReports.length === 0) {
      loadedReports = [
        {
          id: 'RX-2026-901',
          is_prescription: true,
          patient_name: currentUser?.name || 'Ramesh Kumar (Citizen)',
          age: 54,
          gender: 'Male',
          symptoms: 'High fever for 3 days with severe headache, body pain, and dry cough',
          urgency: 'Moderate',
          diagnosis: 'Acute Viral Febrile Illness & Pharyngitis',
          doctor_name: 'Dr. Rajesh Sharma (MBBS, MD)',
          created_at: '30 Aug 2026, 09:30 AM',
          vitals: { bp: '124/80', spo2: '97%', pulse: '82', temp: '101.4°F' },
          advice: 'Hydrate with ORS, take Paracetamol 650mg TDS, and consult PHC doctor if fever persists.',
          hospital_name: 'Rampur Primary Health Centre (PHC)',
          hospital_distance: 3.2,
          prescribed_medicines: [
            'Paracetamol 650mg Tablet (08:00 AM • 01:30 PM • 08:30 PM)',
            'Pantoprazole 40mg Tablet (07:30 AM Empty Stomach)',
            'ORS Solution (10:00 AM • 02:00 PM • 06:00 PM)',
            'Cetirizine 10mg Tablet (08:30 PM Night)',
          ],
          medicines_list: [
            {
              name: 'Pantoprazole 40mg Tablet',
              dosage: '1 Tablet',
              slot: 'Morning',
              exactTime: '07:30 AM',
              timing: 'Empty Stomach (30 mins before breakfast)',
              foodInstruction: 'Take first thing in the morning with half glass water',
              schedule: 'Morning (☀️ 07:30 AM)',
              duration: '5 Days',
              purpose: 'Reduces stomach acid, heartburn & gastric burning',
            },
            {
              name: 'Paracetamol 650mg Tablet',
              dosage: '1 Tablet',
              slot: 'Morning • Afternoon • Night',
              exactTime: '08:00 AM, 01:30 PM, 08:30 PM',
              timing: '30 Mins After Food',
              foodInstruction: 'Take after breakfast, lunch, and dinner with water',
              schedule: 'Morning (☀️ 08:00 AM) • Afternoon (🌤️ 01:30 PM) • Night (🌙 08:30 PM)',
              duration: '3 to 5 Days',
              purpose: 'Fever and body pain relief',
            },
            {
              name: 'ORS (Oral Rehydration Solution)',
              dosage: '1 Sachet in 1L Water',
              slot: 'Continuous Schedule',
              exactTime: '10:00 AM, 02:00 PM, 06:00 PM',
              timing: 'Between Meals',
              foodInstruction: 'Sip frequently throughout the day',
              schedule: 'Morning (☀️ 10:00 AM) • Afternoon (🌤️ 02:00 PM) • Evening (🌙 06:00 PM)',
              duration: '3 Days',
              purpose: 'Continuous hydration & vital electrolyte replenishment',
            },
            {
              name: 'Cetirizine 10mg Tablet',
              dosage: '1 Tablet',
              slot: 'Night',
              exactTime: '08:30 PM',
              timing: 'After Dinner / Bedtime',
              foodInstruction: 'Take at night before going to sleep',
              schedule: 'Night Only (🌙 08:30 PM)',
              duration: '3 Days',
              purpose: 'Relieves runny nose, sneezing & throat irritation',
            },
          ],
          doctor_notes: 'Facial Signs: Mild pallor. Pain Score: 65%. Physical Injuries: None detected.',
          risk_factors: ['Fever > 101°F'],
        },
        {
          id: 'REP-2026-8802',
          is_prescription: false,
          patient_name: 'Savita Devi',
          age: 28,
          gender: 'Female',
          symptoms: 'Routine ANC visit checkup with mild swelling in feet at 28 weeks gestation',
          urgency: 'Mild',
          diagnosis: 'Routine Antenatal Care (2nd Trimester)',
          created_at: '29 Aug 2026, 03:45 PM',
          vitals: { bp: '118/76', spo2: '99%', pulse: '74', temp: '98.4°F', isPregnant: true },
          advice: 'Continue daily IFA and Calcium supplements. Schedule 3rd ANC scan.',
          hospital_name: 'Rampur Sector Sub-Centre',
          hospital_distance: 1.5,
          prescribed_medicines: ['Iron Folic Acid (IFA) Tablets (08:00 AM)', 'Calcium Carbonate 500mg (08:30 PM)'],
          medicines_list: [
            {
              name: 'Iron Folic Acid (IFA) Tablet',
              dosage: '1 Tablet',
              slot: 'Morning',
              exactTime: '08:00 AM',
              timing: 'After Breakfast',
              foodInstruction: 'Take with lemon water or plain water',
              schedule: 'Morning (☀️ 08:00 AM)',
              duration: '100 Days',
              purpose: 'Prevents maternal anemia & promotes fetal growth',
            },
            {
              name: 'Calcium Carbonate 500mg Tablet',
              dosage: '1 Tablet',
              slot: 'Night',
              exactTime: '08:30 PM',
              timing: 'After Dinner',
              foodInstruction: 'Do not take together with Iron tablet',
              schedule: 'Night (🌙 08:30 PM)',
              duration: '100 Days',
              purpose: 'Maternal bone density and fetal skeletal development',
            },
          ],
          doctor_notes: 'Fetal heart rate normal (142 bpm).',
          risk_factors: ['Mild Pedal Edema'],
        },
      ]
    }

    setReports(loadedReports)
    setLoading(false)
  }

  useEffect(() => {
    loadReports()
  }, [currentUser])

  // Toggle Medicine Taken Adherence Status
  const toggleMedicineTaken = (key, medName) => {
    setTakenMap((prev) => {
      const isCurrentlyTaken = Boolean(prev[key]?.taken)
      const updated = {
        ...prev,
        [key]: {
          taken: !isCurrentlyTaken,
          takenAt: !isCurrentlyTaken
            ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '',
          medName,
        },
      }
      try {
        localStorage.setItem('asl:pill_adherence_v1', JSON.stringify(updated))
      } catch (e) {}
      return updated
    })
  }

  // Aggregate All Prescribed Medicines Grouped into Exact Time Categories
  const categorizedDoses = {
    morning: [],
    afternoon: [],
    night: [],
    sos: [],
  }

  reports.forEach((rep) => {
    if (rep.medicines_list && Array.isArray(rep.medicines_list)) {
      rep.medicines_list.forEach((med, idx) => {
        const keyBase = `${rep.id}_${idx}`
        const slotLower = (med.slot || med.schedule || med.timing || '').toLowerCase()

        const doseObj = {
          ...med,
          reportId: rep.id,
          patientName: rep.patient_name,
          doctorName: rep.doctor_name || 'Dr. Rajesh Sharma (MD)',
          diagnosis: rep.diagnosis || 'Clinical Prescription',
          index: idx,
        }

        if (
          slotLower.includes('morning') ||
          slotLower.includes('tds') ||
          slotLower.includes('breakfast') ||
          slotLower.includes('07:30') ||
          slotLower.includes('08:00') ||
          slotLower.includes('10:00')
        ) {
          categorizedDoses.morning.push({
            ...doseObj,
            key: `${keyBase}_morning`,
            slotLabel: 'Morning Dose',
            slotTime: med.exactTime?.includes('07:30') ? '07:30 AM' : '08:00 AM',
          })
        }

        if (
          slotLower.includes('afternoon') ||
          slotLower.includes('tds') ||
          slotLower.includes('lunch') ||
          slotLower.includes('01:30') ||
          slotLower.includes('02:00')
        ) {
          categorizedDoses.afternoon.push({
            ...doseObj,
            key: `${keyBase}_afternoon`,
            slotLabel: 'Afternoon Dose',
            slotTime: '01:30 PM',
          })
        }

        if (
          slotLower.includes('night') ||
          slotLower.includes('tds') ||
          slotLower.includes('dinner') ||
          slotLower.includes('bedtime') ||
          slotLower.includes('08:30')
        ) {
          categorizedDoses.night.push({
            ...doseObj,
            key: `${keyBase}_night`,
            slotLabel: 'Night Dose',
            slotTime: '08:30 PM',
          })
        }

        if (slotLower.includes('sos') || slotLower.includes('emergency') || slotLower.includes('needed')) {
          categorizedDoses.sos.push({
            ...doseObj,
            key: `${keyBase}_sos`,
            slotLabel: 'Emergency / SOS Dose',
            slotTime: 'Immediate / As Needed',
          })
        }
      })
    }
  })

  // Calculate Total Adherence Progress
  const allDosesList = [
    ...categorizedDoses.morning,
    ...categorizedDoses.afternoon,
    ...categorizedDoses.night,
  ]
  const totalDosesCount = allDosesList.length
  const takenDosesCount = allDosesList.filter((d) => takenMap[d.key]?.taken).length
  const adherencePercent = totalDosesCount > 0 ? Math.round((takenDosesCount / totalDosesCount) * 100) : 100

  // Audio Voice Helper to Read Pill Schedule Aloud in Native Language
  const speakPillScheduleAloud = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()

    let speechText = ''
    if (langKey === 'te') {
      speechText = `మీ రోజువారీ మందుల సమయాలు: ఉదయం 08:00 AM కి ${categorizedDoses.morning.length} మందులు ఉన్నాయి. మధ్యాహ్నం 01:30 PM కి ${categorizedDoses.afternoon.length} మందులు, మరియు రాత్రి 08:30 PM కి ${categorizedDoses.night.length} మందులు తీసుకోవాలి. సమయానికి మందులు వేసుకోండి.`
    } else if (langKey === 'hi') {
      speechText = `आपकी दैनिक दवाओं का समय: सुबह 08:00 AM पर ${categorizedDoses.morning.length} दवाएं, दोपहर 01:30 PM पर ${categorizedDoses.afternoon.length} दवाएं, और रात 08:30 PM पर ${categorizedDoses.night.length} दवाएं लेनी हैं। समय पर दवाएं लें।`
    } else {
      speechText = `Your daily medicine schedule: Morning at 08:00 AM has ${categorizedDoses.morning.length} medicines. Afternoon at 01:30 PM has ${categorizedDoses.afternoon.length} medicines, and Night at 08:30 PM has ${categorizedDoses.night.length} medicines. Please take your doses on time.`
    }

    const utterance = new SpeechSynthesisUtterance(speechText)
    utterance.lang = speechCode
    utterance.rate = 0.92
    utterance.pitch = 1.0

    utterance.onstart = () => setIsSpeakingSchedule(true)
    utterance.onend = () => setIsSpeakingSchedule(false)
    utterance.onerror = () => setIsSpeakingSchedule(false)

    window.speechSynthesis.speak(utterance)
  }, [langKey, speechCode, categorizedDoses])

  const filteredReports = reports.filter((r) => {
    const q = search.toLowerCase()
    const matchesSearch =
      !q ||
      (r.patient_name || '').toLowerCase().includes(q) ||
      (r.symptoms || '').toLowerCase().includes(q) ||
      (r.id || '').toLowerCase().includes(q) ||
      (r.diagnosis || '').toLowerCase().includes(q) ||
      (r.hospital_name || '').toLowerCase().includes(q)

    if (!matchesSearch) return false

    if (activeSection === 'prescriptions') {
      if (!r.is_prescription && !r.id?.startsWith('RX') && !r.medicines_list?.length) {
        return false
      }
    } else if (activeSection === 'triage') {
      if (r.is_prescription || r.id?.startsWith('RX')) {
        return false
      }
    }

    if (filterUrgency !== 'all') {
      return (r.urgency || '').toLowerCase().includes(filterUrgency.toLowerCase())
    }
    return true
  })

  const rxCount = reports.filter(
    (r) => r.is_prescription || r.id?.startsWith('RX') || r.medicines_list?.length
  ).length

  const handleDelete = async (reportId) => {
    if (!window.confirm(`Delete record #${reportId}?`)) return
    try {
      await fetch(`/api/reports/${reportId}`, { method: 'DELETE' })
    } catch (e) {}

    const updated = reports.filter((r) => r.id !== reportId)
    setReports(updated)
    try {
      localStorage.setItem('asl:patient_assessment_history_v1', JSON.stringify(updated))
    } catch (e) {}
    setSyncNotice(`Record #${reportId} deleted`)
    setTimeout(() => setSyncNotice(''), 2500)
  }

  const handleDownloadJson = (report) => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Arogya_Medical_Record_${report.id}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-2.5 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => go('home')}
          className="tap-press inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-blue-600" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadReports()}
            className="tap-press inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs hover:bg-slate-50 transition-all"
            title="Refresh from SQLite Database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync Database</span>
          </button>

          <button
            type="button"
            onClick={() => startVideoCall()}
            className="tap-press inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 rounded-xl shadow-sm transition-all"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Consult Doctor (Video)</span>
          </button>
        </div>
      </div>

      {/* Page Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-4 sm:p-7 shadow-xl border border-blue-700/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0">
              <Pill className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-300 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-400/20 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-300" />
                  Prescriptions & Timings Vault Active
                </span>
                <span className="text-xs text-blue-200 font-mono">
                  {totalDosesCount} Daily Doses Scheduled
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-extrabold font-display text-white mt-1">
                Medical Records, Prescriptions & Pill Timings
              </h1>
              <p className="text-xs sm:text-sm text-blue-100 mt-0.5">
                Categorized daily tablet schedules: Morning (08:00 AM), Afternoon (01:30 PM), Night (08:30 PM), and verified doctor slips
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Categorized Tabs Switcher (Thumb Friendly on Mobile) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-200/80 rounded-2xl">
        <button
          type="button"
          onClick={() => setActiveSection('pill_tracker')}
          className={`tap-press py-2.5 px-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
            activeSection === 'pill_tracker'
              ? 'bg-white text-emerald-800 shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-emerald-600" />
          <span>🕒 Pill Timings Tracker</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('prescriptions')}
          className={`tap-press py-2.5 px-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
            activeSection === 'prescriptions'
              ? 'bg-white text-blue-800 shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Pill className="w-3.5 h-3.5 text-blue-600" />
          <span>💊 Prescriptions ({rxCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('triage')}
          className={`tap-press py-2.5 px-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
            activeSection === 'triage'
              ? 'bg-white text-indigo-800 shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />
          <span>Triage Slips ({reports.length - rxCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('all')}
          className={`tap-press py-2.5 px-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
            activeSection === 'all'
              ? 'bg-white text-slate-900 shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-slate-600" />
          <span>All Records ({reports.length})</span>
        </button>
      </div>

      {syncNotice && (
        <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold flex items-center justify-between shadow-xs">
          <span>{syncNotice}</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        </div>
      )}

      {/* VIEW 1: DAILY PILL TRACKER & TIMINGS SCHEDULE */}
      {activeSection === 'pill_tracker' && (
        <div className="space-y-4">
          {/* Adherence Header Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                  Daily Medicine Adherence Meter
                </span>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-1">
                  Today's Scheduled Tablets & Doses ({takenDosesCount} of {totalDosesCount} Taken)
                </h3>
              </div>

              {/* Voice Prompt Button for Rural Citizens */}
              <button
                type="button"
                onClick={speakPillScheduleAloud}
                className="tap-press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all self-start sm:self-auto"
              >
                <Volume2 className={`w-3.5 h-3.5 ${isSpeakingSchedule ? 'animate-pulse text-blue-700' : ''}`} />
                <span>Hear Schedule Aloud ({language.toUpperCase()})</span>
              </button>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${adherencePercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                <span>{adherencePercent}% Completed Today</span>
                <span>{totalDosesCount - takenDosesCount} Dose(s) Pending</span>
              </div>
            </div>
          </div>

          {/* 4 Time Categories Grid */}
          <div className="space-y-4">
            {/* Category 1: ☀️ Morning Doses (08:00 AM) */}
            <div className="bg-amber-50/40 border border-amber-200/80 rounded-3xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-amber-950">
                      ☀️ Morning Slot • 08:00 AM (ఉదయం / सुबह)
                    </h4>
                    <span className="text-[10.5px] text-amber-800 font-medium">
                      Breakfast Window (07:30 AM – 09:00 AM)
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-mono bg-white text-amber-900 font-bold px-2 py-0.5 rounded-full border border-amber-300">
                  {categorizedDoses.morning.length} Tablets
                </span>
              </div>

              {categorizedDoses.morning.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-2">No morning medicines prescribed.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {categorizedDoses.morning.map((med) => {
                    const isTaken = Boolean(takenMap[med.key]?.taken)
                    return (
                      <div
                        key={med.key}
                        className={`p-3 rounded-2xl border transition-all space-y-2 bg-white ${
                          isTaken ? 'border-emerald-300 ring-1 ring-emerald-500/20 bg-emerald-50/10' : 'border-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div>
                            <strong className="text-xs font-bold text-slate-900 block">{med.name}</strong>
                            <span className="text-[10.5px] text-blue-700 font-medium">{med.purpose}</span>
                          </div>
                          <span className="text-[9.5px] font-mono bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded border border-amber-300 shrink-0">
                            {med.slotTime}
                          </span>
                        </div>

                        <div className="text-[10.5px] text-slate-600 bg-slate-50 p-1.5 rounded-xl border border-slate-200/80">
                          🍽️ <strong>Timing:</strong> {med.timing || med.foodInstruction || 'After Breakfast with water'}
                        </div>

                        {/* Check-off Button */}
                        <button
                          type="button"
                          onClick={() => toggleMedicineTaken(med.key, med.name)}
                          className={`tap-press w-full py-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs ${
                            isTaken
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                          }`}
                        >
                          <Check className={`w-3.5 h-3.5 ${isTaken ? 'stroke-[3]' : ''}`} />
                          <span>{isTaken ? `Taken at ${takenMap[med.key]?.takenAt || '08:00 AM'}` : 'Mark as Taken'}</span>
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Category 2: 🌤️ Afternoon Doses (01:30 PM) */}
            <div className="bg-blue-50/40 border border-blue-200/80 rounded-3xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-blue-200/60 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Sunset className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-blue-950">
                      🌤️ Afternoon Slot • 01:30 PM (మధ్యాహ్నం / दोपहर)
                    </h4>
                    <span className="text-[10.5px] text-blue-800 font-medium">
                      Lunch Window (01:00 PM – 02:30 PM)
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-mono bg-white text-blue-900 font-bold px-2 py-0.5 rounded-full border border-blue-300">
                  {categorizedDoses.afternoon.length} Tablets
                </span>
              </div>

              {categorizedDoses.afternoon.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-2">No afternoon medicines prescribed.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {categorizedDoses.afternoon.map((med) => {
                    const isTaken = Boolean(takenMap[med.key]?.taken)
                    return (
                      <div
                        key={med.key}
                        className={`p-3 rounded-2xl border transition-all space-y-2 bg-white ${
                          isTaken ? 'border-emerald-300 ring-1 ring-emerald-500/20 bg-emerald-50/10' : 'border-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div>
                            <strong className="text-xs font-bold text-slate-900 block">{med.name}</strong>
                            <span className="text-[10.5px] text-blue-700 font-medium">{med.purpose}</span>
                          </div>
                          <span className="text-[9.5px] font-mono bg-blue-100 text-blue-900 font-bold px-1.5 py-0.2 rounded border border-blue-300 shrink-0">
                            {med.slotTime}
                          </span>
                        </div>

                        <div className="text-[10.5px] text-slate-600 bg-slate-50 p-1.5 rounded-xl border border-slate-200/80">
                          🍽️ <strong>Timing:</strong> {med.timing || med.foodInstruction || 'After Lunch with water'}
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleMedicineTaken(med.key, med.name)}
                          className={`tap-press w-full py-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs ${
                            isTaken
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                          }`}
                        >
                          <Check className={`w-3.5 h-3.5 ${isTaken ? 'stroke-[3]' : ''}`} />
                          <span>{isTaken ? `Taken at ${takenMap[med.key]?.takenAt || '01:30 PM'}` : 'Mark as Taken'}</span>
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Category 3: 🌙 Night Doses (08:30 PM) */}
            <div className="bg-indigo-50/40 border border-indigo-200/80 rounded-3xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-indigo-200/60 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Moon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-indigo-950">
                      🌙 Night Slot • 08:30 PM (రాత్రి / रात)
                    </h4>
                    <span className="text-[10.5px] text-indigo-800 font-medium">
                      Dinner & Bedtime Window (08:00 PM – 10:00 PM)
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-mono bg-white text-indigo-900 font-bold px-2 py-0.5 rounded-full border border-indigo-300">
                  {categorizedDoses.night.length} Tablets
                </span>
              </div>

              {categorizedDoses.night.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-2">No night medicines prescribed.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {categorizedDoses.night.map((med) => {
                    const isTaken = Boolean(takenMap[med.key]?.taken)
                    return (
                      <div
                        key={med.key}
                        className={`p-3 rounded-2xl border transition-all space-y-2 bg-white ${
                          isTaken ? 'border-emerald-300 ring-1 ring-emerald-500/20 bg-emerald-50/10' : 'border-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div>
                            <strong className="text-xs font-bold text-slate-900 block">{med.name}</strong>
                            <span className="text-[10.5px] text-blue-700 font-medium">{med.purpose}</span>
                          </div>
                          <span className="text-[9.5px] font-mono bg-indigo-100 text-indigo-900 font-bold px-1.5 py-0.2 rounded border border-indigo-300 shrink-0">
                            {med.slotTime}
                          </span>
                        </div>

                        <div className="text-[10.5px] text-slate-600 bg-slate-50 p-1.5 rounded-xl border border-slate-200/80">
                          🍽️ <strong>Timing:</strong> {med.timing || med.foodInstruction || 'After Dinner at Bedtime'}
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleMedicineTaken(med.key, med.name)}
                          className={`tap-press w-full py-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs ${
                            isTaken
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                          }`}
                        >
                          <Check className={`w-3.5 h-3.5 ${isTaken ? 'stroke-[3]' : ''}`} />
                          <span>{isTaken ? `Taken at ${takenMap[med.key]?.takenAt || '08:30 PM'}` : 'Mark as Taken'}</span>
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Category 4: ⚡ Emergency SOS / As Needed */}
            {categorizedDoses.sos.length > 0 && (
              <div className="bg-red-50/40 border border-red-200 rounded-3xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-red-200 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Zap className="w-4 h-4 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-red-950">
                        ⚡ Emergency SOS Doses (అత్యవసర మోతాదు)
                      </h4>
                      <span className="text-[10.5px] text-red-800 font-medium">
                        Take only when symptoms exceed threshold
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {categorizedDoses.sos.map((med) => (
                    <div key={med.key} className="p-3 rounded-2xl border border-red-200 bg-white space-y-1 text-xs">
                      <strong className="text-slate-900 font-bold">{med.name}</strong>
                      <p className="text-red-700 text-[11px] font-semibold">{med.timing || 'Immediate SOS'}</p>
                      <p className="text-slate-600 text-[10.5px]">{med.purpose}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: PRESCRIPTIONS & TRIAGE SLIPS LIST */}
      {activeSection !== 'pill_tracker' && (
        <div className="space-y-4">
          {/* Search & Urgency Filter Toolbar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search prescription ID, patient, diagnosis, hospital..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm outline-none focus:bg-white focus:border-blue-600 transition-all"
              />
            </div>

            {/* Urgency Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setFilterUrgency('all')}
                className={`tap-press px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  filterUrgency === 'all'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                All ({filteredReports.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterUrgency('Emergency')}
                className={`tap-press px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  filterUrgency === 'Emergency'
                    ? 'bg-red-600 text-white shadow-2xs'
                    : 'bg-white text-red-700 border border-red-200 hover:bg-red-50'
                }`}
              >
                Emergency
              </button>
              <button
                type="button"
                onClick={() => setFilterUrgency('Moderate')}
                className={`tap-press px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  filterUrgency === 'Moderate'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-white text-amber-800 border border-amber-200 hover:bg-amber-50'
                }`}
              >
                Moderate
              </button>
              <button
                type="button"
                onClick={() => setFilterUrgency('Mild')}
                className={`tap-press px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  filterUrgency === 'Mild'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                Mild
              </button>
            </div>
          </div>

          {/* Records List */}
          <div className="space-y-4">
            {loading ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                <p className="font-bold text-slate-600">Loading Medical Vault from SQLite...</p>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 space-y-3">
                <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-bold text-base text-slate-700">No Records Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {activeSection === 'prescriptions'
                    ? 'No digital prescriptions have been issued yet. Start a video teleconsultation to receive a doctor prescription.'
                    : 'No triage records match your search criteria.'}
                </p>
                <button
                  type="button"
                  onClick={() => startVideoCall()}
                  className="tap-press inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm"
                >
                  <Video className="w-4 h-4" />
                  <span>Consult Doctor (Video)</span>
                </button>
              </div>
            ) : (
              filteredReports.map((record) => {
                const isRx = record.is_prescription || record.id?.startsWith('RX') || record.medicines_list?.length > 0
                const isEmergency = record.urgency?.toLowerCase().includes('emergency')
                const isModerate = record.urgency?.toLowerCase().includes('moderate')

                return (
                  <div
                    key={record.id}
                    className={`bg-white rounded-3xl border p-4 sm:p-6 shadow-xs transition-all space-y-3.5 ${
                      isRx
                        ? 'border-emerald-200 bg-emerald-50/10 ring-1 ring-emerald-500/10'
                        : isEmergency
                        ? 'border-red-200 bg-red-50/15'
                        : isModerate
                        ? 'border-amber-200 bg-amber-50/15'
                        : 'border-slate-200'
                    }`}
                  >
                    {/* Top Meta Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono font-bold text-xs px-2.5 py-0.5 rounded-lg border ${
                            isRx
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {record.id}
                        </span>

                        {isRx && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-1">
                            <Pill className="w-3 h-3" />
                            Digital Prescription (Rx)
                          </span>
                        )}

                        <span
                          className={`text-[10px] sm:text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${
                            isEmergency
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : isModerate
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {record.urgency || 'Moderate'} Urgency
                        </span>
                      </div>

                      <span className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {record.created_at || 'Recently Recorded'}
                      </span>
                    </div>

                    {/* Patient & Doctor/Facility Details */}
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div>
                          <h3 className="font-bold text-sm sm:text-lg text-slate-900">
                            {record.patient_name || 'Citizen Patient'} {record.age ? `(${record.age} Yrs, ${record.gender || 'Patient'})` : ''}
                          </h3>
                          {record.diagnosis && (
                            <p className="text-xs font-bold text-emerald-800 mt-0.5 flex items-center gap-1">
                              <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Diagnosis: {record.diagnosis}</span>
                            </p>
                          )}
                        </div>

                        <div className="text-right">
                          {record.doctor_name && (
                            <span className="text-xs font-bold text-slate-800 block">
                              👨‍⚕️ {record.doctor_name}
                            </span>
                          )}
                          {record.hospital_name && (
                            <span className="text-[11px] text-slate-500 flex items-center sm:justify-end gap-1">
                              <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
                              <span>{record.hospital_name}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-xs text-slate-800 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                        <strong className="text-slate-900 block mb-0.5">Symptoms & Clinical Summary:</strong>
                        "{record.symptoms}"
                      </div>
                    </div>

                    {/* Structured Prescribed Tablets List with Exact Timings */}
                    {record.medicines_list && record.medicines_list.length > 0 ? (
                      <div className="space-y-2 bg-emerald-50/40 p-3 rounded-2xl border border-emerald-200/80">
                        <span className="text-[11px] font-bold text-emerald-950 flex items-center gap-1">
                          <Pill className="w-3.5 h-3.5 text-emerald-600" />
                          Prescribed Tablets & Exact Daily Timing Schedules:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {record.medicines_list.map((med, idx) => (
                            <div key={idx} className="bg-white p-2.5 rounded-xl border border-emerald-200 text-xs space-y-1">
                              <div className="flex items-center justify-between">
                                <strong className="text-emerald-900 font-bold">{med.name}</strong>
                                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                  {med.duration}
                                </span>
                              </div>
                              <p className="text-slate-600 text-[11px]">
                                <strong>Dose:</strong> {med.dosage} · <strong className="text-blue-700">{med.timing || med.foodInstruction || 'After Food'}</strong>
                              </p>
                              <div className="text-[10px] text-slate-700 font-mono bg-slate-50 p-1 rounded-lg border border-slate-200/60">
                                🕒 Timing: <strong>{med.exactTime || med.schedule}</strong>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : record.prescribed_medicines?.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase py-0.5">Rx Prescriptions:</span>
                        {record.prescribed_medicines.map((m, idx) => (
                          <span key={idx} className="bg-emerald-50 text-emerald-900 border border-emerald-200 px-2.5 py-0.5 rounded-xl text-xs font-medium flex items-center gap-1">
                            <Pill className="w-3 h-3 text-emerald-600" />
                            {m}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    {/* Vitals Grid if available */}
                    {record.vitals && Object.keys(record.vitals).length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50/70 p-2.5 rounded-2xl border border-slate-200/80 text-xs font-mono">
                        {record.vitals.bp && <div>BP: <strong className="text-slate-900">{record.vitals.bp}</strong></div>}
                        {record.vitals.spo2 && <div>SpO2: <strong className="text-emerald-700">{record.vitals.spo2}</strong></div>}
                        {record.vitals.pulse && <div>Pulse: <strong className="text-slate-900">{record.vitals.pulse} bpm</strong></div>}
                        {record.vitals.temp && <div>Temp: <strong className="text-slate-900">{record.vitals.temp}</strong></div>}
                      </div>
                    )}

                    {/* Clinical Recovery Advice */}
                    {record.advice && (
                      <p className="text-xs text-slate-700 leading-relaxed bg-blue-50/40 p-2.5 rounded-2xl border border-blue-200/60">
                        <strong className="text-blue-950">Recovery Advice:</strong> {record.advice}
                      </p>
                    )}

                    {/* Interactive Actions Row */}
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveSlip({
                              name: record.patient_name,
                              age: record.age,
                              gender: record.gender,
                              symptoms: record.diagnosis || record.symptoms,
                              urgency: record.urgency,
                              advice: record.advice,
                              vitals: record.vitals,
                              hospital: { name: record.hospital_name, distance_km: record.hospital_distance },
                              date: record.created_at?.split(',')?.[0] || 'Today',
                              refId: record.id,
                            })
                          }
                          className="tap-press inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs shadow-2xs transition-all"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>View & Print Slip</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            startVideoCall({
                              name: record.patient_name,
                              age: record.age,
                              gender: record.gender,
                              symptoms: `Follow-up for record #${record.id}: ${record.symptoms}`,
                              vitals: record.vitals,
                            })
                          }
                          className="tap-press inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs transition-all"
                        >
                          <Video className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Follow-up Video Call</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDownloadJson(record)}
                          className="tap-press inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                          title="Download JSON Record"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>JSON</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(record.id)}
                          className="tap-press p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
