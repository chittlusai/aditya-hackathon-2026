import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  ShieldCheck,
  Phone,
  Sparkles,
  CheckCircle2,
  X,
  ArrowRight,
  Fingerprint,
  LogOut,
  Save,
} from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

const AUTH_I18N = {
  en: {
    badge: 'Citizen Patient Profile',
    title: 'Manage Patient Details',
    nameLabel: 'Full Name',
    ageLabel: 'Age',
    genderLabel: 'Gender',
    phoneLabel: 'Mobile Number',
    abhaLabel: 'ABHA ID (Ayushman Bharat Health Account)',
    cancel: 'Cancel',
    save: 'Save Profile',
    logout: 'Logout / Sign Out',
    logoutConfirm: 'Are you sure you want to log out of this account?',
  },
  te: {
    badge: 'పౌరుని ప్రొఫైల్',
    title: 'రోగి వివరాల నిర్వహణ',
    nameLabel: 'పూర్తి పేరు (Name)',
    ageLabel: 'వయస్సు (Age)',
    genderLabel: 'లింగం (Gender)',
    phoneLabel: 'మొబైల్ నంబర్ (Phone)',
    abhaLabel: 'ఆయుష్మాన్ భారత్ హెల్త్ ఐడీ (ABHA ID)',
    cancel: 'రద్దు చేయండి',
    save: 'వివరాలు భద్రపరచండి',
    logout: 'ఖాతా నుండి నిష్క్రమించండి (Logout)',
    logoutConfirm: 'మీరు నిజంగానే ఖాతా నుండి లాగౌట్ కావాలనుకుంటున్నారా?',
  },
  hi: {
    badge: 'नागरिक स्वास्थ्य प्रोफाइल',
    title: 'मरीज विवरण प्रबंधित करें',
    nameLabel: 'पूरा नाम',
    ageLabel: 'उम्र',
    genderLabel: 'लिंग',
    phoneLabel: 'मोबाइल नंबर',
    abhaLabel: 'आभा आईडी (ABHA ID)',
    cancel: 'रद्द करें',
    save: 'प्रोफाइल सहेजें',
    logout: 'लॉगआउट करें (Sign Out)',
    logoutConfirm: 'क्या आप निश्चित रूप से लॉगआउट करना चाहते हैं?',
  },
}

export default function AuthModal() {
  const {
    authModalOpen,
    setAuthModalOpen,
    currentUser,
    loginUser,
    logoutUser,
    language,
    t,
  } = useApp()

  const langKey = language || 'en'
  const text = AUTH_I18N[langKey] || AUTH_I18N.en

  const [name, setName] = useState(currentUser?.name || 'Ramesh Kumar')
  const [phone, setPhone] = useState(currentUser?.phone || '+91 98221 55432')
  const [age, setAge] = useState(currentUser?.age || 34)
  const [gender, setGender] = useState(currentUser?.gender || 'Male')
  const [abhaId, setAbhaId] = useState(currentUser?.abhaNumber || '91-8821-4401-9923')

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || 'Ramesh Kumar')
      setPhone(currentUser.phone || '+91 98221 55432')
      setAge(currentUser.age || 34)
      setGender(currentUser.gender || 'Male')
      setAbhaId(currentUser.abhaNumber || '91-8821-4401-9923')
    }
  }, [currentUser])

  if (!authModalOpen) return null

  const handleSaveProfile = (e) => {
    e?.preventDefault?.()
    loginUser({
      id: abhaId || `ABHA-91-${Math.floor(1000 + Math.random() * 9000)}-4401`,
      name: name.trim() || 'Citizen Resident',
      role: 'patient',
      title: 'Citizen / Patient Portal',
      facility: 'Rampur Rural Sector',
      age: Number(age) || 34,
      gender: gender || 'Male',
      phone: phone ? `+91 ${phone.replace(/^\+?91\s*/, '')}` : '+91 98221 55432',
      abhaNumber: abhaId ? `${abhaId}@abdm` : '91-8821-4401-9923@abdm',
    })
    setAuthModalOpen(false)
  }

  const handleLogout = () => {
    if (window.confirm(text.logoutConfirm)) {
      logoutUser()
      setAuthModalOpen(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.18 }}
          className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white p-5 relative shrink-0">
            <button
              onClick={() => setAuthModalOpen(false)}
              className="tap-press absolute top-4 right-4 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full border border-white/25">
                  <ShieldCheck className="w-3 h-3 text-emerald-300" />
                  {text.badge}
                </span>
                <h2 className="text-base sm:text-lg font-bold font-display truncate mt-0.5">
                  {text.title}
                </h2>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-5 sm:p-6 space-y-4">
            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {text.nameLabel}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {text.ageLabel}
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {text.genderLabel}
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {text.phoneLabel}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98221 55432"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {text.abhaLabel}
                </label>
                <input
                  type="text"
                  value={abhaId}
                  onChange={(e) => setAbhaId(e.target.value)}
                  placeholder="91-8821-4401-9923"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-mono focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Action Buttons: Cancel, Save & Logout */}
              <div className="space-y-2 pt-2">
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setAuthModalOpen(false)}
                    className="tap-press flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
                  >
                    {text.cancel}
                  </button>
                  <button
                    type="submit"
                    className="tap-press flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{text.save}</span>
                  </button>
                </div>

                {/* Prominent Red Logout Button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="tap-press w-full py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{text.logout}</span>
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
