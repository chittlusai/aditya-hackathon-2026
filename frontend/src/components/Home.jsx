import { useState } from 'react'
import {
  Stethoscope,
  Building2,
  Users,
  Phone,
  Search,
  PhoneCall,
} from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

export default function Home() {
  const { go, setRole, setSosOpen, t, hospitals, patientRecords } = useApp()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredHospitals = hospitals.filter((h) =>
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (h.specialist || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const quickSymptoms = [
    t('chips')?.['Fever'] || 'High Fever',
    t('chips')?.['Cough'] || 'Severe Cough',
    t('chips')?.['Chest Pain'] || 'Chest Pain',
    t('chips')?.['Stomach Pain'] || 'Abdominal Pain',
    t('chips')?.['Shortness of Breath'] || 'Breathing Difficulty',
    t('chips')?.['Vomiting'] || 'Vomiting',
    t('chips')?.['Headache'] || 'Headache',
    t('chips')?.['Injury / Fracture'] || 'Physical Injury',
  ]

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Notice Banner */}
      <div className="bg-blue-900 text-white rounded-xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200 block">
            {t('bannerCategory')}
          </span>
          <h1 className="text-xl sm:text-2xl font-bold font-display mt-0.5">
            {t('heroTitle')}
          </h1>
          <p className="text-xs text-blue-100 mt-1 max-w-2xl">
            {t('heroSub')}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            onClick={() => go('check')}
            className="tap-press px-5 py-2.5 rounded-lg bg-white text-blue-950 font-bold text-xs shadow hover:bg-blue-50 flex items-center gap-2"
          >
            <Stethoscope className="w-4 h-4 text-blue-800" />
            <span>{t('checkSymptomsBtn')}</span>
          </button>
        </div>
      </div>

      {/* 2-Column Utility Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Quick Triage & Citizen Workflows */}
        <div className="lg:col-span-2 space-y-4">
          {/* Quick Check Box */}
          <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-blue-800" />
                  {t('assessmentBoxTitle')}
                </h2>
                <p className="text-xs text-slate-500">
                  {t('assessmentBoxSub')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {quickSymptoms.map((symptom) => (
                <button
                  key={symptom}
                  onClick={() => go('check')}
                  className="tap-press p-2.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-blue-600 hover:bg-blue-50 text-left text-xs font-semibold text-slate-800"
                >
                  {symptom}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-xs text-slate-500">
                {t('voicePromptHelp')}
              </span>
              <button
                onClick={() => go('check')}
                className="tap-press w-full sm:w-auto px-5 py-2 rounded-lg bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs"
              >
                {t('openFullForm')}
              </button>
            </div>
          </div>

          {/* Portal Service Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => {
                setRole('asha')
                go('asha')
              }}
              className="bg-white border border-slate-300 hover:border-blue-600 p-5 rounded-xl shadow-sm cursor-pointer transition-all"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{t('ashaTitle')}</h3>
                  <span className="text-[10px] text-teal-700 font-bold">{patientRecords.length} Saved Records</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('ashaSub')}
              </p>
              <p className="text-xs font-bold text-blue-800 mt-3">{t('tabVillageRegister')} →</p>
            </div>

            <div
              onClick={() => {
                setRole('admin')
                go('admin')
              }}
              className="bg-white border border-slate-300 hover:border-blue-600 p-5 rounded-xl shadow-sm cursor-pointer transition-all"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-900 border border-blue-200 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{t('adminTitle')}</h3>
                  <span className="text-[10px] text-blue-700 font-bold">{hospitals.length} Facilities Mapped</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('adminSub')}
              </p>
              <p className="text-xs font-bold text-blue-800 mt-3">{t('navAdmin')} →</p>
            </div>
          </div>
        </div>

        {/* Right Col: Emergency Helplines Box */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
              <PhoneCall className="w-4 h-4 text-red-600" />
              {t('emergencyHelplineTitle')}
            </h2>

            <div className="space-y-2">
              <a
                href="tel:108"
                className="tap-press flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-200 hover:bg-red-100 text-red-900"
              >
                <div>
                  <span className="font-bold text-sm block">108</span>
                  <span className="text-[11px] text-red-700">{t('ambulanceLine')}</span>
                </div>
                <span className="text-xs font-bold bg-red-700 text-white px-2.5 py-1 rounded">{t('callNow')} 108</span>
              </a>

              <a
                href="tel:112"
                className="tap-press flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-800"
              >
                <div>
                  <span className="font-bold text-xs block">112</span>
                  <span className="text-[10px] text-slate-500">{t('emergencyLine')}</span>
                </div>
                <span className="text-xs font-bold text-blue-800">{t('callNow')} 112</span>
              </a>

              <a
                href="tel:104"
                className="tap-press flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-800"
              >
                <div>
                  <span className="font-bold text-xs block">104</span>
                  <span className="text-[10px] text-slate-500">{t('healthAdviceLine')}</span>
                </div>
                <span className="text-xs font-bold text-blue-800">{t('callNow')} 104</span>
              </a>

              <a
                href="tel:102"
                className="tap-press flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-800"
              >
                <div>
                  <span className="font-bold text-xs block">102</span>
                  <span className="text-[10px] text-slate-500">{t('maternityLine')}</span>
                </div>
                <span className="text-xs font-bold text-blue-800">{t('callNow')} 102</span>
              </a>
            </div>

            <button
              onClick={() => setSosOpen(true)}
              className="tap-press w-full py-2.5 rounded-lg bg-red-700 hover:bg-red-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
            >
              <span>{t('openDispatcher')}</span>
            </button>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-1.5">
            <p className="font-bold text-slate-800">{t('healthTiersTitle')}</p>
            <p><strong>Sub-Centre:</strong> {t('tierSubCentre')}</p>
            <p><strong>PHC:</strong> {t('tierPHC')}</p>
            <p><strong>CHC:</strong> {t('tierCHC')}</p>
          </div>
        </div>
      </div>

      {/* Live District Hospital & PHC Directory Table */}
      <div className="bg-white border border-slate-300 rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-800" />
              {t('directoryTitle')}
            </h2>
            <p className="text-xs text-slate-500">
              {t('directorySub')}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-300 w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder={t('searchHospitalPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-xs text-slate-800 outline-none w-full"
            />
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                <th className="py-2.5 px-3">{t('thFacility')}</th>
                <th className="py-2.5 px-3">{t('thType')}</th>
                <th className="py-2.5 px-3">{t('thDistance')}</th>
                <th className="py-2.5 px-3">{t('thDoctors')}</th>
                <th className="py-2.5 px-3">{t('thSpecialist')}</th>
                <th className="py-2.5 px-3">{t('thMedicines')}</th>
                <th className="py-2.5 px-3 text-right">{t('thAction')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredHospitals.slice(0, 8).map((h) => (
                <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-900">{h.name}</td>
                  <td className="py-3 px-3 text-slate-600">{h.type}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900">{h.distance_km} km</td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {h.doctors_available} {t('thDoctors')}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 truncate max-w-[160px]">{h.specialist || 'General'}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      h.medicine_stock?.toLowerCase().includes('in') ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                    }`}>
                      {h.medicine_stock}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    {h.phone && (
                      <a
                        href={`tel:${h.phone}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 text-blue-900 hover:bg-blue-100 font-bold border border-blue-200"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{t('mapCall')}</span>
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span>{t('showingCount')}</span>
          <button
            onClick={() => go('map')}
            className="text-blue-800 hover:underline font-bold"
          >
            {t('viewAllMap')}
          </button>
        </div>
      </div>
    </div>
  )
}
