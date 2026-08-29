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
      {/* 1. Hero & Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xs border border-blue-600">
        <div className="relative z-10 max-w-3xl space-y-2.5 sm:space-y-3">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider bg-white/20 text-white px-2.5 py-0.5 rounded-full border border-white/25">
              <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              {t('bannerCategory')}
            </span>
            <button
              onClick={() => setGpsModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold bg-white/15 hover:bg-white/25 text-white px-2.5 py-0.5 rounded-full border border-white/25 transition-all"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{userCoords?.label || 'Live GPS'} · Real-Time Radar</span>
            </button>
          </div>

          <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold font-display leading-tight text-white">
            {t('heroTitle')}
          </h1>

          <p className="text-xs sm:text-sm lg:text-base text-blue-100 leading-relaxed max-w-2xl">
            {t('heroSub')}
          </p>

          {/* Quick Voice Assistant Banner */}
          <div className="pt-1 sm:pt-2">
            <button
              onClick={() => go('check')}
              className="tap-press w-full sm:w-auto inline-flex items-center justify-center sm:justify-start gap-2.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-white text-blue-900 font-bold text-xs sm:text-sm shadow-xs hover:bg-blue-50 transition-all"
            >
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center animate-pulse">
                <Mic className="w-4 h-4" />
              </span>
              <span>
                {language === 'hi'
                  ? 'बोलकर अपनी बीमारी बताएं (Tap to Speak)'
                  : language === 'mr'
                  ? 'बोलून आपला त्रास सांगा (Tap to Speak)'
                  : 'Speak Symptoms via Voice (Hindi / Marathi / English)'}
              </span>
              <ArrowRight className="w-4 h-4 text-blue-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Real-Time Live Location & Nearby Radar Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
            <Navigation className="w-5 h-5 animate-pulse text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">
                {userCoords?.label || 'Live GPS Sector'}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                Live Tracking Active
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {hospitals[0] ? (
                <>
                  Closest Care: <strong>{hospitals[0].name}</strong> — <span className="text-emerald-700 font-bold">{hospitals[0].distance_km} km</span> ({hospitals[0].doctors_available} doctors on duty)
                </>
              ) : (
                'Scanning for closest Primary Health Centres & Sub-Centres…'
              )}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setGpsModalOpen(true)}
          className="tap-press inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold shrink-0 shadow-2xs"
        >
          <MapPin className="w-3.5 h-3.5 text-blue-600" />
          <span>Change Sector / Refresh GPS</span>
        </button>
      </div>

      {/* Quick Visual Color Guide (Traffic Light System) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              {language === 'hi' ? 'रंगों का मतलब (3-Color Triage Guide)' : language === 'mr' ? 'रंगांचा अर्थ (3-Color Triage Guide)' : 'Urgency Color Guide'}
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            {language === 'hi' ? 'आपातकाल के अनुसार रंग' : language === 'mr' ? 'तीव्रतेनुसार रंग' : 'Follow the colors'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start gap-2.5">
            <span className="text-base leading-none">🟢</span>
            <div>
              <strong className="block text-emerald-900 font-bold">{language === 'hi' ? 'हरा: सामान्य (Mild)' : language === 'mr' ? 'हिरवा: सामान्य (Mild)' : 'Green: Mild'}</strong>
              <span className="text-[11px] text-emerald-800 leading-tight block mt-0.5">{language === 'hi' ? 'घर पर आराम करें या उप-केंद्र से सलाह लें।' : language === 'mr' ? 'घरी विश्रांती घ्या किंवा उपकेंद्राचा सल्ला घ्या.' : 'Manage at home or visit local Sub-Centre.'}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-2.5">
            <span className="text-base leading-none">🟡</span>
            <div>
              <strong className="block text-amber-900 font-bold">{language === 'hi' ? 'पीला: मध्यम (Moderate)' : language === 'mr' ? 'पिवळा: मध्यम (Moderate)' : 'Yellow: Moderate'}</strong>
              <span className="text-[11px] text-amber-800 leading-tight block mt-0.5">{language === 'hi' ? 'आज ही प्राथमिक स्वास्थ्य केंद्र (PHC) में डॉक्टर को दिखाएं।' : language === 'mr' ? 'आजच प्राथमिक आरोग्य केंद्रात डॉक्टरांना दाखवा.' : 'Visit your nearest PHC doctor today.'}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-950 flex items-start gap-2.5">
            <span className="text-base leading-none">🔴</span>
            <div>
              <strong className="block text-red-900 font-bold">{language === 'hi' ? 'लाल: आपातकाल (Emergency)' : language === 'mr' ? 'लाल: आपत्कालीन (Emergency)' : 'Red: Emergency'}</strong>
              <span className="text-[11px] text-red-800 leading-tight block mt-0.5">{language === 'hi' ? 'तुरंत अस्पताल जाएं या 108 एम्बुलेंस बुलाएं।' : language === 'mr' ? 'तातडीने रुग्णालयात जा किंवा १०८ बोलवा.' : 'Immediate hospital visit or call 108 ambulance.'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Three Big Primary Action Cards (Simple & Unambiguous) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Card 1: Check Symptoms */}
        <div
          onClick={() => go('check')}
          className="tap-press group bg-white border-2 border-blue-200 hover:border-blue-600 p-6 rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              {t('checkSymptomsBtn')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {language === 'hi'
                ? 'चित्र देखकर या बोलकर अपनी बीमारी दर्ज करें और सही डॉक्टर की सलाह पाएं।'
                : language === 'mr'
                ? 'चित्रे पाहून किंवा बोलून आपली लक्षणे निवडा व त्वरित मार्गदर्शन मिळवा.'
                : 'Describe symptoms via voice or visual SVGs for instant doctor guidance & triage.'}
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
            <span>{language === 'hi' ? 'जांच शुरू करें →' : language === 'mr' ? 'तपासणी सुरू करा →' : 'Start Free Check →'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Hospital Radar & Doctors */}
        <div
          onClick={() => go('map')}
          className="tap-press group bg-white border border-slate-200 hover:border-blue-600 p-6 rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Building2 className="w-6 h-6" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              {t('navMap')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {language === 'hi'
                ? 'नजदीकी प्राथमिक स्वास्थ्य केंद्र (PHC), उपस्थित डॉक्टर और दवाइयों की उपलब्धता देखें।'
                : language === 'mr'
                ? 'जवळचे प्राथमिक आरोग्य केंद्र (PHC), उपस्थित डॉक्टर व उपलब्ध औषधांची माहिती पहा.'
                : 'Find nearest Primary Health Centres (PHC), on-duty doctors, available medicines, and directions.'}
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
            <span>{language === 'hi' ? 'अस्पताल सूची देखें →' : language === 'mr' ? 'रुग्णालय यादी पहा →' : 'View 18+ Facilities →'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: 108 Emergency Ambulance */}
        <div
          onClick={() => setSosOpen(true)}
          className="tap-press group bg-red-50/60 border-2 border-red-200 hover:border-red-600 p-6 rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors">
              <Siren className="w-6 h-6 animate-pulse" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-red-700">
              {t('sosTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {language === 'hi'
                ? 'गंभीर आपातकाल में 108 एम्बुलेंस को तुरंत कॉल करें और लोकेशन भेजें।'
                : language === 'mr'
                ? 'गंभीर आपत्कालीन स्थितीत १०८ रुग्णवाहिकेला थेट कॉल करा व ठिकाण पाठवा.'
                : 'Immediate one-tap 108 emergency ambulance calling and automated WhatsApp GPS location dispatch.'}
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-red-200 flex items-center justify-between text-xs font-bold text-red-600">
            <span>{language === 'hi' ? '108 एम्बुलेंस बुलाएं →' : language === 'mr' ? '१०८ रुग्णवाहिका बोलवा →' : 'Call 108 Dispatch →'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* 3. Illustrated Visual Symptom Selector (1-Tap Visual Check for Tribal & Rural Citizens) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm">
        <VisualSymptomSelector onSelectSymptom={handleVisualSelect} selectedSymptoms={[]} />
      </div>

      {/* 4. Simple 3-Step Guide (How it works in 1-2-3) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm">
        <div className="text-center max-w-xl mx-auto mb-6">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
            {language === 'hi' ? 'सरल व आसान उपयोग' : language === 'mr' ? 'सोपी व सुलभ पद्धत' : 'Easy To Use · How It Works'}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display mt-0.5">
            {language === 'hi' ? 'इलाज पाने के 3 सरल चरण' : language === 'mr' ? 'उपचारासाठी ३ सोप्या पायऱ्या' : 'Three Simple Steps to Proper Care'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm shrink-0 flex items-center justify-center shadow-sm">
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

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm shrink-0 flex items-center justify-center shadow-sm">
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

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm shrink-0 flex items-center justify-center shadow-sm">
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

      {/* 5. Nearby Health Facilities & Emergency Helplines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Nearby Health Centre Radar */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
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

            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder={t('searchHospitalPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-xs text-slate-800 outline-none w-full"
              />
            </div>
          </div>

          {/* Clean Facility Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
            {filteredHospitals.slice(0, 8).map((h) => (
              <div
                key={h.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-400 transition-all space-y-2 flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 truncate">
                      {h.type}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {h.distance_km} km
                    </span>
                  </div>

                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 mt-1.5 leading-snug">
                    {h.name}
                  </h3>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 mt-1.5">
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
                      className="tap-press flex-1 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] text-center flex items-center justify-center gap-1 border border-blue-200"
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

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>{t('showingCount')}</span>
            <button
              onClick={() => go('map')}
              className="text-blue-600 hover:underline font-bold"
            >
              {t('viewAllMap')}
            </button>
          </div>
        </div>

        {/* Right Col: Helplines & Healthcare Levels Guide */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <PhoneCall className="w-4 h-4 text-red-600" />
              {t('emergencyHelplineTitle')}
            </h2>

            <div className="space-y-2">
              <a
                href="tel:108"
                className="tap-press flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-200 hover:bg-red-100 text-slate-800 transition-all"
              >
                <div>
                  <span className="font-bold text-sm block text-red-600">108</span>
                  <span className="text-[11px] text-slate-600">{t('ambulanceLine')}</span>
                </div>
                <span className="text-xs font-bold bg-red-600 text-white px-3 py-1 rounded-lg">{t('callNow')} 108</span>
              </a>

              <a
                href="tel:112"
                className="tap-press flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-800 transition-all"
              >
                <div>
                  <span className="font-bold text-xs block text-slate-900">112</span>
                  <span className="text-[10px] text-slate-500">{t('emergencyLine')}</span>
                </div>
                <span className="text-xs font-bold text-blue-600">{t('callNow')} 112</span>
              </a>

              <a
                href="tel:104"
                className="tap-press flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-800 transition-all"
              >
                <div>
                  <span className="font-bold text-xs block text-slate-900">104</span>
                  <span className="text-[10px] text-slate-500">{t('healthAdviceLine')}</span>
                </div>
                <span className="text-xs font-bold text-blue-600">{t('callNow')} 104</span>
              </a>

              <a
                href="tel:102"
                className="tap-press flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-800 transition-all"
              >
                <div>
                  <span className="font-bold text-xs block text-slate-900">102</span>
                  <span className="text-[10px] text-slate-500">{t('maternityLine')}</span>
                </div>
                <span className="text-xs font-bold text-blue-600">{t('callNow')} 102</span>
              </a>
            </div>

            <button
              onClick={() => setSosOpen(true)}
              className="tap-press w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
            >
              <Siren className="w-4 h-4" />
              <span>{t('openDispatcher')}</span>
            </button>
          </div>

          {/* Rural Health Tier Quick Guide */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 space-y-1.5 shadow-sm">
            <p className="font-bold text-slate-900 text-xs">{t('healthTiersTitle')}</p>
            <p><strong>Sub-Centre (0–3 km):</strong> {t('tierSubCentre')}</p>
            <p><strong>PHC (3–10 km):</strong> {t('tierPHC')}</p>
            <p><strong>CHC (10–25 km):</strong> {t('tierCHC')}</p>
          </div>
        </div>
      </div>

      {/* 6. Staff & Grassroots Portals (ASHA Worker & PHC Incharge) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div
          onClick={() => {
            setRole('asha')
            go('asha')
          }}
          className="tap-press group bg-white border border-slate-200 hover:border-blue-500 p-5 rounded-2xl shadow-sm cursor-pointer transition-all"
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
          className="tap-press group bg-white border border-slate-200 hover:border-blue-500 p-5 rounded-2xl shadow-sm cursor-pointer transition-all"
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
