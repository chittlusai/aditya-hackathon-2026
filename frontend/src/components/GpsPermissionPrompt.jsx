import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Navigation, CheckCircle2, ShieldCheck, X, Loader2 } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

export default function GpsPermissionPrompt() {
  const {
    gpsModalOpen,
    setGpsModalOpen,
    userCoords,
    gpsStatus,
    requestGpsLocation,
    applyCoordinates,
    t,
  } = useApp()

  const [selectedDistrict, setSelectedDistrict] = useState('live')

  if (!gpsModalOpen) return null

  const DISTRICT_PRESETS = {
    wardha: { name: 'Wardha Rural District', lat: 20.7453, lng: 78.6022, desc: 'Vidarbha Rural Belt' },
    nagpur: { name: 'Nagpur District Rural', lat: 21.1458, lng: 79.0882, desc: 'Central Health Hub' },
    gadchiroli: { name: 'Gadchiroli Tribal Block', lat: 20.1809, lng: 80.0034, desc: 'Tribal Adivasi Sector' },
    amravati: { name: 'Amravati Melghat Sector', lat: 21.2847, lng: 77.3482, desc: 'Melghat Tribal Belt' },
    pune: { name: 'Pune Rural (Junnar Block)', lat: 19.2081, lng: 73.8767, desc: 'Western Ghats Sector' },
    nashik: { name: 'Nashik Tribal Belt (Surgana)', lat: 20.5833, lng: 73.6167, desc: 'Northern Tribal Zone' },
  }

  const handleSelectDistrict = (key) => {
    setSelectedDistrict(key)
    const preset = DISTRICT_PRESETS[key]
    if (preset) {
      applyCoordinates(preset.lat, preset.lng, preset.name, 50)
      setGpsModalOpen(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-2xl text-slate-800 overflow-hidden"
        >
          {/* Top Blue Accent */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-blue-600" />

          <button
            onClick={() => setGpsModalOpen(false)}
            className="tap-press absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center border border-slate-200"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3.5 mb-4">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
              <Navigation className="w-6 h-6 animate-pulse text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-display">
                Location Access & Nearest Hospital Radar
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculate live distance in kilometers to all 18+ health facilities
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5 text-xs text-slate-700 space-y-2 leading-relaxed">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Accurate Proximity Matching:</strong> Automatically orders health centres from nearest to farthest based on your exact location.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                <strong>108 Ambulance Dispatch:</strong> Attaches precise GPS coordinates to emergency SMS/WhatsApp alerts for zero-delay ambulance routing.
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => requestGpsLocation(true)}
              disabled={gpsStatus === 'loading'}
              className="tap-press w-full min-h-[48px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
            >
              {gpsStatus === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Detecting GPS Coordinates…</span>
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4" />
                  <span>Allow GPS Location Access</span>
                </>
              )}
            </button>

            {/* Manual District Selection Fallback */}
            <div className="pt-3 border-t border-slate-200">
              <p className="text-[11px] font-bold text-slate-700 mb-2 uppercase tracking-wider">
                Or Select District Sector Manually:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(DISTRICT_PRESETS).map(([key, item]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelectDistrict(key)}
                    className="tap-press p-2.5 rounded-xl border text-left text-xs bg-slate-50 hover:bg-blue-50/60 border-slate-200 text-slate-800 font-semibold truncate"
                  >
                    {item.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => setGpsModalOpen(false)}
              className="text-xs text-slate-500 hover:text-slate-800 underline font-semibold"
            >
              {t('close')}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
