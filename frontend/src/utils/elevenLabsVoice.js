/**
 * elevenLabsVoice.js — Ultra-Realistic AI Doctor Voice Synthesizer with ElevenLabs
 * Supports Male Doctor (Dr. Rajesh Sharma) and Female Doctor (Dr. Ananya Rao)
 * with eleven_multilingual_v2 supporting all Indian languages (Telugu, Hindi, Tamil, etc.)
 */

export const DEFAULT_ELEVENLABS_API_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ELEVENLABS_API_KEY) ||
  (typeof localStorage !== 'undefined' && localStorage.getItem('asl:elevenlabs_api_key')) ||
  ''

// ElevenLabs Voice Personas
export const ELEVENLABS_VOICE_IDS = {
  male: {
    id: 'JBFqnCBsd6RMkjVDRZzb', // George - Deep, calm, authoritative male doctor
    name: 'Dr. Rajesh Sharma (Chief Medical Officer)',
    persona: 'Male Doctor',
    stability: 0.55,
    similarity_boost: 0.75,
  },
  female: {
    id: '21m00Tcm4TlvDq8ikWAM', // Rachel - Warm, compassionate female clinician
    name: 'Dr. Ananya Rao (Senior Medical Officer)',
    persona: 'Female Doctor',
    stability: 0.55,
    similarity_boost: 0.75,
  },
}

let activeAudioElement = null

/**
 * Stop any currently playing ElevenLabs or browser audio
 */
export function stopDoctorVoiceAudio() {
  if (activeAudioElement) {
    try {
      activeAudioElement.pause()
      activeAudioElement.currentTime = 0
      activeAudioElement = null
    } catch (e) {}
  }
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
}

/**
 * Synthesize ultra-realistic doctor voice speech via ElevenLabs API
 * with automatic fallback to Web Speech API.
 */
export async function playDoctorVoiceSpeech(
  text,
  persona = 'male', // 'male' | 'female'
  languageCode = 'en-IN',
  onStart = () => {},
  onEnd = () => {},
  onError = () => {}
) {
  stopDoctorVoiceAudio()

  const cleanText = (text || '').trim()
  if (!cleanText) return

  const apiKey =
    (typeof localStorage !== 'undefined' && localStorage.getItem('asl:elevenlabs_api_key')) ||
    DEFAULT_ELEVENLABS_API_KEY

  const voiceConfig = ELEVENLABS_VOICE_IDS[persona] || ELEVENLABS_VOICE_IDS.male
  const voiceId = voiceConfig.id

  // 1. Try ElevenLabs High-Fidelity Audio API if API key is provided
  if (apiKey) {
    try {
      onStart()
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text: cleanText,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: voiceConfig.stability,
            similarity_boost: voiceConfig.similarity_boost,
            style: 0.2,
            use_speaker_boost: true,
          },
        }),
      })

      if (res.ok) {
        const audioBlob = await res.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)
        activeAudioElement = audio

        audio.onplay = () => onStart()
        audio.onended = () => {
          activeAudioElement = null
          URL.revokeObjectURL(audioUrl)
          onEnd()
        }
        audio.onerror = () => {
          activeAudioElement = null
          URL.revokeObjectURL(audioUrl)
          fallbackBrowserSpeech(cleanText, persona, languageCode, onStart, onEnd, onError)
        }

        await audio.play()
        return
      } else {
        console.warn('ElevenLabs API returned non-200 status:', res.status)
      }
    } catch (err) {
      console.warn('ElevenLabs speech synthesis fetch error:', err)
    }
  }

  // 2. Fallback to Browser Speech Synthesis
  fallbackBrowserSpeech(cleanText, persona, languageCode, onStart, onEnd, onError)
}

/**
 * Fallback Browser Speech Synthesis
 */
function fallbackBrowserSpeech(text, persona, languageCode, onStart, onEnd, onError) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    onError?.()
    return
  }

  try {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = languageCode || 'en-IN'

    if (persona === 'female') {
      utterance.pitch = 1.18
      utterance.rate = 0.94
    } else {
      utterance.pitch = 0.90
      utterance.rate = 0.92
    }

    const voices = window.speechSynthesis.getVoices()
    const match = voices.find(
      (v) =>
        v.lang.toLowerCase().includes((languageCode || '').toLowerCase()) ||
        v.name.toLowerCase().includes(persona === 'female' ? 'female' : 'male') ||
        v.name.toLowerCase().includes('india') ||
        v.name.toLowerCase().includes('google')
    )
    if (match) utterance.voice = match

    utterance.onstart = () => onStart()
    utterance.onend = () => onEnd()
    utterance.onerror = () => onError()

    window.speechSynthesis.speak(utterance)
  } catch (e) {
    console.warn('Browser speech synthesis failed:', e)
    onError?.()
  }
}
