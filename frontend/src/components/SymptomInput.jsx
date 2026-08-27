import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  Loader2,
  Activity,
  ChevronDown,
  Navigation,
  FileText,
  AlertCircle,
  Sparkles,
} from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import VoiceInput from './VoiceInput.jsx'
import { analyzeSymptomsWithGemini } from '../utils/geminiAi.js'
import { classifyLocalUrgency, matchLocalHospital } from '../utils/localTriage.js'

const COMMON_CHIPS_KEYS = [
  'Fever',
  'Cough',
  'Chest Pain',
  'Headache',
  'Vomiting',
  'Diarrhea',
  'Dizziness',
  'Stomach Pain',
  'Shortness of Breath',
  'Snake Bite',
  'Injury / Fracture',
  'High BP',
]

export default function SymptomInput() {
  const {
    language,
    go,
    setResult,
    t,
    userCoords,
    setGpsModalOpen,
    requestGpsLocation,
    hospitals,
  } = useApp()

  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [showVitals, setShowVitals] = useState(false)

  const [vitals, setVitals] = useState({
    age: '',
    spo2: '',
    pulse: '',
    bp: '',
    temp: '',
    sugar: '',
    isPregnant: false,
  })

  function toggleChip(chipKey) {
    const chipText = t('chips')?.[chipKey] || chipKey
    setText((prev) => {
      if (!prev) return chipText
      const parts = prev.split(',').map((s) => s.trim()).filter(Boolean)
      if (parts.includes(chipText)) {
        return parts.filter((p) => p !== chipText).join(', ')
      }
      return [...parts, chipText].join(', ')
    })
  }

  function handleVoiceTranscript(transcript) {
    setText((prev) => (prev ? `${prev} ${transcript}` : transcript))
  }

  async function onSubmit(e) {
    e?.preventDefault?.()
    setErr('')
    if (!text.trim()) {
      setErr(t('placeholder'))
      return
    }

    setLoading(true)

    try {
      // 1. Deep Gemini AI Clinical Analysis
      const geminiResult = await analyzeSymptomsWithGemini(text, vitals, language)

      // 2. Proximity-aware Hospital Matching
      const matchedFacility = matchLocalHospital(
        geminiResult.urgency,
        text,
        hospitals,
        userCoords
      )

      setResult({
        ...geminiResult,
        hospital: matchedFacility?.best,
        alternatives: matchedFacility?.alternatives || [],
        inputText: text,
        vitals,
        offline: false,
        ai_powered: true,
      })
      go('result')
    } catch (apiError) {
      console.warn('Gemini API unreachable, falling back to local clinical rule engine:', apiError)

      // Deterministic Local Fallback
      const localUrgency = classifyLocalUrgency(text, vitals, language)
      const localMatches = matchLocalHospital(
        localUrgency.urgency,
        text,
        hospitals,
        userCoords
      )

      setResult({
        ...localUrgency,
        hospital: localMatches?.best,
        alternatives: localMatches?.alternatives || [],
        inputText: text,
        vitals,
        offline: true,
        ai_powered: false,
      })
      go('result')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Official Form Header */}
      <div className="bg-white border border-slate-300 rounded-xl p-5 mb-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 block">
                {t('formTag')}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200">
                <Sparkles className="w-3 h-3 text-blue-700" />
                Gemini AI Integrated
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display mt-0.5">
              {t('inputHeader')}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('inputSub')}
            </p>
          </div>

          {/* GPS Location Button */}
          <button
            type="button"
            onClick={() => setGpsModalOpen(true)}
            className="tap-press self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-200"
          >
            <Navigation className={`w-3.5 h-3.5 ${userCoords?.active ? 'text-emerald-700' : 'text-blue-800'}`} />
            <span>{userCoords?.active ? t('gpsActive') : t('useGps')}</span>
          </button>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Main Symptom Text Area with Integrated Voice */}
        <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-800" />
              {t('symptomLabel')}
            </label>
            <VoiceInput onTranscript={handleVoiceTranscript} disabled={loading} />
          </div>

          <textarea
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('placeholder')}
            className="w-full p-3.5 text-sm rounded-lg bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-700 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-y"
          />

          <p className="text-[11px] text-slate-500">
            {t('voicePrompt')}
          </p>
        </div>

        {/* Common Symptoms Selection */}
        <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-700 mb-2.5">
            {t('commonSymptoms')}
          </p>
          <div className="flex flex-wrap gap-2">
            {COMMON_CHIPS_KEYS.map((chipKey) => {
              const chipLabel = t('chips')?.[chipKey] || chipKey
              const active = text.toLowerCase().includes(chipLabel.toLowerCase())
              return (
                <button
                  type="button"
                  key={chipKey}
                  onClick={() => toggleChip(chipKey)}
                  className={`chip ${active ? 'chip-active' : ''}`}
                >
                  {chipLabel}
                </button>
              )
            })}
          </div>
        </div>

        {/* Optional Clinical Vitals */}
        <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-sm">
          <button
            type="button"
            onClick={() => setShowVitals((v) => !v)}
            className="w-full flex items-center justify-between text-left text-xs font-bold text-slate-800 tap-press"
          >
            <span className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-800" />
              {showVitals ? t('vitalsHide') : t('vitalsToggle')}
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${showVitals ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showVitals && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">{t('age')}</label>
                    <input
                      type="number"
                      placeholder="35"
                      value={vitals.age}
                      onChange={(e) => setVitals({ ...vitals, age: e.target.value })}
                      className="w-full p-2 text-xs rounded border border-slate-300 text-slate-900 bg-slate-50 focus:bg-white focus:border-blue-700 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">{t('spo2')}</label>
                    <input
                      type="number"
                      placeholder="98"
                      value={vitals.spo2}
                      onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
                      className="w-full p-2 text-xs rounded border border-slate-300 text-slate-900 bg-slate-50 focus:bg-white focus:border-blue-700 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">{t('pulse')}</label>
                    <input
                      type="number"
                      placeholder="74"
                      value={vitals.pulse}
                      onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })}
                      className="w-full p-2 text-xs rounded border border-slate-300 text-slate-900 bg-slate-50 focus:bg-white focus:border-blue-700 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">{t('bp')}</label>
                    <input
                      type="text"
                      placeholder="120/80"
                      value={vitals.bp}
                      onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
                      className="w-full p-2 text-xs rounded border border-slate-300 text-slate-900 bg-slate-50 focus:bg-white focus:border-blue-700 outline-none"
                    />
                  </div>
                </div>

                <div className="pt-3">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-slate-800 font-semibold">
                    <input
                      type="checkbox"
                      checked={vitals.isPregnant}
                      onChange={(e) =>
                        setVitals({ ...vitals, isPregnant: e.target.checked })
                      }
                      className="w-4 h-4 accent-blue-800 rounded"
                    />
                    <span>{t('isPregnant')}</span>
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Error notification */}
        {err && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{err}</span>
          </div>
        )}

        {/* Submit Assessment Button */}
        <button
          type="submit"
          disabled={loading}
          className="tap-press w-full min-h-[50px] rounded-lg bg-blue-800 hover:bg-blue-900 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing with Gemini AI…</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>{t('analyzeBtn')}</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}
