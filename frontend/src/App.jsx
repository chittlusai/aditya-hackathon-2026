import { AnimatePresence } from 'framer-motion'
import { AppProvider, useApp } from './context/AppContext.jsx'
import Navbar from './components/Navbar.jsx'
import OfflineBanner from './components/OfflineBanner.jsx'
import LoginGate from './components/LoginGate.jsx'
import Home from './components/Home.jsx'
import SymptomInput from './components/SymptomInput.jsx'
import Result from './components/Result.jsx'
import AshaWorkerPortal from './components/AshaWorkerPortal.jsx'
import DoctorWorkbench from './components/DoctorWorkbench.jsx'
import HospitalAdminPortal from './components/HospitalAdminPortal.jsx'
import HospitalDirectory from './components/HospitalDirectory.jsx'
import MedicineDiagnosticsFinder from './components/MedicineDiagnosticsFinder.jsx'
import About from './components/About.jsx'
import EmergencyModal from './components/EmergencyModal.jsx'
import DigitalHealthSlip from './components/DigitalHealthSlip.jsx'
import GpsPermissionPrompt from './components/GpsPermissionPrompt.jsx'
import AuthModal from './components/AuthModal.jsx'
import LanguageSelectModal from './components/LanguageSelectModal.jsx'
import ReferralTrackerModal from './components/ReferralTrackerModal.jsx'
import ConsentVaultModal from './components/ConsentVaultModal.jsx'
import FhirExportModal from './components/FhirExportModal.jsx'
import DoctorProfileModal from './components/DoctorProfileModal.jsx'
import TeleconsultVideoCallModal from './components/TeleconsultVideoCallModal.jsx'
import PatientHistoryModal from './components/PatientHistoryModal.jsx'
import { PhoneCall } from 'lucide-react'

function Shell() {
  const { screen, activeSlip, setActiveSlip, currentUser, t } = useApp()

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
      <OfflineBanner />
      <Navbar />

      {/* Main Content Router with Mandatory Login Enforcement */}
      <main className="flex-1 pb-24 lg:pb-10">
        {!currentUser ? (
          <LoginGate />
        ) : (
          <>
            {screen === 'home' && <Home />}
            {screen === 'check' && <SymptomInput />}
            {screen === 'result' && <Result />}
            {screen === 'map' && <HospitalDirectory />}
            {screen === 'medicines' && <MedicineDiagnosticsFinder />}
            {screen === 'doctor' && <DoctorWorkbench />}
            {screen === 'asha' && <AshaWorkerPortal />}
            {screen === 'admin' && <HospitalAdminPortal />}
            {screen === 'about' && <About />}
          </>
        )}
      </main>

      {/* 1. Language Selection Modal (First visit & On-demand) */}
      <LanguageSelectModal />

      {/* 2. Unified Multi-Role Auth Modal (For role switching) */}
      <AuthModal />

      {/* 3. Doctor Profile & Credentials Modal */}
      <DoctorProfileModal />

      {/* 4. Real-Time Teleconsultation Video Call Room */}
      <TeleconsultVideoCallModal />

      {/* 5. Patient Health Assessment History & Reports Modal */}
      <PatientHistoryModal />

      {/* 6. Feature 06: Referral Journey Tracker Modal */}
      <ReferralTrackerModal />

      {/* 7. Feature 19: Privacy & Consent Vault Modal */}
      <ConsentVaultModal />

      {/* 8. Feature 20: FHIR Interoperability Bridge Modal */}
      <FhirExportModal />

      {/* 9. GPS Permission Modal */}
      <GpsPermissionPrompt />

      {/* 10. Emergency 108 SOS Modal */}
      <EmergencyModal />

      {/* 11. Digital Health Referral Slip Modal */}
      {activeSlip && (
        <DigitalHealthSlip
          slipData={activeSlip}
          onClose={() => setActiveSlip(null)}
        />
      )}

      {/* Official MoHFW Footer */}
      <footer className="hidden lg:block py-6 bg-white border-t border-slate-200 text-xs text-slate-600 mt-auto">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div>
            <p className="font-bold text-slate-900">{t('appName')} · {t('portalSubtitle')}</p>
            <p className="text-[11px] text-slate-500">{t('govtNotice')} • SIH26133</p>
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
