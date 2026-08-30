import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Pill,
  Microscope,
  Search,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2,
  Navigation,
} from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

export default function MedicineDiagnosticsFinder() {
  const { medicines, diagnostics, hospitals, t } = useApp()
  const [activeTab, setActiveTab] = useState('medicines') // 'medicines' | 'diagnostics'
  const [searchQuery, setSearchQuery] = useState('')

  const filteredMedicines = (medicines || []).filter(
    (m) =>
      (m?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m?.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m?.usage || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredDiagnostics = (diagnostics || []).filter(
    (d) =>
      (d?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d?.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d?.importance || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-5">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-blue-600/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-2.5 py-0.5 rounded-full border border-white/25">
            Features 10 & 11 • Government Health Supply Chain
          </span>
          <h1 className="text-xl sm:text-2xl font-bold font-display mt-1">
            Medicine & Diagnostics Availability Network
          </h1>
          <p className="text-xs text-blue-100 mt-0.5 max-w-xl">
            Live inventory tracking across connected PHCs, CHCs, and District Hospitals with nearest alternative stock routing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-2 rounded-2xl bg-white/10 border border-white/15 text-center">
            <span className="text-[10px] uppercase text-blue-200 block font-bold">Medicines Tracked</span>
            <span className="text-base font-extrabold text-white">{medicines.length} Essential</span>
          </div>
          <div className="px-3.5 py-2 rounded-2xl bg-white/10 border border-white/15 text-center">
            <span className="text-[10px] uppercase text-blue-200 block font-bold">Diagnostics</span>
            <span className="text-base font-extrabold text-white">{diagnostics.length} Lab Tests</span>
          </div>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('medicines')}
            className={`tap-press px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'medicines'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Pill className="w-3.5 h-3.5" />
            <span>Essential Medicines ({medicines.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('diagnostics')}
            className={`tap-press px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'diagnostics'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Microscope className="w-3.5 h-3.5" />
            <span>Diagnostic Lab Tests ({diagnostics.length})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'medicines' ? 'Search medicine, antivenom...' : 'Search test e.g. CBC, ECG...'}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs focus:bg-white focus:border-blue-600 outline-none"
          />
        </div>
      </div>

      {/* MEDICINES GRID */}
      {activeTab === 'medicines' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
          {filteredMedicines.map((m) => {
            const isLow = m.stockStatus === 'Low Stock'
            const isOut = m.stockStatus === 'Out of Stock'
            return (
              <div
                key={m.id}
                className={`bg-white rounded-2xl p-4 sm:p-5 border shadow-xs flex flex-col justify-between space-y-3 ${
                  isOut
                    ? 'border-red-200 bg-red-50/20'
                    : isLow
                    ? 'border-amber-200 bg-amber-50/20'
                    : 'border-slate-200'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 block">
                        {m.id} • {m.category}
                      </span>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
                        {m.name}
                      </h3>
                      <p className="text-xs text-slate-500">{m.dosage}</p>
                    </div>

                    <span
                      className={`text-[10.5px] font-extrabold px-2.5 py-1 rounded-full border shrink-0 ${
                        isOut
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : isLow
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {m.stockStatus} ({m.quantity} {m.unit})
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong>Usage:</strong> {m.usage}
                  </p>
                </div>

                {/* Facility Stock Breakdown */}
                <div className="pt-2.5 border-t border-slate-100 space-y-1.5 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Available Stock at Verified Facilities:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {m.facilitiesWithStock.map((f) => (
                      <span
                        key={f.name}
                        className="inline-flex items-center gap-1 text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200 font-medium"
                      >
                        <MapPin className="w-3 h-3 text-blue-600" />
                        <span>{f.name}: <strong>{f.qty}</strong> ({f.distance_km} km)</span>
                      </span>
                    ))}
                  </div>

                  <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-bold text-emerald-700">{m.priceGovt}</span>
                    <span>1-Tap Doctor Prescription Ready</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* DIAGNOSTICS GRID */}
      {activeTab === 'diagnostics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
          {filteredDiagnostics.map((d) => (
            <div
              key={d.id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {d.id} • {d.category}
                    </span>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-snug mt-1">
                      {d.name}
                    </h3>
                  </div>

                  <span className="text-[10.5px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{d.status}</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Sample Type:</span>
                    <span className="text-slate-800 font-medium">{d.sample}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Turnaround Time:</span>
                    <span className="text-blue-700 font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-blue-600" />
                      {d.turnaround}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Clinical Role:</strong> {d.importance}
                </p>
              </div>

              <div className="pt-2.5 border-t border-slate-100 text-xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Available At Nearby Centres:
                </span>
                <p className="text-slate-700 text-[11.5px]">
                  {d.availableAt.join(' • ')}
                </p>
                <div className="pt-1 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-emerald-700">{d.price}</span>
                  <span className="text-slate-400 font-mono">Digital Sync with ABHA</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
