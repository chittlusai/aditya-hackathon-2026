import { motion } from 'framer-motion'
import {
  ArrowLeft,
  FileText,
  Siren,
  MapPin,
  Stethoscope,
  Sparkles,
  ShieldAlert,
  HeartPulse,
} from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import UrgencyBadge from './UrgencyBadge.jsx'
import HospitalCard from './HospitalCard.jsx'
import SpeechReader from './SpeechReader.jsx'
import HospitalMap from './HospitalMap.jsx'

export default function Result() {
  const { result, go, setSosOpen, setActiveSlip, hospitals, t, language } = useApp()

  if (!result) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-text-muted/70 text-sm">
          {t('noPatients')}
        </p>
        <button
          onClick={() => go('check')}
          className="tap-press inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-slate-600 hover:bg-slate-700 text-white font-bold text-xs shadow-sm"
        >
          <Stethoscope className="w-4 h-4" />
          <span>{t('checkSymptomsBtn')}</span>
        </button>
      </div>
    )
  }

  const isEmergency = result.urgency === 'Emergency'
  const textForTTS = `${t('resultTitle')}. ${result.urgency}. ${result.advice}. ${
    result.hospital ? `${t('recommendedFacility')}: ${result.hospital.name}, ${result.hospital.distance_km} ${t('kmAway')}.` : ''
  }`

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-border-soft pb-3">
        <button
          onClick={() => go('check')}
          className="tap-press inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-white border border-border-soft text-text-muted hover:bg-slate-50 text-xs font-bold shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-primary" />
          <span>{t('backToCheck')}</span>
        </button>

        <div className="flex items-center gap-2">
          <SpeechReader textToRead={textForTTS} />

          <button
            type="button"
            onClick={() =>
              setActiveSlip({
                name: 'Walk-in Patient',
                symptoms: result.inputText,
                urgency: result.urgency,
                advice: result.advice,
                vitals: result.vitals,
                hospital: result.hospital,
                risk_factors: result.risk_factors,
              })
            }
            className="tap-press inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary hover:bg-primary-800 text-white text-xs font-bold shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{t('shareSlip')}</span>
          </button>
        </div>
      </div>

      {/* Emergency Action Banner */}
      {isEmergency && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Siren className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-red-700">{t('emergencyBannerTitle')}</p>
              <p className="text-xs text-text-muted">{t('emergencyBannerSub')}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSosOpen(true)}
            className="tap-press px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm shrink-0"
          >
            {t('call108Ambulance')}
          </button>
        </div>
      )}

      {/* Triage Urgency Level Display */}
      <UrgencyBadge urgency={result.urgency} />

      {/* Doctor & Clinical Findings Box */}
      <div className="bg-white border border-border-soft rounded-lg p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border-soft pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary-50 text-primary flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-text-main">
                {language === 'hi' ? 'चिकित्सा परामर्श एवं देखभाल निर्देश' : language === 'mr' ? 'वैद्यकीय सल्ला व काळजी सूचना' : 'Medical Protocol & Care Guidance'}
              </p>
              <p className="text-[11px] text-text-muted">
                {language === 'hi' ? 'राष्ट्रीय ग्रामीण स्वास्थ्य मानकों के अनुसार' : language === 'mr' ? 'शासकीय आरोग्य मानकांनुसार' : 'Verified by National Health Protocol'}
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-emerald-600" />
            <span>Doctor Verified</span>
          </span>
        </div>

        <div className="p-4 rounded-lg bg-slate-50 border border-border-soft">
          <span className="text-xs font-bold text-text-main block mb-1">
            {language === 'hi' ? 'मरीज के लिए मुख्य सलाह (Main Medical Advice):' : language === 'mr' ? 'रुग्णासाठी मुख्य सल्ला (Main Advice):' : 'Key Medical Advice:'}
          </span>
          <p className="text-sm text-text-main leading-relaxed font-medium">
            {result.advice}
          </p>
        </div>

        {/* First Aid / Precautions if present */}
        {result.first_aid && (
          <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-lg text-xs text-text-main space-y-1.5">
            <span className="font-bold text-amber-950 block flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-amber-700" />
              {language === 'hi' ? 'घर पर तुरंत करने योग्य प्राथमिक उपचार (Immediate Home First-Aid):' : language === 'mr' ? 'घरी करावयाचा प्रथमोपचार (Immediate First-Aid):' : 'Immediate Home Precautions / First Aid:'}
            </span>
            <p className="leading-relaxed text-text-muted">{result.first_aid}</p>
          </div>
        )}

        {/* Risk Factors */}
        {result.risk_factors && result.risk_factors.length > 0 && (
          <div className="pt-2">
            <span className="text-[11px] font-bold text-text-muted block mb-1.5 uppercase tracking-wider">
              {language === 'hi' ? 'पहचाने गए मुख्य लक्षण व जोखिम:' : language === 'mr' ? 'नोंदवलेली मुख्य लक्षणे व धोके:' : 'Identified Clinical Signs & Risks:'}
            </span>
            <div className="flex flex-wrap gap-2">
              {result.risk_factors.map((rf, i) => (
                <span
                  key={i}
                  className="text-xs px-3 py-1 rounded-md bg-red-50 text-red-900 border border-red-100 font-semibold flex items-center gap-1.5"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span>{rf}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Matched Signals */}
        {result.matched_keywords && result.matched_keywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {result.matched_keywords.map((kw, i) => (
              <span
                key={i}
                className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-text-muted border border-border-soft font-semibold flex items-center gap-1"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>{kw}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Recommended Primary Health Facility */}
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-text-muted">
          {t('recommendedFacility')}
        </p>
        {result.hospital ? (
          <HospitalCard hospital={result.hospital} urgency={result.urgency} isTop={true} />
        ) : (
          <div className="bg-white border border-border-soft rounded-lg p-5 text-text-muted text-xs">
            {t('mildSub')}
          </div>
        )}
      </div>

      {/* Geospatial Map */}
      <div className="bg-white border border-border-soft rounded-lg p-5 shadow-sm space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-text-main flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-primary" />
          {t('proximityMapTitle')}
        </p>
        <HospitalMap
          recommendedHospital={result.hospital}
          allHospitals={hospitals}
          height="340px"
        />
      </div>

      {/* Alternative Facilities */}
      {result.alternatives && result.alternatives.length > 0 && (
        <div className="space-y-3 pt-2">
          <p className="text-xs font-bold uppercase tracking-wider text-text-muted">
            {t('alternativeHospitals')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {result.alternatives.slice(0, 2).map((alt) => (
              <HospitalCard key={alt.id} hospital={alt} urgency={result.urgency} isTop={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
