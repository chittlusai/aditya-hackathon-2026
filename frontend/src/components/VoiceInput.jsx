import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, AlertCircle, Volume2, Square, Check, Activity } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { INDIAN_LANGUAGES } from '../utils/i18n.js'

/**
 * VoiceInput — Robust Continuous Speech-to-Text with 3-Second Auto-Silence Stop
 * Supported across all 17 Official / Major Indian Languages.
 */
export default function VoiceInput({ onTranscript, disabled = false }) {
  const { language, t } = useApp()
  const [isListening, setIsListening] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [interimText, setInterimText] = useState('')
  const [silenceCountdown, setSilenceCountdown] = useState(3)

  const recognitionRef = useRef(null)
  const transcriptBufferRef = useRef('')
  const silenceTimerRef = useRef(null)
  const intervalRef = useRef(null)

  // Look up BCP-47 speech recognition language code
  const currentLangObj = INDIAN_LANGUAGES.find((l) => l.code === language) || {
    speechCode: 'en-IN',
    label: 'English',
    short: 'EN',
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch {}
      }
    }
  }, [])

  const resetSilenceTimer = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
    if (intervalRef.current) clearInterval(intervalRef.current)
    
    setSilenceCountdown(3)
    let count = 3
    intervalRef.current = setInterval(() => {
      count -= 1
      if (count >= 0) setSilenceCountdown(count)
    }, 1000)

    // 3000ms silence timer
    silenceTimerRef.current = setTimeout(() => {
      stopListening()
    }, 3000)
  }

  const startListening = () => {
    setErrorMessage('')
    setInterimText('')
    transcriptBufferRef.current = ''

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      setErrorMessage(
        'Speech recognition is not supported in this browser. Please use Google Chrome, Edge, or an updated mobile browser.'
      )
      return
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch {}
      }

      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.maxAlternatives = 1
      recognition.lang = currentLangObj.speechCode || 'en-IN'

      recognition.onstart = () => {
        setIsListening(true)
        setErrorMessage('')
        transcriptBufferRef.current = ''
        resetSilenceTimer()
      }

      recognition.onsoundstart = () => {
        resetSilenceTimer()
      }

      recognition.onspeechstart = () => {
        resetSilenceTimer()
      }

      recognition.onresult = (event) => {
        resetSilenceTimer()
        let finalStr = ''
        let currentInterim = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i]
          if (res.isFinal) {
            finalStr += res[0].transcript + ' '
          } else {
            currentInterim += res[0].transcript
          }
        }

        if (finalStr.trim()) {
          transcriptBufferRef.current = (transcriptBufferRef.current + ' ' + finalStr).trim()
        }

        setInterimText(currentInterim || transcriptBufferRef.current)
      }

      recognition.onerror = (event) => {
        console.warn('Speech recognition event notice:', event)
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setErrorMessage('Microphone access blocked. Please allow Microphone permissions in browser settings.')
        } else if (event.error === 'no-speech') {
          // Handled by silence timer
        } else if (event.error !== 'aborted') {
          setErrorMessage(`Microphone notice: ${event.error}`)
        }
      }

      recognition.onend = () => {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
        if (intervalRef.current) clearInterval(intervalRef.current)
        setIsListening(false)

        const finalRecordedText = transcriptBufferRef.current.trim() || interimText.trim()
        if (finalRecordedText) {
          onTranscript(finalRecordedText)
        }
        setInterimText('')
        transcriptBufferRef.current = ''
      }

      recognitionRef.current = recognition
      recognition.start()
    } catch (err) {
      console.error('Failed to start speech recognition:', err)
      setErrorMessage('Could not start microphone. Please check browser permissions.')
      setIsListening(false)
    }
  }

  const stopListening = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {}
    }
    setIsListening(false)
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        disabled={disabled}
        onClick={isListening ? stopListening : startListening}
        aria-label={isListening ? t('stopVoice') : t('speakNow')}
        className={`tap-press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                    text-xs font-bold transition-all shadow-2xs border ${
                      isListening
                        ? 'bg-red-600 hover:bg-red-700 text-white border-red-700 animate-pulse ring-2 ring-red-500/20'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                    }`}
      >
        <Mic className={`w-3.5 h-3.5 ${isListening ? 'text-white' : 'text-blue-600'}`} />
        <span>{isListening ? t('stopVoice') : t('speakNow')}</span>
        <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${isListening ? 'bg-red-700 text-white' : 'bg-blue-50 text-blue-700'}`}>
          {currentLangObj.short || currentLangObj.code?.toUpperCase()}
        </span>
      </button>

      {/* Floating Listening Banner with 3s Silence Countdown & Live Preview */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-full mt-2 right-0 z-30 w-72 sm:w-80 p-3.5 rounded-2xl
                       bg-slate-900 text-white text-xs font-medium shadow-2xl border border-slate-800 space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0" />
                <span className="font-bold text-[11px] text-red-400">
                  {currentLangObj.label} ({t('listeningNow')})
                </span>
              </div>
              <span className="text-[10px] text-slate-300 font-mono bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                Auto-stops in {silenceCountdown}s
              </span>
            </div>

            {/* Live speech preview */}
            <div className="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-emerald-300 text-xs min-h-[42px] max-h-24 overflow-y-auto italic">
              {interimText || 'Speak your symptoms clearly…'}
            </div>

            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800 text-[11px]">
              <span className="text-slate-400">Continuous voice mode</span>
              <button
                type="button"
                onClick={stopListening}
                className="tap-press px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1 shadow-2xs"
              >
                <Check className="w-3 h-3" />
                <span>Done</span>
              </button>
            </div>
          </motion.div>
        )}

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-full mt-2 right-0 z-30 w-72 p-3 rounded-2xl
                       bg-red-50 border border-red-200 text-red-800 text-xs shadow-xl flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p>{errorMessage}</p>
              <button
                type="button"
                onClick={() => setErrorMessage('')}
                className="text-[10px] text-red-700 underline font-bold mt-1 block"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
