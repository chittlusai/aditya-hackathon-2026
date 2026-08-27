import { Building2, Heart, ShieldCheck, PhoneCall, Stethoscope } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

export default function About() {
  const { t } = useApp()

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-300 rounded-xl p-6 shadow-sm">
        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 block">
          National Rural Health Portal · Project Overview
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display mt-0.5">
          About Arogya Setu Local
        </h1>
        <p className="mt-2 text-slate-600 text-sm leading-relaxed">
          <strong>Arogya Setu Local</strong> is a dedicated rural healthcare triage and facility referral portal designed for the <strong>Smart India Hackathon 2026</strong>. The portal provides instant clinical triage guidance for rural citizens and ASHA field workers to ensure patients reach the appropriate Primary Health Centre (PHC), Community Health Centre (CHC), or District Hospital without critical delays.
        </p>
      </div>

      {/* Grid of Objectives */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-300 p-5 rounded-xl shadow-sm space-y-2">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-blue-800" />
            <h3 className="font-bold text-sm text-slate-900">Standardized Clinical Triage</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Evaluates plain-language symptom descriptions and vital signs against emergency protocols to categorize cases into Level 1 (Mild), Level 2 (Moderate), or Level 3 (Emergency).
          </p>
        </div>

        <div className="bg-white border border-slate-300 p-5 rounded-xl shadow-sm space-y-2">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-800" />
            <h3 className="font-bold text-sm text-slate-900">Facility Allocation System</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Directs patients to the closest equipped facility based on proximity, doctor shift availability, specialty requirements, and essential drug stock.
          </p>
        </div>

        <div className="bg-white border border-slate-300 p-5 rounded-xl shadow-sm space-y-2">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-blue-800" />
            <h3 className="font-bold text-sm text-slate-900">ASHA Field Worker Support</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Supports grassroots health workers with multilingual voice dictation (English, Hindi, Marathi), digital referral slips, and offline patient records.
          </p>
        </div>

        <div className="bg-white border border-slate-300 p-5 rounded-xl shadow-sm space-y-2">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-blue-800" />
            <h3 className="font-bold text-sm text-slate-900">108 Emergency Dispatch</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Enables one-tap emergency ambulance calling and prepares automated WhatsApp & SMS dispatch messages containing exact GPS coordinates.
          </p>
        </div>
      </div>
    </div>
  )
}
