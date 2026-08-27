import { Home, Stethoscope, Users, Building2, MapPin, Info, Siren, PhoneCall, ShieldCheck } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import LanguageToggle from './LanguageToggle.jsx'

export default function Navbar() {
  const { screen, go, setSosOpen, t, patientRecords } = useApp()

  const links = [
    { key: 'home', label: t('navHome'), icon: Home },
    { key: 'check', label: t('navCheck'), icon: Stethoscope },
    { key: 'map', label: t('navMap'), icon: MapPin },
    { key: 'asha', label: t('navAsha'), icon: Users, badge: patientRecords.length > 0 ? patientRecords.length : null },
    { key: 'admin', label: t('navAdmin'), icon: Building2 },
    { key: 'about', label: t('navAbout'), icon: Info },
  ]

  return (
    <>
      {/* Top Official Helpline Strip */}
      <div className="bg-slate-900 text-slate-200 text-[11px] py-1.5 px-4 sm:px-6 border-b border-slate-800">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-slate-300 hidden sm:inline">
              {t('govtNotice')}
            </span>
            <span className="flex items-center gap-1 text-red-400 font-bold">
              <PhoneCall className="w-3 h-3" />
              <span>{t('ambulanceLine')}</span>
            </span>
            <span className="hidden md:inline text-slate-400">|</span>
            <span className="hidden md:inline text-slate-300">
              {t('emergencyLine')}
            </span>
            <span className="hidden lg:inline text-slate-400">|</span>
            <span className="hidden lg:inline text-slate-300">
              {t('healthAdviceLine')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <LanguageToggle />
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-300 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Official Emblem & Portal Title */}
          <button
            onClick={() => go('home')}
            className="tap-press flex items-center gap-3 text-left"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-blue-900 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl text-blue-950 tracking-tight font-display">
                  {t('appName')}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {t('portalSubtitle')}
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {links.map((l) => {
              const active = screen === l.key
              const Icon = l.icon
              return (
                <button
                  key={l.key}
                  onClick={() => go(l.key)}
                  className={`tap-press px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-blue-50 text-blue-900 border-b-2 border-blue-800 rounded-b-none'
                      : 'text-slate-700 hover:text-blue-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{l.label}</span>
                  {l.badge && (
                    <span className="w-4 h-4 rounded-full bg-blue-700 text-white text-[10px] font-bold flex items-center justify-center">
                      {l.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* Emergency 108 Trigger */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSosOpen(true)}
              className="tap-press inline-flex items-center gap-1.5 px-3.5 sm:px-4 min-h-[38px] rounded-lg bg-red-700 hover:bg-red-800 text-white text-xs font-bold shadow-sm"
              aria-label={t('sosButton')}
            >
              <Siren className="w-4 h-4" />
              <span>{t('sosButton')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-300 pb-[env(safe-area-inset-bottom)] shadow-lg">
        <ul className="grid grid-cols-5 h-15">
          {[
            { key: 'home', label: t('navHome'), icon: Home },
            { key: 'check', label: t('navCheck'), icon: Stethoscope },
            { key: 'map', label: t('navMap'), icon: MapPin },
            { key: 'asha', label: t('navAsha'), icon: Users, badge: patientRecords.length > 0 ? patientRecords.length : null },
            { key: 'admin', label: t('navAdmin'), icon: Building2 },
          ].map((l) => {
            const Icon = l.icon
            const active = screen === l.key
            return (
              <li key={l.key} className="flex">
                <button
                  onClick={() => go(l.key)}
                  className={`tap-press w-full flex flex-col items-center justify-center gap-1 text-[11px] font-bold transition-all py-1 ${
                    active ? 'text-blue-900 font-extrabold bg-blue-50/70 border-t-2 border-blue-800' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  <div className="relative">
                    <Icon className="w-5 h-5" />
                    {l.badge && (
                      <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-blue-700 text-white text-[9px] font-bold flex items-center justify-center">
                        {l.badge}
                      </span>
                    )}
                  </div>
                  <span className="truncate max-w-[56px]">{l.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
}
