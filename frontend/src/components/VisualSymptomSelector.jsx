import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Volume2, Mic, Sparkles } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

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
  jointpain: (
    <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
      <path d="M18 10l6 14-6 14M30 10l-6 14 6 14" stroke="#0D9488" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24" cy="24" r="5" fill="#CCFBF1" stroke="#0D9488" strokeWidth="2.5" />
      <path d="M14 24h3M31 24h3M24 14v3M24 31v3" stroke="#14B8A6" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
}

export const VISUAL_SYMPTOMS_DATA = [
  {
    key: 'fever',
    svg: SYMPTOM_SVGS.fever,
    tag: 'Fever',
    urgencyColor: 'border-red-200 bg-red-50/50 text-red-950',
    translations: {
      hi: { title: 'तेज बुखार और कंपकंपी', desc: 'गर्म शरीर, कंपकंपी, पसीना' },
      te: { title: 'తీవ్ర జ్వరం & చలి', desc: 'వేడి ఒళ్లు, వణుకు, చెమటలు' },
      ta: { title: 'காய்ச்சல் & நடுக்கம்', desc: 'சூடான உடல், நடுக்கம், வியர்வை' },
      mr: { title: 'ताप व थंडी वाजणे', desc: 'अंगात उष्णता, थंडी, घाम' },
      bn: { title: 'তীব্র জ্বর ও কাঁপুনি', desc: 'গরম শরীর, কাঁপুনি, ঘাম' },
      gu: { title: 'તીવ્ર તાવ અને ધ્રૂજારી', desc: 'ગરમ શરીર, ધ્રૂજારી, પરસેવો' },
      kn: { title: 'ತೀವ್ರ ಜ್ವರ ಮತ್ತು ಚಳಿ', desc: 'ಬಿಸಿ ಮೈ, ನಡುಕ, ಬೆವರು' },
      ml: { title: 'കടുത്ത പനിയും വിറയലും', desc: 'ചൂടുള്ള ശരീരം, വിറയൽ' },
      pa: { title: 'ਤੇਜ਼ ਬੁਖਾਰ ਅਤੇ ਕੰਬਣੀ', desc: 'ਗਰਮ ਸਰੀਰ, ਕੰਬਣੀ' },
      or: { title: 'ପ୍ରବଳ ଜ୍ୱର ଓ ଥଣ୍ଡା', desc: 'ଗରମ ଶରୀର, ଥରିବା' },
      as: { title: 'তীব্র জ্বৰ আৰু কঁপনি', desc: 'গৰম গা, কঁপনি' },
      ur: { title: 'تیز بخار اور کپکپی', desc: 'گرم جسم، پسینہ' },
      sa: { title: 'तीव्रज्वरः कम्पनं च', desc: 'उष्णं शरीरं, कम्पनम्' },
      mai: { title: 'तेज बुखार आ कंपकंपी', desc: 'गरम देह, पसीना' },
      kok: { title: 'चड जोर आनी थंडी', desc: 'गरम आंग, थंडी' },
      ne: { title: 'कडा ज्वरो र कम्पन', desc: 'तातो शरीर, पसिना' },
      en: { title: 'High Fever & Chills', desc: 'Hot body, shivering, sweating' },
    },
  },
  {
    key: 'breathing',
    svg: SYMPTOM_SVGS.breathing,
    tag: 'Shortness of Breath',
    urgencyColor: 'border-sky-200 bg-sky-50/50 text-sky-950',
    translations: {
      hi: { title: 'सांस लेने में तकलीफ', desc: 'सांस फूलना, सीने में घबराहट' },
      te: { title: 'శ్వాస తీసుకోవడంలో ఇబ్బంది', desc: 'దమ్ము, ఆయాసం, ఛాతీలో ఒత్తిడి' },
      ta: { title: 'மூச்சுத் திணறல்', desc: 'மூச்சு வாங்கல், நெஞ்சு இறுக்கம்' },
      mr: { title: 'श्वास घेण्यास त्रास', desc: 'दम लागणे, छातीत घरघर' },
      bn: { title: 'শ্বাসকষ্ট', desc: 'হাঁপ ধরা, বুকে চাপ' },
      gu: { title: 'શ્વાસ લેવામાં તકલીફ', desc: 'દમ ચઢવો, છાતીમાં દબાણ' },
      kn: { title: 'ಉಸಿರಾಟದ ತೊಂದರೆ', desc: 'ಉಸಿರು ಕಟ್ಟುವಿಕೆ, ಆಯಾಸ' },
      ml: { title: 'ശ്വാസതടസ്സം', desc: 'ശ്വാസംമുട്ടൽ, കിതപ്പ്' },
      pa: { title: 'ਸਾਹ ਲੈਣ ਵਿੱਚ ਤਕਲੀਫ਼', desc: 'ਸਾਹ ਚੜ੍ਹਨਾ' },
      or: { title: 'ଶ୍ୱାସକ୍ରିୟାରେ କଷ୍ଟ', desc: 'ନିଶ୍ୱାସ ନେବାରେ କଷ୍ଟ' },
      as: { title: 'উশাহ লোৱাত কষ্ট', desc: 'হাঁপধৰা, বুকুত টান' },
      ur: { title: 'سانس لینے میں دشواری', desc: 'سینے میں گھٹن' },
      sa: { title: 'श्वासकष्टम्', desc: 'श्वासावरोधः' },
      mai: { title: 'सांस लेब में तकलीफ', desc: 'दम फूलब' },
      kok: { title: 'श्वास घेवपाक त्रास', desc: 'दम लागप' },
      ne: { title: 'सास फेर्न गाह्रो', desc: 'छाती भारी हुनु' },
      en: { title: 'Breathing Trouble', desc: 'Gasping, chest tightness, fast breath' },
    },
  },
  {
    key: 'chest',
    svg: SYMPTOM_SVGS.chest,
    tag: 'Chest Pain',
    urgencyColor: 'border-rose-200 bg-rose-50/50 text-rose-950',
    translations: {
      hi: { title: 'सीने में दर्द या भारीपन', desc: 'बाएं हाथ में दर्द, भारी दबाव' },
      te: { title: 'ఛాతీ నొప్పి / గుండెలో భారం', desc: 'ఎడమ చేయి నొప్పి, ఛాతీలో బరువు' },
      ta: { title: 'நெஞ்சு வலி / அழுத்தம்', desc: 'இடது கை வலி, அதிக அழுத்தம்' },
      mr: { title: 'छातीत तीव्र वेदना', desc: 'डाव्या हाताकडे कळ, छातीत दाब' },
      bn: { title: 'বুকে তীব্র ব্যথা', desc: 'বাম হাতে ব্যথা, ভারী চাপ' },
      gu: { title: 'છાતીમાં દુખાવો', desc: 'ડાબા હાથમાં દુખાવો, ભારેપણું' },
      kn: { title: 'ಎದೆ ನೋವು / ಭಾರ', desc: 'ಎಡಗೈ ನೋವು, ಎದೆ ಬಿಗಿತ' },
      ml: { title: 'നെഞ്ചുവേദന', desc: 'ഇടതുകൈ വേദന, ഭാരം' },
      pa: { title: 'ਛਾਤੀ ਦਾ ਦਰਦ', desc: 'ਖੱਬੀ ਬਾਂਹ ਦਾ ਦਰਦ' },
      or: { title: 'ଛାତି ଯନ୍ତ୍ରଣା', desc: 'ବାମ ହାତ ଯନ୍ତ୍ରଣା' },
      as: { title: 'বুকুৰ বিষ', desc: 'বাওঁ হাতৰ বিষ' },
      ur: { title: 'سینے میں درد', desc: 'بائیں بازو میں درد' },
      sa: { title: 'वक्षोवेदना', desc: 'वामबाहुवेदना' },
      mai: { title: 'छाती में दर्द', desc: 'बाएं हाथ में दर्द' },
      kok: { title: 'हड्ड्यांत दुख', desc: 'दाव्या हाताक कळ' },
      ne: { title: 'छातीको दुखाइ', desc: 'देब्रे हात दुखाइ' },
      en: { title: 'Chest Pain / Heart', desc: 'Left arm pain, squeezing pressure' },
    },
  },
  {
    key: 'snakebite',
    svg: SYMPTOM_SVGS.snakebite,
    tag: 'Snake Bite',
    urgencyColor: 'border-red-300 bg-red-100/60 text-red-950',
    translations: {
      hi: { title: 'सांप या जहरीले कीड़े का काटना', desc: 'काटने के निशान, सूजन, जलन' },
      te: { title: 'పాము లేదా విషపు పురుగు కాటు', desc: 'కాటు గుర్తులు, వాపు, మంట' },
      ta: { title: 'பாம்பு / விஷப்பூச்சி கடி', desc: 'கடி தடம், வீக்கம், எரிச்சல்' },
      mr: { title: 'सर्पदंश किंवा विंचू चावणे', desc: 'दंशाचे व्रण, सूज, तीव्र दाह' },
      bn: { title: 'সাপ বা বিষাক্ত পোকার কামড়', desc: 'কামড়ের দাগ, ফোলা, জ্বালা' },
      gu: { title: 'સાપ કે ઝેરી જીવડું કરડવું', desc: 'ડંખના નિશાન, સોજો, બળતરા' },
      kn: { title: 'ಹಾವು / ವಿಷಕಾರಿ ಕಡಿತ', desc: 'ಕಡಿತದ ಗುರುತು, ಊತ, ಉರಿ' },
      ml: { title: 'പാമ്പുകടി / വിഷബാധ', desc: 'കടിയേറ്റ പാട്, വീക്കം' },
      pa: { title: 'ਸੱਪ ਦਾ ਡੰਗ', desc: 'ਸੋਜ, ਜਲਣ' },
      or: { title: 'ସାପ କାମୁଡ଼ା', desc: 'କ୍ଷତ ଚିହ୍ନ, ଫୁଲିବା' },
      as: { title: 'সৰ্পদংশন', desc: 'দাঁতৰ দাগ, ফুলা' },
      ur: { title: 'سانپ کا کاٹنا', desc: 'سوجن، جلن' },
      sa: { title: 'सर्पदंशः', desc: 'दंशचिह्नं, शोथः' },
      mai: { title: 'सांपक कटाई', desc: 'काटबाक निशान' },
      kok: { title: 'सरोप चाबप', desc: 'सूज, जळजळ' },
      ne: { title: 'सर्पदंश / विषालु किरा', desc: 'सुन्निनु, पोल्नु' },
      en: { title: 'Snake / Insect Bite', desc: 'Fang marks, swelling, burning' },
    },
  },
  {
    key: 'stomach',
    svg: SYMPTOM_SVGS.stomach,
    tag: 'Stomach Pain',
    urgencyColor: 'border-amber-200 bg-amber-50/50 text-amber-950',
    translations: {
      hi: { title: 'पेट में तेज दर्द व मरोड़', desc: 'तेज मरोड़, पेट कड़ा होना' },
      te: { title: 'తీవ్రమైన కడుపు నొప్పి & తిమ్మిరి', desc: 'కడుపులో మెలితిప్పే నొప్పి' },
      ta: { title: 'கடுமையான வயிற்று வலி', desc: 'வயிற்றுப் பிடிப்பு, வலி' },
      mr: { title: 'पोटात तीव्र वेदना व मुरडा', desc: 'पोट आवळणे, गॅस, जळजळ' },
      bn: { title: 'তীব্র পেটে ব্যথা', desc: 'পেটে মোচড়, শক্ত পেট' },
      gu: { title: 'પેટમાં તીવ્ર દુખાવો', desc: 'પેટમાં ચૂંક, ખેંચાણ' },
      kn: { title: 'ತೀವ್ರ ಹೊಟ್ಟೆ ನೋವು', desc: 'ಹೊಟ್ಟೆ ಸೆಳೆತ, ಉಬ್ಬರ' },
      ml: { title: 'കഠിനമായ വയറുവേദന', desc: 'വയറ്റിൽ കൊളുത്തിപ്പിടുത്തം' },
      pa: { title: 'ਪੇਟ ਵਿੱਚ ਤੇਜ਼ ਦਰਦ', desc: 'ਮਰੋੜ, ਸਖ਼ਤ ਪੇਟ' },
      or: { title: 'ପ୍ରବଳ ପେଟ ଯନ୍ତ୍ରଣା', desc: 'ପେଟ ମୋଡ଼ିବା' },
      as: { title: 'তীব্র পেটৰ বিষ', desc: 'পেট কামোৰণি' },
      ur: { title: 'پیٹ میں شدید درد', desc: 'مروڑ، جلن' },
      sa: { title: 'तीव्रोदरवेदना', desc: 'उदरपीडा' },
      mai: { title: 'पेट में तेज दर्द', desc: 'मरोड़' },
      kok: { title: 'पोटात तीव्र दुख', desc: 'पोट आवळप' },
      ne: { title: 'पेटको कडा दुखाइ', desc: 'पेट बटारिनु' },
      en: { title: 'Severe Stomach Ache', desc: 'Cramps, hard belly, burning' },
    },
  },
  {
    key: 'vomiting',
    svg: SYMPTOM_SVGS.vomiting,
    tag: 'Diarrhea, Vomiting',
    urgencyColor: 'border-yellow-200 bg-yellow-50/50 text-yellow-950',
    translations: {
      hi: { title: 'उल्टी-दस्त व कमजोरी', desc: 'पतले दस्त, शरीर में पानी की कमी' },
      te: { title: 'వాంతులు మరియు విరేచనాలు', desc: 'నీళ్ల విరేచనాలు, డీహైడ్రేషన్, నీరసం' },
      ta: { title: 'வாந்தி & வயிற்றுப்போக்கு', desc: 'நீரிழப்பு, சோர்வு' },
      mr: { title: 'उलटी व जुलाब', desc: 'पातळ शौच, अशक्तपणा' },
      bn: { title: 'বমি ও পাতলা পায়খানা', desc: 'জলশূন্যতা, দুর্বলতা' },
      gu: { title: 'ઉલટી અને ઝાડા', desc: 'શરીરમાં પાણીની અછત, નબળાઈ' },
      kn: { title: 'ವಾಂತಿ ಮತ್ತು ಭೇದಿ', desc: 'ನಿರ್ಜಲೀಕರಣ, ಆಯಾಸ' },
      ml: { title: 'ഛർദ്ദിയും വയറിളക്കവും', desc: 'നിർജ്ജലീകരണം, ക്ഷീണം' },
      pa: { title: 'ਉਲਟੀ ਅਤੇ ਦਸਤ', desc: 'ਕਮਜ਼ੋਰੀ, ਪਾਣੀ ਦੀ ਕਮੀ' },
      or: { title: 'ବାନ୍ତି ଓ ଝାଡ଼ା', desc: 'ଦୁର୍ବଳତା, ଶୋଷ' },
      as: { title: 'বমি আৰু পেটচলা', desc: 'পানী শূন্যতা, দুৰ্বলতা' },
      ur: { title: 'الٹی اور دست', desc: 'پانی کی کمی، کمزوری' },
      sa: { title: 'वमनम् अतीसारः च', desc: 'जलक्षयः, दौर्बल्यम्' },
      mai: { title: 'उल्टी आ दस्त', desc: 'कमजोरी' },
      kok: { title: 'उलटी आनी जुलाब', desc: 'अशक्तपण' },
      ne: { title: 'वान्ता र पखाला', desc: 'पानीको कमी, कमजोरी' },
      en: { title: 'Vomiting & Diarrhea', desc: 'Loose motions, dehydration, dry mouth' },
    },
  },
  {
    key: 'injury',
    svg: SYMPTOM_SVGS.injury,
    tag: 'Injury / Fracture',
    urgencyColor: 'border-slate-300 bg-slate-100/60 text-slate-900',
    translations: {
      hi: { title: 'हड्डी टूटना या गहरा घाव', desc: 'खून बहना, हाथ-पैर न हिलना' },
      te: { title: 'ఎముక విరగడం / తీవ్ర గాయం', desc: 'రక్తస్రావం, చేయి/కాలు కదపలేకపోవడం' },
      ta: { title: 'எலும்பு முறிவு / ஆழமான காயம்', desc: 'இரத்தப்போக்கு, அசைக்க முடியாமை' },
      mr: { title: 'हाड मोडणे किंवा गंभीर जखम', desc: 'रक्तस्त्राव, हालचाल न होणे' },
      bn: { title: 'হাড় ভাঙা বা গভীর ক্ষত', desc: 'রক্তপাত, নড়াচড়া করতে না পারা' },
      gu: { title: 'હાડકું તૂટવું કે ઊંડો ઘા', desc: 'લોહી વહેવું, હલનચલન ન થવું' },
      kn: { title: 'ಮೂಳೆ ಮುರಿತ / ಆಳವಾದ ಗಾಯ', desc: 'ರಕ್ತಸ್ರಾವ, ಚಲಿಸಲಾಗದಿರುವುದು' },
      ml: { title: 'അസ്ഥി ഒടിവ് / ആഴമുള്ള മുറിവ്', desc: 'രക്തസ്രാവം' },
      pa: { title: 'ਹੱਡੀ ਟੁੱਟਣੀ ਜਾਂ ਡੂੰਘਾ ਜ਼ਖ਼ਮ', desc: 'ਖੂਨ ਵਹਿਣਾ' },
      or: { title: 'ହାଡ଼ ଭାଙ୍ଗିବା ବା ଗଭୀର କ୍ଷତ', desc: 'ରକ୍ତସ୍ରାବ' },
      as: { title: 'হাড় ভগা বা গভীৰ আঘাত', desc: 'ৰক্তক্ষৰণ' },
      ur: { title: 'ہڈی کا ٹوٹنا یا گہرا زخم', desc: 'خون بہنا' },
      sa: { title: 'अस्थिभङ्गः गभीरव्रणः च', desc: 'रक्तस्रावः' },
      mai: { title: 'हाड़ टूटब वा घाव', desc: 'रक्तस्राव' },
      kok: { title: 'हाड मोडप वा जखम', desc: 'रगत व्हांवप' },
      ne: { title: 'हड्डी भाँचिनु वा गहिरो चोट', desc: 'रगत बग्नु' },
      en: { title: 'Bone Fracture / Deep Cut', desc: 'Bleeding, cannot move limb' },
    },
  },
  {
    key: 'maternity',
    svg: SYMPTOM_SVGS.maternity,
    tag: 'Pregnancy Labor',
    urgencyColor: 'border-pink-200 bg-pink-50/50 text-pink-950',
    translations: {
      hi: { title: 'गर्भावस्था व प्रसव पीड़ा', desc: 'प्रसव का दर्द, पानी छूटना' },
      te: { title: 'గర్భధారణ & ప్రసవ నొప్పులు', desc: 'ప్రసవ వేదన, రక్తస్రావం, ఉమ్మనీరు పడటం' },
      ta: { title: 'கர்ப்பகாலம் & பிரசவ வலி', desc: 'பிரசவ வலி, நீர் உடைதல்' },
      mr: { title: 'गरोदरपण व प्रसूती कळा', desc: 'बाळंतपणाच्या कळा, रक्तस्त्राव' },
      bn: { title: 'গর্ভাবস্থা ও প্রসব বেদনা', desc: 'প্রসব যন্ত্রণা, জল ভাঙা' },
      gu: { title: 'ગર્ભાવસ્થા અને પ્રસૂતિ પીડા', desc: 'પ્રસૂતિની પીડા, લોહી નીકળવું' },
      kn: { title: 'ಗರ್ಭಧಾರಣೆ ಮತ್ತು ಹೆರಿಗೆ ನೋವು', desc: 'ಹೆರಿಗೆ ನೋವು, ರಕ್ತಸ್ರಾವ' },
      ml: { title: 'ഗർഭാവസ്ഥയും പ്രസവവേദനയും', desc: 'പ്രസവവേദന' },
      pa: { title: 'ਗਰਭ ਅਵਸਥਾ ਅਤੇ ਜਣੇਪਾ ਦਰਦ', desc: 'ਜਣੇਪਾ ਪੀੜ' },
      or: { title: 'ଗର୍ଭାବସ୍ଥା ଓ ପ୍ରସବ ଯନ୍ତ୍ରଣା', desc: 'ପ୍ରସବ ବେଦନା' },
      as: { title: 'গৰ্ভাৱস্থা আৰু প্ৰসৱ বেদনা', desc: 'প্ৰসৱৰ বিষ' },
      ur: { title: 'حمل اور زچگی کا درد', desc: 'درد زہ' },
      sa: { title: 'गर्भावस्था प्रसववेदना च', desc: 'प्रसवपीडा' },
      mai: { title: 'गर्भावस्था आ प्रसव पीड़ा', desc: 'प्रसव दर्द' },
      kok: { title: 'गुरवारपण आनी बाळंतपण', desc: 'बाळंतपणाच्यो कळा' },
      ne: { title: 'गर्भावस्था र प्रसव पीडा', desc: 'व्यथा लाग्नु' },
      en: { title: 'Pregnancy & Delivery Pain', desc: 'Labor pain, water break, bleeding' },
    },
  },
  {
    key: 'headache',
    svg: SYMPTOM_SVGS.headache,
    tag: 'Headache',
    urgencyColor: 'border-purple-200 bg-purple-50/50 text-purple-950',
    translations: {
      hi: { title: 'तेज सिरदर्द व चक्कर आना', desc: 'आंखों के आगे अंधेरा, सिर फटना' },
      te: { title: 'తీవ్ర తలనొప్పి & కళ్లు తిరగడం', desc: 'కళ్ల ముందు చీకట్లు, తల దిమ్ముగా ఉండటం' },
      ta: { title: 'கடுமையான தலைவலி & மயக்கம்', desc: 'மயக்கம், பார்வை மங்குதல்' },
      mr: { title: 'तीव्र डोकेदुखी व भोवळ', desc: 'डोळ्यांसमोर अंधारी, डोके भणभणणे' },
      bn: { title: 'তীব্র মাথাব্যথা ও মাথা ঘোরা', desc: 'চোখে অন্ধকার দেখা' },
      gu: { title: 'તીવ્ર માથાનો દુખાવો અને ચક્કર', desc: 'આંખે અંધારા આવવા' },
      kn: { title: 'ತೀವ್ರ ತಲೆನೋವು ಮತ್ತು ತಲೆತಿರುಗುವಿಕೆ', desc: 'ಕಣ್ಣು ಕತ್ತಲೆ ಬರುವುದು' },
      ml: { title: 'കഠിനമായ തലവേദനയും തലകറക്കവും', desc: 'തലകറക്കം' },
      pa: { title: 'ਸਿਰ ਦਰਦ ਅਤੇ ਚੱਕਰ', desc: 'ਚੱਕਰ ਆਉਣੇ' },
      or: { title: 'ମୁଣ୍ଡ ବିନ୍ଧା ଓ ମୁଣ୍ଡ ଘୁରାଇବା', desc: 'ମୁଣ୍ଡ ବୁଲାଇବା' },
      as: { title: 'মূৰৰ বিষ আৰু মূৰ ঘূৰোৱা', desc: 'মূৰ ঘূৰোৱা' },
      ur: { title: 'شدید سر درد اور چکر', desc: 'آنکھوں کے آگے اندھیرا' },
      sa: { title: 'तीव्रशिरोवेदना भ्रमः च', desc: 'नेत्रान्धकारः' },
      mai: { title: 'तेज माथ दर्द आ चक्कर', desc: 'माथा भारी' },
      kok: { title: 'तकलीदुखी आनी चक्कर', desc: 'दोळ्यांमुखार काळोख' },
      ne: { title: 'टाउको दुखाइ र चक्कर', desc: 'आँखा धमिलो हुनु' },
      en: { title: 'Severe Headache & Dizziness', desc: 'Throbbing head, blackouts, blurry eyes' },
    },
  },
  {
    key: 'jointpain',
    svg: SYMPTOM_SVGS.jointpain,
    tag: 'Joint Pain',
    urgencyColor: 'border-teal-200 bg-teal-50/50 text-teal-950',
    translations: {
      hi: { title: 'जोड़ों व बदन में तेज दर्द', desc: 'घुटनों में सूजन, कमर दर्द, अकड़न' },
      te: { title: 'కీళ్ల నొప్పులు & ఒళ్లు నొప్పులు', desc: 'మోకాళ్ల వాపు, నడుము నొప్పి, కదల్లేకపోవడం' },
      ta: { title: 'மூட்டு வலி & உடல் வலி', desc: 'முழங்கால் வீக்கம், இடுப்பு வலி' },
      mr: { title: 'सांधेदुखी व अंगदुखी', desc: 'गुडघेदुखी, कंबरदुखी, सांधे सुजणे' },
      bn: { title: 'গাঁটে ব্যথা ও শরীর ব্যথা', desc: 'হাঁটু ফোলা, পিঠে ব্যথা' },
      gu: { title: 'સાંધાનો દુખાવો અને શરીરનો દુખાવો', desc: 'ઢીંચણમાં સોજો, કમરનો દુખાવો' },
      kn: { title: 'ಕೀಲು ನೋವು ಮತ್ತು ಮೈಕೈ ನೋವು', desc: 'ಮೊಣಕಾಲು ಊತ, ಬೆನ್ನು ನೋವು' },
      ml: { title: 'സന്ധിവേദനയും ശരീരവേദനയും', desc: 'മുട്ടുവേദന, നീർക്കെട്ട്' },
      pa: { title: 'ਜੋੜਾਂ ਅਤੇ ਸਰੀਰ ਦਾ ਦਰਦ', desc: 'ਗੋਡਿਆਂ ਦੀ ਸੋਜ' },
      or: { title: 'ଗଣ୍ଠି ବିନ୍ଧା ଓ ଦେହ ଯନ୍ତ୍ରଣା', desc: 'ଆଣ୍ଠୁ ଫୁଲିବା' },
      as: { title: 'গাঁঠিৰ বিষ আৰু গাৰ বিষ', desc: 'আঁঠু ফুলা, কঁকালৰ বিষ' },
      ur: { title: 'جوڑوں اور جسم کا درد', desc: 'گھٹنوں میں سوجن' },
      sa: { title: 'सन्धिपीडा देहपीडा च', desc: 'जानुशोथः' },
      mai: { title: 'जोड़ आ देह दर्द', desc: 'कमर दर्द' },
      kok: { title: 'सांधेदुखी आनी आंगदुखी', desc: 'खोंपर दुखप' },
      ne: { title: 'जोर्नी र शरीर दुखाइ', desc: 'घुँडा सुन्निनु' },
      en: { title: 'Joint & Body Pain', desc: 'Knee swelling, back pain, stiffness' },
    },
  },
]

export default function VisualSymptomSelector({ onSelectSymptom, selectedSymptoms = [] }) {
  const { language } = useApp()

  const getTitle = (item) => {
    const langObj = item.translations[language] || item.translations.en || item.translations.hi
    return langObj.title
  }

  const getDesc = (item) => {
    const langObj = item.translations[language] || item.translations.en || item.translations.hi
    return langObj.desc
  }

  const activeList = Array.isArray(selectedSymptoms)
    ? selectedSymptoms.map((s) => (typeof s === 'string' ? s.trim().toLowerCase() : '')) .filter(Boolean)
    : []

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-display flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>
              {language === 'te'
                ? 'మీ అనారోగ్య సమస్యను ఎంచుకోండి'
                : language === 'ta'
                ? 'உங்கள் உடல்நலப் பிரச்சனையைத் தேர்ந்தெடுக்கவும்'
                : language === 'hi'
                ? 'अपनी तकलीफ का चित्र चुनें'
                : language === 'mr'
                ? 'तुमच्या त्रासाचे चित्र निवडा'
                : language === 'bn'
                ? 'আপনার স্বাস্থ্য সমস্যা নির্বাচন করুন'
                : language === 'gu'
                ? 'તમારી સ્વાસ્થ્ય સમસ્યા પસંદ કરો'
                : language === 'kn'
                ? 'ನಿಮ್ಮ ಆರೋಗ್ಯ ಸಮಸ್ಯೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ'
                : language === 'ml'
                ? 'നിങ്ങളുടെ ആരോഗ്യ പ്രശ്നം തിരഞ്ഞെടുക്കുക'
                : 'Select Your Health Concern (Visual Problem Cards)'}
            </span>
          </h3>
          <p className="text-[11px] text-slate-500">
            {language === 'te'
              ? 'టైప్ చేయకుండా చిత్రాలపై క్లిక్ చేసి సులభంగా తెలియజేయండి'
              : language === 'ta'
              ? 'எழுதாமல் படங்களை கிளிக் செய்து எளிதாக தேர்ந்தெடுக்கவும்'
              : language === 'hi'
              ? 'बिना लिखे आसानी से अपनी बीमारी दर्ज करें'
              : language === 'mr'
              ? 'टाइप न करता सहजपणे आपली लक्षणे निवडा'
              : '1-tap selection without typing'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3">
        {VISUAL_SYMPTOMS_DATA.map((item) => {
          const itemTag = item.tag.toLowerCase()
          const currentTitle = getTitle(item).toLowerCase()

          const isSelected = activeList.length > 0 && activeList.some((s) => {
            return (
              s === itemTag ||
              s === currentTitle ||
              itemTag.includes(s) ||
              currentTitle.includes(s) ||
              Object.values(item.translations).some(t => t.title.toLowerCase() === s)
            )
          })

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelectSymptom(item)}
              className={`tap-press group relative p-3 sm:p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all min-h-[130px] shadow-2xs ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-600/20 shadow-xs'
                  : `border-slate-200/90 bg-white hover:border-blue-400 hover:shadow-xs ${item.urgencyColor}`
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="p-1 rounded-xl bg-white shadow-2xs border border-slate-100 mb-2 group-hover:scale-105 transition-transform">
                    {item.svg}
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>

                <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                  {getTitle(item)}
                </h4>
              </div>

              <p className="text-[10px] sm:text-[10.5px] text-slate-500 line-clamp-2 mt-1 leading-tight">
                {getDesc(item)}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
