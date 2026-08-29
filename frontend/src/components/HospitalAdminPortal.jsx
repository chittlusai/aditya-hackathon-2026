import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Building2, UserRound, Pill, Bed, Check, Save, Search, Lock, MapPin, ShieldCheck, Stethoscope } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

export default function HospitalAdminPortal() {
  const { t, hospitals, updateHospitalCapacity, adminLogout, language } = useApp()
  const [selectedHospitalId, setSelectedHospitalId] = useState(hospitals[0]?.id || 1)
  const [search, setSearch] = useState('')
  const [successToast, setSuccessToast] = useState(false)

  const selectedHospital = hospitals.find((h) => h.id === selectedHospitalId) || hospitals[0]

  const [editForm, setEditForm] = useState({
    doctors_available: selectedHospital?.doctors_available || 2,
    medicine_stock: selectedHospital?.medicine_stock || 'In stock',
    icu_beds: selectedHospital?.icu_beds || 2,
    emergency_ready: selectedHospital?.emergency_ready ?? true,
  })

  const handleSelectHospital = (h) => {
    setSelectedHospitalId(h.id)
    setEditForm({
      doctors_available: h.doctors_available || 1,
      medicine_stock: h.medicine_stock || 'In stock',
      icu_beds: h.icu_beds || 0,
      emergency_ready: h.emergency_ready ?? true,
    })
  }

  const handleSave = (e) => {
    e?.preventDefault?.()
    updateHospitalCapacity(selectedHospitalId, {
      doctors_available: Number(editForm.doctors_available),
      medicine_stock: editForm.medicine_stock,
      icu_beds: Number(editForm.icu_beds),
      emergency_ready: Boolean(editForm.emergency_ready),
    })

    setSuccessToast(true)
    setTimeout(() => setSuccessToast(false), 3000)
  }

  const filteredHospitals = hospitals.filter((h) =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.type.toLowerCase().includes(search.toLowerCase()) ||
    (h.address || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-5">
      {/* Header Banner with Lock / Logout Button */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
                  {t('bannerCategory')}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-blue-600" />
                  Medical Officer Dashboard
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-bold text-slate-900 font-display mt-0.5">
                {t('adminTitle')}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('adminSub')}
              </p>
            </div>
          </div>

          {/* Secure Lock & Log Out Button */}
          <button
            type="button"
            onClick={adminLogout}
            className="tap-press self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-200 hover:border-red-200 text-xs font-bold transition-all shadow-2xs"
            title="Lock Portal & Log Out"
          >
            <Lock className="w-3.5 h-3.5 text-slate-500 hover:text-red-600" />
            <span>{language === 'hi' ? 'सुरक्षित लॉगआउट (Lock)' : language === 'mr' ? 'सुरक्षित लॉगआउट (Lock)' : 'Lock & Log Out'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Left Column: Facility Picker */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">
              {language === 'hi' ? 'स्वास्थ्य केंद्र चुनें' : language === 'mr' ? 'आरोग्य केंद्र निवडा' : 'Select Health Centre'}
            </span>
            <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
              {filteredHospitals.length} Centres
            </span>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder={t('searchHospitalPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none text-xs text-slate-800 outline-none w-full"
            />
          </div>

          {/* Mobile scrollable chips or compact list */}
          <div className="space-y-1.5 max-h-[300px] lg:max-h-[420px] overflow-y-auto pr-1">
            {filteredHospitals.map((h) => {
              const active = h.id === selectedHospitalId
              return (
                <button
                  type="button"
                  key={h.id}
                  onClick={() => handleSelectHospital(h)}
                  className={`tap-press w-full text-left p-3 rounded-xl border text-xs transition-all ${
                    active
                      ? 'bg-blue-50 border-blue-500 text-slate-900 font-bold shadow-2xs ring-1 ring-blue-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <p className="font-bold truncate">{h.name}</p>
                  <p className="text-[10.5px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{h.address || 'Rural Block'}</span>
                  </p>
                  <div className="flex items-center justify-between text-[10.5px] text-slate-500 mt-1 pt-1 border-t border-slate-100">
                    <span className="text-blue-700 font-medium">{h.type}</span>
                    <span className="font-bold text-emerald-700">{h.doctors_available} {t('thDoctors')}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right Column: Live Capacity Editor */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs">
          <div className="border-b border-slate-100 pb-3 mb-4 sm:mb-5">
            <span className="text-[10px] sm:text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
              {t('editingFacility')}
            </span>
            <h2 className="text-base sm:text-xl font-bold text-slate-900 mt-0.5">
              {selectedHospital?.name}
            </h2>
            <p className="text-xs text-slate-600 flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{selectedHospital?.address || 'District Rural Sector'}</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {selectedHospital?.type} • {selectedHospital?.specialist || 'General Medicine'}
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-4 sm:space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Doctor Availability */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <UserRound className="w-4 h-4 text-blue-600" />
                  <span>{t('doctorsOnDuty')}</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={editForm.doctors_available}
                  onChange={(e) =>
                    setEditForm({ ...editForm, doctors_available: e.target.value })
                  }
                  className="w-full p-2.5 text-sm font-bold font-mono rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                />
              </div>

              {/* ICU / Emergency Beds */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Bed className="w-4 h-4 text-red-600" />
                  <span>{t('icuBeds')}</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editForm.icu_beds}
                  onChange={(e) =>
                    setEditForm({ ...editForm, icu_beds: e.target.value })
                  }
                  className="w-full p-2.5 text-sm font-bold font-mono rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                />
              </div>
            </div>

            {/* Medicine Stock Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-amber-600" />
                <span>{t('medicineStock')}</span>
              </label>
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                {[
                  { key: 'In stock', label: t('inStock') },
                  { key: 'Low stock', label: t('lowStock') },
                  { key: 'Out of stock', label: t('outOfStock') },
                ].map((item) => {
                  const active = editForm.medicine_stock === item.key
                  return (
                    <button
                      type="button"
                      key={item.key}
                      onClick={() => setEditForm({ ...editForm, medicine_stock: item.key })}
                      className={`tap-press py-2.5 px-2 rounded-xl border text-xs font-bold text-center transition-all ${
                        active
                          ? 'bg-blue-600 border-blue-600 text-white shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Emergency Readiness Checkbox */}
            <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">{t('traumaUnitTitle')}</p>
                <p className="text-[11px] text-slate-500">{t('traumaUnitSub')}</p>
              </div>
              <input
                type="checkbox"
                checked={editForm.emergency_ready}
                onChange={(e) => setEditForm({ ...editForm, emergency_ready: e.target.checked })}
                className="w-4 h-4 accent-blue-600 rounded"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="tap-press w-full min-h-[48px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{t('updateBtn')}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {successToast && (
          <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold border border-slate-700">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{t('updateSuccess')}</span>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
