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
    id: '2DRBj9T2XZ7Jmkcm6WCZ', // Realistic Doctor Voice ID provided by User
    name: 'Dr. Rajesh Sharma (Chief Medical Officer)',
    persona: 'Male Doctor',
    stability: 0.50,
    similarity_boost: 0.80,
    style: 0.15,
  },
  female: {
    id: '21m00Tcm4TlvDq8ikWAM', // Rachel - Warm, compassionate female clinician
    name: 'Dr. Ananya Rao (Senior Medical Officer)',
    persona: 'Female Doctor',
    stability: 0.55,
    similarity_boost: 0.75,
    style: 0.15,
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
 * with backend proxy endpoint and automatic fallback.
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

  const voiceConfig = ELEVENLABS_VOICE_IDS[persona] || ELEVENLABS_VOICE_IDS.male
  const voiceId = voiceConfig.id

  // 1. First Tier: Dedicated Backend Streaming Proxy (Guarantees zero CORS & full audio headers)
  try {
    onStart()
    const proxyRes = await fetch('/api/tts/doctor-voice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: cleanText,
        voice_id: voiceId,
        persona,
      }),
    })

    if (proxyRes.ok) {
      const audioBlob = await proxyRes.blob()
      if (audioBlob && audioBlob.size > 500) {
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
      }
    }
  } catch (err) {
    console.warn('Backend ElevenLabs audio stream attempt failed, trying direct API:', err)
  }

  // 2. Second Tier: Direct ElevenLabs API Call
  const apiKey =
    (typeof localStorage !== 'undefined' && localStorage.getItem('asl:elevenlabs_api_key')) ||
    DEFAULT_ELEVENLABS_API_KEY

  if (apiKey) {
    try {
      const directRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
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
            style: voiceConfig.style || 0.15,
            use_speaker_boost: true,
          },
        }),
      })

      if (directRes.ok) {
        const audioBlob = await directRes.blob()
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
      }
    } catch (e) {
      console.warn('Direct ElevenLabs API failed:', e)
    }
  }

  // 3. Fallback to Browser Speech Synthesis
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
