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
  ShieldCheck,
  Stethoscope,
  Mic,
} from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import VoiceInput from './VoiceInput.jsx'
import VisualSymptomSelector from './VisualSymptomSelector.jsx'
import BodyPartSelector from './BodyPartSelector.jsx'
import { analyzeSymptomsWithGemini } from '../utils/geminiAi.js'
import { classifyLocalUrgency, matchLocalHospital } from '../utils/localTriage.js'

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

  function handleSelectVisualSymptom(item) {
    const symptomName = item.translations?.[language]?.title || item.translations?.en?.title || item.tag
    setText((prev) => {
      if (!prev) return symptomName
      const parts = prev.split(',').map((s) => s.trim()).filter(Boolean)
      if (parts.some((p) => p.toLowerCase() === symptomName.toLowerCase() || p.toLowerCase() === item.tag.toLowerCase())) {
        return parts.filter((p) => p.toLowerCase() !== symptomName.toLowerCase() && p.toLowerCase() !== item.tag.toLowerCase()).join(', ')
      }
      return [...parts, symptomName].join(', ')
    })
  }

  function handleAddBodySymptom(label) {
    setText((prev) => {
      if (!prev) return label
      const parts = prev.split(',').map((s) => s.trim()).filter(Boolean)
      if (parts.some((p) => p.toLowerCase() === label.toLowerCase())) {
        return parts.filter((p) => p.toLowerCase() !== label.toLowerCase()).join(', ')
      }
      return [...parts, label].join(', ')
    })
  }

  function handleVoiceTranscript(transcript) {
    setText((prev) => (prev ? `${prev}, ${transcript}` : transcript))
  }

  async function onSubmit(e) {
    e?.preventDefault?.()
    setErr('')
    if (!text.trim()) {
      const errs = {
        te: 'దయచేసి పై చిత్రాలను ఎంచుకోండి లేదా మాట్లాడి మీ అనారోగ్య వివరాలను తెలియజేయండి.',
        ta: 'தயவுசெய்து மேலே உள்ள படங்களைத் தேர்ந்தெடுக்கவும் அல்லது பேசி அறிகுறிகளைச் சேர்க்கவும்.',
        hi: 'कृपया ऊपर से कोई चित्र चुनें या बोलकर अपनी बीमारी बताएं।',
        mr: 'कृपया वरील चित्रांमधून निवडा किंवा बोलून आपला त्रास सांगा.',
        bn: 'দয়া করে উপরের ছবিগুলি থেকে নির্বাচন করুন বা কথা বলে আপনার সমস্যা জানান।',
        gu: 'કૃપા કરીને ઉપરના ચિત્રોમાંથી પસંદ કરો અથવા બોલીને તમારી તકલીફ જણાવો.',
        kn: 'ದಯವಿಟ್ಟು ಮೇಲಿನ ಚಿತ್ರಗಳಿಂದ ಆಯ್ಕೆಮಾಡಿ ಅಥವಾ ಮಾತನಾಡಿ ನಿಮ್ಮ ಸಮಸ್ಯೆ ತಿಳಿಸಿ.',
        ml: 'ദയവായി മുകളിലെ ചിത്രങ്ങൾ തിരഞ്ഞെടുക്കുക അല്ലെങ്കിൽ സംസാരിക്കുക.',
        en: 'Please select a visual symptom card from above or type/speak your health problem.',
      }
      setErr(errs[language] || errs.en)
      return
    }

    setLoading(true)

    try {
      const geminiResult = await analyzeSymptomsWithGemini(text, vitals, language)
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
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6">
      {/* Back button */}
      <button
        type="button"
        onClick={() => go('home')}
        className="tap-press inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
      >
        ← {t('navHome')}
      </button>

      {/* Official Form Header */}
      <div className="bg-white border border-border-soft rounded-lg p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary block">
                {t('formTag')}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary-50 text-primary border border-primary-100">
                <ShieldCheck className="w-3 h-3 text-primary" />
                {language === 'hi' ? 'स्वास्थ्य प्रोटोकॉल' : language === 'mr' ? 'आरोग्य प्रोटोकॉल' : 'Clinical Protocol'}
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-bold text-text-main font-display mt-1">
              {t('inputHeader')}
            </h1>
            <p className="text-xs sm:text-sm text-text-muted mt-1 leading-relaxed">
              {language === 'hi'
                ? 'अपनी तकलीफ का चित्र चुनें, बोलकर बताएं या नीचे विवरण लिखें।'
                : language === 'mr'
                ? 'आपल्या त्रासाचे चित्र निवडा, बोलून सांगा किंवा खाली माहिती लिहा.'
                : 'Select from visual problem cards, use voice dictation, or type your symptoms.'}
            </p>
          </div>

          {/* GPS Location Button */}
          <button
            type="button"
            onClick={() => setGpsModalOpen(true)}
            className="tap-press self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-50 border border-border-soft text-xs font-bold text-text-muted hover:bg-slate-100 shrink-0 shadow-sm"
          >
            <Navigation className={`w-3.5 h-3.5 ${userCoords?.active ? 'text-emerald-600' : 'text-primary'}`} />
            <span>{userCoords?.active ? t('gpsActive') : t('useGps')}</span>
          </button>
        </div>
      </div>

      {/* 1. Body Part Selector */}
      <BodyPartSelector onAddSymptom={handleAddBodySymptom} currentSymptoms={text} />

      {/* 2. Visual Illustrated Problem Cards */}
      <div className="bg-white border border-border-soft rounded-lg p-4 sm:p-6 shadow-sm">
        <VisualSymptomSelector
          onSelectSymptom={handleSelectVisualSymptom}
          selectedSymptoms={text ? text.split(',').map((s) => s.trim()).filter(Boolean) : []}
        />
      </div>

      {/* 3. Main Symptom Box & Voice Dictation */}
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="bg-white border border-border-soft rounded-lg p-4 sm:p-6 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-soft pb-3">
            <label className="text-xs font-bold text-text-main flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>{t('symptomLabel')}</span>
            </label>
            <VoiceInput onTranscript={handleVoiceTranscript} disabled={loading} />
          </div>

          <textarea
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('placeholder')}
            className="w-full p-3.5 text-sm rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none transition-all resize-y font-sans"
          />

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>{t('voicePrompt')}</span>
            {text && (
              <button
                type="button"
                onClick={() => setText('')}
                className="text-red-600 hover:underline font-bold"
              >
                {language === 'te' ? 'అన్నీ తొలగించు' : language === 'ta' ? 'அனைத்தையும் அழி' : language === 'hi' ? 'सभी हटाएं' : language === 'mr' ? 'सर्व हटवा' : 'Clear All'}
              </button>
            )}
          </div>
        </div>

        {/* Optional Clinical Vitals */}
        <div className="bg-white border border-border-soft rounded-lg p-5 shadow-sm">
          <button
            type="button"
            onClick={() => setShowVitals((v) => !v)}
            className="w-full flex items-center justify-between text-left text-xs font-bold text-text-main tap-press"
          >
            <span className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              {showVitals ? t('vitalsHide') : t('vitalsToggle')}
            </span>
            <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${showVitals ? 'rotate-180' : ''}`} />
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
                    <label className="block text-[11px] font-semibold text-text-muted mb-1">{t('age')}</label>
                    <input
                      type="number"
                      placeholder="35"
                      value={vitals.age}
                      onChange={(e) => setVitals({ ...vitals, age: e.target.value })}
                      className="w-full p-2.5 text-xs rounded-md border border-border-soft text-text-main bg-slate-50 focus:bg-white focus:border-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-text-muted mb-1">{t('spo2')}</label>
                    <input
                      type="number"
                      placeholder="98"
                      value={vitals.spo2}
                      onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
                      className="w-full p-2.5 text-xs rounded-md border border-border-soft text-text-main bg-slate-50 focus:bg-white focus:border-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-text-muted mb-1">{t('pulse')}</label>
                    <input
                      type="number"
                      placeholder="74"
                      value={vitals.pulse}
                      onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })}
                      className="w-full p-2.5 text-xs rounded-md border border-border-soft text-text-main bg-slate-50 focus:bg-white focus:border-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-text-muted mb-1">{t('bp')}</label>
                    <input
                      type="text"
                      placeholder="120/80"
                      value={vitals.bp}
                      onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
                      className="w-full p-2.5 text-xs rounded-md border border-border-soft text-text-main bg-slate-50 focus:bg-white focus:border-primary outline-none"
                    />
                  </div>
                </div>

                <div className="pt-3">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-text-main font-semibold">
                    <input
                      type="checkbox"
                      checked={vitals.isPregnant}
                      onChange={(e) =>
                        setVitals({ ...vitals, isPregnant: e.target.checked })
                      }
                      className="w-4 h-4 accent-primary rounded"
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
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{err}</span>
          </div>
        )}

        {/* Submit Assessment Button */}
        <button
          type="submit"
          disabled={loading}
          className="tap-press w-full min-h-[52px] rounded-md bg-primary hover:bg-primary-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>
                {language === 'hi'
                  ? 'स्वास्थ्य प्रोटोकॉल एवं डॉक्टर सलाह जांची जा रही है...'
                  : language === 'mr'
                  ? 'वैद्यकीय सल्ला व केंद्र शोधत आहे...'
                  : 'Evaluating against Clinical Protocols & Finding PHC…'}
              </span>
            </>
          ) : (
            <>
              <Stethoscope className="w-4 h-4" />
              <span>
                {language === 'hi'
                  ? 'डॉक्टर की सलाह एवं नजदीकी केंद्र देखें (Check Guidance & PHC)'
                  : language === 'mr'
                  ? 'डॉक्टरांचा सल्ला व जवळचे केंद्र पहा (Check Guidance & PHC)'
                  : t('analyzeBtn')}
              </span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}
