import { useState } from 'react'
import { Activity, Trash2, FileText, CheckCircle2, User, Search, Stethoscope, Users, Loader2, ShieldCheck, Phone, Calendar, Building2 } from 'lucide-react'
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
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-5">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
                  {t('bannerCategory')}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-blue-600" />
                  National Health Mission Portal
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-bold text-slate-900 font-display mt-0.5">
                {t('ashaTitle')}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('ashaSub')}
              </p>
            </div>
          </div>

          {/* Responsive Tab Switcher */}
          <div className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('new')}
              className={`tap-press py-2 px-3 sm:px-4 rounded-lg text-xs font-bold text-center transition-all ${
                activeTab === 'new'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('tabNewIntake')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('registry')}
              className={`tap-press py-2 px-3 sm:px-4 rounded-lg text-xs font-bold text-center transition-all ${
                activeTab === 'registry'
                  ? 'bg-white text-slate-900 shadow-xs'
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
          {/* Patient Demographics */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <User className="w-4 h-4 text-blue-600" />
              <span>{t('section1Demo')}</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
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
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-blue-600" />
                <span>{t('section2Vitals')}</span>
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

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3">
              <div>
                <label className="block text-[11px] text-slate-600 font-semibold mb-1">{t('spo2')}</label>
                <input
                  type="number"
                  placeholder="98 %"
                  value={form.spo2}
                  onChange={(e) => setForm({ ...form, spo2: e.target.value })}
                  className="w-full p-2.5 text-xs font-mono text-center rounded-xl border border-slate-300 text-slate-900 bg-slate-50 focus:bg-white focus:border-blue-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 font-semibold mb-1">{t('pulse')}</label>
                <input
                  type="number"
                  placeholder="76 bpm"
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
                  placeholder="98.6 °F"
                  value={form.temp}
                  onChange={(e) => setForm({ ...form, temp: e.target.value })}
                  className="w-full p-2.5 text-xs font-mono text-center rounded-xl border border-slate-300 text-slate-900 bg-slate-50 focus:bg-white focus:border-blue-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 font-semibold mb-1">{t('sugar')}</label>
                <input
                  type="number"
                  placeholder="110 mg"
                  value={form.sugar}
                  onChange={(e) => setForm({ ...form, sugar: e.target.value })}
                  className="w-full p-2.5 text-xs font-mono text-center rounded-xl border border-slate-300 text-slate-900 bg-slate-50 focus:bg-white focus:border-blue-600 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Visual Problem Cards for ASHA Worker Intake */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs">
            <VisualSymptomSelector
              onSelectSymptom={handleVisualSymptomSelect}
              selectedSymptoms={form.symptoms ? form.symptoms.split(',').map((s) => s.trim()).filter(Boolean) : []}
            />
          </div>

          {/* Symptoms & Observation Box */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900">
                {t('section3Symptoms')}
              </h2>
              <VoiceInput onTranscript={handleVoiceTranscript} />
            </div>

            <textarea
              rows={3}
              value={form.symptoms}
              onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
              placeholder={language === 'hi' ? 'चित्र चुनने या बोलने पर लक्षण यहां जुड़ेंगे...' : 'Selected problems will appear here...'}
              className="w-full p-3 text-xs rounded-xl border border-slate-300 text-slate-900 bg-slate-50 focus:bg-white focus:border-blue-600 outline-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="tap-press w-full min-h-[48px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 transition-all"
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
        /* Patient Registry List View */
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">{t('villageRegisterTitle')}</h2>
              <p className="text-xs text-slate-500">{t('villageRegisterSub')}</p>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
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
            <>
              {/* Mobile Card List View (< md screens) */}
              <div className="space-y-3 block md:hidden">
                {filteredRecords.map((rec) => (
                  <div key={rec.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5 shadow-2xs">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900">{rec.name}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {rec.age ? `${rec.age} yrs` : '—'} • {rec.gender}
                          {rec.phone && ` • 📞 ${rec.phone}`}
                        </p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${
                        rec.urgency === 'Emergency'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : rec.urgency === 'Moderate'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {rec.urgency}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-700 flex items-center gap-1.5 bg-white p-2 rounded-lg border border-slate-200">
                      <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">{rec.hospital?.name || 'Local Primary Health Centre'}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(rec.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setActiveSlip(rec)}
                          className="tap-press text-blue-600 hover:underline font-bold text-xs inline-flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{t('actionPrint')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => deletePatientRecord(rec.id)}
                          className="tap-press text-red-600 hover:underline font-bold text-xs inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{t('actionDelete')}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View (md+ screens) */}
              <div className="hidden md:block overflow-x-auto">
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
            </>
          )}
        </div>
      )}
    </div>
  )
}
