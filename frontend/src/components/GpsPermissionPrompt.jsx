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
    setUserCoords,
    hospitals,
    t,
  } = useApp()

  const [selectedDistrict, setSelectedDistrict] = useState('wardha')

  if (!gpsModalOpen) return null

  const DISTRICT_PRESETS = {
    wardha: { name: 'Wardha Rural District', lat: 20.7453, lng: 78.6022 },
    nagpur: { name: 'Nagpur District', lat: 21.1458, lng: 79.0882 },
    pune: { name: 'Pune District Rural', lat: 18.5204, lng: 73.8567 },
    amravati: { name: 'Amravati District', lat: 20.9374, lng: 77.7796 },
    nashik: { name: 'Nashik District', lat: 19.9975, lng: 73.7898 },
  }

  const handleSelectDistrict = (key) => {
    setSelectedDistrict(key)
    const preset = DISTRICT_PRESETS[key]
    if (preset) {
      setUserCoords({
        lat: preset.lat,
        lng: preset.lng,
        active: true,
        label: preset.name,
      })
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
          className="relative w-full max-w-lg bg-white border border-slate-300 rounded-2xl p-6 sm:p-8 shadow-2xl text-slate-900 overflow-hidden"
        >
          {/* Top Blue Accent */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-blue-800" />

          <button
            onClick={() => setGpsModalOpen(false)}
            className="tap-press absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center border border-slate-200"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3.5 mb-4">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-900 border border-blue-200 flex items-center justify-center">
              <Navigation className="w-6 h-6 animate-pulse text-blue-800" />
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
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>
                <strong>Accurate Proximity Matching:</strong> Automatically orders health centres from nearest to farthest based on your exact location.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-800 shrink-0 mt-0.5" />
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
              className="tap-press w-full min-h-[48px] rounded-lg bg-blue-800 hover:bg-blue-900 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
            >
              {gpsStatus === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
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
            <div className="pt-2 border-t border-slate-200">
              <p className="text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                Or Select District Sector Manually:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {Object.entries(DISTRICT_PRESETS).map(([key, item]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelectDistrict(key)}
                    className="tap-press p-2 rounded border text-left text-xs bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800 font-semibold truncate"
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
