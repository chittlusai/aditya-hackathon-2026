import { useState, useEffect } from 'react'
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
} from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

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
  const [activeSection, setActiveSection] = useState('all') // 'all' | 'prescriptions' | 'triage'
  const [filterUrgency, setFilterUrgency] = useState('all') // 'all' | 'Emergency' | 'Moderate' | 'Mild'
  const [loading, setLoading] = useState(false)
  const [syncNotice, setSyncNotice] = useState('')

  // Load reports from backend SQLite database and localStorage
  const loadReports = async () => {
    setLoading(true)
    let loadedReports = []

    // 1. Try to fetch from SQLite backend API
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

    // 3. Fallback sample data if empty
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
            'Paracetamol 650mg Tablet (1 Tablet TDS after food)',
            'ORS Solution (1 Sachet in 1L boiled water)',
            'Cetirizine 10mg Tablet (1 Tablet at night)',
          ],
          medicines_list: [
            {
              name: 'Paracetamol 650mg Tablet',
              dosage: '1 Tablet',
              timing: 'After Food',
              schedule: 'Morning (☀️) • Afternoon (🌤️) • Night (🌙)',
              duration: '3 to 5 Days',
              purpose: 'Fever & body ache relief',
            },
            {
              name: 'ORS (Oral Rehydration Solution)',
              dosage: '1 Sachet in 1L Water',
              timing: 'Throughout the day',
              schedule: 'Sip frequently every 2 hours',
              duration: '3 Days',
              purpose: 'Continuous hydration & electrolytes',
            },
            {
              name: 'Cetirizine 10mg Tablet',
              dosage: '1 Tablet',
              timing: 'After Food',
              schedule: 'Night Only (🌙)',
              duration: '3 Days',
              purpose: 'Relieves runny nose and sneezing',
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
          prescribed_medicines: ['Iron Folic Acid (IFA) Tablets', 'Calcium Carbonate 500mg'],
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

    // Section Filter (Prescriptions vs Triage)
    if (activeSection === 'prescriptions') {
      if (!r.is_prescription && !r.id?.startsWith('RX') && !r.medicines_list?.length) {
        return false
      }
    } else if (activeSection === 'triage') {
      if (r.is_prescription || r.id?.startsWith('RX')) {
        return false
      }
    }

    // Urgency Filter
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
          className="tap-press inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs transition-all"
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
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 sm:p-8 shadow-xl border border-blue-700/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-blue-300" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-400/20 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-300" />
                  SQLite Medical Vault Active
                </span>
                <span className="text-xs text-blue-200 font-mono">
                  {reports.length} Total Records · {rxCount} Prescriptions
                </span>
              </div>
              <h1 className="text-xl sm:text-3xl font-extrabold font-display text-white mt-1">
                Medical Records & Prescriptions Vault
              </h1>
              <p className="text-xs sm:text-sm text-blue-100 mt-0.5">
                Official digital prescriptions, doctor tablet schedules, triage evaluations, and priority referral slips
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section Switcher Tabs: All vs Prescriptions & Tablets vs Triage */}
      <div className="grid grid-cols-3 gap-2 bg-slate-200/80 p-1.5 rounded-2xl">
        <button
          type="button"
          onClick={() => setActiveSection('all')}
          className={`tap-press py-2.5 px-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
            activeSection === 'all'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-blue-600" />
          <span>All Records ({reports.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('prescriptions')}
          className={`tap-press py-2.5 px-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
            activeSection === 'prescriptions'
              ? 'bg-white text-emerald-800 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Pill className="w-3.5 h-3.5 text-emerald-600" />
          <span>💊 Prescriptions & Tablets ({rxCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('triage')}
          className={`tap-press py-2.5 px-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
            activeSection === 'triage'
              ? 'bg-white text-blue-800 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
          <span>Triage Slips ({reports.length - rxCount})</span>
        </button>
      </div>

      {/* Search & Urgency Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search report ID, patient name, diagnosis, tablet, hospital..."
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

      {syncNotice && (
        <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold flex items-center justify-between shadow-xs">
          <span>{syncNotice}</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        </div>
      )}

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

                {/* Structured Prescribed Tablets List if present */}
                {record.medicines_list && record.medicines_list.length > 0 ? (
                  <div className="space-y-2 bg-emerald-50/40 p-3 rounded-2xl border border-emerald-200/80">
                    <span className="text-[11px] font-bold text-emerald-950 flex items-center gap-1">
                      <Pill className="w-3.5 h-3.5 text-emerald-600" />
                      Prescribed Tablets & Dosages:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {record.medicines_list.map((med, idx) => (
                        <div key={idx} className="bg-white p-2.5 rounded-xl border border-emerald-200 text-xs space-y-0.5">
                          <div className="flex items-center justify-between">
                            <strong className="text-emerald-900 font-bold">{med.name}</strong>
                            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              {med.duration}
                            </span>
                          </div>
                          <p className="text-slate-600 text-[11px]">
                            <strong>Dose:</strong> {med.dosage} · <strong className="text-blue-700">{med.timing || 'After Food'}</strong>
                          </p>
                          <div className="text-[10px] text-slate-500 font-mono">
                            🕒 {med.schedule || med.frequency}
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
  )
}
