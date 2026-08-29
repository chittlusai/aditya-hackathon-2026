import { useState } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext.jsx'
import { Check, Info, Sparkles } from 'lucide-react'

export const BODY_REGIONS = [
  {
    id: 'head',
    nameEn: 'Head & Senses',
    nameHi: 'सिर, आंख, कान, चक्कर',
    nameMr: 'डोके, डोळे, कान, चक्कर',
    symptoms: [
      { tag: 'Headache', en: 'Severe Headache', hi: 'तेज सिरदर्द', mr: 'तीव्र डोकेदुखी' },
      { tag: 'Dizziness', en: 'Dizziness / Fainting', hi: 'चक्कर आना / बेहोशी', mr: 'चक्कर येणे / भोवळ' },
      { tag: 'High BP', en: 'High BP / Blurred Vision', hi: 'हाई बीपी / धुंधला दिखना', mr: 'उच्च रक्तदाब / अंधारी' },
    ],
    svgIcon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6">
        <circle cx="12" cy="9" r="6" strokeWidth="2" fill="#EDE9FE" stroke="#7C3AED" />
        <path d="M12 15v4M9 19h6" strokeWidth="2" strokeLinecap="round" stroke="#7C3AED" />
        <path d="M8 7a4 4 0 018 0" strokeWidth="1.5" stroke="#A78BFA" strokeDasharray="1 2" />
      </svg>
    ),
  },
  {
    id: 'chest',
    nameEn: 'Chest & Breathing',
    nameHi: 'सीना, फेफड़े, सांस फूलना',
    nameMr: 'छाती, फुफ्फुस, दम लागणे',
    symptoms: [
      { tag: 'Chest Pain', en: 'Chest Pain / Squeezing', hi: 'सीने में दर्द व दबाव', mr: 'छातीत तीव्र दुखणे' },
      { tag: 'Shortness of Breath', en: 'Breathing Difficulty', hi: 'सांस लेने में भारीपन', mr: 'श्वास घेण्यास त्रास' },
      { tag: 'Cough', en: 'Severe Cough & Phlegm', hi: 'गंभीर खांसी व कफ', mr: 'खोकला व कफ' },
    ],
    svgIcon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6">
        <path d="M4 10c0-3 2.5-6 8-6s8 3 8 6v6c0 4-3 7-8 7s-8-3-8-7v-6z" strokeWidth="2" fill="#FEE2E2" stroke="#DC2626" />
        <path d="M8 12h3l1.5-3 2 6 1.5-3h3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="#B91C1C" />
      </svg>
    ),
  },
  {
    id: 'stomach',
    nameEn: 'Stomach & Belly',
    nameHi: 'पेट दर्द, उल्टी, दस्त',
    nameMr: 'पोटदुखी, उलटी, जुलाब',
    symptoms: [
      { tag: 'Stomach Pain', en: 'Severe Abdominal Cramp', hi: 'पेट में तेज मरोड़', mr: 'पोटात तीव्र मुरडा' },
      { tag: 'Vomiting', en: 'Repeated Vomiting', hi: 'लगातार उल्टी', mr: 'वारंवार उलट्या' },
      { tag: 'Diarrhea', en: 'Loose Motions / Dehydration', hi: 'दस्त / कमजोरी', mr: 'जुलाब / अशक्तपणा' },
    ],
    svgIcon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6">
        <rect x="5" y="6" width="14" height="14" rx="4" strokeWidth="2" fill="#FEF3C7" stroke="#D97706" />
        <circle cx="12" cy="13" r="3" fill="#D97706" />
        <path d="M12 9v1" strokeWidth="2" strokeLinecap="round" stroke="#B45309" />
      </svg>
    ),
  },
  {
    id: 'limbs',
    nameEn: 'Hands, Legs & Joints',
    nameHi: 'हाथ-पैर, हड्डी, जोड़',
    nameMr: 'हात, पाय, सांधे, हाडे',
    symptoms: [
      { tag: 'Injury / Fracture', en: 'Fracture / Dislocation', hi: 'हड्डी टूटना / मोच', mr: 'हाड मोडणे / लचक' },
      { tag: 'Joint Pain', en: 'Swollen Joint / Arthritis', hi: 'जोड़ों में सूजन व दर्द', mr: 'सांधेदुखी व सूज' },
      { tag: 'Physical Injury', en: 'Deep Wound / Bleeding', hi: 'गहरा घाव / खून बहना', mr: 'गंभीर जखम / रक्त' },
    ],
    svgIcon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6">
        <path d="M8 4l4 8-4 8M16 4l-4 8 4 8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" stroke="#0D9488" />
        <circle cx="12" cy="12" r="3" fill="#CCFBF1" stroke="#0D9488" strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: 'bites',
    nameEn: 'Bite & Emergency',
    nameHi: 'सांप, बिच्छू, जानवर का काटना',
    nameMr: 'सर्पदंश, विंचू, प्राणी दंश',
    symptoms: [
      { tag: 'Snake Bite', en: 'Snake / Viper Bite', hi: 'सांप का काटना (सर्पदंश)', mr: 'सापाचा चावा (सर्पदंश)' },
      { tag: 'Scorpion Bite', en: 'Scorpion / Insect Sting', hi: 'बिच्छू / कीड़े का डंक', mr: 'विंचू / कीटक दंश' },
      { tag: 'Animal Bite', en: 'Dog / Animal Bite', hi: 'कुत्ते या जानवर का काटना', mr: 'कुत्रा किंवा प्राणी दंश' },
    ],
    svgIcon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6">
        <circle cx="12" cy="12" r="9" strokeWidth="2" fill="#FEE2E2" stroke="#DC2626" />
        <path d="M12 7v6M12 17h.01" strokeWidth="2.5" strokeLinecap="round" stroke="#DC2626" />
      </svg>
    ),
  },
  {
    id: 'maternal',
    nameEn: 'Maternal & Baby',
    nameHi: 'गर्भावस्था, प्रसव, शिशु',
    nameMr: 'गरोदरपण, प्रसूती, बाळ',
    symptoms: [
      { tag: 'Labor Pain', en: 'Labor & Delivery Pain', hi: 'प्रसव पीड़ा / कळा', mr: 'बाळंतपणाच्या कळा' },
      { tag: 'Pregnancy Issue', en: 'Bleeding / Swollen Feet', hi: 'गर्भावस्था में रक्तस्त्राव', mr: 'गरोदरपणातील रक्तस्त्राव' },
      { tag: 'Infant Illness', en: 'Newborn Care / Fever', hi: 'नवजात शिशु बुखार/रोदन', mr: 'नवजात बाळाचा ताप' },
    ],
    svgIcon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6">
        <circle cx="12" cy="7" r="4" fill="#FCE7F3" stroke="#DB2777" strokeWidth="2" />
        <path d="M7 21c0-5 2-9 5-9s5 4 5 9" fill="#FCE7F3" stroke="#DB2777" strokeWidth="2" />
        <circle cx="15" cy="15" r="2" fill="#F472B6" />
      </svg>
    ),
  },
]

export default function BodyPartSelector({ onAddSymptom, currentSymptoms = '' }) {
  const { language } = useApp()
  const [activeRegion, setActiveRegion] = useState(BODY_REGIONS[0].id)

  const regionData = BODY_REGIONS.find((r) => r.id === activeRegion) || BODY_REGIONS[0]

  const getRegionName = (r) => {
    if (language === 'hi') return r.nameHi
    if (language === 'mr') return r.nameMr
    return r.nameEn
  }

  const getSymptomLabel = (s) => {
    if (language === 'hi') return s.hi
    if (language === 'mr') return s.mr
    return s.en
  }

  const getSymptomSub = (s) => {
    if (language === 'hi') return s.en
    if (language === 'mr') return s.en
    return s.hi
  }

  const cleanSymptoms = currentSymptoms ? currentSymptoms.toLowerCase() : ''

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-5 shadow-xs space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5 sm:pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            {language === 'hi'
              ? 'शरीर के किस हिस्से में तकलीफ है?'
              : language === 'mr'
              ? 'शरीराच्या कोणत्या भागात त्रास होत आहे?'
              : 'Where does it hurt?'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'hi'
              ? 'शरीर के अंग पर क्लिक करें और अपने लक्षण जोड़ें'
              : language === 'mr'
              ? 'शरीराचा भाग निवडून आपली लक्षणे सहज जोडा'
              : 'Tap a body region to choose your specific symptom'}
          </p>
        </div>
      </div>

      {/* Region Tabs / Body Zones */}
      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-1.5 sm:gap-2">
        {BODY_REGIONS.map((r) => {
          const isActive = r.id === activeRegion
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setActiveRegion(r.id)}
              className={`tap-press p-2 sm:p-3 rounded-xl border text-left flex flex-col items-center justify-center gap-1.5 sm:gap-2 transition-all ${
                isActive
                  ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-xs ring-2 ring-blue-500/20'
                  : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-700'
              }`}
            >
              <div className="p-1 rounded-lg bg-white shadow-xs">{r.svgIcon}</div>
              <span className="text-[11px] font-bold text-center leading-tight">
                {getRegionName(r).split(',')[0]}
              </span>
            </button>
          )
        })}
      </div>

      {/* Selected Region's Specific Problems */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            {regionData.svgIcon}
            <span>{getRegionName(regionData)}</span>
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            {language === 'hi'
              ? 'जोड़ने के लिए क्लिक करें'
              : language === 'mr'
              ? 'जोडण्यासाठी क्लिक करा'
              : 'Tap to add to symptom list'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {regionData.symptoms.map((s) => {
            const label = getSymptomLabel(s)
            const isAdded = Boolean(cleanSymptoms) && (
              cleanSymptoms.includes(s.tag.toLowerCase()) ||
              cleanSymptoms.includes(label.toLowerCase()) ||
              cleanSymptoms.includes(s.en.toLowerCase())
            )

            return (
              <button
                key={s.tag}
                type="button"
                onClick={() => onAddSymptom(s.tag, label)}
                className={`tap-press p-3 rounded-xl border text-left transition-all flex items-center justify-between shadow-xs ${
                  isAdded
                    ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-sm'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50'
                }`}
              >
                <div>
                  <p className="text-xs font-bold leading-tight">{label}</p>
                  <p className={`text-[10px] mt-0.5 ${isAdded ? 'text-blue-100' : 'text-slate-500'}`}>
                    {getSymptomSub(s)}
                  </p>
                </div>
                {isAdded ? (
                  <Check className="w-4 h-4 text-white shrink-0 ml-2" />
                ) : (
                  <span className="text-xs font-bold text-blue-600 shrink-0 ml-2">+</span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
