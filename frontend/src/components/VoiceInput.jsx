import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, AlertCircle, CheckCircle, Volume2 } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

/**
 * VoiceInput — Robust Multilingual Speech-to-Text
 * Supports English (en-IN), Hindi (hi-IN), and Marathi (mr-IN)
 */
export default function VoiceInput({ onTranscript, disabled = false }) {
  const { language, t } = useApp()
  const [isListening, setIsListening] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const recognitionRef = useRef(null)

  const langCodeMap = {
    en: 'en-IN',
    hi: 'hi-IN',
    mr: 'mr-IN',
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch {
          // ignore
        }
      }
    }
  }, [])

  const startListening = () => {
    setErrorMessage('')
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      setErrorMessage(
        'Speech recognition is not supported in this browser. Please use Chrome, Edge, or an updated mobile browser.'
      )
      return
    }

    try {
      // Abort any existing instance
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch {}
      }

      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = true
      recognition.maxAlternatives = 1
      recognition.lang = langCodeMap[language] || 'en-IN'

      recognition.onstart = () => {
        setIsListening(true)
        setErrorMessage('')
      }

      recognition.onresult = (event) => {
        let finalTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal || transcript.trim()) {
            finalTranscript += transcript
          }
        }
        if (finalTranscript.trim()) {
          onTranscript(finalTranscript)
        }
      }

      recognition.onerror = (event) => {
        console.warn('Speech recognition error event:', event)
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setErrorMessage('Microphone access blocked. Please click the lock/camera icon in your address bar and allow Microphone.')
        } else if (event.error === 'no-speech') {
          setErrorMessage('No speech detected. Please speak closer to the microphone.')
        } else if (event.error !== 'aborted') {
          setErrorMessage(`Microphone error: ${event.error}`)
        }
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
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
        className={`tap-press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                    text-xs font-bold transition-all shadow-sm border ${
                      isListening
                        ? 'bg-red-700 text-white border-red-800 animate-pulse'
                        : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
                    }`}
      >
        <Mic className={`w-3.5 h-3.5 ${isListening ? 'text-white' : 'text-blue-800'}`} />
        <span>{isListening ? t('stopVoice') : t('speakNow')}</span>
      </button>

      {/* Listening notification or error banner */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-full mt-1.5 right-0 z-30 w-64 p-2.5 rounded-lg
                       bg-blue-900 text-white text-[11px] font-semibold shadow-xl border border-blue-950 flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
            <span>{t('listeningNow')}</span>
          </motion.div>
        )}

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-full mt-1.5 right-0 z-30 w-72 p-2.5 rounded-lg
                       bg-red-50 border border-red-300 text-red-900 text-xs shadow-xl flex items-start gap-2"
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
