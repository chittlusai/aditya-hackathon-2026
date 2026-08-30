import React from 'react'
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
import HistoryView from './components/HistoryView.jsx'
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
import { PhoneCall, AlertTriangle, RefreshCw } from 'lucide-react'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Arogya Setu Local ErrorBoundary caught:', error, errorInfo)
  }

  handleReset = () => {
    try {
      localStorage.removeItem('asl:current_user_v1')
      localStorage.removeItem('asl:pill_adherence_v1')
    } catch (e) {}
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-amber-400" />
            </div>
            <h2 className="text-xl font-bold text-white">App Session Diagnostics</h2>
            <p className="text-xs text-slate-300">
              A runtime layout error was caught. Please review details below:
            </p>
            {this.state.error && (
              <pre className="text-[11px] text-red-300 font-mono bg-red-950/70 p-3 rounded-xl border border-red-800 text-left overflow-auto max-h-40 whitespace-pre-wrap">
                {this.state.error?.message || String(this.state.error)}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              className="tap-press w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset & Reload Arogya Setu</span>
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

function Shell() {
  const { screen, activeSlip, setActiveSlip, currentUser, t } = useApp()

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
      <OfflineBanner />
      <Navbar />

      {/* Main Content Router with Real URL Synchronization & Mandatory Login */}
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
            {screen === 'history' && <HistoryView />}
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

      {/* 5. Patient Health Assessment History & Reports Modal (Fallback) */}
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
    <ErrorBoundary>
      <AppProvider>
        <Shell />
      </AppProvider>
    </ErrorBoundary>
  )
}
