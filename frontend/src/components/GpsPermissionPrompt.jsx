import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin,
  Navigation,
  CheckCircle2,
  ShieldCheck,
  X,
  Loader2,
  Compass,
  Search,
  Sparkles,
} from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

export default function GpsPermissionPrompt() {
  const {
    gpsModalOpen,
    setGpsModalOpen,
    userCoords,
    gpsStatus,
    requestGpsLocation,
    applyCoordinates,
    language,
    t,
  } = useApp()

  const [customSearch, setCustomSearch] = useState('')
  const [isDetecting, setIsDetecting] = useState(false)

  if (!gpsModalOpen) return null

  const DISTRICT_PRESETS = [
    { name: 'Hyderabad (Telangana)', lat: 17.3850, lng: 78.4867, desc: 'Central Health Hub' },
    { name: 'Vijayawada (Andhra Pradesh)', lat: 16.5062, lng: 80.6480, desc: 'Krishna District Hub' },
    { name: 'Visakhapatnam (Vizag)', lat: 17.6868, lng: 83.2185, desc: 'Coastal Health Sector' },
    { name: 'Kakinada / Aditya Campus', lat: 16.9891, lng: 82.2475, desc: 'East Godavari Sector' },
    { name: 'Guntur / Amaravati', lat: 16.3067, lng: 80.4365, desc: 'Capital Rural Region' },
    { name: 'Tirupati (Rayalaseema)', lat: 13.6288, lng: 79.4192, desc: 'Southern Health Belt' },
    { name: 'Nagpur Rural (Rampur)', lat: 21.1458, lng: 79.0882, desc: 'Central Rural Belt' },
    { name: 'Wardha Rural District', lat: 20.7453, lng: 78.6022, desc: 'Vidarbha Rural Belt' },
    { name: 'Bengaluru (Karnataka)', lat: 12.9716, lng: 77.5946, desc: 'Metro Health Hub' },
    { name: 'Chennai (Tamil Nadu)', lat: 13.0827, lng: 80.2707, desc: 'Southern Metro Hub' },
    { name: 'Pune Rural (Maharashtra)', lat: 18.5204, lng: 73.8567, desc: 'Western Ghats Sector' },
    { name: 'New Delhi (NCR)', lat: 28.6139, lng: 77.2090, desc: 'National Health Hub' },
  ]

  const handleSelectPreset = (preset) => {
    applyCoordinates(preset.lat, preset.lng, preset.name, 25)
    setGpsModalOpen(false)
  }

  const handleDetectAuto = async () => {
    setIsDetecting(true)
    await requestGpsLocation(true)
    setIsDetecting(false)
  }

  const filteredPresets = DISTRICT_PRESETS.filter((p) =>
    !customSearch ||
    p.name.toLowerCase().includes(customSearch.toLowerCase()) ||
    p.desc.toLowerCase().includes(customSearch.toLowerCase())
  )

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-2xl text-slate-800 overflow-hidden my-auto"
        >
          {/* Top Blue Accent */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-blue-600" />

          <button
            onClick={() => setGpsModalOpen(false)}
            className="tap-press absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center border border-slate-200"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
              <Navigation className="w-6 h-6 animate-pulse text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-display">
                GPS Location & Hospital Radar
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically calculates real driving distance to all nearby PHCs & CHCs
              </p>
            </div>
          </div>

          {/* Current Active GPS Pill */}
          {userCoords && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 mb-4 flex items-center justify-between text-xs text-emerald-800 font-medium shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <div>
                  <span className="font-bold block text-slate-900">{userCoords.label || 'Live GPS Active'}</span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {userCoords.lat.toFixed(4)}° N, {userCoords.lng.toFixed(4)}° E
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-full border border-emerald-300">
                Connected
              </span>
            </div>
          )}

          {/* Action 1: Live Auto Detect Button */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleDetectAuto}
              disabled={isDetecting || gpsStatus === 'requesting'}
              className="tap-press w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 transition-all disabled:opacity-60"
            >
              {isDetecting || gpsStatus === 'requesting' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Detecting Live GPS & IP Coordinates…</span>
                </>
              ) : (
                <>
                  <Compass className="w-4 h-4 text-emerald-300 animate-spin" />
                  <span>Detect Live Location Automatically (GPS / IP)</span>
                </>
              )}
            </button>

            {/* Action 2: Fast 1-Tap District Presets */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                  Or Choose District / City (1-Tap):
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Instant Recalculation</span>
              </div>

              {/* Search Presets Box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={customSearch}
                  onChange={(e) => setCustomSearch(e.target.value)}
                  placeholder="Filter district or city (e.g. Hyderabad, Kakinada, Vijayawada)..."
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:border-blue-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-0.5">
                {filteredPresets.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className="tap-press p-2.5 rounded-xl border text-left bg-slate-50 hover:bg-blue-50/70 border-slate-200 hover:border-blue-300 text-slate-800 transition-all shadow-2xs group"
                  >
                    <strong className="block text-xs text-slate-900 group-hover:text-blue-700 truncate">
                      📍 {p.name.split('(')[0].trim()}
                    </strong>
                    <span className="block text-[10px] text-slate-500 truncate mt-0.5">
                      {p.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => setGpsModalOpen(false)}
              className="text-xs text-slate-500 hover:text-slate-800 font-bold underline"
            >
              Done / Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
