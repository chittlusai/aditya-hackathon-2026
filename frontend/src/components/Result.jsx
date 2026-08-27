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
  const { result, go, setSosOpen, setActiveSlip, hospitals, t } = useApp()

  if (!result) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-slate-600 text-sm">
          {t('noPatients')}
        </p>
        <button
          onClick={() => go('check')}
          className="tap-press inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-800 text-white font-bold text-xs shadow-sm"
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
      <div className="flex items-center justify-between border-b border-slate-300 pb-3">
        <button
          onClick={() => go('check')}
          className="tap-press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
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
            className="tap-press inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{t('shareSlip')}</span>
          </button>
        </div>
      </div>

      {/* Emergency Action Banner */}
      {isEmergency && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-700 text-white flex items-center justify-center shrink-0">
              <Siren className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-red-950">{t('emergencyBannerTitle')}</p>
              <p className="text-xs text-red-800">{t('emergencyBannerSub')}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSosOpen(true)}
            className="tap-press px-4 py-2 rounded-lg bg-red-700 hover:bg-red-800 text-white text-xs font-bold shadow-sm shrink-0"
          >
            {t('call108Ambulance')}
          </button>
        </div>
      )}

      {/* Triage Urgency Level Display */}
      <UrgencyBadge urgency={result.urgency} />

      {/* AI Clinical Findings & Guidance Box */}
      <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-800" />
            Gemini AI Clinical Evaluation
          </p>
          <span className="text-[11px] font-bold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
            {Math.round((result.confidence || 0.92) * 100)}% Confidence
          </span>
        </div>

        <p className="text-sm text-slate-900 leading-relaxed font-medium">
          {result.advice}
        </p>

        {/* First Aid / Precautions if present */}
        {result.first_aid && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 space-y-1">
            <span className="font-bold text-blue-950 block">Immediate Home Precautions / First Aid:</span>
            <p className="leading-relaxed">{result.first_aid}</p>
          </div>
        )}

        {/* Risk Factors */}
        {result.risk_factors && result.risk_factors.length > 0 && (
          <div className="pt-2">
            <span className="text-[11px] font-bold text-slate-600 block mb-1.5 uppercase tracking-wider">
              Identified Clinical Risk Factors:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {result.risk_factors.map((rf, i) => (
                <span
                  key={i}
                  className="text-xs px-2.5 py-1 rounded bg-amber-50 text-amber-900 border border-amber-300 font-semibold flex items-center gap-1"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                  {rf}
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
                className="text-xs px-2.5 py-1 rounded bg-slate-100 text-slate-800 border border-slate-200 font-semibold"
              >
                ✓ {kw}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Recommended Primary Health Facility */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
          {t('recommendedFacility')}
        </p>
        {result.hospital ? (
          <HospitalCard hospital={result.hospital} urgency={result.urgency} isTop={true} />
        ) : (
          <div className="bg-white border border-slate-300 rounded-xl p-5 text-slate-600 text-xs">
            {t('mildSub')}
          </div>
        )}
      </div>

      {/* Geospatial Map */}
      <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-blue-800" />
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
          <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
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
