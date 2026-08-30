import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Stethoscope,
  Users,
  ShieldCheck,
  Lock,
  Phone,
  KeyRound,
  Sparkles,
  CheckCircle2,
  X,
  ArrowRight,
  Fingerprint,
} from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

export default function AuthModal() {
  const {
    authModalOpen,
    setAuthModalOpen,
    currentUser,
    loginUser,
    logoutUser,
    role,
    t,
    language,
  } = useApp()

  const [activeTab, setActiveTab] = useState(role || 'patient') // 'patient' | 'doctor' | 'asha' | 'admin'
  const [phone, setPhone] = useState('')
  const [abhaId, setAbhaId] = useState('')
  const [doctorId, setDoctorId] = useState('DR-101')
  const [doctorPin, setDoctorPin] = useState('1234')
  const [ashaId, setAshaId] = useState('ASHA-404')
  const [ashaPin, setAshaPin] = useState('1234')
  const [adminPin, setAdminPin] = useState('admin123')
  const [error, setError] = useState('')

  if (!authModalOpen) return null

  const handlePatientLogin = (e) => {
    e?.preventDefault?.()
    loginUser({
      id: abhaId || 'ABHA-91-8821-4401',
      name: phone ? `Citizen (${phone})` : 'Ramesh Kumar (Citizen)',
      role: 'patient',
      title: 'Citizen / Patient Portal',
      facility: 'Rampur Rural Sector',
      phone: phone || '+91 98221 55432',
      abhaNumber: abhaId || '91-8821-4401-9923',
    })
    setAuthModalOpen(false)
  }

  const handleDoctorLogin = (e) => {
    e?.preventDefault?.()
    if (doctorPin !== '1234' && doctorPin !== '1080') {
      setError('Invalid Doctor PIN. Use demo PIN 1234')
      return
    }
    loginUser({
      id: doctorId || 'DR-101',
      name: 'Dr. Rajesh Sharma',
      role: 'doctor',
      title: 'Chief Medical Officer (MBBS, MD)',
      facility: 'Rampur Primary Health Centre (PHC)',
      regNo: 'MCI-MH-88210',
      specialty: 'General Medicine',
    })
    setAuthModalOpen(false)
  }

  const handleAshaLogin = (e) => {
    e?.preventDefault?.()
    if (ashaPin !== '1234') {
      setError('Invalid ASHA PIN. Use demo PIN 1234')
      return
    }
    loginUser({
      id: ashaId || 'ASHA-404',
      name: 'Anita Devi',
      role: 'asha',
      title: 'Accredited Social Health Activist (ASHA)',
      facility: 'Rampur Sector Sub-Centre',
      sector: 'Rampur Village & South Tola',
      assignedHouseholds: 185,
    })
    setAuthModalOpen(false)
  }

  const handleAdminLogin = (e) => {
    e?.preventDefault?.()
    const valid = ['admin123', '1080', 'ADMIN2026', '1234']
    if (!valid.includes(adminPin)) {
      setError('Invalid Admin Key. Use demo key: admin123')
      return
    }
    loginUser({
      id: 'ADM-DIST-01',
      name: 'Dr. K. Verma',
      role: 'admin',
      title: 'District Chief Medical Officer (Admin)',
      facility: 'Nagpur Rural District Health Directorate',
    })
    setAuthModalOpen(false)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.18 }}
          className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white p-5 sm:p-6 relative shrink-0">
            {currentUser && (
              <button
                onClick={() => setAuthModalOpen(false)}
                className="tap-press absolute top-4 right-4 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
                <Fingerprint className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full border border-white/25">
                  <ShieldCheck className="w-3 h-3 text-emerald-300" />
                  National Health Authority • Secure Login
                </span>
                <h2 className="text-lg sm:text-xl font-bold font-display mt-0.5">
                  Arogya Setu Local Portal Login
                </h2>
                <p className="text-[11px] text-blue-100 mt-0.5">
                  Select your role to access customized clinical tools & records
                </p>
              </div>
            </div>
          </div>

          {/* 4-Role Navigation Pills */}
          <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200">
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-200/70 rounded-xl">
              <button
                type="button"
                onClick={() => { setActiveTab('patient'); setError('') }}
                className={`tap-press py-2 px-1 rounded-lg text-[11px] font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
                  activeTab === 'patient'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Citizen</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('doctor'); setError('') }}
                className={`tap-press py-2 px-1 rounded-lg text-[11px] font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
                  activeTab === 'doctor'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Doctor</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('asha'); setError('') }}
                className={`tap-press py-2 px-1 rounded-lg text-[11px] font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
                  activeTab === 'asha'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>ASHA</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('admin'); setError('') }}
                className={`tap-press py-2 px-1 rounded-lg text-[11px] font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
                  activeTab === 'admin'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          {/* Tab Body */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {error}
              </div>
            )}

            {/* CITIZEN / PATIENT TAB */}
            {activeTab === 'patient' && (
              <form onSubmit={handlePatientLogin} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                    <span>Mobile Phone Number (Optional for Quick Access)</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 98221 55432"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Fingerprint className="w-3.5 h-3.5 text-blue-600" />
                    <span>ABHA Health Account Number (Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 91-8821-4401-9923"
                    value={abhaId}
                    onChange={(e) => setAbhaId(e.target.value)}
                    className="w-full p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="tap-press w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <span>Continue as Citizen / Patient</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* 1-Tap Demo Chip */}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setPhone('+91 98221 55432')
                      setAbhaId('91-8821-4401-9923')
                      handlePatientLogin()
                    }}
                    className="w-full p-2.5 rounded-xl bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200 text-blue-800 text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>⚡ 1-Tap Quick Citizen Login (Demo Mode)</span>
                  </button>
                </div>
              </form>
            )}

            {/* DOCTOR LOGIN TAB */}
            {activeTab === 'doctor' && (
              <form onSubmit={handleDoctorLogin} className="space-y-3.5">
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-900 text-xs space-y-0.5">
                  <p className="font-bold flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-blue-700" />
                    <span>Medical Officer / Clinician Authentication</span>
                  </p>
                  <p className="text-[11px] text-blue-700">
                    Unlocks Doctor AI Workbench, Live OPD queue, and referral approvals.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Doctor Registration ID / Username
                  </label>
                  <input
                    type="text"
                    value={doctorId}
                    onChange={(e) => setDoctorId(e.target.value)}
                    placeholder="e.g. DR-101"
                    className="w-full p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-mono focus:bg-white focus:border-blue-600 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Clinical Security PIN</span>
                    <span className="text-[10px] text-blue-600 font-mono">Demo PIN: 1234</span>
                  </label>
                  <input
                    type="password"
                    value={doctorPin}
                    onChange={(e) => setDoctorPin(e.target.value)}
                    placeholder="Enter PIN (1234)"
                    className="w-full p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-mono focus:bg-white focus:border-blue-600 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="tap-press w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <span>Login to Doctor AI Workbench</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setDoctorId('DR-101')
                      setDoctorPin('1234')
                      handleDoctorLogin()
                    }}
                    className="w-full p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>⚡ 1-Tap Doctor Login (Dr. Rajesh Sharma, MD)</span>
                  </button>
                </div>
              </form>
            )}

            {/* ASHA WORKER TAB */}
            {activeTab === 'asha' && (
              <form onSubmit={handleAshaLogin} className="space-y-3.5">
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 text-purple-900 text-xs space-y-0.5">
                  <p className="font-bold flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-purple-700" />
                    <span>Frontline ASHA / ANM Field Portal</span>
                  </p>
                  <p className="text-[11px] text-purple-700">
                    Offline household screening, MCH pathway, and High-Risk Watchlist.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    ASHA Worker ID / Sector Code
                  </label>
                  <input
                    type="text"
                    value={ashaId}
                    onChange={(e) => setAshaId(e.target.value)}
                    placeholder="e.g. ASHA-404"
                    className="w-full p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-mono focus:bg-white focus:border-blue-600 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Field Access PIN</span>
                    <span className="text-[10px] text-purple-600 font-mono">Demo PIN: 1234</span>
                  </label>
                  <input
                    type="password"
                    value={ashaPin}
                    onChange={(e) => setAshaPin(e.target.value)}
                    placeholder="Enter PIN (1234)"
                    className="w-full p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-mono focus:bg-white focus:border-blue-600 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="tap-press w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <span>Login to ASHA Super-App</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setAshaId('ASHA-404')
                      setAshaPin('1234')
                      handleAshaLogin()
                    }}
                    className="w-full p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>⚡ 1-Tap ASHA Login (Anita Devi, Rampur)</span>
                  </button>
                </div>
              </form>
            )}

            {/* ADMIN LOGIN TAB */}
            {activeTab === 'admin' && (
              <form onSubmit={handleAdminLogin} className="space-y-3.5">
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-amber-900 text-xs space-y-0.5">
                  <p className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                    <span>District Health Officer & Command Portal</span>
                  </p>
                  <p className="text-[11px] text-amber-700">
                    Care Capacity Heatmap, Emergency Beds, Medicine and Doctor rosters.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Admin Security Passcode</span>
                    <span className="text-[10px] text-amber-600 font-mono">Demo: admin123</span>
                  </label>
                  <input
                    type="password"
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    placeholder="Enter Admin Key (admin123)"
                    className="w-full p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-mono focus:bg-white focus:border-blue-600 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="tap-press w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <span>Login to District Command Desk</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setAdminPin('admin123')
                      handleAdminLogin()
                    }}
                    className="w-full p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>⚡ 1-Tap Admin Login (District CMO)</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
