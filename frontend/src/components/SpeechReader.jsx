import { useState, useEffect, useRef } from 'react'
import { Volume2, VolumeX, Loader2, Settings, Key, Check, Sparkles } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

/**
 * SpeechReader — Text-to-Speech Engine
 * Features:
 * 1. ElevenLabs Multilingual Studio AI Voice (eleven_multilingual_v2) for Hindi, Marathi, & English
 * 2. Web Speech Synthesis fallback when no API key is provided
 * 3. Quick in-UI API key configuration drawer
 */

const ELEVENLABS_STORAGE_KEY = 'asl:elevenlabs_api_key'
// Default highly rated ElevenLabs Multilingual Voice IDs
const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM' // Rachel (Clear & natural)

export default function SpeechReader({ textToRead }) {
  const { language, t } = useApp()
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [apiKey, setApiKey] = useState(() => {
    return (
      localStorage.getItem(ELEVENLABS_STORAGE_KEY) ||
      import.meta.env.VITE_ELEVENLABS_API_KEY ||
      ''
    )
  })
  const [inputKey, setInputKey] = useState(apiKey)
  const [savedSuccess, setSavedSuccess] = useState(false)

  const audioRef = useRef(null)

  const langCodeMap = {
    en: 'en-IN',
    hi: 'hi-IN',
    mr: 'mr-IN',
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const handleSaveApiKey = (e) => {
    e?.preventDefault?.()
    const trimmed = inputKey.trim()
    setApiKey(trimmed)
    if (trimmed) {
      localStorage.setItem(ELEVENLABS_STORAGE_KEY, trimmed)
    } else {
      localStorage.removeItem(ELEVENLABS_STORAGE_KEY)
    }
    setSavedSuccess(true)
    setTimeout(() => {
      setSavedSuccess(false)
      setShowSettings(false)
    }, 1500)
  }

  const handleSpeak = async () => {
    // If already playing, stop playback
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
      setIsPlaying(false)
      setIsLoading(false)
      return
    }

    // 1. Try ElevenLabs TTS if API Key exists
    if (apiKey) {
      setIsLoading(true)
      try {
        const response = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${DEFAULT_VOICE_ID}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'xi-api-key': apiKey,
            },
            body: JSON.stringify({
              text: textToRead,
              model_id: 'eleven_multilingual_v2',
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75,
              },
            }),
          }
        )

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}))
          console.warn('ElevenLabs API returned error, falling back to browser TTS:', errData)
          throw new Error(errData.detail?.message || 'ElevenLabs synthesis failed')
        }

        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)

        audioRef.current = audio
        audio.onplay = () => {
          setIsLoading(false)
          setIsPlaying(true)
        }
        audio.onended = () => {
          setIsPlaying(false)
          audioRef.current = null
        }
        audio.onerror = () => {
          setIsPlaying(false)
          setIsLoading(false)
          audioRef.current = null
        }

        await audio.play()
        return
      } catch (err) {
        console.warn('Falling back to standard speech synthesis:', err)
        setIsLoading(false)
      }
    }

    // 2. Browser Web Speech Synthesis Fallback
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      alert('Speech synthesis is not supported on this browser.')
      return
    }

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(textToRead)
    utterance.lang = langCodeMap[language] || 'en-IN'
    utterance.rate = 0.95

    utterance.onstart = () => setIsPlaying(true)
    utterance.onend = () => setIsPlaying(false)
    utterance.onerror = () => setIsPlaying(false)

    window.speechSynthesis.speak(utterance)
  }

  return (
    <div className="relative inline-flex items-center gap-1.5">
      {/* Audio Play/Stop Button */}
      <button
        type="button"
        onClick={handleSpeak}
        disabled={isLoading}
        aria-label={isPlaying ? 'Stop audio' : t('audioListen')}
        className={`tap-press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm border ${
          isPlaying
            ? 'bg-blue-800 text-white border-blue-900'
            : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-700" />
            <span>Loading Audio…</span>
          </>
        ) : isPlaying ? (
          <>
            <VolumeX className="w-3.5 h-3.5 animate-pulse" />
            <span>{t('audioPlaying')}</span>
          </>
        ) : (
          <>
            <Volume2 className="w-3.5 h-3.5 text-blue-800" />
            <span>{t('audioListen')}</span>
          </>
        )}
      </button>

      {/* Settings / API Key Button */}
      <button
        type="button"
        onClick={() => setShowSettings((v) => !v)}
        title="ElevenLabs Voice Settings"
        className="tap-press p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-600 shadow-sm"
      >
        <Settings className="w-3.5 h-3.5 text-slate-700" />
      </button>

      {/* ElevenLabs API Key Modal / Popover */}
      {showSettings && (
        <div className="absolute top-full right-0 mt-2 z-50 w-80 bg-white border border-slate-300 rounded-xl p-4 shadow-2xl text-left">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-blue-800" />
              {t('elevenLabsKeyTitle')}
            </h4>
            <button
              onClick={() => setShowSettings(false)}
              className="text-slate-400 hover:text-slate-700 text-xs font-bold"
            >
              ✕
            </button>
          </div>

          <p className="text-[11px] text-slate-600 mb-3 leading-relaxed">
            {t('elevenLabsKeySub')}
          </p>

          <form onSubmit={handleSaveApiKey} className="space-y-2.5">
            <input
              type="password"
              placeholder={t('apiKeyPlaceholder')}
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              className="w-full p-2 text-xs rounded border border-slate-300 text-slate-900 bg-slate-50 focus:bg-white focus:border-blue-700 outline-none font-mono"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-500 font-medium">
                {apiKey ? '✓ ' + t('usingElevenLabs') : '• ' + t('usingBrowserTTS')}
              </span>

              <button
                type="submit"
                className="tap-press px-3 py-1 rounded bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold shadow-sm"
              >
                {savedSuccess ? 'Saved!' : t('saveApiKey')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
