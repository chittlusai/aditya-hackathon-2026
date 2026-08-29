import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, ShieldCheck, KeyRound, X, ArrowRight, AlertCircle, Building2 } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

export default function AdminAuthModal() {
  const { adminAuthModalOpen, setAdminAuthModalOpen, adminLogin, t, language } = useApp()
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  if (!adminAuthModalOpen) return null

  const handleSubmit = (e) => {
    e?.preventDefault?.()
    if (!pin.trim()) return

    const success = adminLogin(pin)
    if (success) {
      setPin('')
      setError(false)
    } else {
      setError(true)
    }
  }

  const handleClose = () => {
    setAdminAuthModalOpen(false)
    setPin('')
    setError(false)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.18 }}
          className="w-full max-w-md bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden"
          role="dialog"
          aria-modal="true"
        >
          {/* Official Security Header */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-900 text-white p-5 sm:p-6 relative">
            <button
              onClick={handleClose}
              className="tap-press absolute top-4 right-4 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/25 flex items-center justify-center shrink-0">
                <Lock className="w-6 h-6 text-white animate-pulse" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full border border-white/25">
                  <ShieldCheck className="w-3 h-3" />
                  Government Security Gate
                </span>
                <h2 className="text-lg sm:text-xl font-bold font-display mt-0.5">
                  {language === 'hi'
                    ? 'अस्पताल प्रबंधन लॉगिन'
                    : language === 'mr'
                    ? 'रुग्णालय व्यवस्थापन लॉगिन'
                    : 'Hospital Admin Gate'}
                </h2>
                <p className="text-[11px] text-blue-100 mt-0.5">
                  {language === 'hi'
                    ? 'केवल अधिकृत डॉक्टर व स्वास्थ्य अधिकारी'
                    : language === 'mr'
                    ? 'केवळ अधिकृत डॉक्टर व आरोग्य अधिकारी'
                    : 'Authorized PHC Incharge & Medical Officers Only'}
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-slate-700 text-xs leading-relaxed flex items-start gap-2.5">
              <Building2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p>
                {language === 'hi'
                  ? 'अस्पताल में उपस्थित डॉक्टर, दवाई स्टॉक व आपातकालीन बेड की संख्या अपडेट करने के लिए अपना 4-अंकों का पिन दर्ज करें।'
                  : language === 'mr'
                  ? 'रुग्णालयातील उपस्थित डॉक्टर, औषध साठा व आपत्कालीन बेड अपडेट करण्यासाठी आपला ४-अंकी पिन प्रविष्ट करा.'
                  : 'Enter your 4-digit Medical Officer / Administrative Security PIN to update live doctor availability, medicine inventory, and emergency beds.'}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                  <span>{language === 'hi' ? 'सुरक्षा पिन (Security PIN)' : language === 'mr' ? 'सुरक्षा पिन (Security PIN)' : 'Administrative PIN'}</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400 font-normal">
                  Demo PIN: <strong>1080</strong>
                </span>
              </label>

              <input
                type="password"
                maxLength={10}
                autoFocus
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value)
                  setError(false)
                }}
                placeholder="••••"
                className={`w-full p-3 text-center text-lg font-mono tracking-widest rounded-xl border bg-slate-50 text-slate-900 focus:bg-white outline-none transition-all ${
                  error
                    ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/30'
                    : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20'
                }`}
              />
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-1.5 animate-shake">
                <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span>
                  {language === 'hi'
                    ? 'गलत पिन! कृपया सही पिन (1080) दर्ज करें।'
                    : language === 'mr'
                    ? 'अयोग्य पिन! कृपया योग्य पिन (1080) प्रविष्ट करा.'
                    : 'Invalid Security PIN. Please enter the authorized PIN (1080).'}
                </span>
              </div>
            )}

            <div className="pt-2 flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleClose}
                className="tap-press flex-1 min-h-[44px] rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
              >
                {language === 'hi' ? 'रद्द करें' : language === 'mr' ? 'रद्द करा' : 'Cancel'}
              </button>

              <button
                type="submit"
                className="tap-press flex-1 min-h-[44px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <span>{language === 'hi' ? 'अनलॉक करें' : language === 'mr' ? 'अनलॉक करा' : 'Unlock Portal'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
