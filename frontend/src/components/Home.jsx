import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Stethoscope,
  Building2,
  Phone,
  Sparkles,
  MapPin,
  ShieldCheck,
  Clock,
  ArrowRight,
  Pill,
  Siren,
  FileText,
  Video,
  Navigation,
  CheckCircle2,
  Calendar,
  HeartPulse,
} from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import VisualSymptomSelector from './VisualSymptomSelector.jsx'

export default function Home() {
  const {
    go,
    setSosOpen,
    t,
    language,
    hospitals,
    currentUser,
    userCoords,
    setGpsModalOpen,
    startVideoCall,
  } = useApp()

  const handleVisualSelect = () => {
    go('check')
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6">
      {/* 1. Modern Citizen Welcome & Status Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-blue-500/20 shrink-0">
            {currentUser?.name?.charAt(0) || 'R'}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                {language === 'hi' ? 'नमस्ते' : language === 'te' ? 'నమస్కారం' : 'Welcome back'},
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ABDM Verified
              </span>
            </div>
            <h1 className="text-base sm:text-xl font-extrabold text-slate-900 truncate">
              {currentUser?.name || 'Ramesh Kumar (Citizen)'}
            </h1>
          </div>
        </div>

        {/* GPS Location & Emergency SOS Quick Actions */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setGpsModalOpen(true)}
            className="tap-press flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 px-3 py-2 rounded-2xl border border-slate-200 transition-all"
          >
            <Navigation className="w-3.5 h-3.5 text-blue-600" />
            <span className="truncate max-w-[130px] sm:max-w-none">{userCoords?.label || 'GPS Radar Active'}</span>
          </button>

          <button
            type="button"
            onClick={() => setSosOpen(true)}
            className="tap-press inline-flex items-center justify-center gap-1.5 text-xs font-extrabold bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 rounded-2xl shadow-md shadow-red-500/25 transition-all"
          >
            <Siren className="w-3.5 h-3.5 animate-pulse" />
            <span>108 SOS</span>
          </button>
        </div>
      </motion.div>

      {/* 2. Flagship Interactive Feature Cards (2 Hero Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* HERO CARD 1: AI Health Triage & Body Map */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative rounded-3xl p-5 sm:p-7 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white shadow-xl shadow-blue-600/15 overflow-hidden flex flex-col justify-between group"
        >
          {/* Subtle Background Art */}
          <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />

          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-inner">
                <Stethoscope className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 text-white px-2.5 py-1 rounded-full border border-white/25">
                ⚡ 10ms Offline AI
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-tight">
                {language === 'hi' ? 'बीमारी व लक्षणों की जांच करें' : language === 'te' ? 'లక్షణాలు & ఆరోగ్య పరీక్ష' : 'Check Symptoms & Health Triage'}
              </h2>
              <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed mt-1">
                {language === 'hi'
                  ? 'चित्रों पर टच करके या अपनी भाषा में बोलकर बीमारी की गंभीरता और सही अस्पताल जानें।'
                  : language === 'te'
                  ? 'శరీర భాగాలపై నొక్కి లేదా 17 భాషల్లో మాట్లాడి తక్షణ వైద్య సలహా పొందండి.'
                  : 'Tap interactive body parts or speak in 17 Indian languages for zero-delay triage & PHC matching.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => go('check')}
            className="tap-press mt-5 w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-blue-50 text-blue-900 font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 transition-all relative z-10"
          >
            <span>{language === 'hi' ? 'जांच शुरू करें (Start Triage)' : language === 'te' ? 'పరీక్ష ప్రారంభించండి' : 'Start Symptom Check'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>

        {/* HERO CARD 2: WhatsApp Doctor Video Consultation */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative rounded-3xl p-5 sm:p-7 bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 text-white shadow-xl shadow-emerald-600/15 overflow-hidden flex flex-col justify-between group"
        >
          {/* Subtle Background Art */}
          <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-emerald-400/15 blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />

          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-inner">
                <Video className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/30 text-emerald-200 px-2.5 py-1 rounded-full border border-emerald-400/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Doctor Available
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-tight">
                {language === 'hi' ? 'डॉक्टर वीडियो कॉल (WhatsApp)' : language === 'te' ? 'వాట్సాప్ డాక్టర్ వీడియో కాల్' : 'WhatsApp Doctor Video Call'}
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed mt-1">
                {language === 'hi'
                  ? 'डॉ. राजेश शर्मा से लाइव बात करें — चेहरे के दर्द का AI विश्लेषण व वास्तविक आवाज़ में परामर्श।'
                  : language === 'te'
                  ? 'డాక్టర్ రాజేష్ శర్మతో మాట్లాడండి — ముఖ కవళికల AI స్కాన్ & రియల్ వాయిస్ సలహా.'
                  : 'Live teleconsultation with Dr. Rajesh Sharma featuring Gemini AI Face/Pain HUD and ElevenLabs real doctor voice.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => startVideoCall()}
            className="tap-press mt-5 w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-950 font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 transition-all relative z-10"
          >
            <span>{language === 'hi' ? 'कॉल शुरू करें (Start Call)' : language === 'te' ? 'కాల్ ప్రారంభించండి' : 'Start Video Call Now'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>

      {/* 3. Secondary Bento Grid (Nearby Hospitals & Pill Tracker) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card 3: Nearby Hospitals & Live GPS Map */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-300 transition-all group"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                  GPS Radar
                </span>
                <span className="text-[10px] font-bold text-slate-500">
                  {hospitals?.length || 18} Centres
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mt-1">
                Nearby PHC & CHC Hospitals
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Check driving distances, on-duty doctors, ICU beds & oxygen availability.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => go('map')}
            className="tap-press w-full py-2.5 px-3.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-800 hover:text-blue-700 font-bold text-xs border border-slate-200 transition-all flex items-center justify-center gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5 text-teal-600" />
            <span>View Hospital Radar & Live Map →</span>
          </button>
        </motion.div>

        {/* Card 4: Daily Pill Tracker & Medicine Timings */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-300 transition-all group"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                  Daily Schedule
                </span>
                <span className="text-[10px] font-bold text-slate-500">
                  Morning • Afternoon • Night
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mt-1">
                Daily Pill Tracker & Medicines
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Organizes tablets with food instructions, exact timings & clinical purpose.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => go('medicines')}
            className="tap-press w-full py-2.5 px-3.5 rounded-xl bg-slate-50 hover:bg-amber-50 text-slate-800 hover:text-amber-800 font-bold text-xs border border-slate-200 transition-all flex items-center justify-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Check Pill Timings & Stock →</span>
          </button>
        </motion.div>
      </div>

      {/* 4. Visual 1-Tap Body Symptoms Selector */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-7 shadow-xs"
      >
        <VisualSymptomSelector onSelectSymptom={handleVisualSelect} selectedSymptoms={[]} />
      </motion.div>
    </div>
  )
}
