import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  CheckCircle2,
  Clock,
  Navigation,
  Phone,
  AlertTriangle,
  X,
  ArrowRight,
  ShieldCheck,
  Building2,
  Ambulance,
  Stethoscope,
} from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

export default function ReferralTrackerModal() {
  const {
    referralTrackerModalOpen,
    setReferralTrackerModalOpen,
    selectedReferral,
    updateReferralStage,
    setActiveSlip,
  } = useApp()

  if (!referralTrackerModalOpen || !selectedReferral) return null

  const STAGES = [
    { label: 'Created', sub: 'Referral Generated', icon: FileText },
    { label: 'Accepted', sub: 'Doctor Confirmed', icon: CheckCircle2 },
    { label: 'En Route', sub: 'Ambulance in Transit', icon: Ambulance },
    { label: 'Arrived', sub: 'Reached Emergency Desk', icon: Building2 },
    { label: 'In Care', sub: 'Clinical Consultation', icon: Stethoscope },
    { label: 'Closed', sub: 'Discharged / Complete', icon: ShieldCheck },
  ]

  const currentStageIndex = selectedReferral.stageIndex ?? 2

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.18 }}
          className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white p-5 sm:p-6 relative shrink-0">
            <button
              onClick={() => setReferralTrackerModalOpen(false)}
              className="tap-press absolute top-4 right-4 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/25 flex items-center justify-center shrink-0">
                <Ambulance className="w-6 h-6 text-white animate-pulse" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full border border-white/25">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live Referral Lifecycle Tracker (Feature 06)
                </span>
                <h2 className="text-lg sm:text-xl font-bold font-display mt-0.5">
                  {selectedReferral.patientName} ({selectedReferral.refId})
                </h2>
                <p className="text-[11px] text-blue-100 mt-0.5">
                  {selectedReferral.originFacility} → {selectedReferral.targetFacility}
                </p>
              </div>
            </div>
          </div>

          {/* 6-Stage Progress Stepper Bar */}
          <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200 overflow-x-auto">
            <div className="flex items-center justify-between min-w-[500px] relative">
              {/* Connecting Background Line */}
              <div className="absolute left-6 right-6 top-4 h-1 bg-slate-200 -z-0" />
              <div
                className="absolute left-6 top-4 h-1 bg-blue-600 transition-all duration-300 -z-0"
                style={{
                  width: `${(currentStageIndex / (STAGES.length - 1)) * 92}%`,
                }}
              />

              {STAGES.map((s, idx) => {
                const isPassed = idx <= currentStageIndex
                const isCurrent = idx === currentStageIndex
                const Icon = s.icon

                return (
                  <div
                    key={s.label}
                    className="flex flex-col items-center text-center relative z-10 space-y-1"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-blue-600 text-white ring-4 ring-blue-600/20 shadow-sm scale-110'
                          : isPassed
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-white text-slate-400 border border-slate-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-[11px] font-bold leading-tight block ${
                        isCurrent
                          ? 'text-blue-700 font-extrabold'
                          : isPassed
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {s.label}
                    </span>
                    <span className="text-[9px] text-slate-400 block max-w-[70px] leading-none">
                      {s.sub}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Referral Details Body */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
            {/* Live Update Alert */}
            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-blue-900 block">Current Status & GPS Pulse:</span>
                <p className="text-blue-800 mt-0.5">{selectedReferral.lastUpdate}</p>
                <p className="text-[11px] text-blue-600 font-mono mt-1">
                  Transport: {selectedReferral.transportMode || '108 Emergency Ambulance'}
                </p>
              </div>
            </div>

            {/* Structured AI Referral Copilot Summary */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                AI Referral Copilot Handoff Summary (Feature 05)
              </span>
              <div className="grid grid-cols-2 gap-2 font-mono">
                <div>
                  <span className="text-slate-400 block">Patient Name:</span>
                  <span className="font-bold text-slate-900">{selectedReferral.patientName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Urgency Level:</span>
                  <span className="font-bold text-red-600">{selectedReferral.urgency}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Specialty Target:</span>
                  <span className="font-bold text-slate-900">{selectedReferral.specialtyRequired}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Receiving Doctor:</span>
                  <span className="font-bold text-slate-900">{selectedReferral.assignedDoctor || 'Assigned On Duty'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/80">
                <span className="font-bold text-slate-700 block mb-0.5">Clinical Reason for Transfer:</span>
                <p className="text-slate-800 leading-relaxed font-sans">{selectedReferral.reasonForReferral}</p>
              </div>

              {selectedReferral.vitals && (
                <div className="pt-2 border-t border-slate-200/80 flex flex-wrap gap-3 font-mono text-[11px]">
                  <span>BP: <strong>{selectedReferral.vitals.bp || '120/80'}</strong></span>
                  <span>SpO2: <strong className="text-emerald-700">{selectedReferral.vitals.spo2 || '98%'}</strong></span>
                  <span>Pulse: <strong>{selectedReferral.vitals.pulse || '78'} bpm</strong></span>
                  <span>Temp: <strong>{selectedReferral.vitals.temp || '98.6°F'}</strong></span>
                </div>
              )}
            </div>

            {/* Stage Progression Controller (Demo Tool) */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
              <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Simulate Referral Stage Transition (Workflow Lifecycle Demo):</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {STAGES.map((st, i) => (
                  <button
                    key={st.label}
                    type="button"
                    onClick={() => updateReferralStage(selectedReferral.refId, i)}
                    className={`tap-press px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      i === currentStageIndex
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'bg-white hover:bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    {i + 1}. {st.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                setActiveSlip({
                  name: selectedReferral.patientName,
                  urgency: selectedReferral.urgency,
                  symptoms: selectedReferral.reasonForReferral,
                  vitals: selectedReferral.vitals,
                  hospital: { name: selectedReferral.targetFacility, address: 'District Medical Centre' },
                })
                setReferralTrackerModalOpen(false)
              }}
              className="tap-press px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>View Official Slip</span>
            </button>

            <button
              type="button"
              onClick={() => setReferralTrackerModalOpen(false)}
              className="tap-press px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <span>Done Tracking</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
