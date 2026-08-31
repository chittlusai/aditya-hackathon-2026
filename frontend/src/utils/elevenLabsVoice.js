/**
 * elevenLabsVoice.js — Ultra-Realistic AI Doctor Voice Synthesizer
 * Powered by free Microsoft Edge Neural TTS with high-quality Indian regional accents
 * and automatic ElevenLabs & browser speech fallbacks.
 */

export const DEFAULT_ELEVENLABS_API_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ELEVENLABS_API_KEY) ||
  (typeof localStorage !== 'undefined' && localStorage.getItem('asl:elevenlabs_api_key')) ||
  ''

// Voice Personas
export const ELEVENLABS_VOICE_IDS = {
  male: {
    id: '2DRBj9T2XZ7Jmkcm6WCZ',
    name: 'Dr. Rajesh Sharma (Chief Medical Officer)',
    persona: 'Male Doctor',
    stability: 0.50,
    similarity_boost: 0.80,
    style: 0.15,
  },
  female: {
    id: '21m00Tcm4TlvDq8ikWAM',
    name: 'Dr. Ananya Rao (Senior Medical Officer)',
    persona: 'Female Doctor',
    stability: 0.55,
    similarity_boost: 0.75,
    style: 0.15,
  },
}

let activeAudioElement = null

/**
 * Stop any currently playing audio stream
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
 * Synthesize ultra-realistic doctor voice speech via Edge Neural TTS / ElevenLabs
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
  const langKey = (languageCode || 'en').split('-')[0].toLowerCase()

  // 1. First Tier: Microsoft Edge Neural TTS via Backend Engine (Free, high-fidelity Indian accents)
  try {
    const proxyRes = await fetch('/api/tts/doctor-voice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: cleanText,
        language: langKey,
        voice_id: voiceId,
        persona,
      }),
    })

    if (proxyRes.ok) {
      const audioBlob = await proxyRes.blob()
      if (audioBlob && audioBlob.size > 300) {
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
    console.warn('Backend Edge TTS audio stream attempt failed, trying ElevenLabs direct API:', err)
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
    } catch (directErr) {
      console.warn('Direct ElevenLabs synthesis failed, resorting to native browser speech:', directErr)
    }
  }

  // 3. Third Tier: Native Browser SpeechSynthesis
  fallbackBrowserSpeech(cleanText, persona, languageCode, onStart, onEnd, onError)
}

/**
 * High-quality Native Browser SpeechSynthesis Fallback
 */
function fallbackBrowserSpeech(text, persona, languageCode, onStart, onEnd, onError) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    onError()
    return
  }

  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = languageCode || 'en-IN'
  utterance.rate = 0.95
  utterance.pitch = persona === 'female' ? 1.15 : 0.92

  // Select best matching regional voice if available
  const voices = window.speechSynthesis.getVoices()
  const matchingVoice = voices.find((v) => v.lang === languageCode || v.lang.startsWith(languageCode.split('-')[0]))
  if (matchingVoice) {
    utterance.voice = matchingVoice
  }

  utterance.onstart = () => onStart()
  utterance.onend = () => onEnd()
  utterance.onerror = () => {
    onEnd()
    onError()
  }

  window.speechSynthesis.speak(utterance)
}
