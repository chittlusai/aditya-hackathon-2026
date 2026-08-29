import { motion, AnimatePresence } from 'framer-motion'
import { Siren, Phone, MessageSquare, X, MapPin, Send } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

export default function EmergencyModal() {
  const { sosOpen, setSosOpen, userCoords, result, t } = useApp()

  if (!sosOpen) return null

  const lat = userCoords?.lat || 21.1458
  const lng = userCoords?.lng || 79.0882
  const mapsLink = `https://maps.google.com/?q=${lat},${lng}`
  
  const emergencyMessage = encodeURIComponent(
    `[CRITICAL MEDICAL EMERGENCY ALERT - Arogya Setu Local]\n` +
    `Patient Location: ${mapsLink}\n` +
    `Urgency: ${result?.urgency || 'Critical Emergency'}\n` +
    `Symptoms: ${result?.inputText || 'Severe medical emergency'}\n` +
    `Please dispatch 108 ambulance or nearest medical team immediately.`
  )

  const whatsappUrl = `https://api.whatsapp.com/send?text=${emergencyMessage}`
  const smsUrl = `sms:108?body=${emergencyMessage}`

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden text-slate-800">
          {/* Red top border strip */}
          <div className="absolute top-0 inset-x-0 h-2 bg-red-600" />

          <button
            onClick={() => setSosOpen(false)}
            className="tap-press absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center border border-slate-200"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3.5 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shadow-sm">
              <Siren className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-display">
                {t('sosTitle')}
              </h2>
              <p className="text-xs text-red-600 font-semibold mt-0.5">
                {t('sosSub')}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-5 text-xs text-slate-700 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-600 shrink-0" />
            <span className="truncate">
              {t('gpsLocation')} <strong className="text-slate-900">{lat.toFixed(4)}, {lng.toFixed(4)}</strong> {t('dispatchReady')}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            <a
              href="tel:108"
              className="tap-press w-full min-h-[48px] rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-sm"
            >
              <Phone className="w-4 h-4" />
              <span>{t('call108')}</span>
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="tap-press w-full min-h-[46px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{t('whatsappSos')}</span>
            </a>

            <div className="grid grid-cols-2 gap-2.5">
              <a
                href="tel:112"
                className="tap-press min-h-[42px] rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                <span>{t('call112')}</span>
              </a>

              <a
                href={smsUrl}
                className="tap-press min-h-[42px] rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5 text-amber-600" />
                <span>{t('smsSos')}</span>
              </a>
            </div>
          </div>

          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => setSosOpen(false)}
              className="text-xs text-slate-500 hover:text-slate-800 underline font-semibold"
            >
              {t('close')}
            </button>
          </div>
        </div>
      </div>
    </AnimatePresence>
  )
}
