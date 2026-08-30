import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck,
  Lock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  UserCheck,
  Eye,
  EyeOff,
  History,
} from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

export default function ConsentVaultModal() {
  const { consentVaultModalOpen, setConsentVaultModalOpen, currentUser } = useApp()
  const [consentGranted, setConsentGranted] = useState(true)
  const [otpCode, setOtpCode] = useState('')
  const [showLogs, setShowLogs] = useState(false)

  if (!consentVaultModalOpen) return null

  const AUDIT_LOGS = [
    {
      id: 'LOG-01',
      actor: 'Dr. Rajesh Sharma (Rampur PHC)',
      action: 'Accessed OPD Triage & Vitals Record',
      timestamp: 'Today, 09:16 AM',
      purpose: 'Emergency Clinical Triage',
      status: 'Authorized',
    },
    {
      id: 'LOG-02',
      actor: 'Anita Devi (ASHA Worker)',
      action: 'Updated Blood Pressure & Sugar Field Log',
      timestamp: 'Yesterday, 04:20 PM',
      purpose: 'Routine Household Health Survey',
      status: 'Authorized',
    },
    {
      id: 'LOG-03',
      actor: 'Gangaon CHC Pathology Lab',
      action: 'Synced CBC & Hemoglobin Diagnostic Report',
      timestamp: '28 Aug 2026, 11:30 AM',
      purpose: 'Diagnostic Lab Test Reporting',
      status: 'Authorized',
    },
  ]

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.18 }}
          className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 relative shrink-0">
            <button
              onClick={() => setConsentVaultModalOpen(false)}
              className="tap-press absolute top-4 right-4 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-400/20">
                  Feature 19 • ABDM & DPDP Act 2023 Compliant
                </span>
                <h2 className="text-lg sm:text-xl font-bold font-display mt-0.5">
                  Privacy & Health Consent Vault
                </h2>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Fine-grained consent management & auditable record sharing
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
            {/* ABHA Link Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Linked ABHA Address:</span>
                <p className="font-bold text-sm text-slate-900 font-mono">
                  {currentUser?.abhaNumber || '91-8821-4401-9923@abdm'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Owner: {currentUser?.name || 'Citizen Patient'} • Verified by Aadhaar OTP
                </p>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Active
              </span>
            </div>

            {/* Consent Controls */}
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Automated Clinical Data Sharing Consent
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Allows treating PHC doctors and 108 Emergency staff to view your emergency triage history.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setConsentGranted(!consentGranted)}
                  className={`tap-press px-3 py-1.5 rounded-xl font-bold text-xs shadow-2xs transition-all ${
                    consentGranted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {consentGranted ? 'Consent ACTIVE' : 'REVOKED'}
                </button>
              </div>

              <div className="pt-2 border-t border-indigo-200/80 flex items-center justify-between text-[11px] text-indigo-900">
                <span>Encryption: AES-256 GCM</span>
                <span>Token Expiry: 30 Days</span>
              </div>
            </div>

            {/* Audit Logs */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-blue-600" />
                  <span>Immutable Access Audit Trail</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setShowLogs(!showLogs)}
                  className="text-blue-600 hover:underline font-bold text-[11px]"
                >
                  {showLogs ? 'Hide Logs' : 'View Full Logs'}
                </button>
              </div>

              <div className="space-y-2">
                {AUDIT_LOGS.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{log.actor}</p>
                      <p className="text-[11px] text-slate-600">{log.action}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Purpose: {log.purpose}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 self-start sm:self-auto">
                      {log.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setConsentVaultModalOpen(false)}
              className="tap-press px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
            >
              Close Consent Vault
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
