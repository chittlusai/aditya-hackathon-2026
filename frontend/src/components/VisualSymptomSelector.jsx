import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Volume2, Mic } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

// High-fidelity custom SVG illustrations designed for maximum visual recognition
export const SYMPTOM_SVGS = {
  fever: (
    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10" stroke="currentColor">
      <path d="M24 6v20" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" />
      <circle cx="24" cy="34" r="7" fill="#FEE2E2" stroke="#DC2626" strokeWidth="3" />
      <circle cx="24" cy="34" r="4" fill="#DC2626" />
      <rect x="21" y="6" width="6" height="24" rx="3" fill="none" stroke="#DC2626" strokeWidth="2.5" />
      <path d="M27 12h3M27 17h3M27 22h3" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 18c-2 2-2 6 0 8M36 18c2 2 2 6 0 8" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    </svg>
  ),
  breathing: (
    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10" stroke="currentColor">
      <path d="M24 6v14M24 20l-6 6M24 20l6 6" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 26c-4 0-8 3-8 9 0 5 4 8 8 8 3 0 6-2 6-5V26" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2.5" />
      <path d="M30 26c4 0 8 3 8 9 0 5-4 8-8 8-3 0-6-2 6-5V26" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2.5" />
      <path d="M6 14c3-2 6-2 9 0M33 14c3-2 6-2 9 0" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  chest: (
    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
      <path d="M24 39s-14-8.5-14-19a8.5 8.5 0 0114-6.4A8.5 8.5 0 0138 20c0 10.5-14 19-14 19z" fill="#FEE2E2" stroke="#DC2626" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M14 22h4l2-4 4 8 3-6 2 2h5" stroke="#B91C1C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  stomach: (
    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
      <path d="M20 8c2 0 4 3 4 7 0 6-8 8-8 15 0 7 6 11 12 11s12-4 12-11c0-8-5-11-5-15 0-3 2-5 3-7" fill="#FEF3C7" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="24" cy="28" r="3" fill="#D97706" />
      <path d="M19 28c0-3 2-5 5-5M24 33c3 0 5-2 5-5" stroke="#B45309" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  snakebite: (
    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
      <path d="M10 38c6-2 10-7 12-12 2-6 6-9 12-9 4 0 6 2 6 5 0 4-4 7-8 7-5 0-7 4-8 8" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" />
      <path d="M38 17c1.5-1 3-1 4 0s1 2.5 0 4l-4 3" fill="#FEE2E2" stroke="#DC2626" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="39" cy="18" r="1" fill="#DC2626" />
      <path d="M42 21l3 1M42 23l2 2" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
      <circle cx="16" cy="38" r="2" fill="#DC2626" />
      <circle cx="22" cy="38" r="2" fill="#DC2626" />
    </svg>
  ),
  injury: (
    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
      <rect x="8" y="18" width="32" height="12" rx="6" transform="rotate(-30 8 18)" fill="#F1F5F9" stroke="#475569" strokeWidth="2.5" />
      <rect x="20" y="20" width="8" height="8" rx="2" transform="rotate(-30 20 20)" fill="#CBD5E1" />
      <path d="M16 28l16-10" stroke="#DC2626" strokeWidth="2.5" strokeDasharray="3 3" />
      <circle cx="24" cy="24" r="1.5" fill="#DC2626" />
      <circle cx="27" cy="22" r="1.5" fill="#DC2626" />
    </svg>
  ),
  maternity: (
    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
      <circle cx="22" cy="12" r="5" fill="#FCE7F3" stroke="#DB2777" strokeWidth="2.5" />
      <path d="M14 38c0-8 4-15 12-15s10 7 10 15" fill="#FCE7F3" stroke="#DB2777" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="31" cy="26" r="3.5" fill="#F472B6" stroke="#BE185D" strokeWidth="2" />
      <path d="M29 32c1 3 4 5 7 5" stroke="#BE185D" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  headache: (
    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
      <circle cx="24" cy="25" r="12" fill="#EDE9FE" stroke="#7C3AED" strokeWidth="2.5" />
      <path d="M18 24c0-3 3-5 6-5s6 2 6 5" stroke="#6D28D9" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M10 15l4 4M38 15l-4 4M24 7v5M16 10l2 4M32 10l-2 4" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
  vomiting: (
    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
      <circle cx="24" cy="18" r="10" fill="#FEF3C7" stroke="#D97706" strokeWidth="2.5" />
      <circle cx="20" cy="16" r="1.5" fill="#B45309" />
      <circle cx="28" cy="16" r="1.5" fill="#B45309" />
      <path d="M21 23c1.5-1.5 4.5-1.5 6 0" stroke="#B45309" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 28v14M21 34l3 4 3-4M19 40c2 2 8 2 10 0" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  highbp: (
    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
      <circle cx="24" cy="24" r="15" fill="#FEE2E2" stroke="#DC2626" strokeWidth="2.5" />
      <path d="M24 13v11l6 4" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M15 20a10 10 0 0118 0" stroke="#EF4444" strokeWidth="2" strokeDasharray="2 3" />
      <circle cx="24" cy="24" r="2.5" fill="#DC2626" />
    </svg>
  ),
  weakness: (
    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
      <circle cx="24" cy="14" r="6" fill="#F1F5F9" stroke="#64748B" strokeWidth="2.5" />
      <path d="M16 40l4-15 4 6 4-6 4 15" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 28h8M28 28h8" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
      <path d="M34 10l4-2M36 16l3 1" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  jointpain: (
    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
      <path d="M18 10l6 14-6 14M30 10l-6 14 6 14" stroke="#0D9488" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24" cy="24" r="5" fill="#CCFBF1" stroke="#0D9488" strokeWidth="2.5" />
      <path d="M14 24h3M31 24h3M24 14v3M24 31v3" stroke="#14B8A6" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
}

export const VISUAL_SYMPTOMS_LIST = [
  {
    key: 'fever',
    svg: SYMPTOM_SVGS.fever,
    titleEn: 'High Fever & Chills',
    titleHi: 'तेज बुखार और कंपकंपी',
    titleMr: 'ताप व थंडी वाजणे',
    descEn: 'Hot body, shivering, sweating',
    descHi: 'गर्म शरीर, कंपकंपी, पसीना',
    descMr: 'अंगात उष्णता, थंडी, घाम',
    tag: 'Fever',
    urgencyColor: 'border-red-200 bg-red-50/40 text-red-950',
  },
  {
    key: 'breathing',
    svg: SYMPTOM_SVGS.breathing,
    titleEn: 'Breathing Trouble',
    titleHi: 'सांस लेने में तकलीफ',
    titleMr: 'श्वास घेण्यास त्रास',
    descEn: 'Gasping, chest tightness, fast breath',
    descHi: 'सांस फूलना, सीने में घबराहट',
    descMr: 'दम लागणे, छातीत घरघर',
    tag: 'Shortness of Breath',
    urgencyColor: 'border-sky-200 bg-sky-50/40 text-sky-950',
  },
  {
    key: 'chest',
    svg: SYMPTOM_SVGS.chest,
    titleEn: 'Chest Pain / Heart',
    titleHi: 'सीने में दर्द या भारीपन',
    titleMr: 'छातीत दुखणे किंवा जड वाटणे',
    descEn: 'Left arm pain, squeezing pressure',
    descHi: 'बाएं हाथ में दर्द, भारी दबाव',
    descMr: 'डाव्या हाताकडे कळ, छातीत दाब',
    tag: 'Chest Pain',
    urgencyColor: 'border-rose-200 bg-rose-50/40 text-rose-950',
  },
  {
    key: 'snakebite',
    svg: SYMPTOM_SVGS.snakebite,
    titleEn: 'Snake / Insect Bite',
    titleHi: 'सांप या जहरीले कीड़े का काटना',
    titleMr: 'सर्पदंश किंवा विंचू चावणे',
    descEn: 'Fang marks, swelling, burning',
    descHi: 'काटने के निशान, सूजन, जलन',
    descMr: 'दंशाचे व्रण, सूज, तीव्र दाह',
    tag: 'Snake Bite',
    urgencyColor: 'border-red-300 bg-red-100/50 text-red-950',
  },
  {
    key: 'stomach',
    svg: SYMPTOM_SVGS.stomach,
    titleEn: 'Severe Stomach Ache',
    titleHi: 'पेट में तेज दर्द व मरोड़',
    titleMr: 'पोटात तीव्र वेदना व मुरडा',
    descEn: 'Cramps, hard belly, burning',
    descHi: 'तेज मरोड़, पेट कड़ा होना',
    descMr: 'पोट आवळणे, गॅस, जळजळ',
    tag: 'Stomach Pain',
    urgencyColor: 'border-amber-200 bg-amber-50/40 text-amber-950',
  },
  {
    key: 'vomiting',
    svg: SYMPTOM_SVGS.vomiting,
    titleEn: 'Vomiting & Diarrhea',
    titleHi: 'उल्टी-दस्त व कमजोरी',
    titleMr: 'उलटी व जुलाब',
    descEn: 'Loose motions, dehydration, dry mouth',
    descHi: 'पतले दस्त, शरीर में पानी की कमी',
    descMr: 'पातळ शौच, शरीरातील पाणी कमी',
    tag: 'Diarrhea, Vomiting',
    urgencyColor: 'border-yellow-200 bg-yellow-50/40 text-yellow-950',
  },
  {
    key: 'injury',
    svg: SYMPTOM_SVGS.injury,
    titleEn: 'Bone Fracture / Deep Cut',
    titleHi: 'हड्डी टूटना या गहरा घाव',
    titleMr: 'हाड मोडणे किंवा गंभीर जखम',
    descEn: 'Bleeding, cannot move limb',
    descHi: 'खून बहना, हाथ-पैर न हिलना',
    descMr: 'रक्तस्त्राव, हात-पाय हालवता न येणे',
    tag: 'Injury / Fracture',
    urgencyColor: 'border-slate-300 bg-slate-100/60 text-slate-900',
  },
  {
    key: 'maternity',
    svg: SYMPTOM_SVGS.maternity,
    titleEn: 'Pregnancy & Delivery Pain',
    titleHi: 'गर्भावस्था व प्रसव पीड़ा',
    titleMr: 'गरोदरपण व प्रसूती कळा',
    descEn: 'Labor pain, water break, bleeding',
    descHi: 'प्रसव का दर्द, पानी छूटना',
    descMr: 'बाळंतपणाच्या कळा, रक्तस्त्राव',
    tag: 'Maternity / Pregnancy Emergency',
    urgencyColor: 'border-pink-200 bg-pink-50/40 text-pink-950',
  },
  {
    key: 'headache',
    svg: SYMPTOM_SVGS.headache,
    titleEn: 'Severe Headache & Giddiness',
    titleHi: 'तेज सिरदर्द व चक्कर आना',
    titleMr: 'तीव्र डोकेदुखी व चक्कर',
    descEn: 'Throbbing head, blackouts, blurry eyes',
    descHi: 'आंखों के आगे अंधेरा, सिर फटना',
    descMr: 'डोळ्यांसमोर अंधारी, डोके भणभणणे',
    tag: 'Headache',
    urgencyColor: 'border-purple-200 bg-purple-50/40 text-purple-950',
  },
  {
    key: 'jointpain',
    svg: SYMPTOM_SVGS.jointpain,
    titleEn: 'Joint & Body Pain',
    titleHi: 'जोड़ों व बदन में तेज दर्द',
    titleMr: 'सांधेदुखी व अंगदुखी',
    descEn: 'Knee swelling, back pain, stiffness',
    descHi: 'घुटनों में सूजन, कमर दर्द, अकड़न',
    descMr: 'गुडघेदुखी, कंबरदुखी, सांधे सुजणे',
    tag: 'Joint Pain',
    urgencyColor: 'border-teal-200 bg-teal-50/40 text-teal-950',
  },
]

export default function VisualSymptomSelector({ onSelectSymptom, selectedSymptoms = [] }) {
  const { language } = useApp()

  const getTitle = (item) => {
    if (language === 'hi') return item.titleHi
    if (language === 'mr') return item.titleMr
    return item.titleEn
  }

  const getDesc = (item) => {
    if (language === 'hi') return item.descHi
    if (language === 'mr') return item.descMr
    return item.descEn
  }

  const activeList = Array.isArray(selectedSymptoms)
    ? selectedSymptoms.map((s) => (typeof s === 'string' ? s.trim().toLowerCase() : '')) .filter(Boolean)
    : []

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-text-main font-display">
            {language === 'hi'
              ? 'अपनी तकलीफ का चित्र चुनें'
              : language === 'mr'
              ? 'तुमच्या त्रासाचे चित्र निवडा'
              : 'Tap your health problem below'}
          </h3>
          <p className="text-xs text-text-muted">
            {language === 'hi'
              ? 'बिना लिखे आसानी से अपनी बीमारी दर्ज करें'
              : language === 'mr'
              ? 'टाइप न करता सहजपणे आपली लक्षणे निवडा'
              : 'Select directly using clear visual icons'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {VISUAL_SYMPTOMS_LIST.map((item) => {
          const itemTag = item.tag.toLowerCase()
          const itemEn = item.titleEn.toLowerCase()
          const itemHi = item.titleHi.toLowerCase()
          const itemMr = item.titleMr.toLowerCase()

          const isSelected = activeList.length > 0 && activeList.some((s) => {
            return (
              s === itemTag ||
              s === itemEn ||
              s === itemHi ||
              s === itemMr ||
              itemTag.includes(s) ||
              itemEn.includes(s) ||
              itemHi.includes(s) ||
              itemMr.includes(s)
            )
          })

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelectSymptom(item)}
              className={`tap-press group relative p-3.5 rounded-md border text-left flex flex-col justify-between transition-all duration-150 min-h-[125px] shadow-sm ${
                isSelected
                  ? 'border-primary bg-primary-50 ring-2 ring-primary/10 shadow-md'
                  : `border-border-soft bg-white hover:border-primary hover:shadow-md ${item.urgencyColor}`
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="p-1 rounded-md bg-white/90 shadow-sm border border-border-soft group-hover:scale-105 transition-transform">
                  {item.svg}
                </div>
                {isSelected ? (
                  <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shadow-sm shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-text-muted group-hover:text-primary">
                    + Add
                  </span>
                )}
              </div>

              <div className="mt-2.5">
                <h4 className="font-bold text-xs leading-snug text-text-main group-hover:text-primary">
                  {getTitle(item)}
                </h4>
                <p className="text-[11px] text-text-muted leading-tight mt-0.5 line-clamp-2">
                  {getDesc(item)}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
