import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Stethoscope,
  Users,
  Building2,
  ShieldCheck,
  Lock,
  Sparkles,
  ArrowRight,
  Fingerprint,
  Phone,
  KeyRound,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import LanguageToggle from './LanguageToggle.jsx'

export default function LoginGate() {
  const { loginUser, t, language } = useApp()

  const [activeTab, setActiveTab] = useState('patient') // 'patient' | 'doctor' | 'asha' | 'admin'
  const [phone, setPhone] = useState('')
  const [abhaId, setAbhaId] = useState('')
  const [doctorPin, setDoctorPin] = useState('')
  const [ashaPin, setAshaPin] = useState('')
  const [adminPin, setAdminPin] = useState('')
  const [error, setError] = useState('')

  const handlePatientLogin = (e) => {
    e?.preventDefault?.()
    loginUser({
      id: abhaId || `ABHA-91-${Math.floor(1000 + Math.random() * 9000)}-4401`,
      name: phone ? `Citizen (${phone})` : 'Ramesh Kumar (Citizen)',
      role: 'patient',
      title: 'Citizen / Patient Portal',
      facility: 'Rampur Rural Sector',
      phone: phone || '+91 98221 55432',
      abhaNumber: abhaId || '91-8821-4401-9923@abdm',
    })
  }

  const handleDoctorLogin = (e) => {
    e?.preventDefault?.()
    if (doctorPin && doctorPin !== '1234' && doctorPin !== '1080') {
      setError('Invalid Doctor PIN. Demo PIN is: 1234')
      return
    }
    loginUser({
      id: 'DR-101',
      name: 'Dr. Rajesh Sharma',
      role: 'doctor',
      title: 'Chief Medical Officer (MBBS, MD)',
      facility: 'Rampur Primary Health Centre (PHC)',
      regNo: 'MCI-MH-88210',
      specialty: 'General Medicine',
    })
  }

  const handleAshaLogin = (e) => {
    e?.preventDefault?.()
    if (ashaPin && ashaPin !== '1234') {
      setError('Invalid ASHA PIN. Demo PIN is: 1234')
      return
    }
    loginUser({
      id: 'ASHA-404',
      name: 'Anita Devi',
      role: 'asha',
      title: 'Accredited Social Health Activist (ASHA)',
      facility: 'Rampur Sector Sub-Centre',
      sector: 'Rampur Village & South Tola',
      assignedHouseholds: 185,
    })
  }

  const handleAdminLogin = (e) => {
    e?.preventDefault?.()
    const valid = ['admin123', '1080', 'ADMIN2026', '1234', '']
    if (!valid.includes(adminPin)) {
      setError('Invalid Admin Key. Demo key is: admin123')
      return
    }
    loginUser({
      id: 'ADM-DIST-01',
      name: 'Dr. K. Verma',
      role: 'admin',
      title: 'District Chief Medical Officer (Admin)',
      facility: 'Nagpur Rural District Health Directorate',
      jurisdiction: '4 Sub-Districts • 28 PHCs',
    })
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 bg-gradient-to-b from-blue-50/50 via-slate-50 to-indigo-50/30">
      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-xl bg-white border border-slate-200/80 rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* National Banner Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-7 relative">
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-white/15 text-blue-200 px-3 py-1 rounded-full border border-white/20">
              <Lock className="w-3 h-3 text-amber-400" />
              Secure Portal Authentication Gate
            </span>
            <LanguageToggle />
          </div>

          <div className="flex items-center gap-3.5">
            <img
              src="/logo.png"
              alt="Arogya Setu Logo"
              className="w-12 h-12 object-contain rounded-2xl p-1 bg-white border border-white/40 shadow-md shrink-0"
            />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-white">
                Arogya Setu Local
              </h1>
              <p className="text-xs text-blue-200 mt-0.5">
                National Rural Health Mission · Mandatory Access Verification
              </p>
            </div>
          </div>
        </div>

        {/* Lock Notice */}
        <div className="bg-amber-50 border-b border-amber-200/70 px-5 py-2.5 flex items-center gap-2 text-xs text-amber-900 font-semibold">
          <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
          <span>Login is mandatory to access clinical triage, hospital radar, and specialized desks.</span>
        </div>

        {/* Role Selector Tabs */}
        <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Step 1: Choose Your Role
          </span>
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-200/80 rounded-2xl">
            <button
              type="button"
              onClick={() => { setActiveTab('patient'); setError('') }}
              className={`tap-press py-2.5 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === 'patient'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Citizen</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('doctor'); setError('') }}
              className={`tap-press py-2.5 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === 'doctor'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Doctor</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('asha'); setError('') }}
              className={`tap-press py-2.5 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === 'asha'
                  ? 'bg-white text-purple-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>ASHA</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('admin'); setError('') }}
              className={`tap-press py-2.5 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === 'admin'
                  ? 'bg-white text-amber-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab 1: Citizen Login */}
        {activeTab === 'patient' && (
          <form onSubmit={handlePatientLogin} className="p-5 sm:p-7 space-y-4 text-xs">
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Mobile Number (For OTP Verification)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98221 55432 (or leave empty for quick demo)"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ABHA Health ID (Ayushman Bharat Digital Mission)
                </label>
                <div className="relative">
                  <Fingerprint className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={abhaId}
                    onChange={(e) => setAbhaId(e.target.value)}
                    placeholder="91-8821-4401-9923@abdm (Optional)"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="tap-press w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all mt-2"
            >
              <span>Verify & Unlock Citizen Health Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Tab 2: Doctor Login */}
        {activeTab === 'doctor' && (
          <form onSubmit={handleDoctorLogin} className="p-5 sm:p-7 space-y-4 text-xs">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 space-y-1">
              <span className="font-bold block">👨‍⚕️ Clinician Verification Required</span>
              <p className="text-[11px] text-emerald-800">
                Authorized for <strong>Dr. Rajesh Sharma (MD)</strong> · Rampur PHC OPD. Demo PIN: <strong>1234</strong>
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Doctor Security PIN / Passcode</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={doctorPin}
                  onChange={(e) => setDoctorPin(e.target.value)}
                  placeholder="Enter 4-digit PIN (default: 1234)"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <button
              type="submit"
              className="tap-press w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all mt-2"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Unlock Doctor AI Workbench</span>
            </button>
          </form>
        )}

        {/* Tab 3: ASHA Login */}
        {activeTab === 'asha' && (
          <form onSubmit={handleAshaLogin} className="p-5 sm:p-7 space-y-4 text-xs">
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-950 space-y-1">
              <span className="font-bold block">👩‍⚕️ Frontline Worker Verification</span>
              <p className="text-[11px] text-purple-800">
                Authorized for <strong>Anita Devi (ASHA)</strong> · Rampur Sector. Demo PIN: <strong>1234</strong>
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">ASHA Access PIN</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={ashaPin}
                  onChange={(e) => setAshaPin(e.target.value)}
                  placeholder="Enter PIN (default: 1234)"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 outline-none focus:border-purple-600"
                />
              </div>
            </div>

            <button
              type="submit"
              className="tap-press w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all mt-2"
            >
              <Users className="w-4 h-4" />
              <span>Unlock ASHA Field Super-App</span>
            </button>
          </form>
        )}

        {/* Tab 4: Admin Login */}
        {activeTab === 'admin' && (
          <form onSubmit={handleAdminLogin} className="p-5 sm:p-7 space-y-4 text-xs">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 space-y-1">
              <span className="font-bold block">🏛️ District Health Directorate Command</span>
              <p className="text-[11px] text-amber-900">
                Authorized for <strong>Dr. K. Verma (Admin CMO)</strong>. Demo Master Key: <strong>admin123</strong>
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Directorate Master Key</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  placeholder="Enter Master Key (default: admin123)"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 outline-none focus:border-amber-600"
                />
              </div>
            </div>

            <button
              type="submit"
              className="tap-press w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all mt-2"
            >
              <Building2 className="w-4 h-4" />
              <span>Unlock District Directorate Command</span>
            </button>
          </form>
        )}

        {/* 1-Tap Quick Demo Logins Footer */}
        <div className="p-4 bg-slate-100/90 border-t border-slate-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2 text-center">
            ⚡ Quick 1-Tap Instant Evaluation Access
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => handlePatientLogin()}
              className="tap-press py-2 px-2 rounded-xl bg-white hover:bg-blue-50 text-blue-800 border border-slate-200 font-bold text-xs shadow-2xs text-center"
            >
              👤 Demo Citizen
            </button>
            <button
              type="button"
              onClick={() => handleDoctorLogin()}
              className="tap-press py-2 px-2 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 border border-slate-200 font-bold text-xs shadow-2xs text-center"
            >
              👨‍⚕️ Demo Doctor
            </button>
            <button
              type="button"
              onClick={() => handleAshaLogin()}
              className="tap-press py-2 px-2 rounded-xl bg-white hover:bg-purple-50 text-purple-800 border border-slate-200 font-bold text-xs shadow-2xs text-center"
            >
              👩‍⚕️ Demo ASHA
            </button>
            <button
              type="button"
              onClick={() => handleAdminLogin()}
              className="tap-press py-2 px-2 rounded-xl bg-white hover:bg-amber-50 text-amber-950 border border-slate-200 font-bold text-xs shadow-2xs text-center"
            >
              🏛️ Demo Admin
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
