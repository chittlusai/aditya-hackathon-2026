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
  Menu,
  X,
  Layers,
  HeartPulse,
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
  } = useApp()

  // Dropdown states: null | 'clinical' | 'facilities' | 'portals' | 'upgrades' | 'mobile_category'
  const [openDropdown, setOpenDropdown] = useState(null)
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState(null) // null | 'clinical' | 'facilities' | 'portals' | 'upgrades'
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const navRef = useRef(null)

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenDropdown(null)
        setMobileCategoryOpen(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleDropdown = (name) => {
    setOpenDropdown((prev) => (prev === name ? null : name))
  }

  const toggleMobileCategory = (name) => {
    setMobileCategoryOpen((prev) => (prev === name ? null : name))
  }

  const closeDropdowns = () => {
    setOpenDropdown(null)
    setMobileCategoryOpen(null)
    setMobileDrawerOpen(false)
  }

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
    if (!currentUser) {
      return {
        themeColor: 'bg-slate-700',
        topGradient: 'grid-cols-3',
        badgeBg: 'bg-amber-50 text-amber-900 border-amber-300',
        roleTitle: 'Authentication Required',
        name: 'Login Required',
        status: '🔒 Portal Locked',
        icon: User,
      }
    }
    // Citizen / Patient
    return {
      themeColor: 'bg-blue-600',
      topGradient: 'grid-cols-3',
      badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
      roleTitle: 'Citizen Health Portal',
      name: currentUser.name || 'Citizen Patient',
      status: 'ABHA Linked',
      icon: User,
    }
  })()

  // Mobile Bottom Navigation Bar Items (Thumb Friendly)
  const mobileNavItems = [
    { key: 'home', label: 'Home', icon: Home, action: () => go('home') },
    { key: 'check', label: 'AI Check', icon: Stethoscope, action: () => go('check') },
    { key: 'map', label: 'Hospitals', icon: MapPin, action: () => go('map') },
    { key: 'medicines', label: 'Medicines', icon: Pill, action: () => go('medicines') },
    {
      key: 'history',
      label: 'History',
      icon: FileText,
      badge: role === 'asha' && patientRecords.length > 0 ? patientRecords.length : null,
      action: () => go('history'),
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

      {/* Main Header Bar */}
      <header ref={navRef} className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs w-full">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 h-13 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-3">
          {/* 1. Left: Brand Logo & Title */}
          <button
            type="button"
            onClick={() => {
              closeDropdowns()
              go('home')
            }}
            className="tap-press flex items-center gap-1.5 sm:gap-2.5 text-left shrink-0 group min-w-0"
          >
            <img
              src="/logo.png"
              alt="Arogya Setu Logo"
              className="w-7 h-7 sm:w-9 sm:h-9 object-contain rounded-xl shadow-2xs border border-blue-100/60 p-0.5 bg-white group-hover:scale-105 transition-transform shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-xs sm:text-base text-slate-900 tracking-tight leading-none truncate">
                  <span className="inline sm:hidden">Arogya Setu</span>
                  <span className="hidden sm:inline">{t('appName')}</span>
                </span>
                {role !== 'patient' && (
                  <span className={`text-[8px] sm:text-[9px] font-extrabold uppercase px-1 py-0.2 rounded border shrink-0 ${roleConfig.badgeBg}`}>
                    {role}
                  </span>
                )}
              </div>
              <span className="text-[9px] sm:text-[10px] text-blue-600 font-bold tracking-wide uppercase mt-0.5 hidden sm:inline truncate">
                {roleConfig.roleTitle}
              </span>
            </div>
          </button>

          {/* 2. Center: Categorized Desktop Navigation Menu */}
          <nav className="hidden lg:flex items-center gap-1">
            {/* Category 0: Direct Home */}
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

            {/* Category 1: Clinical Care Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown('clinical')}
                className={`tap-press px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  ['check', 'history'].includes(screen) || openDropdown === 'clinical'
                    ? 'bg-blue-50 text-blue-700 font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                <span>Clinical Care</span>
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
                      Patient Clinical Services
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
                        <span className="font-bold block text-slate-900">AI Care Navigator (Triage)</span>
                        <span className="text-[10px] text-slate-500">Symptom evaluation & protocols</span>
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
                          Live Video Consult
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        </span>
                        <span className="text-[10px] text-slate-500">Teleconsult with on-duty doctor</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => { closeDropdowns(); go('history') }}
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

            {/* Category 2: Facilities & Logistics Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown('facilities')}
                className={`tap-press px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  ['map', 'medicines'].includes(screen) || openDropdown === 'facilities'
                    ? 'bg-blue-50 text-blue-700 font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Facilities & Logistics</span>
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
                      Geospatial & Inventory Network
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
                        <span className="text-[10px] text-slate-500">Live PHCs, CHCs & GPS Radar</span>
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
                        <span className="font-bold block text-slate-900">Medicines & Diagnostic Labs</span>
                        <span className="text-[10px] text-slate-500">Stock availability & tests</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => { closeDropdowns(); setSosOpen(true) }}
                      className="tap-press w-full text-left p-2 rounded-xl hover:bg-red-50 text-slate-700 hover:text-red-700 flex items-center gap-2.5 transition-all border-t border-slate-100"
                    >
                      <div className="w-7 h-7 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                        <Siren className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                      </div>
                      <div>
                        <span className="font-bold block text-slate-900">108 Emergency Ambulance</span>
                        <span className="text-[10px] text-slate-500">Immediate dispatch service</span>
                      </div>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Category 3: Role Portals Dropdown */}
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
                <Users className="w-3.5 h-3.5 text-purple-600" />
                <span>Role Portals</span>
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
                      Select Healthcare Desk
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
                        <span className="text-[10px] text-slate-500">Live OPD, AI Rx & Queue</span>
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
                        <span className="font-bold block text-slate-900">ASHA Field Super-App</span>
                        <span className="text-[10px] text-slate-500">Offline MCH & Household triage</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => { closeDropdowns(); go('admin') }}
                      className="tap-press w-full text-left p-2 rounded-xl hover:bg-amber-50 text-slate-700 hover:text-amber-950 flex items-center gap-2.5 transition-all"
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                        <Building2 className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-bold block text-slate-900">District Health Directorate</span>
                        <span className="text-[10px] text-slate-500">Resource allocation & analytics</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => { closeDropdowns(); setAuthModalOpen(true) }}
                      className="tap-press w-full text-left p-2 rounded-xl hover:bg-blue-50 text-blue-700 font-bold flex items-center gap-2.5 transition-all border-t border-slate-100"
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-bold block text-blue-900">Switch Role / Login</span>
                        <span className="text-[10px] text-blue-600">Access citizen or officer logins</span>
                      </div>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Category 4: Advanced Upgrades Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown('upgrades')}
                className={`tap-press px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  openDropdown === 'upgrades'
                    ? 'bg-blue-50 text-blue-700 font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Advanced Upgrades</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${openDropdown === 'upgrades' ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {openDropdown === 'upgrades' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.14 }}
                    className="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 space-y-1 text-xs"
                  >
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      SIH26133 Architecture
                    </div>

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
                      onClick={() => { closeDropdowns(); setConsentVaultModalOpen(true) }}
                      className="tap-press w-full text-left p-2 rounded-xl hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 flex items-center gap-2.5 transition-all"
                    >
                      <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                        <KeyRound className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-bold block text-slate-900">Consent Vault (ABDM)</span>
                        <span className="text-[10px] text-slate-500">DPDP Act consent tokens</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => { closeDropdowns(); setFhirExportModalOpen(true) }}
                      className="tap-press w-full text-left p-2 rounded-xl hover:bg-blue-50 text-slate-700 hover:text-blue-700 flex items-center gap-2.5 transition-all"
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <FileCode className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-bold block text-slate-900">FHIR Interoperability Bridge</span>
                        <span className="text-[10px] text-slate-500">HL7 / ABDM export standard</span>
                      </div>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* 3. Right: Quick Actions (Language, Profile, SOS) */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Desktop Only: Quick Live Video Call Button */}
            <button
              type="button"
              onClick={() => startVideoCall()}
              className="tap-press hidden md:inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-all"
              title="Start Live Video Teleconsultation"
            >
              <Video className="w-3.5 h-3.5 animate-pulse" />
              <span>Video Call</span>
            </button>

            {/* Profile / Role Dropdown Pill */}
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className={`tap-press inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl border text-xs font-bold transition-all shadow-2xs ${roleConfig.badgeBg}`}
              title="Account & Role Profile"
            >
              <roleConfig.icon className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[10px] sm:text-xs font-bold max-w-[75px] sm:max-w-[110px] truncate">
                {currentUser ? roleConfig.name.split(' ')[0] : 'Login'}
              </span>
              <ChevronDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
            </button>

            {/* 17-Language Toggle */}
            <LanguageToggle />

            {/* 108 Emergency SOS Button */}
            <button
              type="button"
              onClick={() => setSosOpen(true)}
              className="tap-press hidden sm:inline-flex items-center gap-1 px-2.5 sm:px-3 h-8 sm:h-9 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs whitespace-nowrap"
              aria-label={t('sosButton')}
            >
              <Siren className="w-3.5 h-3.5 animate-pulse" />
              <span>{t('sosButton')}</span>
            </button>

            {/* Mobile Hamburger Menu Drawer Toggle (Visible on small screens) */}
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="tap-press lg:hidden w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center border border-slate-200 shrink-0"
              aria-label="Open Menu Drawer"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4. Categorized Sub-Header Bar for Mobile & Tablet (< lg) */}
        <div className="lg:hidden border-t border-slate-100 bg-slate-50/95 px-2 py-1.5 overflow-x-auto flex items-center gap-1.5 no-scrollbar">
          {/* Category: Home */}
          <button
            type="button"
            onClick={() => { closeDropdowns(); go('home') }}
            className={`tap-press px-2.5 py-1.5 rounded-xl text-[11px] font-bold shrink-0 transition-all flex items-center gap-1 ${
              screen === 'home' ? 'bg-blue-600 text-white shadow-2xs' : 'bg-white text-slate-700 border border-slate-200'
            }`}
          >
            <span>🏠 Home</span>
          </button>

          {/* Category: Clinical Care Popover Trigger */}
          <button
            type="button"
            onClick={() => toggleMobileCategory('clinical')}
            className={`tap-press px-2.5 py-1.5 rounded-xl text-[11px] font-bold shrink-0 flex items-center gap-1 transition-all ${
              ['check', 'history'].includes(screen) || mobileCategoryOpen === 'clinical'
                ? 'bg-blue-600 text-white shadow-2xs font-extrabold'
                : 'bg-blue-50 text-blue-900 border border-blue-200'
            }`}
          >
            <Stethoscope className="w-3 h-3" />
            <span>Clinical ▾</span>
          </button>

          {/* Category: Facilities Popover Trigger */}
          <button
            type="button"
            onClick={() => toggleMobileCategory('facilities')}
            className={`tap-press px-2.5 py-1.5 rounded-xl text-[11px] font-bold shrink-0 flex items-center gap-1 transition-all ${
              ['map', 'medicines'].includes(screen) || mobileCategoryOpen === 'facilities'
                ? 'bg-emerald-600 text-white shadow-2xs font-extrabold'
                : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
            }`}
          >
            <Building2 className="w-3 h-3" />
            <span>Facilities ▾</span>
          </button>

          {/* Category: Role Portals Popover Trigger */}
          <button
            type="button"
            onClick={() => toggleMobileCategory('portals')}
            className={`tap-press px-2.5 py-1.5 rounded-xl text-[11px] font-bold shrink-0 flex items-center gap-1 transition-all ${
              ['doctor', 'asha', 'admin'].includes(screen) || mobileCategoryOpen === 'portals'
                ? 'bg-purple-600 text-white shadow-2xs font-extrabold'
                : 'bg-purple-50 text-purple-900 border border-purple-200'
            }`}
          >
            <Users className="w-3 h-3" />
            <span>Portals ▾</span>
          </button>

          {/* Category: Upgrades Popover Trigger */}
          <button
            type="button"
            onClick={() => toggleMobileCategory('upgrades')}
            className={`tap-press px-2.5 py-1.5 rounded-xl text-[11px] font-bold shrink-0 flex items-center gap-1 transition-all ${
              mobileCategoryOpen === 'upgrades'
                ? 'bg-indigo-600 text-white shadow-2xs font-extrabold'
                : 'bg-indigo-50 text-indigo-900 border border-indigo-200'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Upgrades ▾</span>
          </button>
        </div>
      </header>

      {/* 5. Fixed Mobile Floating Category Popover (Unclipped, Full Viewport Access) */}
      <AnimatePresence>
        {mobileCategoryOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-start pt-24 px-3 sm:px-6 pointer-events-auto">
            {/* Dim Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileCategoryOpen(null)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            {/* Floating Action Menu Card */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="relative w-full max-w-sm mx-auto bg-white rounded-3xl shadow-2xl border border-slate-200 p-3.5 z-50 space-y-2"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 px-1">
                <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                  {mobileCategoryOpen === 'clinical' && (
                    <>
                      <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                      <span>Clinical Care Services</span>
                    </>
                  )}
                  {mobileCategoryOpen === 'facilities' && (
                    <>
                      <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Facilities & Logistics</span>
                    </>
                  )}
                  {mobileCategoryOpen === 'portals' && (
                    <>
                      <Users className="w-3.5 h-3.5 text-purple-600" />
                      <span>Role Portals & Desks</span>
                    </>
                  )}
                  {mobileCategoryOpen === 'upgrades' && (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Advanced Upgrades</span>
                    </>
                  )}
                </span>

                <button
                  type="button"
                  onClick={() => setMobileCategoryOpen(null)}
                  className="tap-press w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Action List for Clinical */}
              {mobileCategoryOpen === 'clinical' && (
                <div className="space-y-1 text-xs">
                  <button
                    type="button"
                    onClick={() => { closeDropdowns(); go('check') }}
                    className="tap-press w-full text-left p-2.5 rounded-2xl hover:bg-blue-50 bg-slate-50 text-slate-800 flex items-center gap-3 transition-all"
                  >
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold block text-slate-900">AI Care Navigator (Triage)</span>
                      <span className="text-[10px] text-slate-500">Symptom check & severity advice</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { closeDropdowns(); startVideoCall() }}
                    className="tap-press w-full text-left p-2.5 rounded-2xl hover:bg-emerald-50 bg-slate-50 text-slate-800 flex items-center gap-3 transition-all"
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Video className="w-4 h-4 animate-pulse" />
                    </div>
                    <div>
                      <span className="font-bold block text-slate-900 flex items-center gap-1">
                        Live Video Consult
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      </span>
                      <span className="text-[10px] text-slate-500">Real-time consultation with AI doctor</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { closeDropdowns(); go('history') }}
                    className="tap-press w-full text-left p-2.5 rounded-2xl hover:bg-teal-50 bg-slate-50 text-slate-800 flex items-center gap-3 transition-all"
                  >
                    <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold block text-slate-900">My Health History & Rx Vault</span>
                      <span className="text-[10px] text-slate-500">Past prescriptions, slips & reports</span>
                    </div>
                  </button>
                </div>
              )}

              {/* Action List for Facilities */}
              {mobileCategoryOpen === 'facilities' && (
                <div className="space-y-1 text-xs">
                  <button
                    type="button"
                    onClick={() => { closeDropdowns(); go('map') }}
                    className="tap-press w-full text-left p-2.5 rounded-2xl hover:bg-blue-50 bg-slate-50 text-slate-800 flex items-center gap-3 transition-all"
                  >
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold block text-slate-900">Hospital Command Map</span>
                      <span className="text-[10px] text-slate-500">Nearby PHCs, CHCs & Live GPS radar</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { closeDropdowns(); go('medicines') }}
                    className="tap-press w-full text-left p-2.5 rounded-2xl hover:bg-amber-50 bg-slate-50 text-slate-800 flex items-center gap-3 transition-all"
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                      <Pill className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold block text-slate-900">Medicines & Diagnostic Labs</span>
                      <span className="text-[10px] text-slate-500">Stock availability & medical tests</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { closeDropdowns(); setSosOpen(true) }}
                    className="tap-press w-full text-left p-2.5 rounded-2xl hover:bg-red-50 bg-red-50/50 text-slate-800 flex items-center gap-3 transition-all border border-red-200"
                  >
                    <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0">
                      <Siren className="w-4 h-4 animate-pulse" />
                    </div>
                    <div>
                      <span className="font-bold block text-red-700">108 Emergency Ambulance</span>
                      <span className="text-[10px] text-red-500">Immediate GPS dispatch service</span>
                    </div>
                  </button>
                </div>
              )}

              {/* Action List for Portals */}
              {mobileCategoryOpen === 'portals' && (
                <div className="space-y-1 text-xs">
                  <button
                    type="button"
                    onClick={() => { closeDropdowns(); go('doctor') }}
                    className="tap-press w-full text-left p-2.5 rounded-2xl hover:bg-emerald-50 bg-slate-50 text-slate-800 flex items-center gap-3 transition-all"
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold block text-slate-900">Doctor AI Workbench</span>
                      <span className="text-[10px] text-slate-500">Live OPD Queue & clinical records</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { closeDropdowns(); go('asha') }}
                    className="tap-press w-full text-left p-2.5 rounded-2xl hover:bg-purple-50 bg-slate-50 text-slate-800 flex items-center gap-3 transition-all"
                  >
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold block text-slate-900">ASHA Field Super-App</span>
                      <span className="text-[10px] text-slate-500">Offline maternal health & household survey</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { closeDropdowns(); go('admin') }}
                    className="tap-press w-full text-left p-2.5 rounded-2xl hover:bg-amber-50 bg-slate-50 text-slate-800 flex items-center gap-3 transition-all"
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold block text-slate-900">District Health Directorate</span>
                      <span className="text-[10px] text-slate-500">Administrative analytics & supply logistics</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { closeDropdowns(); setAuthModalOpen(true) }}
                    className="tap-press w-full text-left p-2.5 rounded-2xl hover:bg-blue-50 bg-blue-50/60 text-blue-900 flex items-center gap-3 transition-all border border-blue-200"
                  >
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold block text-blue-950">Switch Role / Login</span>
                      <span className="text-[10px] text-blue-700">Login with ABHA, Mobile OTP or Doctor ID</span>
                    </div>
                  </button>
                </div>
              )}

              {/* Action List for Upgrades */}
              {mobileCategoryOpen === 'upgrades' && (
                <div className="space-y-1 text-xs">
                  <button
                    type="button"
                    onClick={() => { closeDropdowns(); setReferralTrackerModalOpen(true) }}
                    className="tap-press w-full text-left p-2.5 rounded-2xl hover:bg-purple-50 bg-slate-50 text-slate-800 flex items-center gap-3 transition-all"
                  >
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold block text-slate-900">Referral Journey Tracker</span>
                      <span className="text-[10px] text-slate-500">Live ambulance tracking & Bed lock</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { closeDropdowns(); setConsentVaultModalOpen(true) }}
                    className="tap-press w-full text-left p-2.5 rounded-2xl hover:bg-indigo-50 bg-slate-50 text-slate-800 flex items-center gap-3 transition-all"
                  >
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold block text-slate-900">Consent Vault (ABDM)</span>
                      <span className="text-[10px] text-slate-500">Granular PHR consent management</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { closeDropdowns(); setFhirExportModalOpen(true) }}
                    className="tap-press w-full text-left p-2.5 rounded-2xl hover:bg-blue-50 bg-slate-50 text-slate-800 flex items-center gap-3 transition-all"
                  >
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                      <FileCode className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold block text-slate-900">FHIR R4 Bridge</span>
                      <span className="text-[10px] text-slate-500">Interoperable health data export</span>
                    </div>
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Slide-Out Navigation Drawer */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileDrawerOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            {/* Slide-out Sheet */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl z-10 flex flex-col overflow-y-auto"
            >
              {/* Drawer Top Header */}
              <div className="p-4 bg-gradient-to-r from-blue-900 to-indigo-950 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="Logo" className="w-7 h-7 object-contain bg-white rounded-lg p-0.5" />
                  <div>
                    <span className="font-bold text-sm block leading-tight">Arogya Setu Local</span>
                    <span className="text-[10px] text-blue-200">{roleConfig.name}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="tap-press w-7 h-7 rounded-full bg-white/20 text-white flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick 1-Tap Emergency SOS & Video Banner */}
              <div className="p-3 bg-slate-50 border-b border-slate-200 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { closeDropdowns(); startVideoCall() }}
                  className="tap-press p-2 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Video Doctor</span>
                </button>

                <button
                  type="button"
                  onClick={() => { closeDropdowns(); setSosOpen(true) }}
                  className="tap-press p-2 rounded-xl bg-red-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Siren className="w-3.5 h-3.5 animate-pulse" />
                  <span>108 SOS</span>
                </button>
              </div>

              {/* Drawer Navigation Links Organised by Category */}
              <div className="p-3 space-y-4 text-xs flex-1">
                {/* 1. Clinical Care Category */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md inline-block mb-1.5">
                    🩺 Clinical Care
                  </span>
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => { closeDropdowns(); go('home') }}
                      className={`tap-press w-full text-left p-2.5 rounded-xl font-bold flex items-center gap-2.5 ${screen === 'home' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                      <Home className="w-4 h-4 text-blue-600" />
                      <span>Home Dashboard</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { closeDropdowns(); go('check') }}
                      className={`tap-press w-full text-left p-2.5 rounded-xl font-bold flex items-center gap-2.5 ${screen === 'check' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                      <Stethoscope className="w-4 h-4 text-blue-600" />
                      <span>AI Symptom Triage</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { closeDropdowns(); go('history') }}
                      className={`tap-press w-full text-left p-2.5 rounded-xl font-bold flex items-center gap-2.5 ${screen === 'history' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                      <FileText className="w-4 h-4 text-teal-600" />
                      <span>My Medical History & Slips</span>
                    </button>
                  </div>
                </div>

                {/* 2. Facilities & Logistics Category */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mb-1.5">
                    🏥 Facilities & Logistics
                  </span>
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => { closeDropdowns(); go('map') }}
                      className={`tap-press w-full text-left p-2.5 rounded-xl font-bold flex items-center gap-2.5 ${screen === 'map' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      <span>Nearby Hospitals & GPS Radar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { closeDropdowns(); go('medicines') }}
                      className={`tap-press w-full text-left p-2.5 rounded-xl font-bold flex items-center gap-2.5 ${screen === 'medicines' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                      <Pill className="w-4 h-4 text-amber-600" />
                      <span>Medicines & Lab Diagnostics</span>
                    </button>
                  </div>
                </div>

                {/* 3. Role Portals Category */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md inline-block mb-1.5">
                    👨‍⚕️ Healthcare Portals
                  </span>
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => { closeDropdowns(); go('doctor') }}
                      className="tap-press w-full text-left p-2.5 rounded-xl font-bold flex items-center gap-2.5 text-slate-700 hover:bg-emerald-50"
                    >
                      <Stethoscope className="w-4 h-4 text-emerald-600" />
                      <span>Doctor AI Workbench</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { closeDropdowns(); go('asha') }}
                      className="tap-press w-full text-left p-2.5 rounded-xl font-bold flex items-center gap-2.5 text-slate-700 hover:bg-purple-50"
                    >
                      <Users className="w-4 h-4 text-purple-600" />
                      <span>ASHA Field Super-App</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { closeDropdowns(); go('admin') }}
                      className="tap-press w-full text-left p-2.5 rounded-xl font-bold flex items-center gap-2.5 text-slate-700 hover:bg-amber-50"
                    >
                      <Building2 className="w-4 h-4 text-amber-600" />
                      <span>District Health Directorate</span>
                    </button>
                  </div>
                </div>

                {/* 4. Advanced Upgrades Category */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md inline-block mb-1.5">
                    ⚡ Advanced Upgrades (SIH26133)
                  </span>
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => { closeDropdowns(); setReferralTrackerModalOpen(true) }}
                      className="tap-press w-full text-left p-2.5 rounded-xl font-bold flex items-center gap-2.5 text-slate-700 hover:bg-slate-50"
                    >
                      <Activity className="w-4 h-4 text-purple-600" />
                      <span>Referral Journey Tracker</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { closeDropdowns(); setConsentVaultModalOpen(true) }}
                      className="tap-press w-full text-left p-2.5 rounded-xl font-bold flex items-center gap-2.5 text-slate-700 hover:bg-slate-50"
                    >
                      <KeyRound className="w-4 h-4 text-indigo-600" />
                      <span>Consent Vault (ABDM)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { closeDropdowns(); setFhirExportModalOpen(true) }}
                      className="tap-press w-full text-left p-2.5 rounded-xl font-bold flex items-center gap-2.5 text-slate-700 hover:bg-slate-50"
                    >
                      <FileCode className="w-4 h-4 text-blue-600" />
                      <span>FHIR Interoperability Bridge</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Drawer Bottom Controls */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2">
                <button
                  type="button"
                  onClick={() => { closeDropdowns(); setAuthModalOpen(true) }}
                  className="tap-press w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Switch Role / Login</span>
                </button>

                <button
                  type="button"
                  onClick={() => { closeDropdowns(); logoutUser() }}
                  className="tap-press w-full py-2 rounded-xl text-red-600 font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out & Lock</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation Bar (Thumb Friendly) */}
      <nav
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/98 backdrop-blur-md border-t border-slate-200 shadow-lg px-1 py-1.5"
      >
        <div className="grid grid-cols-5 gap-0.5">
          {mobileNavItems.map((item) => {
            const active = screen === item.key
            const Icon = item.icon
            return (
              <button
                key={item.key}
                type="button"
                onClick={item.action}
                className={`tap-press flex flex-col items-center justify-center py-1 rounded-xl transition-all relative ${
                  active
                    ? 'text-blue-700 font-extrabold bg-blue-50/90'
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
