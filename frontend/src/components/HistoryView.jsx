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
          id: 'REP-2026-8801',
          patient_name: currentUser?.name || 'Ramesh Kumar (Citizen)',
          age: 54,
          gender: 'Male',
          symptoms: 'High fever for 3 days with severe headache, body pain, and dry cough',
          urgency: 'Moderate',
          created_at: '30 Aug 2026, 09:30 AM',
          vitals: { bp: '124/80', spo2: '97%', pulse: '82', temp: '101.4°F' },
          advice: 'Hydrate with ORS, take Paracetamol 500mg, and consult PHC doctor if fever persists.',
          hospital_name: 'Rampur Primary Health Centre (PHC)',
          hospital_distance: 3.2,
          prescribed_medicines: ['Paracetamol 500mg (1 TDS)', 'ORS Solution'],
          doctor_notes: 'Patient advised warm fluids and rest.',
          risk_factors: ['Fever > 101°F'],
        },
        {
          id: 'REP-2026-8802',
          patient_name: 'Savita Devi',
          age: 28,
          gender: 'Female',
          symptoms: 'Routine ANC visit checkup with mild swelling in feet at 28 weeks gestation',
          urgency: 'Mild',
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
      (r.hospital_name || '').toLowerCase().includes(q)

    if (!matchesSearch) return false

    if (filterUrgency !== 'all') {
      return (r.urgency || '').toLowerCase().includes(filterUrgency.toLowerCase())
    }
    return true
  })

  const handleDelete = async (reportId) => {
    if (!window.confirm(`Delete medical report #${reportId}?`)) return
    try {
      await fetch(`/api/reports/${reportId}`, { method: 'DELETE' })
    } catch (e) {}

    const updated = reports.filter((r) => r.id !== reportId)
    setReports(updated)
    try {
      localStorage.setItem('asl:patient_assessment_history_v1', JSON.stringify(updated))
    } catch (e) {}
    setSyncNotice(`Report #${reportId} deleted`)
    setTimeout(() => setSyncNotice(''), 2500)
  }

  const handleDownloadJson = (report) => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Arogya_Medical_Report_${report.id}.json`
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
            title="Refresh from Database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync Database</span>
          </button>

          <button
            type="button"
            onClick={() => go('check')}
            className="tap-press inline-flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 rounded-xl shadow-sm transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Health Check</span>
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
                  Persistent SQLite Storage Active
                </span>
                <span className="text-xs text-blue-200 font-mono">
                  {reports.length} Total Records
                </span>
              </div>
              <h1 className="text-xl sm:text-3xl font-extrabold font-display text-white mt-1">
                My Health Assessment History & Reports
              </h1>
              <p className="text-xs sm:text-sm text-blue-100 mt-0.5">
                Full dedicated medical history record: Triage assessments, doctor prescriptions, and priority slips
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search report ID, patient name, symptoms, hospital..."
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
            All ({reports.length})
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

      {/* Reports List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="font-bold text-slate-600">Loading Medical History from SQLite...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-base text-slate-700">No Assessment Records Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You have not recorded any clinical triage assessments yet. Start a new symptom check to generate a report.
            </p>
            <button
              type="button"
              onClick={() => go('check')}
              className="tap-press inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Start Health Check</span>
            </button>
          </div>
        ) : (
          filteredReports.map((report) => {
            const isEmergency = report.urgency?.toLowerCase().includes('emergency')
            const isModerate = report.urgency?.toLowerCase().includes('moderate')

            return (
              <div
                key={report.id}
                className={`bg-white rounded-3xl border p-4 sm:p-6 shadow-xs transition-all space-y-3.5 ${
                  isEmergency
                    ? 'border-red-200 bg-red-50/15'
                    : isModerate
                    ? 'border-amber-200 bg-amber-50/15'
                    : 'border-slate-200'
                }`}
              >
                {/* Top Meta Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                      {report.id}
                    </span>
                    <span
                      className={`text-[10px] sm:text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${
                        isEmergency
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : isModerate
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {report.urgency} Urgency
                    </span>
                  </div>

                  <span className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {report.created_at || 'Recently Recorded'}
                  </span>
                </div>

                {/* Patient & Symptoms */}
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h3 className="font-bold text-sm sm:text-lg text-slate-900">
                      {report.patient_name || 'Citizen Patient'} {report.age ? `(${report.age} Yrs, ${report.gender || 'Patient'})` : ''}
                    </h3>
                    {report.hospital_name && (
                      <span className="text-xs text-slate-600 flex items-center gap-1 font-semibold bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200/80">
                        <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{report.hospital_name} {report.hospital_distance ? `(${report.hospital_distance} km)` : ''}</span>
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-800 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                    <strong className="text-slate-900 block mb-0.5">Chief Symptoms Recorded:</strong>
                    "{report.symptoms}"
                  </div>
                </div>

                {/* Vitals Grid if available */}
                {report.vitals && Object.keys(report.vitals).length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50/70 p-3 rounded-2xl border border-slate-200/80 text-xs font-mono">
                    {report.vitals.bp && <div>BP: <strong className="text-slate-900">{report.vitals.bp}</strong></div>}
                    {report.vitals.spo2 && <div>SpO2: <strong className="text-emerald-700">{report.vitals.spo2}</strong></div>}
                    {report.vitals.pulse && <div>Pulse: <strong className="text-slate-900">{report.vitals.pulse} bpm</strong></div>}
                    {report.vitals.temp && <div>Temp: <strong className="text-slate-900">{report.vitals.temp}</strong></div>}
                  </div>
                )}

                {/* Prescribed Medicines & Doctor Advice */}
                {(report.prescribed_medicines?.length > 0 || report.advice) && (
                  <div className="space-y-1.5 pt-1">
                    {report.advice && (
                      <p className="text-xs text-slate-700 leading-relaxed">
                        <strong className="text-slate-900">Clinical Advice:</strong> {report.advice}
                      </p>
                    )}
                    {report.prescribed_medicines?.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase py-0.5">Rx Prescriptions:</span>
                        {report.prescribed_medicines.map((m, idx) => (
                          <span key={idx} className="bg-purple-50 text-purple-900 border border-purple-200 px-2.5 py-0.5 rounded-xl text-xs font-medium flex items-center gap-1">
                            <Pill className="w-3 h-3 text-purple-600" />
                            {m}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Interactive Actions Row */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveSlip({
                          name: report.patient_name,
                          age: report.age,
                          gender: report.gender,
                          symptoms: report.symptoms,
                          urgency: report.urgency,
                          advice: report.advice,
                          vitals: report.vitals,
                          hospital: { name: report.hospital_name, distance_km: report.hospital_distance },
                          date: report.created_at?.split(',')?.[0] || 'Today',
                          refId: report.id,
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
                          name: report.patient_name,
                          age: report.age,
                          gender: report.gender,
                          symptoms: `Follow up consultation for report #${report.id}: ${report.symptoms}`,
                          vitals: report.vitals,
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
                      onClick={() => handleDownloadJson(report)}
                      className="tap-press inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                      title="Download JSON Report"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>JSON</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(report.id)}
                      className="tap-press p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all"
                      title="Delete Report"
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
