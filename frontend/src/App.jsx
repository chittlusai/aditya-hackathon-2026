import { AnimatePresence } from 'framer-motion'
import { AppProvider, useApp } from './context/AppContext.jsx'
import Navbar from './components/Navbar.jsx'
import OfflineBanner from './components/OfflineBanner.jsx'
import Home from './components/Home.jsx'
import SymptomInput from './components/SymptomInput.jsx'
import Result from './components/Result.jsx'
import AshaWorkerPortal from './components/AshaWorkerPortal.jsx'
import HospitalAdminPortal from './components/HospitalAdminPortal.jsx'
import HospitalDirectory from './components/HospitalDirectory.jsx'
import About from './components/About.jsx'
import EmergencyModal from './components/EmergencyModal.jsx'
import DigitalHealthSlip from './components/DigitalHealthSlip.jsx'
import GpsPermissionPrompt from './components/GpsPermissionPrompt.jsx'
import AdminAuthModal from './components/AdminAuthModal.jsx'
import LanguageSelectModal from './components/LanguageSelectModal.jsx'
import { PhoneCall } from 'lucide-react'

function Shell() {
  const { screen, activeSlip, setActiveSlip, t } = useApp()

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <OfflineBanner />
      <Navbar />

      {/* Main Content View */}
      <main className="flex-1 pb-24 lg:pb-10">
        {screen === 'home' && <Home />}
        {screen === 'check' && <SymptomInput />}
        {screen === 'result' && <Result />}
        {screen === 'asha' && <AshaWorkerPortal />}
        {screen === 'admin' && <HospitalAdminPortal />}
        {screen === 'map' && <HospitalDirectory />}
        {screen === 'about' && <About />}
      </main>

      {/* Language Selection Modal (First visit & On-demand) */}
      <LanguageSelectModal />

      {/* Admin Auth Modal Gate */}
      <AdminAuthModal />

      {/* GPS Permission Modal */}
      <GpsPermissionPrompt />

      {/* Emergency Modal */}
      <EmergencyModal />

      {/* Referral Slip Modal */}
      {activeSlip && (
        <DigitalHealthSlip
          slipData={activeSlip}
          onClose={() => setActiveSlip(null)}
        />
      )}

      {/* Official Footer */}
      <footer className="hidden lg:block py-6 bg-white border-t border-slate-200 text-xs text-slate-600 mt-auto">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div>
            <p className="font-bold text-slate-900">{t('appName')} · {t('portalSubtitle')}</p>
            <p className="text-[11px] text-slate-500">{t('govtNotice')}</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1 text-red-600">
              <PhoneCall className="w-3.5 h-3.5" />
              {t('ambulanceLine')}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-700">{t('emergencyLine')}</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-700">{t('healthAdviceLine')}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  )
}
