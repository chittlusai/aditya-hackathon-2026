import { useState } from 'react'
import {
  Activity,
  Trash2,
  FileText,
  CheckCircle2,
  User,
  Search,
  Stethoscope,
  Users,
  Loader2,
  ShieldCheck,
  Phone,
  Calendar,
  Building2,
  AlertTriangle,
  Heart,
  Baby,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  RefreshCw,
} from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import VoiceInput from './VoiceInput.jsx'
import VisualSymptomSelector from './VisualSymptomSelector.jsx'
import { analyzeSymptomsWithGemini } from '../utils/geminiAi.js'
import { classifyLocalUrgency, matchLocalHospital } from '../utils/localTriage.js'
import confetti from 'canvas-confetti'

export default function AshaWorkerPortal() {
  const {
    t,
    patientRecords,
    savePatientRecord,
    deletePatientRecord,
    setActiveSlip,
    hospitals,
    userCoords,
    language,
    highRiskWatchlist,
    mchRecords,
    chronicCareData,
    createNewReferral,
    setSelectedReferral,
    setReferralTrackerModalOpen,
  } = useApp()

  const [form, setForm] = useState({
    name: '',
    phone: '',
    age: '',
    gender: 'Female',
    symptoms: '',
    spo2: '',
    pulse: '',
    bp: '',
    temp: '',
    sugar: '',
    isPregnant: false,
  })

  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('new') // 'new' | 'watchlist' | 'mch' | 'chronic' | 'registry'
  const [syncStatus, setSyncStatus] = useState('All 185 Households Synced')

  const handleVisualSymptomSelect = (item) => {
    const symptomName = item.translations?.[language]?.title || item.translations?.en?.title || item.tag
    setForm((prev) => {
      if (!prev.symptoms) return { ...prev, symptoms: symptomName }
      const parts = prev.symptoms.split(',').map((s) => s.trim()).filter(Boolean)
      if (parts.some((p) => p.toLowerCase() === symptomName.toLowerCase() || p.toLowerCase() === item.tag.toLowerCase())) {
        return {
          ...prev,
          symptoms: parts.filter((p) => p.toLowerCase() !== symptomName.toLowerCase() && p.toLowerCase() !== item.tag.toLowerCase()).join(', ')
        }
      }
      return { ...prev, symptoms: [...parts, symptomName].join(', ') }
    })
  }

  const handleVoiceTranscript = (text) => {
    setForm((prev) => ({
      ...prev,
      symptoms: prev.symptoms ? `${prev.symptoms}, ${text}` : text,
    }))
  }

  const handleTriageSubmit = async (e) => {
    e?.preventDefault?.()
    if (!form.name.trim() && !form.symptoms.trim()) {
      alert('Please enter at least the patient name or describe symptoms.')
      return
    }

    setLoading(true)

    const vitals = {
      age: form.age,
      spo2: form.spo2,
      pulse: form.pulse,
      bp: form.bp,
      temp: form.temp,
      sugar: form.sugar,
      isPregnant: form.isPregnant,
    }

    let urgencyResult = null

    try {
      urgencyResult = await analyzeSymptomsWithGemini(
        form.symptoms || 'General weakness and illness checkup',
        vitals,
        language
      )
    } catch (err) {
      console.warn('Falling back to local ASHA triage rule engine:', err)
      urgencyResult = classifyLocalUrgency(form.symptoms, vitals, language)
    }

    const matchResult = matchLocalHospital(urgencyResult.urgency, form.symptoms, hospitals, userCoords)

    const savedRecord = savePatientRecord({
      name: form.name || 'Anonymous Resident',
      phone: form.phone,
      age: form.age,
      gender: form.gender,
      symptoms: form.symptoms,
      vitals,
      urgency: urgencyResult.urgency,
      advice: urgencyResult.advice,
      hospital: matchResult?.best,
      risk_factors: urgencyResult.risk_factors || [],
    })

    // If emergency, auto generate referral
    if (urgencyResult.urgency === 'Emergency') {
      const ref = createNewReferral({
        patientName: form.name || 'Resident',
        age: form.age || 30,
        gender: form.gender,
        phone: form.phone,
        village: 'Rampur Village',
        originFacility: 'Rampur Sub-Centre (ASHA Anita)',
        targetFacility: matchResult?.best?.name || 'Gangaon CHC',
        specialtyRequired: urgencyResult.suggested_specialist || 'Emergency Care',
        urgency: 'Emergency',
        reasonForReferral: form.symptoms,
        vitals,
      })
      setSelectedReferral(ref)
      setReferralTrackerModalOpen(true)
    }

    confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } })
    setLoading(false)

    setActiveSlip({
      name: savedRecord.name,
      phone: savedRecord.phone,
      age: savedRecord.age,
      gender: savedRecord.gender,
      symptoms: savedRecord.symptoms,
      urgency: savedRecord.urgency,
      advice: savedRecord.advice,
      vitals: savedRecord.vitals,
      hospital: savedRecord.hospital,
      date: savedRecord.displayDate,
      refId: savedRecord.id,
      risk_factors: savedRecord.risk_factors,
    })

    // Reset form
    setForm({
      name: '',
      phone: '',
      age: '',
      gender: 'Female',
      symptoms: '',
      spo2: '',
      pulse: '',
      bp: '',
      temp: '',
      sugar: '',
      isPregnant: false,
    })
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-5">
      {/* Frontline ASHA Super-App Header Banner */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-900 to-slate-900 text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-purple-600/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-600/30 border border-purple-400/30 flex items-center justify-center shrink-0">
            <Users className="w-7 h-7 text-purple-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Offline-First Field Mode Active
              </span>
              <span className="text-xs text-purple-200 font-mono">ASHA ID: #ASHA-404</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-display mt-1">
              Anita Devi • ASHA Field Super-App
            </h1>
            <p className="text-xs text-purple-100 mt-0.5">
              Rampur Sector Sub-Centre • 185 Assigned Households (Ward 1–4)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={() => {
              setSyncStatus('Syncing 3 offline records with PHC...')
              setTimeout(() => setSyncStatus('All Records Synced (0 Pending)'), 1200)
            }}
            className="tap-press px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-center flex items-center gap-1.5 text-xs font-bold"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin-slow" />
            <span>{syncStatus}</span>
          </button>
        </div>
      </div>

      {/* 5 Super-App Navigation Tabs */}
      <div className="flex items-center gap-1.5 sm:gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('new')}
          className={`tap-press px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'new'
              ? 'bg-purple-700 text-white shadow-sm'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5" />
          <span>1. Household Intake</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('watchlist')}
          className={`tap-press px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'watchlist'
              ? 'bg-purple-700 text-white shadow-sm'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          <span>2. High-Risk Watchlist ({highRiskWatchlist.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('mch')}
          className={`tap-press px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'mch'
              ? 'bg-purple-700 text-white shadow-sm'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <Baby className="w-3.5 h-3.5 text-pink-500" />
          <span>3. Maternal & Child (MCH)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('chronic')}
          className={`tap-press px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'chronic'
              ? 'bg-purple-700 text-white shadow-sm'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <Heart className="w-3.5 h-3.5 text-red-500" />
          <span>4. Chronic Care (NCD)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('registry')}
          className={`tap-press px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'registry'
              ? 'bg-purple-700 text-white shadow-sm'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>5. Village Registry ({patientRecords.length})</span>
        </button>
      </div>

      {/* TAB 1: HOUSEHOLD INTAKE & SCREENING */}
      {activeTab === 'new' && (
        <form onSubmit={handleTriageSubmit} className="space-y-4">
          <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
              <User className="w-4 h-4 text-purple-600" />
              <span>1. Resident Demographics & Household Code</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Resident Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Savita Devi"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm outline-none focus:bg-white focus:border-purple-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Mobile Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="e.g. 98221 55601"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm outline-none focus:bg-white focus:border-purple-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Age (Years)</label>
                <input
                  type="number"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  placeholder="e.g. 28"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm outline-none focus:bg-white focus:border-purple-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Gender</label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm outline-none focus:bg-white focus:border-purple-600"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Vitals Kit (Field Measurements) */}
          <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-600" />
              <span>2. ASHA Diagnostic Kit Vitals (Field Measurements)</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">Blood Pressure</label>
                <input
                  type="text"
                  placeholder="120/80"
                  value={form.bp}
                  onChange={(e) => setForm({ ...form, bp: e.target.value })}
                  className="w-full p-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">SpO2 Oxygen (%)</label>
                <input
                  type="number"
                  placeholder="98"
                  value={form.spo2}
                  onChange={(e) => setForm({ ...form, spo2: e.target.value })}
                  className="w-full p-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">Pulse (bpm)</label>
                <input
                  type="number"
                  placeholder="76"
                  value={form.pulse}
                  onChange={(e) => setForm({ ...form, pulse: e.target.value })}
                  className="w-full p-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">Temp (°F)</label>
                <input
                  type="text"
                  placeholder="98.6"
                  value={form.temp}
                  onChange={(e) => setForm({ ...form, temp: e.target.value })}
                  className="w-full p-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">Sugar (mg/dL)</label>
                <input
                  type="number"
                  placeholder="110"
                  value={form.sugar}
                  onChange={(e) => setForm({ ...form, sugar: e.target.value })}
                  className="w-full p-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="pregnantCheck"
                  checked={form.isPregnant}
                  onChange={(e) => setForm({ ...form, isPregnant: e.target.checked })}
                  className="w-4 h-4 rounded text-purple-600"
                />
                <label htmlFor="pregnantCheck" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Pregnant (ANC)
                </label>
              </div>
            </div>
          </div>

          {/* Visual Symptom Selector */}
          <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-3">
            <VisualSymptomSelector
              onSelectSymptom={handleVisualSymptomSelect}
              selectedSymptoms={form.symptoms ? form.symptoms.split(',').map((s) => s.trim()) : []}
            />

            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-700">Recorded Symptoms:</label>
              <VoiceInput onTranscript={handleVoiceTranscript} disabled={loading} />
            </div>

            <textarea
              rows={2}
              value={form.symptoms}
              onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
              placeholder="Click cards above or speak symptoms in your language..."
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 text-xs outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="tap-press w-full py-3.5 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Running Rural Clinical Triage & Facility Matching...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Household Intake & Generate Digital Referral Slip</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* TAB 2: HIGH-RISK PATIENT WATCHLIST (Feature 13) */}
      {activeTab === 'watchlist' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                High-Risk Patient Watchlist (Feature 13)
              </h3>
              <p className="text-xs text-slate-500">
                Flagged village residents needing close follow-up for chronic illness, maternal risk, or missed appointments.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
            {highRiskWatchlist.map((w) => (
              <div
                key={w.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                        {w.id} • {w.village}
                      </span>
                      <h4 className="font-bold text-sm sm:text-base text-slate-900 leading-snug mt-1">
                        {w.patientName} ({w.age})
                      </h4>
                    </div>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                      {w.riskLevel} Risk
                    </span>
                  </div>

                  <p className="text-xs font-bold text-purple-900 bg-purple-50 p-2 rounded-xl border border-purple-100">
                    {w.riskCategory}
                  </p>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong>Findings:</strong> {w.keyFindings}
                  </p>

                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 font-medium">
                    <strong>Action:</strong> {w.actionRequired}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">Next Due: {w.nextScheduledVisit}</span>
                  <a
                    href={`tel:${w.phone}`}
                    className="tap-press px-2.5 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold flex items-center gap-1 text-[11px]"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MATERNAL & CHILD CARE (MCH) PATHWAY (Feature 14) */}
      {activeTab === 'mch' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Maternal & Child Health (MCH) Care Pathway (Feature 14)
            </h3>
            <p className="text-xs text-slate-500">
              Structured antenatal care journeys (ANC 1–4), institutional delivery plans, and immunization schedules.
            </p>
          </div>

          {mchRecords.map((m) => (
            <div key={m.id} className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold bg-pink-50 text-pink-700 px-2 py-0.5 rounded border border-pink-200">
                      {m.id} • Gravida {m.gravida}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Gestation: {m.gestationWeeks}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mt-1">
                    {m.motherName} (W/o {m.husbandName}) • {m.village}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Estimated Date of Delivery (EDD): <strong>{m.edd}</strong> • LMP: {m.lmp}
                  </p>
                </div>

                <div className="text-right self-start sm:self-auto">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Delivery Facility</span>
                  <span className="text-xs font-bold text-purple-900">{m.institutionalDeliveryPlan}</span>
                </div>
              </div>

              {/* 4 ANC Visits Progress */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 block">Antenatal Care (ANC) Visits Timeline:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                  {m.ancVisits.map((v, i) => (
                    <div
                      key={v.visit}
                      className={`p-3 rounded-2xl border text-xs space-y-1 ${
                        v.status === 'Completed'
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[11px]">{v.visit.split('(')[0]}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          v.status === 'Completed' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {v.status}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-500">{v.date}</p>
                      <p className="text-[11px] font-mono">BP: {v.bp} • Hb: {v.hb}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: CHRONIC CARE COMPANION (Feature 15) */}
      {activeTab === 'chronic' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Chronic Care Companion — NCD Longitudinal Monitoring (Feature 15)
            </h3>
            <p className="text-xs text-slate-500">
              Longitudinal tracking for Diabetes & Hypertension with medication adherence streaks and vitals history.
            </p>
          </div>

          {chronicCareData.map((c) => (
            <div key={c.id} className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                    {c.id} • {c.disease}
                  </span>
                  <h4 className="text-base font-bold text-slate-900 mt-1">
                    {c.patientName} ({c.age}y)
                  </h4>
                </div>

                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
                  🔥 Adherence Streak: {c.adherenceStreak}
                </span>
              </div>

              {/* Vitals Comparison Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Baseline BP</span>
                  <span className="font-bold text-slate-600">{c.baselineBP}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Current BP</span>
                  <span className="font-bold text-emerald-700 text-sm">{c.currentBP}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Baseline Sugar</span>
                  <span className="font-bold text-slate-600">{c.baselineSugar}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Current Sugar</span>
                  <span className="font-bold text-emerald-700 text-sm">{c.currentSugar}</span>
                </div>
              </div>

              <div className="text-xs space-y-1">
                <span className="font-bold text-slate-700 block">Prescribed Daily Medicines:</span>
                <div className="flex flex-wrap gap-1.5">
                  {c.prescriptions.map((rx) => (
                    <span key={rx} className="bg-purple-50 text-purple-800 px-2 py-0.5 rounded-lg border border-purple-200 font-medium">
                      {rx}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: VILLAGE PATIENT REGISTRY (Feature 07 & 16) */}
      {activeTab === 'registry' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Village Resident Registry ({patientRecords.length} Records)
              </h3>
              <p className="text-xs text-slate-500">
                Offline records cached securely on this device with referral slip re-print options.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient name..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs outline-none"
              />
            </div>
          </div>

          {patientRecords.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No patient records registered yet. Use Tab 1 to screen residents.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {patientRecords
                .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((p) => (
                  <div
                    key={p.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900">{p.name}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                          p.urgency === 'Emergency' ? 'bg-red-600 text-white' : 'bg-amber-100 text-amber-900'
                        }`}>
                          {p.urgency}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Age: {p.age} • {p.gender} • Date: {p.displayDate}
                      </p>
                      <p className="text-slate-600 line-clamp-1 mt-0.5">{p.symptoms}</p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveSlip({
                            name: p.name,
                            phone: p.phone,
                            age: p.age,
                            gender: p.gender,
                            symptoms: p.symptoms,
                            urgency: p.urgency,
                            advice: p.advice,
                            vitals: p.vitals,
                            hospital: p.hospital,
                            date: p.displayDate,
                            refId: p.id,
                            risk_factors: p.risk_factors,
                          })
                        }
                        className="tap-press px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold border border-purple-200 flex items-center gap-1 text-[11px]"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Print Slip</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => deletePatientRecord(p.id)}
                        className="tap-press p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
