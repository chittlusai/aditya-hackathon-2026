import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Phone,
  CheckCircle2,
  Lock,
} from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import LanguageToggle from './LanguageToggle.jsx'

export default function LoginGate() {
  const { loginUser, t, language } = useApp()

  const [name, setName] = useState('Ramesh Kumar')
  const [phone, setPhone] = useState('98221 55432')
  const [age, setAge] = useState('34')
  const [gender, setGender] = useState('Male')
  const [abhaId, setAbhaId] = useState('91-8821-4401-9923')

  const handleCitizenLogin = (e) => {
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
  }

  const handleQuickDemoLogin = () => {
    loginUser({
      id: 'ABHA-91-8821-4401',
      name: 'Ramesh Kumar (Citizen)',
      role: 'patient',
      title: 'Citizen / Patient Portal',
      facility: 'Rampur Rural Sector',
      age: 34,
      gender: 'Male',
      phone: '+91 98221 55432',
      abhaNumber: '91-8821-4401-9923@abdm',
    })
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 bg-gradient-to-b from-blue-50/50 via-slate-50 to-indigo-50/30">
      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden"
      >
        {/* Header Ribbon */}
        <div className="h-1.5 w-full grid grid-cols-3">
          <div className="bg-[#FF9933]" />
          <div className="bg-white" />
          <div className="bg-[#138808]" />
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header Branding */}
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 shadow-xs mb-1">
              <User className="w-8 h-8" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Arogya Setu Citizen Login
            </h1>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Offline-first rural health triage, WhatsApp AI doctor consultations & daily medicine schedules
            </p>
          </div>

          {/* Language Selector in Card */}
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs">
            <span className="text-slate-600 font-bold">Preferred Language:</span>
            <LanguageToggle />
          </div>

          {/* Citizen Login Form */}
          <form onSubmit={handleCitizenLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your Full Name (రోగి పేరు / नाम)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Age (వయస్సు / उम्र)</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="34"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
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
                Mobile Number (మొబైల్ నంబర్ / फ़ोन)
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
                Ayushman Bharat ABHA ID (Optional)
              </label>
              <input
                type="text"
                value={abhaId}
                onChange={(e) => setAbhaId(e.target.value)}
                placeholder="91-8821-4401-9923"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-mono focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <button
              type="submit"
              className="tap-press w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all"
            >
              <span>Continue to Health Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick 1-Tap Demo Button */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="tap-press w-full py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 font-bold text-xs border border-emerald-200 flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>⚡ 1-Tap Instant Demo Login (Ramesh Kumar)</span>
            </button>
          </div>

          {/* Footer Security Badges */}
          <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400 font-medium">
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>ABDM Encrypted</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Offline Ready</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
