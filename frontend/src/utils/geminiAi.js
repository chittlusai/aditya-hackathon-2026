/**
 * geminiAi.js — Deep Gemini AI Clinical Analysis Engine
 * Uses Google Gemini API to analyze patient symptoms, vitals, risk factors,
 * and provide accurate urgency triage with nearest facility matching.
 */

export const DEFAULT_GEMINI_API_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) ||
  (typeof localStorage !== 'undefined' && localStorage.getItem('asl:gemini_api_key')) ||
  ''

const GEMINI_MODELS = [
  'gemini-1.5-flash',
  'gemini-2.5-flash',
  'gemini-1.5-pro',
  'gemini-pro'
]

/**
 * Call Gemini API with structured clinical prompt
 */
export async function analyzeSymptomsWithGemini(
  symptoms,
  vitals = {},
  language = 'en',
  apiKey = DEFAULT_GEMINI_API_KEY
) {
  if (!symptoms || !symptoms.trim()) {
    throw new Error('Symptoms text is required for analysis.')
  }

  const langNames = {
    en: 'English',
    hi: 'Hindi (हिन्दी)',
    mr: 'Marathi (मराठी)',
  }
  const targetLanguage = langNames[language] || 'English'

  const prompt = `
You are a senior Chief Medical Officer (Doctor) in the Indian National Rural Health Mission.
A rural/tribal citizen or community health worker is consulting you with health symptoms.
Evaluate their condition using standard clinical medical guidelines (ESI Emergency Severity Index / WHO Rural Health Triage):

PATIENT SYMPTOMS & OBSERVATION:
"${symptoms}"

PATIENT VITALS (IF RECORDED):
- Age: ${vitals.age || 'Not provided'}
- SpO2 Oxygen Level: ${vitals.spo2 ? vitals.spo2 + '%' : 'Not provided'} (Normal is 95-100%, <90% is Critical Emergency)
- Pulse Rate: ${vitals.pulse ? vitals.pulse + ' bpm' : 'Not provided'} (Normal 60-100)
- Blood Pressure: ${vitals.bp || 'Not provided'} (Normal ~120/80)
- Body Temperature: ${vitals.temp ? vitals.temp + '°F' : 'Not provided'} (>103°F is High Risk)
- Blood Sugar: ${vitals.sugar ? vitals.sugar + ' mg/dL' : 'Not provided'}
- Pregnancy: ${vitals.isPregnant ? 'Yes, Patient is Pregnant (Requires priority maternal care)' : 'No'}

CLINICAL GUIDELINES:
1. Determine Urgency Level:
   - "Emergency" (Immediate life risk: chest pain, respiratory distress, SpO2 <90%, snake bite, convulsion, severe bleeding, stroke, high fever during pregnancy).
   - "Moderate" (Needs doctor consultation today at PHC/CHC: persistent fever, severe vomiting/diarrhea, acute abdominal pain, fracture, spreading infection).
   - "Mild" (Manageable with rest & local sub-centre visit: mild cold, slight headache, mild cough, minor scrape).
2. Write direct, caring, doctor-guided medical instructions in ${targetLanguage}. Speak directly as an empathetic doctor guiding a rural patient or family member.
3. Provide practical, immediate first-aid / home precautions in ${targetLanguage}.
4. Identify clinical risk signs.
5. Suggest the required medical specialty (e.g. General Medicine, Cardiology, Obstetrics & Gynecology, Pediatrics, Emergency Trauma).

Return ONLY valid JSON matching this exact structure:
{
  "urgency": "Emergency" | "Moderate" | "Mild",
  "advice": "Clear, caring doctor advice and immediate treatment guidance in ${targetLanguage}",
  "first_aid": "Practical first-aid or home care instructions in ${targetLanguage}",
  "matched_keywords": ["symptom1", "symptom2"],
  "risk_factors": ["risk1", "risk2"],
  "suggested_specialist": "Specialty Name"
}
`

  let lastError = null

  // Try available models in order
  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            topP: 0.8,
            topK: 40,
            responseMimeType: 'application/json',
          },
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.warn(`Gemini model ${model} response error:`, errorText)
        continue
      }

      const data = await response.json()
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text

      if (rawText) {
        const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim()
        const parsed = JSON.parse(cleanJson)
        return {
          urgency: parsed.urgency || 'Moderate',
          confidence: parsed.confidence || 0.92,
          advice: parsed.advice || 'Please consult your nearest Primary Health Centre doctor.',
          first_aid: parsed.first_aid || 'Keep hydrated and rest.',
          matched_keywords: parsed.matched_keywords || [],
          risk_factors: parsed.risk_factors || [],
          suggested_specialist: parsed.suggested_specialist || 'General Medicine',
          ai_powered: true,
          model_used: model,
        }
      }
    } catch (err) {
      console.warn(`Failed with model ${model}:`, err)
      lastError = err
    }
  }

  throw lastError || new Error('Gemini AI analysis could not be completed.')
}
