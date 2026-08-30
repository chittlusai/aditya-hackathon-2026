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
  } = useApp()

  const desktopLinks = [
    { key: 'home', label: t('navHome'), icon: Home },
    { key: 'check', label: t('navCheck'), icon: Stethoscope },
    { key: 'map', label: t('navMap'), icon: MapPin },
    { key: 'medicines', label: 'Medicines & Tests', icon: Pill },
    { key: 'doctor', label: 'Doctor Desk', icon: Stethoscope },
    { key: 'asha', label: t('navAsha'), icon: Users, badge: patientRecords.length > 0 ? patientRecords.length : null },
    { key: 'admin', label: t('navAdmin'), icon: Building2 },
  ]

  // Role Theme Accents & Configurations
  const roleConfig = (() => {
    if (role === 'doctor') {
      return {
        themeColor: 'bg-emerald-600',
        topGradient: 'grid-cols-1 bg-gradient-to-r from-teal-500 via-emerald-600 to-teal-700',
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
        topGradient: 'grid-cols-1 bg-gradient-to-r from-purple-500 via-indigo-600 to-purple-700',
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
        topGradient: 'grid-cols-1 bg-gradient-to-r from-amber-500 via-slate-800 to-amber-600',
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

      {/* Role-Adaptive Specialized Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Portal Brand */}
          <button
            onClick={() => go(role === 'doctor' ? 'doctor' : role === 'asha' ? 'asha' : role === 'admin' ? 'admin' : 'home')}
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
                    {role.toUpperCase()} MODE
                  </span>
                )}
              </div>
              <span className="text-[10px] text-blue-600 font-bold tracking-wide uppercase mt-0.5 hidden sm:inline">
                {roleConfig.roleTitle}
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {desktopLinks.map((l) => {
              const active = screen === l.key
              const Icon = l.icon
              return (
                <button
                  key={l.key}
                  onClick={() => go(l.key)}
                  className={`tap-press px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    active
                      ? 'bg-blue-50 text-blue-700 font-extrabold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-blue-600 stroke-[2.5]' : 'text-slate-400'}`} />
                  <span>{l.label}</span>
                  {l.badge && (
                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {l.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* Right Header Controls (Role-Specific Actions) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* SPECIAL DOCTOR ACTIONS: Profile & Live Teleconsult */}
            {role === 'doctor' && (
              <div className="flex items-center gap-1 sm:gap-1.5">
                <button
                  type="button"
                  onClick={() => startVideoCall(null, null, true)}
                  className="tap-press inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-all"
                  title="Launch Teleconsultation Room"
                >
                  <Video className="w-3.5 h-3.5 animate-pulse" />
                  <span className="hidden md:inline">Teleconsult Video</span>
                </button>

                <button
                  type="button"
                  onClick={() => openDoctorProfile()}
                  className="tap-press inline-flex items-center gap-1 px-2.5 py-1 sm:py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 text-xs font-bold transition-all"
                  title="View Doctor Profile & Credentials"
                >
                  <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                  <span className="hidden sm:inline">My Profile</span>
                </button>
              </div>
            )}

            {/* PATIENT VIDEO CALL BUTTON (For clients suffering from problems) */}
            {role === 'patient' && (
              <button
                type="button"
                onClick={() => startVideoCall()}
                className="tap-press inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-all"
                title="Connect Live Video Call with Doctor"
              >
                <Video className="w-3.5 h-3.5 animate-pulse" />
                <span className="hidden sm:inline">Doctor Video Call</span>
                <span className="inline sm:hidden">Video</span>
              </button>
            )}

            {/* Active User Role Badge & Switcher */}
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className={`tap-press inline-flex items-center gap-1.5 px-2.5 py-1 sm:py-1.5 rounded-xl border text-xs font-bold transition-all shadow-2xs ${roleConfig.badgeBg}`}
              title="Click to Switch Role or Log Out"
            >
              <roleConfig.icon className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[11px] sm:text-xs font-bold max-w-[85px] sm:max-w-[120px] truncate">
                {roleConfig.name}
              </span>
            </button>

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
