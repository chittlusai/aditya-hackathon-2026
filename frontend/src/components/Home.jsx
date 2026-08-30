import { useState } from 'react'
import {
  Stethoscope,
  Building2,
  Users,
  Phone,
  Search,
  PhoneCall,
  Navigation,
  Sparkles,
  MapPin,
  HeartPulse,
  ShieldCheck,
  Clock,
  ArrowRight,
  Pill,
  Siren,
  Activity,
  Mic,
  Volume2,
  FileText,
  Video,
  X,
  ChevronDown,
} from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import VisualSymptomSelector from './VisualSymptomSelector.jsx'

export default function Home() {
  const {
    go,
    setRole,
    setSosOpen,
    t,
    language,
    hospitals,
    patientRecords,
    userCoords,
    setGpsModalOpen,
    requestGpsLocation,
    setHistoryModalOpen,
    startVideoCall,
    setSelectedReferral,
    setReferralTrackerModalOpen,
    setConsentVaultModalOpen,
    setFhirExportModalOpen,
  } = useApp()

  const [searchQuery, setSearchQuery] = useState('')
  const [showFeatureHub, setShowFeatureHub] = useState(false) // Collapsed by default on mobile to prioritize clinical actions

  const filteredHospitals = hospitals.filter((h) =>
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (h.specialist || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleVisualSelect = (item) => {
    go('check')
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-2.5 sm:px-6 py-3 sm:py-8 space-y-3 sm:space-y-6 overflow-x-hidden">
      {/* 1. Mobile-First Government Hero Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-8 shadow-xs">
        <div className="max-w-3xl space-y-3 sm:space-y-4">
          {/* Top GPS Status Pill */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-800 px-2 py-0.5 rounded-lg border border-blue-200">
              <ShieldCheck className="w-3 h-3 text-blue-600 shrink-0" />
              <span>{t('bannerCategory')}</span>
            </span>

            <button
              type="button"
              onClick={() => setGpsModalOpen(true)}
              className="tap-press inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-lg border border-emerald-200 transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="truncate max-w-[140px] sm:max-w-none">{userCoords?.label || 'GPS Radar'}</span>
            </button>
          </div>

          {/* Title & Brand */}
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Arogya Setu Logo"
              className="w-12 h-12 sm:w-16 sm:h-16 object-contain rounded-2xl p-1 bg-white border border-blue-100 shadow-xs shrink-0"
            />
            <div>
              <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
                {t('appName')}
              </h1>
              <p className="text-[11px] sm:text-sm font-bold text-blue-700">
                {t('portalSubtitle')}
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {language === 'hi'
              ? 'चित्रों पर क्लिक करके या बोलकर बीमारी की गंभीरता जांचें, उपस्थित डॉक्टर देखें और नजदीकी स्वास्थ्य केंद्र पहुंचे।'
              : language === 'mr'
              ? 'चित्रांवर क्लिक करून किंवा बोलून आजाराची तपासणी करा आणि जवळच्या आरोग्य केंद्राचा मार्ग मिळवा.'
              : 'Identify illness urgency using visual icons or voice, check on-duty doctors, and reach your nearest Primary Health Centre.'}
          </p>

          {/* 1 Big Primary Action Button for Rural Mobile Users */}
          <button
            type="button"
            onClick={() => go('check')}
            className="tap-press w-full py-3.5 sm:py-4 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm sm:text-base shadow-md flex items-center justify-center gap-2.5 transition-all"
          >
            <Stethoscope className="w-5 h-5 shrink-0" />
            <span>{language === 'hi' ? 'बीमारी की जांच शुरू करें (AI Triage)' : language === 'mr' ? 'आरोग्य तपासणी सुरू करा' : 'Start Health Check (AI Triage)'}</span>
            <ArrowRight className="w-5 h-5 shrink-0" />
          </button>

          {/* 4 Quick Action Touch Tiles (2x2 grid on mobile) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <button
              type="button"
              onClick={() => go('map')}
              className="tap-press p-2.5 sm:p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-200 text-slate-800 text-left flex flex-col justify-between group transition-all"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs block text-slate-900">Nearby Hospitals</span>
                <span className="text-[10px] text-slate-500">Live on-duty doctors</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => startVideoCall()}
              className="tap-press p-2.5 sm:p-3 rounded-2xl bg-emerald-50/70 hover:bg-emerald-100 border border-emerald-200 text-slate-800 text-left flex flex-col justify-between group transition-all"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                <Video className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs block text-emerald-950">Video Doctor</span>
                <span className="text-[10px] text-emerald-700 font-semibold">Live Teleconsult</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => go('history')}
              className="tap-press p-2.5 sm:p-3 rounded-2xl bg-teal-50/70 hover:bg-teal-100 border border-teal-200 text-slate-800 text-left flex flex-col justify-between group transition-all"
            >
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs block text-teal-950">Health History</span>
                <span className="text-[10px] text-teal-700 font-semibold">Reports & Slips</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSosOpen(true)}
              className="tap-press p-2.5 sm:p-3 rounded-2xl bg-red-50 hover:bg-red-100 border border-red-200 text-slate-800 text-left flex flex-col justify-between group transition-all"
            >
              <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                <Siren className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <span className="font-bold text-xs block text-red-950">108 SOS</span>
                <span className="text-[10px] text-red-700 font-semibold">Emergency Dispatch</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Visual Illustrated Problem Cards (Primary Mobile Selector for Rural Citizens) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-3.5 sm:p-7 shadow-xs">
        <VisualSymptomSelector onSelectSymptom={handleVisualSelect} selectedSymptoms={[]} />
      </div>

      {/* 3. Next-Gen 20-Feature Upgrade Blueprint Hub (Mobile Optimized Collapsible) */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-xl border border-blue-700/30 space-y-3 w-full overflow-hidden">
        <button
          type="button"
          onClick={() => setShowFeatureHub((prev) => !prev)}
          className="tap-press w-full flex items-center justify-between gap-2 text-left"
        >
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-blue-500/25 text-blue-200 px-2 py-0.5 rounded-full border border-blue-400/25 inline-flex items-center gap-1 shrink-0">
              <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
              SIH26133
            </span>
            <h2 className="text-xs sm:text-base font-bold font-sans text-white truncate">
              20 Advanced Health Upgrades
            </h2>
          </div>

          <div className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-blue-200 bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-xl shrink-0 transition-all border border-white/10">
            <span>{showFeatureHub ? 'Hide' : 'Explore'}</span>
            <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform ${showFeatureHub ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {showFeatureHub && (
          <div className="pt-3 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
            {/* Feature 01: AI Care Navigator */}
            <button
              type="button"
              onClick={() => go('check')}
              className="tap-press text-left p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 transition-all flex flex-col justify-between group"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-500/30 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Stethoscope className="w-4 h-4 text-blue-300" />
              </div>
              <div>
                <span className="text-[9px] font-mono text-blue-300 block font-bold">FEAT 01</span>
                <span className="text-xs font-bold text-white leading-tight block">AI Care Navigator</span>
              </div>
            </button>

            {/* Feature 03: Command Map & Radar */}
            <button
              type="button"
              onClick={() => go('map')}
              className="tap-press text-left p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 transition-all flex flex-col justify-between group"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500/30 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <MapPin className="w-4 h-4 text-emerald-300" />
              </div>
              <div>
                <span className="text-[9px] font-mono text-emerald-300 block font-bold">FEAT 03</span>
                <span className="text-xs font-bold text-white leading-tight block">Command Map & Queue</span>
              </div>
            </button>

            {/* Features 10 & 11: Medicine & Diagnostics */}
            <button
              type="button"
              onClick={() => go('medicines')}
              className="tap-press text-left p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 transition-all flex flex-col justify-between group"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500/30 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Pill className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <span className="text-[9px] font-mono text-amber-300 block font-bold">FEAT 10 & 11</span>
                <span className="text-xs font-bold text-white leading-tight block">Medicine & Labs</span>
              </div>
            </button>

            {/* Features 05 & 06: Referral Lifecycle Tracker */}
            <button
              type="button"
              onClick={() => setReferralTrackerModalOpen(true)}
              className="tap-press text-left p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 transition-all flex flex-col justify-between group"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-500/30 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Activity className="w-4 h-4 text-purple-300" />
              </div>
              <div>
                <span className="text-[9px] font-mono text-purple-300 block font-bold">FEAT 05 & 06</span>
                <span className="text-xs font-bold text-white leading-tight block">Referral Tracker</span>
              </div>
            </button>

            {/* Feature 19: Privacy & Consent Vault */}
            <button
              type="button"
              onClick={() => setConsentVaultModalOpen(true)}
              className="tap-press text-left p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 transition-all flex flex-col justify-between group"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-500/30 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-4 h-4 text-indigo-300" />
              </div>
              <div>
                <span className="text-[9px] font-mono text-indigo-300 block font-bold">FEAT 19</span>
                <span className="text-xs font-bold text-white leading-tight block">Consent Vault (ABDM)</span>
              </div>
            </button>

            {/* Feature 20: FHIR Interoperability */}
            <button
              type="button"
              onClick={() => setFhirExportModalOpen(true)}
              className="tap-press text-left p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 transition-all flex flex-col justify-between group"
            >
              <div className="w-8 h-8 rounded-xl bg-rose-500/30 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <HeartPulse className="w-4 h-4 text-rose-300" />
              </div>
              <div>
                <span className="text-[9px] font-mono text-rose-300 block font-bold">FEAT 20</span>
                <span className="text-xs font-bold text-white leading-tight block">FHIR / ABDM Bridge</span>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* 4. Simple 3-Step Guide (Mobile Friendly) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-7 shadow-xs">
        <div className="text-center max-w-xl mx-auto mb-4 sm:mb-6">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
            {language === 'hi' ? 'सरल व आसान उपयोग' : language === 'mr' ? 'सोपी व सुलभ पद्धत' : 'Easy To Use · How It Works'}
          </span>
          <h3 className="text-base sm:text-xl font-bold text-slate-900 font-display mt-0.5">
            {language === 'hi' ? '3 चरणों में सही इलाज तक पहुंचें' : language === 'mr' ? '३ सोप्या पायऱ्यांमध्ये आरोग्य सेवा' : 'Access Quality Care in 3 Simple Steps'}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center sm:flex-col sm:text-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center shrink-0">
              1
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                {language === 'hi' ? 'लक्षण बताएं या चित्र चुनें' : 'Speak or Select Symptoms'}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {language === 'hi' ? 'अपनी भाषा में बोलें या परेशानी के चित्र पर टच करें।' : 'Talk in your native language or tap any symptom icon.'}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center sm:flex-col sm:text-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center shrink-0">
              2
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                {language === 'hi' ? 'गंभीरता व प्राथमिक सलाह' : 'Get Triage & Advice'}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {language === 'hi' ? 'तुरंत जानें कि सामान्य आराम चाहिए या डॉक्टर को दिखाना है।' : 'Immediate assessment on whether home care or hospital is needed.'}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center sm:flex-col sm:text-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center shrink-0">
              3
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                {language === 'hi' ? 'डॉक्टर व अस्पताल का रास्ता' : 'Reach Doctor & Hospital'}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {language === 'hi' ? 'उपस्थित डॉक्टर, दूरी और प्राथमिकता पर्ची प्राप्त करें।' : 'See on-duty doctors, beds, and priority referral slip.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
