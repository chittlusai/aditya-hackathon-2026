import { AnimatePresence } from 'framer-motion'
import { AppProvider, useApp } from './context/AppContext.jsx'
import Navbar from './components/Navbar.jsx'
import OfflineBanner from './components/OfflineBanner.jsx'
import Home from './components/Home.jsx'
import SymptomInput from './components/SymptomInput.jsx'
import Result from './components/Result.jsx'
import AshaWorkerPortal from './components/AshaWorkerPortal.jsx'
import HospitalAdminPortal from './components/HospitalAdminPortal.jsx'
import HospitalMap from './components/HospitalMap.jsx'
import About from './components/About.jsx'
import EmergencyModal from './components/EmergencyModal.jsx'
import DigitalHealthSlip from './components/DigitalHealthSlip.jsx'
import GpsPermissionPrompt from './components/GpsPermissionPrompt.jsx'
import { MapPin, PhoneCall, Navigation } from 'lucide-react'

function MapScreen() {
  const { hospitals, t, userCoords, setGpsModalOpen } = useApp()
  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-4">
      <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2 font-display">
            <MapPin className="w-5 h-5 text-blue-800" />
            {t('mapTitle')}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('mapSub')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setGpsModalOpen(true)}
          className="tap-press self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-xs font-bold shadow-sm"
        >
          <Navigation className="w-3.5 h-3.5 text-blue-800" />
          <span>{userCoords?.active ? 'Live GPS: ' + userCoords.lat.toFixed(2) + ', ' + userCoords.lng.toFixed(2) : t('useGps')}</span>
        </button>
      </div>
      <HospitalMap allHospitals={hospitals} height="560px" />
    </div>
  )
}

function Shell() {
  const { screen, activeSlip, setActiveSlip, t } = useApp()

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900">
      <OfflineBanner />
      <Navbar />

      {/* Main Content View */}
      <main className="flex-1 pb-20 lg:pb-10">
        {screen === 'home' && <Home />}
        {screen === 'check' && <SymptomInput />}
        {screen === 'result' && <Result />}
        {screen === 'asha' && <AshaWorkerPortal />}
        {screen === 'admin' && <HospitalAdminPortal />}
        {screen === 'map' && <MapScreen />}
        {screen === 'about' && <About />}
      </main>

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
      <footer className="hidden lg:block py-6 bg-white border-t border-slate-300 text-xs text-slate-600 mt-auto">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div>
            <p className="font-bold text-slate-900">{t('appName')} · {t('portalSubtitle')}</p>
            <p className="text-[11px] text-slate-500">{t('govtNotice')}</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1 text-red-700">
              <PhoneCall className="w-3.5 h-3.5" />
              {t('ambulanceLine')}
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-700">{t('emergencyLine')}</span>
            <span className="text-slate-400">|</span>
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
