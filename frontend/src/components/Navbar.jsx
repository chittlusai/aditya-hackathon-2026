import { Home, Stethoscope, Users, Building2, MapPin, Info, Siren, ShieldCheck } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import LanguageToggle from './LanguageToggle.jsx'

export default function Navbar() {
  const { screen, go, setSosOpen, language, t, patientRecords } = useApp()

  const desktopLinks = [
    { key: 'home', label: t('navHome'), icon: Home },
    { key: 'check', label: t('navCheck'), icon: Stethoscope },
    { key: 'map', label: t('navMap'), icon: MapPin },
    { key: 'asha', label: t('navAsha'), icon: Users, badge: patientRecords.length > 0 ? patientRecords.length : null },
    { key: 'admin', label: t('navAdmin'), icon: Building2 },
    { key: 'about', label: t('navAbout'), icon: Info },
  ]

  const mobileNavItems = [
    {
      key: 'home',
      label: language === 'hi' ? 'होम' : language === 'mr' ? 'मुख्य' : 'Home',
      icon: Home,
    },
    {
      key: 'check',
      label: language === 'hi' ? 'जांच' : language === 'mr' ? 'तपासणी' : 'Check',
      icon: Stethoscope,
    },
    {
      key: 'map',
      label: language === 'hi' ? 'अस्पताल' : language === 'mr' ? 'रुग्णालये' : 'Hospitals',
      icon: MapPin,
    },
    {
      key: 'asha',
      label: language === 'hi' ? 'आशा' : language === 'mr' ? 'आशा' : 'ASHA',
      icon: Users,
      badge: patientRecords.length > 0 ? patientRecords.length : null,
    },
    {
      key: 'admin',
      label: language === 'hi' ? 'एडमिन' : language === 'mr' ? 'ॲडमिन' : 'Admin',
      icon: Building2,
    },
  ]

  return (
    <>
      {/* Subtle National Accent Line */}
      <div className="h-[2px] w-full grid grid-cols-3">
        <div className="bg-[#FF9933]" />
        <div className="bg-slate-100" />
        <div className="bg-[#138808]" />
      </div>

      {/* Clean, Modern, Single Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Portal Brand */}
          <button
            onClick={() => go('home')}
            className="tap-press flex items-center gap-2.5 text-left shrink-0 group"
          >
            <img
              src="/logo.png"
              alt="Arogya Setu Logo"
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain rounded-xl shadow-2xs border border-blue-100/60 p-0.5 bg-white group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight leading-none whitespace-nowrap">
                <span className="inline sm:hidden">Arogya Setu</span>
                <span className="hidden sm:inline">{t('appName')}</span>
              </span>
              <span className="text-[10px] text-blue-600 font-bold tracking-wide uppercase mt-0.5 hidden sm:inline">
                Rural Health Mission
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {desktopLinks.map((l) => {
              const active = screen === l.key
              const Icon = l.icon
              return (
                <button
                  key={l.key}
                  onClick={() => go(l.key)}
                  className={`tap-press px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    active
                      ? 'bg-blue-50 text-blue-700 font-extrabold'
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

          {/* Right Utilities: Language Selector & Emergency Button */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <LanguageToggle />

            <button
              type="button"
              onClick={() => setSosOpen(true)}
              className="tap-press inline-flex items-center gap-1 px-2.5 sm:px-3.5 h-8 sm:h-9 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] sm:text-xs font-bold shadow-xs whitespace-nowrap"
              aria-label={t('sosButton')}
            >
              <Siren className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('sosButton')}</span>
              <span className="inline sm:hidden">108</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 pb-[env(safe-area-inset-bottom)] shadow-lg">
        <ul className="grid grid-cols-5 h-14">
          {mobileNavItems.map((l) => {
            const Icon = l.icon
            const active = screen === l.key
            return (
              <li key={l.key} className="flex">
                <button
                  onClick={() => go(l.key)}
                  className={`tap-press w-full flex flex-col items-center justify-center gap-0.5 text-[10.5px] font-bold transition-all py-1 ${
                    active ? 'text-blue-700 font-extrabold bg-blue-50/70' : 'text-slate-500 hover:text-slate-900'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  <div className="relative">
                    <Icon className={`w-5 h-5 ${active ? 'text-blue-600 stroke-[2.5]' : 'text-slate-400'}`} />
                    {l.badge && (
                      <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
                        {l.badge}
                      </span>
                    )}
                  </div>
                  <span className="leading-none text-center whitespace-nowrap">{l.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
}
