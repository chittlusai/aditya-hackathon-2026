import { useState } from 'react'
import { Activity, Trash2, FileText, CheckCircle2, User, Search, Stethoscope, Users, Loader2, ShieldCheck } from 'lucide-react'
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
    language
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
  const [activeTab, setActiveTab] = useState('new') // 'new' | 'registry'

  const handleVisualSymptomSelect = (item) => {
    const symptomName = language === 'hi' ? item.titleHi : language === 'mr' ? item.titleMr : item.titleEn
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
      // 1. Clinical Analysis
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
      urgency: urgencyResult.urgency,
      advice: urgencyResult.advice,
      vitals,
      hospital: matchResult?.best,
      ai_powered: urgencyResult.ai_powered ?? true,
    })

    try {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } })
    } catch (e) {}

    setActiveSlip({
      ...savedRecord,
      hospital: matchResult?.best,
    })

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
    setLoading(false)
  }

  const filteredRecords = patientRecords.filter((rec) =>
    (rec.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (rec.phone || '').includes(searchQuery) ||
    (rec.urgency || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
                  {t('bannerCategory')}
                </span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-blue-600" />
                  National Health Mission Portal
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display mt-0.5">
                {t('ashaTitle')}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('ashaSub')}
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('new')}
              className={`tap-press px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'new'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('tabNewIntake')}
            </button>
            <button
              onClick={() => setActiveTab('registry')}
              className={`tap-press px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'registry'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('tabVillageRegister')} ({patientRecords.length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'new' ? (
        <form onSubmit={handleTriageSubmit} className="space-y-4">
          {/* Patient Details */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <User className="w-4 h-4 text-blue-600" />
              {t('section1Demo')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
              <div className="sm:col-span-2">
                <label className="block text-xs text-slate-700 font-bold mb-1">{t('patientName')} *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rekha Devi"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 text-slate-900 bg-slate-50 focus:bg-white focus:border-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-700 font-bold mb-1">{t('patientPhone')}</label>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 text-slate-900 bg-slate-50 focus:bg-white focus:border-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-700 font-bold mb-1">{t('gender')}</label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 text-slate-900 bg-slate-50 focus:bg-white focus:border-blue-600 outline-none"
                >
                  <option value="Female">{t('female')}</option>
                  <option value="Male">{t('male')}</option>
                  <option value="Other">{t('other')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Vitals Assessment */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-blue-600" />
                {t('section2Vitals')}
              </h2>
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={form.isPregnant}
                  onChange={(e) => setForm({ ...form, isPregnant: e.target.checked })}
                  className="w-4 h-4 accent-blue-600 rounded"
                />
                <span>{t('isPregnant')}</span>
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="block text-[11px] text-slate-600 font-semibold mb-1">{t('spo2')}</label>
                <input
                  type="number"
                  placeholder="98"
                  value={form.spo2}
                  onChange={(e) => setForm({ ...form, spo2: e.target.value })}
                  className="w-full p-2.5 text-xs font-mono text-center rounded-xl border border-slate-300 text-slate-900 bg-slate-50 focus:bg-white focus:border-blue-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 font-semibold mb-1">{t('pulse')}</label>
                <input
                  type="number"
                  placeholder="76"
                  value={form.pulse}
                  onChange={(e) => setForm({ ...form, pulse: e.target.value })}
                  className="w-full p-2.5 text-xs font-mono text-center rounded-xl border border-slate-300 text-slate-900 bg-slate-50 focus:bg-white focus:border-blue-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 font-semibold mb-1">{t('bp')}</label>
                <input
                  type="text"
                  placeholder="120/80"
                  value={form.bp}
                  onChange={(e) => setForm({ ...form, bp: e.target.value })}
                  className="w-full p-2.5 text-xs font-mono text-center rounded-xl border border-slate-300 text-slate-900 bg-slate-50 focus:bg-white focus:border-blue-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 font-semibold mb-1">{t('temp')}</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="98.6"
                  value={form.temp}
                  onChange={(e) => setForm({ ...form, temp: e.target.value })}
                  className="w-full p-2.5 text-xs font-mono text-center rounded-xl border border-slate-300 text-slate-900 bg-slate-50 focus:bg-white focus:border-blue-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 font-semibold mb-1">{t('sugar')}</label>
                <input
                  type="number"
                  placeholder="110"
                  value={form.sugar}
                  onChange={(e) => setForm({ ...form, sugar: e.target.value })}
                  className="w-full p-2.5 text-xs font-mono text-center rounded-xl border border-slate-300 text-slate-900 bg-slate-50 focus:bg-white focus:border-blue-600 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Visual Problem Cards for ASHA Worker Intake */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <VisualSymptomSelector
              onSelectSymptom={handleVisualSymptomSelect}
              selectedSymptoms={form.symptoms ? form.symptoms.split(',').map((s) => s.trim()).filter(Boolean) : []}
            />
          </div>

          {/* Symptoms & Observation Box */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-sm font-bold text-slate-900">
                {t('section3Symptoms')}
              </h2>
              <VoiceInput onTranscript={handleVoiceTranscript} />
            </div>

            <textarea
              rows={3}
              value={form.symptoms}
              onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
              placeholder={language === 'hi' ? 'चित्र चुनने या बोलने पर लक्षण यहां जुड़ेंगे...' : 'Selected problems will appear here...'}
              className="w-full p-3 text-xs rounded-2xl border border-slate-300 text-slate-900 bg-slate-50 focus:bg-white focus:border-blue-600 outline-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="tap-press w-full min-h-[48px] rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>
                  {language === 'hi'
                    ? 'स्वास्थ्य ट्राइएज व रेफरल जांचा जा रहा है...'
                    : language === 'mr'
                    ? 'आरोग्य ट्राइएज तपासत आहे...'
                    : 'Evaluating Clinical Triage & Referral…'}
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{t('savePatient')}</span>
              </>
            )}
          </button>
        </form>
      ) : (
        /* Patient Registry List Table */
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">{t('villageRegisterTitle')}</h2>
              <p className="text-xs text-slate-500">{t('villageRegisterSub')}</p>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 w-64">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder={t('searchRecordsPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-xs text-slate-800 outline-none w-full"
              />
            </div>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              {t('noPatients')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-3">{t('thPatientName')}</th>
                    <th className="py-2.5 px-3">{t('thAgeGender')}</th>
                    <th className="py-2.5 px-3">{t('thDate')}</th>
                    <th className="py-2.5 px-3">{t('thUrgencyStatus')}</th>
                    <th className="py-2.5 px-3">{t('thAssignedPHC')}</th>
                    <th className="py-2.5 px-3 text-right">{t('thActions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{rec.name}</td>
                      <td className="py-2.5 px-3 text-slate-600">{rec.age ? `${rec.age} yrs` : '—'} / {rec.gender}</td>
                      <td className="py-2.5 px-3 text-slate-500">{new Date(rec.createdAt).toLocaleDateString()}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-md font-bold border ${
                          rec.urgency === 'Emergency'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : rec.urgency === 'Moderate'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {rec.urgency}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-800 font-medium truncate max-w-[180px]">
                        {rec.hospital?.name || 'Local PHC'}
                      </td>
                      <td className="py-2.5 px-3 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => setActiveSlip(rec)}
                          className="text-blue-600 hover:underline font-bold"
                        >
                          {t('actionPrint')}
                        </button>
                        <button
                          type="button"
                          onClick={() => deletePatientRecord(rec.id)}
                          className="text-red-600 hover:underline font-bold"
                        >
                          {t('actionDelete')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
