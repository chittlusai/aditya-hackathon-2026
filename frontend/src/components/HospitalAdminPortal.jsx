import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import {
  Building2,
  UserRound,
  Pill,
  Bed,
  Check,
  Save,
  Search,
  Lock,
  MapPin,
  ShieldCheck,
  Stethoscope,
  TrendingUp,
  Activity,
  AlertTriangle,
  Ambulance,
  BarChart3,
} from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

export default function HospitalAdminPortal() {
  const { t, hospitals, updateHospitalCapacity, logoutUser, currentUser, districtAnalytics, language } = useApp()
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
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-5">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center shrink-0">
            <Building2 className="w-7 h-7 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md border border-amber-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                District Health Officer & CMO Portal
              </span>
              <span className="text-xs text-slate-300 font-mono">District ID: #DIST-NAGPUR-RURAL</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-display mt-1">
              Care Capacity Command Desk (Feature 18)
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Live hospital bed capacity, doctor attendance, medicine logistics, and district command heatmap
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={logoutUser}
          className="tap-press self-start md:self-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white/10 hover:bg-red-500/20 text-white hover:text-red-300 border border-white/20 text-xs font-bold transition-all shadow-2xs"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Lock & Log Out</span>
        </button>
      </div>

      {/* District Care Capacity Radar / Heatmap Analytics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="p-3 rounded-2xl bg-blue-50/80 border border-blue-100">
          <span className="text-[10px] font-bold text-blue-600 uppercase block">Connected Facilities</span>
          <p className="text-lg sm:text-xl font-extrabold text-blue-950 mt-0.5">
            {districtAnalytics.totalFacilities} Health Centres
          </p>
          <span className="text-[10px] text-blue-700">100% Online Grid</span>
        </div>

        <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-100">
          <span className="text-[10px] font-bold text-emerald-600 uppercase block">Active Doctors on Duty</span>
          <p className="text-lg sm:text-xl font-extrabold text-emerald-950 mt-0.5">
            {districtAnalytics.activeDoctorsToday} Clinicians
          </p>
          <span className="text-[10px] text-emerald-700">All Specialists Checked In</span>
        </div>

        <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-100">
          <span className="text-[10px] font-bold text-amber-600 uppercase block">District Bed Occupancy</span>
          <p className="text-lg sm:text-xl font-extrabold text-amber-950 mt-0.5">
            {districtAnalytics.bedOccupancyRate}
          </p>
          <span className="text-[10px] text-amber-700">32% Emergency Buffer</span>
        </div>

        <div className="p-3 rounded-2xl bg-purple-50/80 border border-purple-100">
          <span className="text-[10px] font-bold text-purple-600 uppercase block">Avg Ambulance Transit</span>
          <p className="text-lg sm:text-xl font-extrabold text-purple-950 mt-0.5">
            {districtAnalytics.avgAmbulanceResponseMins} Mins
          </p>
          <span className="text-[10px] text-purple-700">108 Fleet Optimal</span>
        </div>
      </div>

      {/* Main Admin Controller: Facility Selector & Capacity Modifier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left Column: Facility Directory */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">
              Select Facility to Modify Live Capacity:
            </span>
            <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
              {filteredHospitals.length} Centres
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search facility name, address..."
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs outline-none focus:bg-white focus:border-blue-600"
            />
          </div>

          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {filteredHospitals.map((h) => {
              const isSelected = h.id === selectedHospitalId
              return (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => handleSelectHospital(h)}
                  className={`tap-press w-full text-left p-3 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-600/20 shadow-xs'
                      : 'bg-slate-50/60 hover:bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                      {h.name}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400">
                      {h.distance_km} km
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {h.address || 'Rural Block Sector'}
                  </p>

                  <div className="mt-2 flex items-center justify-between text-[10.5px]">
                    <span className="text-emerald-700 font-bold">
                      {h.doctors_available} Doctors Active
                    </span>
                    <span className="text-blue-700 font-medium">
                      {h.icu_beds || 2} ICU Beds
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right Column: Live Capacity Modifier */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
              Editing Live Facility Status
            </span>
            <h3 className="text-lg font-bold text-slate-900 font-display">
              {selectedHospital.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {selectedHospital.address} • {selectedHospital.type}
            </p>
          </div>

          {successToast && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{t('updateSuccess')}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <UserRound className="w-3.5 h-3.5 text-blue-600" />
                  <span>Doctors on Active Duty</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={editForm.doctors_available}
                  onChange={(e) => setEditForm({ ...editForm, doctors_available: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Bed className="w-3.5 h-3.5 text-blue-600" />
                  <span>Available Emergency / ICU Beds</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editForm.icu_beds}
                  onChange={(e) => setEditForm({ ...editForm, icu_beds: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Pill className="w-3.5 h-3.5 text-blue-600" />
                  <span>Medicine Stock Status</span>
                </label>
                <select
                  value={editForm.medicine_stock}
                  onChange={(e) => setEditForm({ ...editForm, medicine_stock: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-blue-600"
                >
                  <option value="In stock">In Stock (Good Supply)</option>
                  <option value="Low stock">Low Stock (Refill Requested)</option>
                  <option value="Out of stock">Out of Stock (Emergency Re-route)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Ambulance className="w-3.5 h-3.5 text-red-600" />
                  <span>Trauma & Emergency Status</span>
                </label>
                <select
                  value={editForm.emergency_ready ? 'true' : 'false'}
                  onChange={(e) => setEditForm({ ...editForm, emergency_ready: e.target.value === 'true' })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-blue-600"
                >
                  <option value="true">✓ 24x7 Emergency Ready (108 Direct Transfer)</option>
                  <option value="false">OPD Day Hours Only (No Trauma Unit)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="tap-press w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save & Broadcast Live Facility Capacity</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
