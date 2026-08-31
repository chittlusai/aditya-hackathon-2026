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
  ChevronRight,
} from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { LANGUAGE_SPEECH_CODES } from '../utils/teleconsultAi.js'

// Full multilingual dictionary for Medical History & Prescription Vault
const HISTORY_I18N = {
  en: {
    backHome: 'Home',
    sync: 'Sync',
    consultDoctor: 'Consult Doctor',
    vaultTag: 'Prescriptions & Timings Vault',
    vaultTitle: 'Medical Records & Pill Timings',
    todaysDoses: "Today's Doses",
    dosesTaken: 'Taken',
    tabTimings: 'Daily Pill Timings',
    tabRx: 'Doctor Prescriptions (Rx)',
    tabTriage: 'Health Triage Assessments',
    tabAll: 'All Medical Records',
    adherenceMeter: 'ADHERENCE METER',
    timetableTitle: "Today's Daily Timetable",
    hearVoice: 'Hear Voice',
    completed: 'Completed',
    pending: 'Pending',
    morningSlot: 'Morning Dose • 08:00 AM (Morning / Breakfast)',
    breakfastHint: 'Breakfast (07:30 AM – 09:00 AM)',
    afternoonSlot: 'Afternoon Dose • 01:30 PM (Lunch / Afternoon)',
    lunchHint: 'Lunch (01:00 PM – 02:30 PM)',
    nightSlot: 'Night Dose • 08:30 PM (Dinner / Bedtime)',
    dinnerHint: 'Dinner / Bedtime (08:00 PM – 09:30 PM)',
    takenAt: 'Taken at',
    markTaken: 'Mark as Taken',
    afterFood: 'After Food',
    searchPlaceholder: 'Search prescriptions, doctors, or symptoms…',
    noRecords: 'No medical records found.',
    printSlip: 'View / Print Slip',
    doctorLabel: 'Doctor',
    hospitalLabel: 'Health Facility',
  },
  te: {
    backHome: 'హోమ్',
    sync: 'సింక్',
    consultDoctor: 'డాక్టర్ సంప్రదింపు',
    vaultTag: 'ప్రిస్క్రిప్షన్లు & మందుల వేళల వాల్ట్',
    vaultTitle: 'వైద్య రికార్డులు & మందుల వేళలు',
    todaysDoses: 'నేటి మోతాదులు',
    dosesTaken: 'తీసుకున్నారు',
    tabTimings: 'మందుల వేళలు (Timings)',
    tabRx: 'డాక్టర్ ప్రిస్క్రిప్షన్లు (Doctor Prescriptions - Rx)',
    tabTriage: 'ఆరోగ్య పరీక్షలు (Triage Assessments)',
    tabAll: 'అన్ని రికార్డులు (All Records)',
    adherenceMeter: 'మందుల వినియోగ మీటర్',
    timetableTitle: 'నేటి రోజువారీ మందుల పట్టిక',
    hearVoice: 'వాయిస్ వినండి',
    completed: 'పూర్తయింది',
    pending: 'బాకీ ఉంది',
    morningSlot: 'ఉదయం మోతాదు • 08:00 AM (ఉదయం / టిఫిన్ తర్వాత)',
    breakfastHint: 'అల్పాహారం (07:30 AM – 09:00 AM)',
    afternoonSlot: 'మధ్యాహ్నం మోతాదు • 01:30 PM (మధ్యాహ్న భోజనం తర్వాత)',
    lunchHint: 'మధ్యాహ్న భోజనం (01:00 PM – 02:30 PM)',
    nightSlot: 'రాత్రి మోతాదు • 08:30 PM (రాత్రి భోజనం / నిద్రకు ముందు)',
    dinnerHint: 'రాత్రి భోజనం / నిద్రకు ముందు (08:00 PM – 09:30 PM)',
    takenAt: 'సమయానికి వేసుకున్నారు',
    markTaken: 'తీసుకున్నట్లు గుర్తించండి',
    afterFood: 'భోజనం తర్వాత',
    searchPlaceholder: 'ప్రిస్క్రిప్షన్లు, డాక్టర్ లేదా లక్షణాలను శోధించండి…',
    noRecords: 'ఎటువంటి వైద్య రికార్డులు కనుగొనబడలేదు.',
    printSlip: 'స్లిప్ చూడండి / ప్రింట్ చేయండి',
    doctorLabel: 'వైద్యులు (Doctor)',
    hospitalLabel: 'ఆరోగ్య కేంద్రం (Hospital)',
  },
  hi: {
    backHome: 'होम',
    sync: 'सिंक',
    consultDoctor: 'डॉक्टर से परामर्श',
    vaultTag: 'दवा पर्ची व समय तालिका',
    vaultTitle: 'चिकित्सा रिकॉर्ड व दवाई समय',
    todaysDoses: 'आज की खुराक',
    dosesTaken: 'ली गई',
    tabTimings: 'दवा का समय (Timings)',
    tabRx: 'डॉक्टर पर्ची (Doctor Prescriptions - Rx)',
    tabTriage: 'स्वास्थ्य जांच (Triage)',
    tabAll: 'सभी रिकॉर्ड (All Records)',
    adherenceMeter: 'दवा नियमितता मीटर',
    timetableTitle: 'आज की दैनिक दवा समय सारणी',
    hearVoice: 'आवाज़ सुनें',
    completed: 'पूर्ण',
    pending: 'शेष',
    morningSlot: 'सुबह की खुराक • 08:00 AM (नाश्ते के बाद)',
    breakfastHint: 'नाश्ता (07:30 AM – 09:00 AM)',
    afternoonSlot: 'दोपहर की खुराक • 01:30 PM (दोपहर भोजन के बाद)',
    lunchHint: 'दोपहर का भोजन (01:00 PM – 02:30 PM)',
    nightSlot: 'रात की खुराक • 08:30 PM (रात के खाने के बाद)',
    dinnerHint: 'रात का भोजन / सोने से पहले (08:00 PM – 09:30 PM)',
    takenAt: 'समय पर ली गई',
    markTaken: 'दवा ले ली (Mark as Taken)',
    afterFood: 'भोजन के बाद',
    searchPlaceholder: 'पर्ची, डॉक्टर या लक्षण खोजें…',
    noRecords: 'कोई चिकित्सा रिकॉर्ड नहीं मिला।',
    printSlip: 'पर्ची देखें / प्रिंट करें',
    doctorLabel: 'डॉक्टर',
    hospitalLabel: 'स्वास्थ्य केंद्र',
  },
  ta: {
    backHome: 'முகப்பு',
    sync: 'ஒத்திசை',
    consultDoctor: 'மருத்துவர் ஆலோசனை',
    vaultTag: 'மருந்து சீட்டுகள் & நேரப் பெட்டகம்',
    vaultTitle: 'மருத்துவப் பதிவுகள் & மாத்திரை நேரங்கள்',
    todaysDoses: 'இன்றைய அளவுகள்',
    dosesTaken: 'எடுக்கப்பட்டது',
    tabTimings: 'மாத்திரை நேரங்கள் (Timings)',
    tabRx: 'மருத்துவர் சீட்டுகள் (Doctor Prescriptions - Rx)',
    tabTriage: 'சுகாதார பரிசோதனைகள் (Triage)',
    tabAll: 'அனைத்து பதிவுகள் (All Records)',
    adherenceMeter: 'மருந்து பயன்பாட்டு மீட்டர்',
    timetableTitle: 'இன்றைய தினசரி அட்டவணை',
    hearVoice: 'குரல் கேட்க',
    completed: 'முடிந்தது',
    pending: 'மீதம்',
    morningSlot: 'காலை அளவு • 08:00 AM (காலை உணவு)',
    breakfastHint: 'காலை உணவு (07:30 AM – 09:00 AM)',
    afternoonSlot: 'மதிய அளவு • 01:30 PM (மதிய உணவு)',
    lunchHint: 'மதிய உணவு (01:00 PM – 02:30 PM)',
    nightSlot: 'இரவு அளவு • 08:30 PM (இரவு உணவு)',
    dinnerHint: 'இரவு உணவு (08:00 PM – 09:30 PM)',
    takenAt: 'எடுக்கப்பட்டது',
    markTaken: 'எடுத்ததாகக் குறிக்கவும்',
    afterFood: 'உணவுக்குப் பின்',
    searchPlaceholder: 'மருந்துகள் அல்லது மருத்துவரைத் தேடுங்கள்…',
    noRecords: 'மருத்துவப் பதிவுகள் எதுவும் இல்லை.',
    printSlip: 'சீட்டு காண்க / அச்சிடு',
    doctorLabel: 'மருத்துவர்',
    hospitalLabel: 'மருத்துவமனை',
  },
}

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

  const langKey = language || 'en'
  const text = HISTORY_I18N[langKey] || HISTORY_I18N.en
  const speechCode = LANGUAGE_SPEECH_CODES[langKey] || 'en-IN'

  const [reports, setReports] = useState([])
  const [search, setSearch] = useState('')
  const [activeSection, setActiveSection] = useState('pill_tracker') // 'pill_tracker' | 'prescriptions' | 'triage' | 'all'
  const [filterUrgency, setFilterUrgency] = useState('all')
  const [loading, setLoading] = useState(false)
  const [syncNotice, setSyncNotice] = useState('')
  const [isSpeakingSchedule, setIsSpeakingSchedule] = useState(false)

  // Pill Adherence state: Map of "reportId_medIndex_slot" -> { taken: boolean, takenAt: string, medName: string }
  const [takenMap, setTakenMap] = useState(() => {
    try {
      const saved = localStorage.getItem('asl:pill_adherence_v1')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

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
          hospital_name: 'Primary Health Centre, Rampur',
          hospital_distance: 2.3,
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
              foodInstruction: 'Take first thing in morning with water',
              schedule: 'Morning (☀️ 07:30 AM)',
              duration: '5 Days',
              purpose: 'Reduces stomach acid & gastric burning',
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
              purpose: 'Fever and severe body pain relief',
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
              purpose: 'Continuous hydration & vital electrolytes',
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
              purpose: 'Relieves runny nose, sneezing & throat allergy',
            },
          ],
          doctor_notes: 'Facial Signs: Mild pallor. Pain Score: 65%. Physical Injuries: None detected.',
          risk_factors: ['Fever > 101°F'],
        },
      ]
    }

    setReports(loadedReports)
    setLoading(false)
  }

  useEffect(() => {
    loadReports()
  }, [])

  // Toggle Pill Taken state
  const togglePillTaken = (doseKey, medName) => {
    setTakenMap((prev) => {
      const isCurrentlyTaken = !!prev[doseKey]?.taken
      const now = new Date()
      const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      const updated = {
        ...prev,
        [doseKey]: {
          taken: !isCurrentlyTaken,
          takenAt: !isCurrentlyTaken ? timeString : '',
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

  ;(reports || []).forEach((rep) => {
    if (!rep) return
    const medList = Array.isArray(rep.medicines_list) ? rep.medicines_list : []
    medList.forEach((med, idx) => {
      if (!med) return
      const medObj =
        typeof med === 'string'
          ? {
              name: med,
              dosage: '1 Dose',
              exactTime: '08:00 AM',
              timing: 'After Food',
              purpose: 'Clinical Medication',
              schedule: 'Morning',
            }
          : med

      const keyBase = `${rep.id || 'rx'}_${idx}`
      const slotLower = String(medObj.slot || medObj.schedule || medObj.timing || '').toLowerCase()

      const doseObj = {
        ...medObj,
        name: medObj.name || (typeof med === 'string' ? med : 'Prescribed Tablet'),
        reportId: rep.id || `rep_${idx}`,
        patientName: rep.patient_name || rep.name || 'Citizen Patient',
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
          slotLabel: text.morningSlot,
          slotTime: medObj.exactTime?.includes('07:30') ? '07:30 AM' : '08:00 AM',
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
          slotLabel: text.afternoonSlot,
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
          slotLabel: text.nightSlot,
          slotTime: '08:30 PM',
        })
      }
    })
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

  const rxCount = reports.filter(
    (r) => r.is_prescription || r.id?.startsWith('RX') || r.medicines_list?.length
  ).length

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-6 py-3 sm:py-6 space-y-3 sm:space-y-5 pb-20">
      {/* 1. Mobile-Optimized Top Action Row */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => go('home')}
          className="tap-press inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs hover:bg-slate-50 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-blue-600" />
          <span>{text.backHome}</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => loadReports()}
            className="tap-press inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-white border border-slate-200 px-2.5 py-1.5 rounded-xl shadow-2xs hover:bg-slate-50 transition-all"
            title="Sync from SQLite Database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            <span className="hidden xs:inline">{text.sync}</span>
          </button>

          <button
            type="button"
            onClick={() => startVideoCall()}
            className="tap-press inline-flex items-center gap-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-xl shadow-sm transition-all"
          >
            <Video className="w-3.5 h-3.5" />
            <span>{text.consultDoctor}</span>
          </button>
        </div>
      </div>

      {/* 2. Header Banner Card */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-xl border border-blue-700/30">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0">
              <Pill className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-300 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.2 rounded-full border border-emerald-400/20 truncate">
                  {text.vaultTag}
                </span>
              </div>
              <h1 className="text-sm sm:text-xl font-bold font-display text-white truncate mt-0.5">
                {text.vaultTitle}
              </h1>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] text-blue-200 block font-mono">{text.todaysDoses}</span>
            <strong className="text-xs sm:text-sm font-bold text-emerald-300">
              {takenDosesCount}/{totalDosesCount} {text.dosesTaken}
            </strong>
          </div>
        </div>
      </div>

      {/* 3. Sticky Segmented Control with FULL Forms for Rx & Triage */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 bg-slate-200/80 rounded-2xl text-[11px] font-bold">
        <button
          type="button"
          onClick={() => setActiveSection('pill_tracker')}
          className={`tap-press py-2.5 px-2 rounded-xl text-center transition-all flex items-center justify-center gap-1.5 ${
            activeSection === 'pill_tracker'
              ? 'bg-white text-emerald-800 shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="truncate">{text.tabTimings}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('prescriptions')}
          className={`tap-press py-2.5 px-2 rounded-xl text-center transition-all flex items-center justify-center gap-1.5 ${
            activeSection === 'prescriptions'
              ? 'bg-white text-blue-800 shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Pill className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="truncate">{text.tabRx} ({rxCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('triage')}
          className={`tap-press py-2.5 px-2 rounded-xl text-center transition-all flex items-center justify-center gap-1.5 ${
            activeSection === 'triage'
              ? 'bg-white text-indigo-800 shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span className="truncate">{text.tabTriage}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('all')}
          className={`tap-press py-2.5 px-2 rounded-xl text-center transition-all flex items-center justify-center gap-1.5 ${
            activeSection === 'all'
              ? 'bg-white text-slate-900 shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <span className="truncate">{text.tabAll} ({reports.length})</span>
        </button>
      </div>

      {/* VIEW 1: DAILY PILL TRACKER & TIMINGS SCHEDULE */}
      {activeSection === 'pill_tracker' && (
        <div className="space-y-3 sm:space-y-4">
          {/* Adherence Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {text.adherenceMeter}
                </span>
                <h3 className="text-xs sm:text-base font-extrabold text-slate-900 mt-1">
                  {text.timetableTitle} ({takenDosesCount}/{totalDosesCount} {text.dosesTaken})
                </h3>
              </div>

              <button
                type="button"
                onClick={speakPillScheduleAloud}
                className={`tap-press px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                  isSpeakingSchedule
                    ? 'bg-emerald-600 text-white border-emerald-600 animate-pulse'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{text.hearVoice}</span>
              </button>
            </div>

            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${adherencePercent}%` }}
              />
            </div>
          </div>

          {/* Morning Doses Slot */}
          {categorizedDoses.morning.length > 0 && (
            <div className="bg-amber-50/40 border border-amber-200 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">
                      {text.morningSlot}
                    </h4>
                    <p className="text-[10.5px] text-amber-900/80 font-medium">
                      {text.breakfastHint}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md">
                  {categorizedDoses.morning.length} Tablets
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {categorizedDoses.morning.map((med) => {
                  const isTaken = !!takenMap[med.key]?.taken
                  return (
                    <div
                      key={med.key}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isTaken
                          ? 'bg-emerald-50/70 border-emerald-300'
                          : 'bg-white border-slate-200 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h5 className="font-bold text-xs sm:text-sm text-slate-900">
                            {med.name}
                          </h5>
                          <p className="text-[11px] text-blue-700 font-medium mt-0.5">
                            🎯 {med.purpose}
                          </p>
                          <span className="inline-block text-[10px] text-slate-500 mt-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 font-mono">
                            🍽️ {med.timing || text.afterFood}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => togglePillTaken(med.key, med.name)}
                        className={`tap-press mt-3 w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          isTaken
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>
                          {isTaken
                            ? `${text.takenAt} ${takenMap[med.key]?.takenAt}`
                            : text.markTaken}
                        </span>
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Afternoon Doses Slot */}
          {categorizedDoses.afternoon.length > 0 && (
            <div className="bg-orange-50/40 border border-orange-200 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold">
                    <Sunset className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">
                      {text.afternoonSlot}
                    </h4>
                    <p className="text-[10.5px] text-orange-900/80 font-medium">
                      {text.lunchHint}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-orange-100 text-orange-800 rounded-md">
                  {categorizedDoses.afternoon.length} Tablets
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {categorizedDoses.afternoon.map((med) => {
                  const isTaken = !!takenMap[med.key]?.taken
                  return (
                    <div
                      key={med.key}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isTaken
                          ? 'bg-emerald-50/70 border-emerald-300'
                          : 'bg-white border-slate-200 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h5 className="font-bold text-xs sm:text-sm text-slate-900">
                            {med.name}
                          </h5>
                          <p className="text-[11px] text-blue-700 font-medium mt-0.5">
                            🎯 {med.purpose}
                          </p>
                          <span className="inline-block text-[10px] text-slate-500 mt-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 font-mono">
                            🍽️ {med.timing || text.afterFood}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => togglePillTaken(med.key, med.name)}
                        className={`tap-press mt-3 w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          isTaken
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>
                          {isTaken
                            ? `${text.takenAt} ${takenMap[med.key]?.takenAt}`
                            : text.markTaken}
                        </span>
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Night Doses Slot */}
          {categorizedDoses.night.length > 0 && (
            <div className="bg-indigo-50/40 border border-indigo-200 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                    <Moon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">
                      {text.nightSlot}
                    </h4>
                    <p className="text-[10.5px] text-indigo-900/80 font-medium">
                      {text.dinnerHint}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-md">
                  {categorizedDoses.night.length} Tablets
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {categorizedDoses.night.map((med) => {
                  const isTaken = !!takenMap[med.key]?.taken
                  return (
                    <div
                      key={med.key}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isTaken
                          ? 'bg-emerald-50/70 border-emerald-300'
                          : 'bg-white border-slate-200 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h5 className="font-bold text-xs sm:text-sm text-slate-900">
                            {med.name}
                          </h5>
                          <p className="text-[11px] text-blue-700 font-medium mt-0.5">
                            🎯 {med.purpose}
                          </p>
                          <span className="inline-block text-[10px] text-slate-500 mt-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 font-mono">
                            🍽️ {med.timing || text.afterFood}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => togglePillTaken(med.key, med.name)}
                        className={`tap-press mt-3 w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          isTaken
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>
                          {isTaken
                            ? `${text.takenAt} ${takenMap[med.key]?.takenAt}`
                            : text.markTaken}
                        </span>
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2, 3, 4: PRESCRIPTIONS & TRIAGE LIST */}
      {activeSection !== 'pill_tracker' && (
        <div className="space-y-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div>
                  <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {report.id}
                  </span>
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900 mt-1">
                    {report.diagnosis || report.symptoms}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {text.doctorLabel}: <strong>{report.doctor_name || 'Dr. Rajesh Sharma (MD)'}</strong> • {report.created_at}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveSlip(report)}
                  className="tap-press px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{text.printSlip}</span>
                </button>
              </div>

              {/* Prescribed Medicines Chips */}
              {report.medicines_list && report.medicines_list.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-700">
                    {text.tabRx}:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {report.medicines_list.map((m, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
                      >
                        <strong className="text-slate-900 block">{m.name}</strong>
                        <span className="text-blue-700 text-[10.5px] font-medium block">
                          🎯 {m.purpose}
                        </span>
                        <span className="text-slate-500 text-[10px] font-mono">
                          ⏰ {m.schedule || m.exactTime} • {m.timing}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hospital Tag */}
              {report.hospital_name && (
                <div className="flex items-center gap-1.5 text-xs text-slate-600 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>
                    {text.hospitalLabel}: <strong>{report.hospital_name}</strong> ({report.hospital_distance || '2.3'} km)
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
