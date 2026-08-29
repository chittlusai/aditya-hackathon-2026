import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, AlertCircle, Volume2, Check } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { INDIAN_LANGUAGES } from '../utils/i18n.js'

/**
 * VoiceInput — High-Accuracy Multilingual Speech-to-Text
 * Supports all 17 Official / Spoken Indian Languages via BCP-47 Speech Recognition.
 * Built with anti-duplication transcript buffering so each spoken utterance is processed exactly ONCE.
 */
export default function VoiceInput({ onTranscript, disabled = false }) {
  const { language, t } = useApp()
  const [isListening, setIsListening] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [interimPreview, setInterimPreview] = useState('')
  const recognitionRef = useRef(null)
  const transcriptBufferRef = useRef('')

  // Look up BCP-47 speech recognition language code
  const currentLangObj = INDIAN_LANGUAGES.find((l) => l.code === language) || {
    speechCode: 'en-IN',
    label: 'English',
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
    setInterimPreview('')
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
      recognition.lang = currentLangObj.speechCode || 'en-IN'

      recognition.onstart = () => {
        setIsListening(true)
        setErrorMessage('')
        transcriptBufferRef.current = ''
      }

      recognition.onresult = (event) => {
        let finalChunk = ''
        let interimChunk = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i]
          if (res.isFinal) {
            finalChunk += res[0].transcript + ' '
          } else {
            interimChunk += res[0].transcript
          }
        }

        if (finalChunk.trim()) {
          transcriptBufferRef.current = (transcriptBufferRef.current + ' ' + finalChunk).trim()
        }

        // Show live visual preview of speaking without committing to parent state yet
        setInterimPreview(interimChunk || transcriptBufferRef.current)
      }

      recognition.onerror = (event) => {
        console.warn('Speech recognition error event:', event)
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setErrorMessage('Microphone access blocked. Please click the lock/camera icon in your address bar and allow Microphone.')
        } else if (event.error === 'no-speech') {
          setErrorMessage('No speech detected. Please speak closer to the microphone.')
        } else if (event.error !== 'aborted') {
          setErrorMessage(`Microphone notice: ${event.error}`)
        }
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
        const finalRecordedText = transcriptBufferRef.current.trim() || interimPreview.trim()
        if (finalRecordedText) {
          // Commit to parent input field ONCE on speech completion
          onTranscript(finalRecordedText)
        }
        setInterimPreview('')
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
                        ? 'bg-red-600 text-white border-red-700 animate-pulse ring-2 ring-red-500/20'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                    }`}
      >
        <Mic className={`w-3.5 h-3.5 ${isListening ? 'text-white' : 'text-blue-600'}`} />
        <span>{isListening ? t('stopVoice') : t('speakNow')}</span>
        <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${isListening ? 'bg-red-700 text-white' : 'bg-blue-50 text-blue-700'}`}>
          {currentLangObj.short || currentLangObj.code?.toUpperCase()}
        </span>
      </button>

      {/* Real-time Listening Pill with Live Speech Preview */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-full mt-1.5 right-0 z-30 w-72 p-3 rounded-2xl
                       bg-slate-900 text-white text-xs font-medium shadow-xl border border-slate-800 space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="font-bold text-[11px] text-red-400">
                  {t('listeningNow')} ({currentLangObj.label})
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">1x Capture</span>
            </div>

            {interimPreview && (
              <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 text-emerald-300 text-xs italic">
                "{interimPreview}"
              </div>
            )}
          </motion.div>
        )}

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-full mt-1.5 right-0 z-30 w-72 p-2.5 rounded-xl
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
