import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home,
  Stethoscope,
  Users,
  Building2,
  MapPin,
  Info,
  Siren,
  Pill,
  ShieldCheck,
  User,
  Fingerprint,
  Video,
  Activity,
  LogOut,
  Sparkles,
  ChevronDown,
  Microscope,
  Baby,
  Heart,
  FileText,
  Clock,
  Navigation,
  KeyRound,
  FileCode,
} from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import LanguageToggle from './LanguageToggle.jsx'

export default function Navbar() {
  const {
    screen,
    go,
    setSosOpen,
    language,
    t,
    role,
    currentUser,
    setAuthModalOpen,
    patientRecords,
    openDoctorProfile,
    startVideoCall,
    logoutUser,
    setReferralTrackerModalOpen,
    setConsentVaultModalOpen,
    setFhirExportModalOpen,
    setHistoryModalOpen,
  } = useApp()

  // State for categorized dropdown menus: null | 'clinical' | 'facilities' | 'portals' | 'profile'
  const [openDropdown, setOpenDropdown] = useState(null)
  const navRef = useRef(null)

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleDropdown = (name) => {
    setOpenDropdown((prev) => (prev === name ? null : name))
  }

  const closeDropdowns = () => setOpenDropdown(null)

  // Role Theme Accents & Configurations
  const roleConfig = (() => {
    if (role === 'doctor') {
      return {
        themeColor: 'bg-emerald-600',
        topGradient: 'bg-gradient-to-r from-teal-500 via-emerald-600 to-teal-700',
        badgeBg: 'bg-emerald-50 text-emerald-900 border-emerald-300',
        roleTitle: 'Doctor Portal (Chief Medical Officer)',
        name: currentUser?.name || 'Dr. Rajesh Sharma (MD)',
        status: '🟢 OPD Room #03 Active',
        icon: Stethoscope,
      }
    }
    if (role === 'asha') {
      return {
        themeColor: 'bg-purple-600',
        topGradient: 'bg-gradient-to-r from-purple-500 via-indigo-600 to-purple-700',
        badgeBg: 'bg-purple-50 text-purple-900 border-purple-300',
        roleTitle: 'ASHA Super-App (Frontline Worker)',
        name: currentUser?.name || 'Anita Devi (ASHA)',
        status: '📶 Offline-First • Rampur Sector',
        icon: Users,
      }
    }
    if (role === 'admin') {
      return {
        themeColor: 'bg-amber-600',
        topGradient: 'bg-gradient-to-r from-amber-500 via-slate-800 to-amber-600',
        badgeBg: 'bg-amber-50 text-amber-950 border-amber-300',
        roleTitle: 'District Health Directorate (Command)',
        name: currentUser?.name || 'Dr. K. Verma (Admin CMO)',
        status: '🏛️ Nagpur Rural Command',
        icon: Building2,
      }
    }
    // Citizen / Patient
    return {
      themeColor: 'bg-blue-600',
      topGradient: 'grid-cols-3',
      badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
      roleTitle: 'Citizen Health Portal',
      name: currentUser?.name || 'Citizen Patient',
      status: 'ABHA Linked',
      icon: User,
    }
  })()

  // Mobile Bottom Navigation Bar Items
  const mobileNavItems = [
    { key: 'home', label: 'Home', icon: Home },
    { key: 'check', label: 'AI Check', icon: Stethoscope },
    { key: 'map', label: 'Hospitals', icon: MapPin },
    { key: 'medicines', label: 'Medicines', icon: Pill },
    {
      key: role === 'doctor' ? 'doctor' : role === 'asha' ? 'asha' : role === 'admin' ? 'admin' : 'asha',
      label: role === 'doctor' ? 'Dr. Desk' : role === 'asha' ? 'ASHA' : role === 'admin' ? 'Admin' : 'Portal',
      icon: role === 'doctor' ? Stethoscope : role === 'asha' ? Users : Building2,
      badge: role === 'asha' && patientRecords.length > 0 ? patientRecords.length : null,
    },
  ]

  return (
    <>
      {/* Top Banner Stripe - Adapts to Role */}
      {role === 'patient' ? (
        <div className="h-[2.5px] w-full grid grid-cols-3">
          <div className="bg-[#FF9933]" />
          <div className="bg-slate-100" />
          <div className="bg-[#138808]" />
        </div>
      ) : (
        <div className={`h-[3.5px] w-full ${roleConfig.topGradient}`} />
      )}

      {/* Modern Compact Categorized Header Bar */}
      <header ref={navRef} className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-3">
          {/* 1. Left: Logo & Portal Brand */}
          <button
            onClick={() => {
              closeDropdowns()
              go(role === 'doctor' ? 'doctor' : role === 'asha' ? 'asha' : role === 'admin' ? 'admin' : 'home')
            }}
            className="tap-press flex items-center gap-2 sm:gap-2.5 text-left shrink-0 group"
          >
            <img
              src="/logo.png"
              alt="Arogya Setu Logo"
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain rounded-xl shadow-2xs border border-blue-100/60 p-0.5 bg-white group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight leading-none whitespace-nowrap">
                  <span className="inline sm:hidden">Arogya Setu</span>
                  <span className="hidden sm:inline">{t('appName')}</span>
                </span>
                {role !== 'patient' && (
                  <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border hidden sm:inline ${roleConfig.badgeBg}`}>
                    {role}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-blue-600 font-bold tracking-wide uppercase mt-0.5 hidden sm:inline">
                {roleConfig.roleTitle}
              </span>
            </div>
          </button>

          {/* 2. Center: Compact Categorized Menu System */}
          <nav className="hidden lg:flex items-center gap-1">
            {/* Direct Link: Home */}
            <button
              type="button"
              onClick={() => { closeDropdowns(); go('home') }}
              className={`tap-press px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                screen === 'home'
                  ? 'bg-blue-50 text-blue-700 font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>{t('navHome')}</span>
            </button>

            {/* Category 1: Clinical Services Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown('clinical')}
                className={`tap-press px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  ['check', 'medicines'].includes(screen) || openDropdown === 'clinical'
                    ? 'bg-blue-50 text-blue-700 font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                <span>Clinical Services</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${openDropdown === 'clinical' ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {openDropdown === 'clinical' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.14 }}
                    className="absolute left-0 top-full mt-1.5 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 space-y-1 text-xs"
                  >
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Patient Clinical Care (Features 01, 05, 10, 11)
                    </div>

                    <button
                      type="button"
                      onClick={() => { closeDropdowns(); go('check') }}
                      className="tap-press w-full text-left p-2 rounded-xl hover:bg-blue-50 text-slate-700 hover:text-blue-700 flex items-center gap-2.5 transition-all"
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <Stethoscope className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-bold block text-slate-900">AI Care Navigator</span>
                        <span className="text-[10px] text-slate-500">Adaptive symptom triage</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => { closeDropdowns(); startVideoCall() }}
                      className="tap-press w-full text-left p-2 rounded-xl hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 flex items-center gap-2.5 transition-all"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Video className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-bold block text-slate-900 flex items-center gap-1">
                          Live Video Call
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        </span>
                        <span className="text-[10px] text-slate-500">Teleconsult with on-duty doctor</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => { closeDropdowns(); go('medicines') }}
                      className="tap-press w-full text-left p-2 rounded-xl hover:bg-amber-50 text-slate-700 hover:text-amber-700 flex items-center gap-2.5 transition-all"
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <Pill className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-bold block text-slate-900">Medicine & Diagnostics</span>
                        <span className="text-[10px] text-slate-500">Essential stock & lab tests</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => { closeDropdowns(); setReferralTrackerModalOpen(true) }}
                      className="tap-press w-full text-left p-2 rounded-xl hover:bg-purple-50 text-slate-700 hover:text-purple-700 flex items-center gap-2.5 transition-all"
                    >
                      <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                        <Activity className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-bold block text-slate-900">Referral Journey Tracker</span>
                        <span className="text-[10px] text-slate-500">6-Stage lifecycle tracker</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => { closeDropdowns(); setHistoryModalOpen(true) }}
                      className="tap-press w-full text-left p-2 rounded-xl hover:bg-teal-50 text-slate-700 hover:text-teal-700 flex items-center gap-2.5 transition-all border-t border-slate-100"
                    >
                      <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-bold block text-slate-900">My Health History & Reports</span>
                        <span className="text-[10px] text-slate-500">Triage history, slips & prescriptions</span>
                      </div>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Category 2: Facilities & Map Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown('facilities')}
                className={`tap-press px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  screen === 'map' || openDropdown === 'facilities'
                    ? 'bg-blue-50 text-blue-700 font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>Facilities & Map</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${openDropdown === 'facilities' ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {openDropdown === 'facilities' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.14 }}
                    className="absolute left-0 top-full mt-1.5 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 space-y-1 text-xs"
                  >
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Geospatial Network (Features 02, 03, 09)
                    </div>

                    <button
                      type="button"
                      onClick={() => { closeDropdowns(); go('map') }}
                      className="tap-press w-full text-left p-2 rounded-xl hover:bg-blue-50 text-slate-700 hover:text-blue-700 flex items-center gap-2.5 transition-all"
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-bold block text-slate-900">Hospital Command Map</span>
                        <span className="text-[10px] text-slate-500">Live GPS proximity radar</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => { closeDropdowns(); go('map') }}
                      className="tap-press w-full text-left p-2 rounded-xl hover:bg-slate-50 text-slate-700 flex items-center gap-2.5 transition-all"
                    >
                      <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                        <Building2 className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-bold block text-slate-900">PHC / CHC Directory</span>
                        <span className="text-[10px] text-slate-500">On-duty doctors & beds</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => { closeDropdowns(); go('map') }}
                      className="tap-press w-full text-left p-2 rounded-xl hover:bg-amber-50 text-slate-700 flex items-center gap-2.5 transition-all"
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-bold block text-slate-900">Smart Wait-Time Predictor</span>
                        <span className="text-[10px] text-slate-500">Live OPD queue forecast</span>
                      </div>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Category 3: Special Role Portals Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown('portals')}
                className={`tap-press px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  ['doctor', 'asha', 'admin'].includes(screen) || openDropdown === 'portals'
                    ? 'bg-blue-50 text-blue-700 font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Specialized Portals</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${openDropdown === 'portals' ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {openDropdown === 'portals' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.14 }}
                    className="absolute left-0 top-full mt-1.5 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 space-y-1 text-xs"
                  >
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Role Workbenches (Features 13–20)
                    </div>

                    <button
                      type="button"
                      onClick={() => { closeDropdowns(); go('doctor') }}
                      className="tap-press w-full text-left p-2 rounded-xl hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 flex items-center gap-2.5 transition-all"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Stethoscope className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-bold block text-slate-900">Doctor AI Workbench</span>
                        <span className="text-[10px] text-slate-500">OPD Queue, Rx & Consultations</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => { closeDropdowns(); go('asha') }}
                      className="tap-press w-full text-left p-2 rounded-xl hover:bg-purple-50 text-slate-700 hover:text-purple-700 flex items-center gap-2.5 transition-all"
                    >
                      <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                        <Users className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-bold block text-slate-900 flex items-center justify-between">
                          <span>ASHA Field Super-App</span>
                          {patientRecords.length > 0 && (
                            <span className="text-[9px] bg-purple-600 text-white px-1.5 rounded-full">{patientRecords.length}</span>
                          )}
                        </span>
                        <span className="text-[10px] text-slate-500">MCH, Watchlist, Household survey</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => { closeDropdowns(); go('admin') }}
                      className="tap-press w-full text-left p-2 rounded-xl hover:bg-amber-50 text-slate-700 hover:text-amber-700 flex items-center gap-2.5 transition-all"
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <Building2 className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-bold block text-slate-900">District Admin Desk</span>
                        <span className="text-[10px] text-slate-500">Care capacity heatmap & beds</span>
                      </div>
                    </button>

                    <div className="pt-1 border-t border-slate-100 space-y-1">
                      <button
                        type="button"
                        onClick={() => { closeDropdowns(); setConsentVaultModalOpen(true) }}
                        className="tap-press w-full text-left p-1.5 rounded-lg hover:bg-indigo-50 text-[11px] text-indigo-900 flex items-center gap-2"
                      >
                        <KeyRound className="w-3 h-3 text-indigo-600 shrink-0" />
                        <span>Privacy & Consent Vault (ABDM)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => { closeDropdowns(); setFhirExportModalOpen(true) }}
                        className="tap-press w-full text-left p-1.5 rounded-lg hover:bg-blue-50 text-[11px] text-blue-900 flex items-center gap-2"
                      >
                        <FileCode className="w-3 h-3 text-blue-600 shrink-0" />
                        <span>FHIR Interoperability Bridge</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* 3. Right: Compact User Profile & Quick Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Quick Live Video Call Button */}
            <button
              type="button"
              onClick={() => startVideoCall()}
              className="tap-press inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-all"
              title="Start Live Video Teleconsultation"
            >
              <Video className="w-3.5 h-3.5 animate-pulse" />
              <span className="hidden md:inline">Video Call</span>
            </button>

            {/* Profile / Role Dropdown Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown('profile')}
                className={`tap-press inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl border text-xs font-bold transition-all shadow-2xs ${roleConfig.badgeBg}`}
                title="Account & Role Profile"
              >
                <roleConfig.icon className="w-3.5 h-3.5 shrink-0" />
                <span className="text-[11px] sm:text-xs font-bold max-w-[80px] sm:max-w-[110px] truncate">
                  {roleConfig.name}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              <AnimatePresence>
                {openDropdown === 'profile' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.14 }}
                    className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 space-y-1 text-xs"
                  >
                    <div className="p-2 bg-slate-50 rounded-xl mb-1">
                      <p className="font-bold text-slate-900 truncate">{roleConfig.name}</p>
                      <p className="text-[10.5px] text-slate-500">{roleConfig.roleTitle}</p>
                      <span className="text-[10px] font-mono text-emerald-700 font-bold">{roleConfig.status}</span>
                    </div>

                    {role === 'doctor' && (
                      <button
                        type="button"
                        onClick={() => { closeDropdowns(); openDoctorProfile() }}
                        className="tap-press w-full text-left p-2 rounded-xl hover:bg-slate-100 text-slate-700 font-bold flex items-center gap-2"
                      >
                        <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                        <span>My Clinician Profile</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => { closeDropdowns(); setHistoryModalOpen(true) }}
                      className="tap-press w-full text-left p-2 rounded-xl hover:bg-slate-100 text-slate-700 font-bold flex items-center gap-2"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>My Medical History & Reports</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { closeDropdowns(); setAuthModalOpen(true) }}
                      className="tap-press w-full text-left p-2 rounded-xl hover:bg-blue-50 text-blue-700 font-bold flex items-center gap-2"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Switch Role (Login Gate)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { closeDropdowns(); logoutUser() }}
                      className="tap-press w-full text-left p-2 rounded-xl hover:bg-red-50 text-red-600 font-bold flex items-center gap-2 border-t border-slate-100"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-600" />
                      <span>Log Out & Lock</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 17-Language Toggle */}
            <LanguageToggle />

            {/* 108 Emergency Shortcut */}
            <button
              type="button"
              onClick={() => setSosOpen(true)}
              className="tap-press inline-flex items-center gap-1 px-2.5 sm:px-3 h-8 sm:h-9 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs whitespace-nowrap"
              aria-label={t('sosButton')}
            >
              <Siren className="w-3.5 h-3.5 animate-pulse" />
              <span className="hidden md:inline">{t('sosButton')}</span>
              <span className="inline md:hidden">108</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-1 py-1.5"
      >
        <div className="grid grid-cols-5 gap-0.5">
          {mobileNavItems.map((item) => {
            const active = screen === item.key
            const Icon = item.icon
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => go(item.key)}
                className={`tap-press flex flex-col items-center justify-center py-1 rounded-xl transition-all relative ${
                  active
                    ? 'text-blue-700 font-extrabold bg-blue-50/80'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${
                      active ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'
                    }`}
                  />
                  {item.badge && (
                    <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-0.5 leading-tight tracking-tight">
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
