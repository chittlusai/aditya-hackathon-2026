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
  } = useApp()

  const [searchQuery, setSearchQuery] = useState('')

  const filteredHospitals = hospitals.filter((h) =>
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (h.specialist || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleVisualSelect = (item) => {
    go('check')
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6">
      {/* 1. Unified Clean Government Hero Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-8 shadow-xs">
        <div className="max-w-3xl space-y-3">
          {/* Official Emblem Strip & Real-time GPS Tracker */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-800 px-2.5 py-1 rounded-md border border-blue-200">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>{t('bannerCategory')}</span>
              </span>
            </div>

            <button
              onClick={() => setGpsModalOpen(true)}
              className="tap-press inline-flex items-center gap-1.5 text-[11px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-md border border-emerald-200 transition-all shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{userCoords?.label || 'Live GPS'} · Real-Time Radar</span>
            </button>
          </div>

          {/* Main Title & Subtitle with Logo */}
          <div className="flex items-center gap-3.5 sm:gap-4">
            <img
              src="/logo.png"
              alt="Arogya Setu Logo"
              className="w-14 h-14 sm:w-16 sm:h-16 object-contain rounded-2xl p-1 bg-white border border-blue-100 shadow-xs shrink-0"
            />
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
                {t('appName')}
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-blue-700 mt-0.5">
                {t('portalSubtitle')}
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
            {language === 'hi'
              ? 'चित्रों पर क्लिक करके या बोलकर बीमारी की गंभीरता जांचें, उपस्थित डॉक्टर देखें और नजदीकी प्राथमिक स्वास्थ्य केंद्र का रास्ता पाएं।'
              : language === 'mr'
              ? 'चित्रांवर क्लिक करून किंवा बोलून आजाराची तपासणी करा, ड्युटीवरील डॉक्टर पहा आणि जवळच्या प्राथमिक आरोग्य केंद्राचा मार्ग मिळवा.'
              : 'Identify illness urgency using visual icons or voice, check on-duty doctors, and reach your nearest Primary Health Centre without delay.'}
          </p>

          {/* Primary Quick Actions */}
          <div className="pt-2 flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => go('check')}
              className="tap-press inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
            >
              <Stethoscope className="w-4 h-4" />
              <span>{language === 'hi' ? 'बीमारी की जांच शुरू करें' : language === 'mr' ? 'आरोग्य तपासणी सुरू करा' : 'Start Health Check'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => go('map')}
              className="tap-press inline-flex items-center gap-2 px-4 sm:px-4.5 py-2.5 sm:py-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs sm:text-sm shadow-2xs transition-all"
            >
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>{language === 'hi' ? 'नजदीकी अस्पताल व डॉक्टर' : language === 'mr' ? 'जवळचे रुग्णालय व डॉक्टर' : 'Nearby Hospitals'}</span>
            </button>

            <button
              onClick={() => setSosOpen(true)}
              className="tap-press inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
            >
              <Siren className="w-4 h-4 animate-pulse" />
              <span>108 {language === 'hi' ? 'एम्बुलेंस' : language === 'mr' ? 'रुग्णवाहिका' : 'Ambulance'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Next-Gen 20-Feature Upgrade Blueprint Hub (SIH26133) */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-blue-700/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-400/20 inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              SIH26133 • Next-Gen Feature Upgrade Stack
            </span>
            <h2 className="text-lg sm:text-xl font-bold font-display mt-1">
              Rural Healthcare Access & Intelligence Grid
            </h2>
          </div>
          <span className="text-xs text-blue-200 font-medium">
            20 Integrated Upgrades
          </span>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
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

          {/* Feature 06: Referral Journey Tracker */}
          <button
            type="button"
            onClick={() => {
              setSelectedReferral(null)
              setReferralTrackerModalOpen(true)
            }}
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
      </div>

      {/* 3. Visual Illustrated Problem Cards */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-7 shadow-xs">
        <VisualSymptomSelector onSelectSymptom={handleVisualSelect} selectedSymptoms={[]} />
      </div>

      {/* 3. Simple 3-Step Guide */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-7 shadow-xs">
        <div className="text-center max-w-xl mx-auto mb-6">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
            {language === 'hi' ? 'सरल व आसान उपयोग' : language === 'mr' ? 'सोपी व सुलभ पद्धत' : 'Easy To Use · How It Works'}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display mt-0.5">
            {language === 'hi' ? '3 सरल चरणों में स्वास्थ्य सलाह' : language === 'mr' ? '३ सोप्या पायऱ्यांत आरोग्य सल्ला' : 'Get Care in 3 Simple Steps'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm shrink-0 flex items-center justify-center shadow-xs">
              1
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                {language === 'hi' ? 'बोलें या चित्र चुनें' : language === 'mr' ? 'बोला किंवा चित्र निवडा' : 'Speak or Select Problem'}
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {language === 'hi'
                  ? 'अपनी भाषा में बोलें या ऊपर दिए गए चित्रों में से अपनी तकलीफ चुनें।'
                  : language === 'mr'
                  ? 'आपल्या भाषेत बोला किंवा वरील चित्रांमधून आपला त्रास निवडा.'
                  : 'Speak in Hindi, Marathi, or English, or tap any illustrative symptom SVG.'}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm shrink-0 flex items-center justify-center shadow-xs">
              2
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                {language === 'hi' ? 'गंभीरता जांच व सलाह' : language === 'mr' ? 'गांभीर्य तपासणी व सल्ला' : 'Instant Health Assessment'}
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {language === 'hi'
                  ? 'बीमारी कितनी गंभीर है (स्तर 1 सामान्य, स्तर 2 मध्यम, या स्तर 3 आपातकालीन) तुरंत जानें।'
                  : language === 'mr'
                  ? 'त्रास किती गंभीर आहे (स्तर १ सामान्य, स्तर २ मध्यम, स्तर ३ आपत्कालीन) लगेच समजेल.'
                  : 'Evaluates urgency into Level 1 (Mild), Level 2 (Moderate), or Level 3 (Emergency).'}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm shrink-0 flex items-center justify-center shadow-xs">
              3
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                {language === 'hi' ? 'सही अस्पताल पहुंचें' : language === 'mr' ? 'योग्य रुग्णालयात पोहोचा' : 'Reach Equipped Health Centre'}
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {language === 'hi'
                  ? 'नजदीकी अस्पताल का रास्ता, डॉक्टर की उपस्थिति और पर्ची (Referral Slip) प्राप्त करें।'
                  : language === 'mr'
                  ? 'जवळच्या रुग्णालयाचा मार्ग, डॉक्टर उपस्थिती व डिजिटल रेफरल स्लिप मिळवा.'
                  : 'Get direct route, on-duty doctor availability, and official referral slip.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Nearby Health Facilities & Emergency Helplines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Nearby Health Centre Radar */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                {t('directoryTitle')}
              </h2>
              <p className="text-xs text-slate-500">
                {t('directorySub')}
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder={t('searchHospitalPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-xs text-slate-900 outline-none w-full"
              />
            </div>
          </div>

          {/* Clean Facility Cards Grid - Natural Flow without internal scroll trapping */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredHospitals.slice(0, 6).map((h) => (
              <div
                key={h.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-500 transition-all space-y-2 flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 truncate">
                      {h.type}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {h.distance_km} km
                    </span>
                  </div>
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 mt-1.5 leading-snug">
                    {h.name}
                  </h3>
                  <p className="text-[10.5px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
                    <span className="truncate">{h.address || 'Rural Block Sector'}</span>
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-1">
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                      • {h.doctors_available} {t('thDoctors')}
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="truncate">{h.specialist || 'General Medicine'}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  {h.phone && (
                    <a
                      href={`tel:${h.phone}`}
                      className="tap-press flex-1 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] text-center flex items-center justify-center gap-1 border border-blue-100"
                    >
                      <Phone className="w-3 h-3 text-blue-600" />
                      <span>{t('mapCall')}</span>
                    </a>
                  )}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="tap-press flex-1 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-[11px] text-center flex items-center justify-center gap-1 border border-slate-200"
                  >
                    <Navigation className="w-3 h-3 text-blue-600" />
                    <span>{t('mapRoute')}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
            <span>{t('showingCount')}</span>
            <button
              onClick={() => go('map')}
              className="text-blue-600 hover:underline font-bold"
            >
              {t('viewAllMap')} →
            </button>
          </div>
        </div>

        {/* Right Col: Helplines */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <PhoneCall className="w-4 h-4 text-red-600" />
              {t('emergencyHelplineTitle')}
            </h2>
            <div className="space-y-2">
              <a href="tel:108" className="tap-press flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-100 hover:bg-red-100 text-slate-800 transition-all">
                <div>
                  <span className="font-bold text-sm block text-red-600">108</span>
                  <span className="text-[11px] text-slate-500">{t('ambulanceLine')}</span>
                </div>
                <span className="text-xs font-bold bg-red-600 text-white px-3 py-1 rounded-lg shadow-2xs">{t('callNow')} 108</span>
              </a>
              <a href="tel:112" className="tap-press flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-800 transition-all">
                <div>
                  <span className="font-bold text-xs block text-slate-900">112</span>
                  <span className="text-[10px] text-slate-500">{t('emergencyLine')}</span>
                </div>
                <span className="text-xs font-bold text-blue-600">{t('callNow')} 112</span>
              </a>
            </div>
            <button
              onClick={() => setSosOpen(true)}
              className="tap-press w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs"
            >
              <Siren className="w-4 h-4" />
              <span>{t('openDispatcher')}</span>
            </button>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 space-y-1.5 shadow-2xs">
            <p className="font-bold text-slate-900 text-xs">{t('healthTiersTitle')}</p>
            <p><strong className="text-slate-900">Sub-Centre (0–3 km):</strong> {t('tierSubCentre')}</p>
            <p><strong className="text-slate-900">PHC (3–10 km):</strong> {t('tierPHC')}</p>
          </div>
        </div>
      </div>

      {/* 5. Staff & Grassroots Portals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div
          onClick={() => {
            setRole('asha')
            go('asha')
          }}
          className="tap-press group bg-white border border-slate-200 hover:border-blue-500 p-5 rounded-2xl shadow-xs cursor-pointer transition-all"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Users className="w-5 h-5 text-blue-600 group-hover:text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">{t('ashaTitle')}</h3>
              <span className="text-[10px] text-blue-600 font-bold">{patientRecords.length} Saved Patient Records</span>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {t('ashaSub')}
          </p>
          <p className="text-xs font-bold text-blue-600 mt-3 group-hover:underline">{t('tabVillageRegister')} →</p>
        </div>

        <div
          onClick={() => {
            setRole('admin')
            go('admin')
          }}
          className="tap-press group bg-white border border-slate-200 hover:border-blue-500 p-5 rounded-2xl shadow-xs cursor-pointer transition-all"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Building2 className="w-5 h-5 text-blue-600 group-hover:text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">{t('adminTitle')}</h3>
              <span className="text-[10px] text-blue-600 font-bold">{hospitals.length} Health Facilities Mapped</span>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {t('adminSub')}
          </p>
          <p className="text-xs font-bold text-blue-600 mt-3 group-hover:underline">{t('navAdmin')} →</p>
        </div>
      </div>
    </div>
  )
}
