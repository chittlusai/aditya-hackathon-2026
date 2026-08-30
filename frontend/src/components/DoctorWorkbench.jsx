import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Stethoscope,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Video,
  Phone,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Send,
  Pill,
  Activity,
  ChevronRight,
  User,
} from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

export default function DoctorWorkbench() {
  const {
    currentUser,
    referrals,
    updateReferralStage,
    setSelectedReferral,
    setReferralTrackerModalOpen,
    doctors,
    medicines,
    t,
    openDoctorProfile,
    startVideoCall,
  } = useApp()

  const [activeTab, setActiveTab] = useState('queue') // 'queue' | 'referrals' | 'prescribe'
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [rxMedicine, setRxMedicine] = useState('Paracetamol 500mg (1 TDS)')
  const [rxNotes, setRxNotes] = useState('')
  const [rxSuccess, setRxSuccess] = useState(false)
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false)
  const [aiSummary, setAiSummary] = useState('')

  // Mock OPD queue for doctor
  const opdQueue = [
    {
      id: 'Q-01',
      token: 14,
      name: 'Rameshwar Yadav',
      age: 54,
      gender: 'Male',
      symptoms: 'Crushing chest pain radiating to left arm, sweating, shortness of breath',
      urgency: 'Emergency',
      vitals: { bp: '150/95', spo2: '91%', pulse: '104', temp: '98.4°F' },
      arrivalTime: '09:15 AM',
      status: 'Ready for Consultation',
    },
    {
      id: 'Q-02',
      token: 15,
      name: 'Meenakshi Bai',
      age: 31,
      gender: 'Female',
      symptoms: 'High fever for 4 days, severe body ache, dizziness (Pregnancy 28 weeks)',
      urgency: 'Moderate',
      vitals: { bp: '110/75', spo2: '97%', pulse: '90', temp: '102.2°F', isPregnant: true },
      arrivalTime: '09:30 AM',
      status: 'Waiting in Room 3',
    },
    {
      id: 'Q-03',
      token: 16,
      name: 'Santosh Ghadge',
      age: 46,
      gender: 'Male',
      symptoms: 'Chronic cough for 3 weeks, mild hemoptysis (blood in sputum)',
      urgency: 'Moderate',
      vitals: { bp: '124/80', spo2: '96%', pulse: '76', temp: '99.0°F' },
      arrivalTime: '09:45 AM',
      status: 'Waiting in OPD',
    },
  ]

  const activePatient = selectedPatient || opdQueue[0]

  const handleGenerateAiSummary = (patient) => {
    setAiSummaryLoading(true)
    setTimeout(() => {
      setAiSummary(
        `AI CLINICAL SUMMARY (Dr. Rajesh Sharma Review):\n` +
        `• 54yo Male presenting with acute retrosternal chest pain and diaphoresis.\n` +
        `• Vitals Alert: SpO2 91% (Hypoxic) and Pulse 104 bpm (Tachycardia).\n` +
        `• Clinical Risk: High probability of Acute Coronary Syndrome (STEMI/NSTEMI).\n` +
        `• Immediate Action: 12-lead ECG, Aspirin 300mg chewable + Clopidogrel 300mg stat, Sublingual Nitroglycerin, continuous cardiac monitor & prepare ICU bed.`
      )
      setAiSummaryLoading(false)
    }, 600)
  }

  const handleIssuePrescription = (e) => {
    e.preventDefault()
    setRxSuccess(true)
    setTimeout(() => setRxSuccess(false), 3000)
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-5">
      {/* Doctor Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center shrink-0">
            <Stethoscope className="w-7 h-7 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live OPD Active
              </span>
              <span className="text-xs text-slate-300 font-mono">Reg #MCI-MH-88210</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-display mt-1">
              {currentUser?.name || 'Dr. Rajesh Sharma'} (Chief Medical Officer)
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Rampur Primary Health Centre (PHC) • OPD Room No. 03
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={() => startVideoCall(
              {
                name: activePatient?.name || 'Walk-in Patient',
                age: activePatient?.age || 40,
                gender: activePatient?.gender || 'Male',
                symptoms: activePatient?.symptoms || 'OPD Teleconsultation',
                vitals: activePatient?.vitals,
              },
              null,
              true // isDoctorView
            )}
            className="tap-press inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all"
          >
            <Video className="w-3.5 h-3.5 animate-pulse" />
            <span>Launch Video Call</span>
          </button>

          <button
            type="button"
            onClick={() => openDoctorProfile()}
            className="tap-press inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all"
          >
            <User className="w-3.5 h-3.5" />
            <span>My Profile</span>
          </button>

          <div className="px-3.5 py-2 rounded-2xl bg-white/10 border border-white/15 text-center hidden sm:block">
            <span className="text-[10px] uppercase text-slate-400 block font-bold">OPD Queue</span>
            <span className="text-sm font-extrabold text-white">3 Waiting</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('queue')}
          className={`tap-press px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'queue'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Live OPD Queue ({opdQueue.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('referrals')}
          className={`tap-press px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'referrals'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Incoming Referrals ({referrals.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('prescribe')}
          className={`tap-press px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'prescribe'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <Pill className="w-3.5 h-3.5" />
          <span>Quick Rx Generator</span>
        </button>
      </div>

      {/* TAB 1: LIVE OPD QUEUE & AI WORKBENCH */}
      {activeTab === 'queue' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Left Column: Waiting Queue */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active OPD Patient Queue (Token Order)
            </h3>

            <div className="space-y-2.5">
              {opdQueue.map((p) => {
                const isSelected = activePatient.id === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSelectedPatient(p)
                      setAiSummary('')
                    }}
                    className={`tap-press w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-600/20 shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center font-mono">
                          #{p.token}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900">{p.name}</h4>
                      </div>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        p.urgency === 'Emergency' ? 'bg-red-600 text-white animate-pulse' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {p.urgency}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                      {p.symptoms}
                    </p>

                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>Age: {p.age} • {p.gender}</span>
                      <span>Arrived: {p.arrivalTime}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right Column: AI Clinical Workbench for Selected Patient */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Active Consultation Session • Token #{activePatient.token}
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {activePatient.name} ({activePatient.age}y, {activePatient.gender})
                </h3>
              </div>

              <button
                type="button"
                onClick={() => handleGenerateAiSummary(activePatient)}
                disabled={aiSummaryLoading}
                className="tap-press inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{aiSummaryLoading ? 'Analyzing...' : 'AI Timeline Summary'}</span>
              </button>
            </div>

            {/* Vitals Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/80 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">Blood Pressure</span>
                <span className="font-bold text-slate-900">{activePatient.vitals.bp || '120/80'} mmHg</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">SpO2 Oxygen</span>
                <span className={`font-bold ${Number(activePatient.vitals.spo2?.replace('%','')) < 92 ? 'text-red-600 font-extrabold' : 'text-emerald-700'}`}>
                  {activePatient.vitals.spo2 || '98%'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">Pulse Rate</span>
                <span className="font-bold text-slate-900">{activePatient.vitals.pulse || '78'} bpm</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">Temperature</span>
                <span className="font-bold text-slate-900">{activePatient.vitals.temp || '98.6°F'}</span>
              </div>
            </div>

            {/* AI Clinical Summary Box */}
            {aiSummary && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-200 text-xs text-indigo-950 space-y-1 font-mono whitespace-pre-line"
              >
                {aiSummary}
              </motion.div>
            )}

            {/* Presenting Symptoms */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Reported Symptoms & History
              </label>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800">
                {activePatient.symptoms}
              </div>
            </div>

            {/* Clinical Decision Actions */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  alert(`Referral initiated for ${activePatient.name} to District Hospital Cardiology`)
                }}
                className="tap-press px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs"
              >
                <span>Escalate & Refer to District Hospital</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  alert(`Discharged with Home Care Advice: Token #${activePatient.token}`)
                }}
                className="tap-press px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Complete Consultation & Print Rx</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INCOMING REFERRALS */}
      {activeTab === 'referrals' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Incoming Facility Referrals (Community & ASHA Transfers)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {referrals.map((r) => (
              <div
                key={r.refId}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {r.refId}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      r.urgency === 'Emergency' ? 'bg-red-600 text-white' : 'bg-amber-100 text-amber-900'
                    }`}>
                      {r.urgency}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900">{r.patientName} ({r.age}y)</h4>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {r.reasonForReferral}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    From: {r.originFacility}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedReferral(r)
                      setReferralTrackerModalOpen(true)
                    }}
                    className="tap-press flex-1 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold text-center"
                  >
                    Track Journey
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      updateReferralStage(r.refId, 1, 'Accepted by Dr. Rajesh Sharma')
                      alert(`Referral ${r.refId} Accepted!`)
                    }}
                    className="tap-press flex-1 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold text-center"
                  >
                    Accept Referral
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: QUICK DIGITAL PRESCRIPTION GENERATOR */}
      {activeTab === 'prescribe' && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Digital E-Prescription & Pharmacy Dispatch
            </h3>
            <p className="text-xs text-slate-500">
              Prescribe verified essential medicines from the Govt Supply stock.
            </p>
          </div>

          {rxSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Prescription issued and dispatched to PHC Pharmacy Desk!</span>
            </div>
          )}

          <form onSubmit={handleIssuePrescription} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Patient Name / Token</label>
              <input
                type="text"
                defaultValue="Rameshwar Yadav (Token #14)"
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Select Essential Medicine (In Stock)</label>
              <select
                value={rxMedicine}
                onChange={(e) => setRxMedicine(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 outline-none"
              >
                {medicines.map((m) => (
                  <option key={m.id} value={`${m.name} (${m.dosage})`}>
                    {m.name} — {m.stockStatus} ({m.quantity} {m.unit})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Dosage Instructions & Follow-up Plan</label>
              <textarea
                rows={3}
                value={rxNotes}
                onChange={(e) => setRxNotes(e.target.value)}
                placeholder="e.g. Take 1 tablet twice daily after meals for 5 days. Drink boiled water."
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 text-xs outline-none"
              />
            </div>

            <button
              type="submit"
              className="tap-press w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>Issue E-Prescription & Hand Over to Patient</span>
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
