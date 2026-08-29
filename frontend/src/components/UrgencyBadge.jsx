import { CheckCircle2, AlertTriangle, Siren, Clock, Home, Building2 } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

export default function UrgencyBadge({ urgency }) {
  const { t, language } = useApp()

  const isMild = urgency === 'Mild'
  const isMod = urgency === 'Moderate'
  const isEm = urgency === 'Emergency'

  const tierConfig = {
    Mild: {
      actionTitle: language === 'hi' ? 'घर पर आराम व घरेलू देखभाल' : language === 'mr' ? 'घरी विश्रांती व प्राथमिक काळजी' : 'Home Rest & Local Sub-Centre Care',
      actionTime: language === 'hi' ? 'स्थिति सामान्य है' : language === 'mr' ? 'स्थिती सामान्य आहे' : 'Stable Condition',
      actionDesc: language === 'hi' ? 'पर्याप्त पानी पिएं, आराम करें। जरूरत पड़ने पर आशा कार्यकर्ता या नजदीकी स्वास्थ्य उप-केंद्र से संपर्क करें।' : language === 'mr' ? 'पुरेसे पाणी प्या, विश्रांती घ्या. गरज भासल्यास आशा सेविकेशी संपर्क साधा.' : 'Stay hydrated and rested. Consult your local ASHA worker or Health Sub-Centre if needed.',
      bg: 'bg-emerald-50 border-emerald-300 text-emerald-950',
      badgeBg: 'bg-emerald-600 text-white',
      borderRing: 'ring-2 ring-emerald-500/30',
      icon: Home,
    },
    Moderate: {
      actionTitle: language === 'hi' ? 'आज ही प्राथमिक स्वास्थ्य केंद्र (PHC) जाएं' : language === 'mr' ? 'आजच प्राथमिक आरोग्य केंद्रात (PHC) जा' : 'Visit Primary Health Centre (PHC) Today',
      actionTime: language === 'hi' ? 'आज ही डॉक्टर को दिखाएं (Within 12-24 hrs)' : language === 'mr' ? 'आजच डॉक्टरांना दाखवा (१२-२४ तासांत)' : 'See Doctor Today (Within 12-24 hrs)',
      actionDesc: language === 'hi' ? 'बीमारी बढ़ने से पहले नजदीकी प्राथमिक स्वास्थ्य केंद्र या सीएचसी में डॉक्टर से परामर्श लें।' : language === 'mr' ? 'त्रास वाढण्यापूर्वी जवळच्या प्राथमिक आरोग्य केंद्रात डॉक्टरांचा सल्ला घ्या.' : 'Consult a medical doctor at your nearest PHC/CHC before symptoms worsen.',
      bg: 'bg-amber-50 border-amber-300 text-amber-950',
      badgeBg: 'bg-amber-600 text-white',
      borderRing: 'ring-2 ring-amber-500/30',
      icon: Building2,
    },
    Emergency: {
      actionTitle: language === 'hi' ? 'तुरंत अस्पताल जाएं या 108 एम्बुलेंस बुलाएं' : language === 'mr' ? 'तातडीने रुग्णालयात जा किंवा १०८ बोलवा' : 'Immediate Hospital Visit or Call 108',
      actionTime: language === 'hi' ? 'तुरंत (Immediate Emergency - No Delay)' : language === 'mr' ? 'त्वरित (तातडीची आपत्कालीन स्थिती)' : 'Immediate Emergency (Do Not Delay)',
      actionDesc: language === 'hi' ? 'यह गंभीर स्थिति है। बिना देर किए नजदीकी अस्पताल के इमरजेंसी वार्ड में जाएं या 108 एम्बुलेंस को कॉल करें।' : language === 'mr' ? 'ही गंभीर स्थिती आहे. विलंब न करता जवळच्या रुग्णालयात जा किंवा १०८ रुग्णवाहिका बोलवा.' : 'Critical condition. Reach the nearest hospital emergency ward immediately or call 108 ambulance.',
      bg: 'bg-red-50 border-red-300 text-red-950',
      badgeBg: 'bg-red-600 text-white',
      borderRing: 'ring-2 ring-red-500/30',
      icon: Siren,
    },
  }[urgency] || {
    actionTitle: 'Standard Clinical Evaluation',
    actionTime: 'Visit Health Centre',
    actionDesc: 'Please consult your nearest healthcare provider.',
    bg: 'bg-blue-50 border-blue-200 text-blue-950',
    badgeBg: 'bg-blue-600 text-white',
    borderRing: '',
    icon: CheckCircle2,
  }

  const ActionIcon = tierConfig.icon

  return (
    <div className="space-y-3">
      {/* Visual 3-Level Traffic Light Meter */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>{language === 'hi' ? 'गंभीरता मीटर (Urgency Level)' : language === 'mr' ? 'तीव्रता मीटर (Urgency Level)' : 'Urgency Traffic-Light Meter'}</span>
          </span>
          <span className="text-[11px] font-bold text-slate-700">
            {isMild ? '🟢 Level 1' : isMod ? '🟡 Level 2' : '🔴 Level 3'}
          </span>
        </div>

        {/* 3 Step Visual Progress Bars */}
        <div className="grid grid-cols-3 gap-2">
          {/* Level 1: Mild */}
          <div
            className={`p-2 sm:p-2.5 rounded-xl border text-center transition-all ${
              isMild
                ? 'bg-emerald-600 text-white border-emerald-600 font-extrabold shadow-sm ring-2 ring-emerald-500/20'
                : 'bg-slate-50 text-slate-400 border-slate-200 opacity-60'
            }`}
          >
            <div className="flex items-center justify-center gap-1 text-[11px] sm:text-xs">
              <span>🟢</span>
              <span>{language === 'hi' ? 'सामान्य' : language === 'mr' ? 'सामान्य' : 'Mild'}</span>
            </div>
            <p className="text-[9.5px] sm:text-[10px] mt-0.5 truncate">
              {language === 'hi' ? 'घर पर आराम' : language === 'mr' ? 'घरी विश्रांती' : 'Home Rest'}
            </p>
          </div>

          {/* Level 2: Moderate */}
          <div
            className={`p-2 sm:p-2.5 rounded-xl border text-center transition-all ${
              isMod
                ? 'bg-amber-600 text-white border-amber-600 font-extrabold shadow-sm ring-2 ring-amber-500/20'
                : 'bg-slate-50 text-slate-400 border-slate-200 opacity-60'
            }`}
          >
            <div className="flex items-center justify-center gap-1 text-[11px] sm:text-xs">
              <span>🟡</span>
              <span>{language === 'hi' ? 'मध्यम' : language === 'mr' ? 'मध्यम' : 'Moderate'}</span>
            </div>
            <p className="text-[9.5px] sm:text-[10px] mt-0.5 truncate">
              {language === 'hi' ? 'आज PHC जाएं' : language === 'mr' ? 'आज PHC जा' : 'PHC Today'}
            </p>
          </div>

          {/* Level 3: Emergency */}
          <div
            className={`p-2 sm:p-2.5 rounded-xl border text-center transition-all ${
              isEm
                ? 'bg-red-600 text-white border-red-600 font-extrabold shadow-sm ring-2 ring-red-500/20 animate-pulse'
                : 'bg-slate-50 text-slate-400 border-slate-200 opacity-60'
            }`}
          >
            <div className="flex items-center justify-center gap-1 text-[11px] sm:text-xs">
              <span>🔴</span>
              <span>{language === 'hi' ? 'आपातकाल' : language === 'mr' ? 'आपत्कालीन' : 'Emergency'}</span>
            </div>
            <p className="text-[9.5px] sm:text-[10px] mt-0.5 truncate">
              {language === 'hi' ? 'तुरंत 108 / अस्पताल' : language === 'mr' ? 'त्वरित १०८ / रुग्णालय' : 'Call 108 / Hosp'}
            </p>
          </div>
        </div>
      </div>

      {/* Big Action Instruction Card */}
      <div className={`p-4 sm:p-5 rounded-2xl border ${tierConfig.bg} ${tierConfig.borderRing} shadow-xs space-y-2`}>
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center shadow-xs ${tierConfig.badgeBg}`}>
            <ActionIcon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/90 border border-slate-200 text-slate-800 shadow-2xs">
                {language === 'hi' ? 'मुख्य निर्देश' : language === 'mr' ? 'मुख्य सूचना' : 'Primary Action Needed'}
              </span>
              <span className="text-[11px] font-bold text-slate-700">
                • {tierConfig.actionTime}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold mt-1 text-slate-900 leading-snug">
              {tierConfig.actionTitle}
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 mt-1 leading-relaxed font-medium">
              {tierConfig.actionDesc}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
