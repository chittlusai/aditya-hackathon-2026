import { useState } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext.jsx'
import { Check, Info, Sparkles, MapPin } from 'lucide-react'

export const BODY_REGIONS_DATA = [
  {
    id: 'head',
    names: {
      hi: 'सिर, आंख, कान',
      te: 'తల, కళ్లు, చెవులు',
      ta: 'தலை, கண், காது',
      mr: 'डोके, डोळे, कान',
      bn: 'মাথা, চোখ, কান',
      gu: 'માથું, આંખ, કાન',
      kn: 'ತಲೆ, ಕಣ್ಣು, ಕಿವಿ',
      ml: 'തല, കണ്ണ്, ചെവി',
      pa: 'ਸਿਰ, ਅੱਖ, ਕੰਨ',
      or: 'ମୁଣ୍ଡ, ଆଖି, କାନ',
      as: 'মূৰ, চকু, কাণ',
      ur: 'سر، آنکھ، کان',
      sa: 'शिरः, नेत्रम्, कर्णः',
      mai: 'माथ, आंखि, कान',
      kok: 'तकली, दोळे, कान',
      ne: 'टाउको, आँखा, कान',
      en: 'Head & Senses',
    },
    symptoms: [
      {
        tag: 'Headache',
        labels: {
          hi: 'तेज सिरदर्द',
          te: 'తీవ్ర తలనొప్పి',
          ta: 'கடுமையான தலைவலி',
          mr: 'तीव्र डोकेदुखी',
          bn: 'তীব্র মাথাব্যথা',
          gu: 'તીવ્ર માથાનો દુખાવો',
          kn: 'ತೀವ್ರ ತಲೆನೋವು',
          ml: 'കഠിനമായ തലവേദന',
          pa: 'ਸਿਰ ਦਰਦ',
          or: 'ମୁଣ୍ଡ ବିନ୍ଧା',
          as: 'মূৰৰ বিষ',
          ur: 'شدید سر درد',
          sa: 'तीव्रशिरोवेदना',
          mai: 'तेज माथ दर्द',
          kok: 'तकलीदुखी',
          ne: 'टाउको दुखाइ',
          en: 'Severe Headache',
        },
      },
      {
        tag: 'Dizziness',
        labels: {
          hi: 'चक्कर आना / बेहोशी',
          te: 'కళ్లు తిరగడం / మూర్ఛ',
          ta: 'மயக்கம்',
          mr: 'चक्कर येणे / भोवळ',
          bn: 'মাথা ঘোরা / অজ্ঞান',
          gu: 'ચક્કર આવવા / બેભાન',
          kn: 'ತಲೆತಿರುಗುವಿಕೆ',
          ml: 'തലകറക്കം',
          pa: 'ਚੱਕਰ ਆਉਣੇ',
          or: 'ମୁଣ୍ଡ ଘୁରାଇବା',
          as: 'মূৰ ঘূৰোৱা',
          ur: 'چکر آنا',
          sa: 'भ्रमः',
          mai: 'चक्कर आबब',
          kok: 'चक्कर येवप',
          ne: 'चक्कर लाग्नु',
          en: 'Dizziness / Fainting',
        },
      },
      {
        tag: 'High BP',
        labels: {
          hi: 'हाई बीपी / घबराहट',
          te: 'అధిక రక్తపోటు / ఆందోళన',
          ta: 'உயர் இரத்த அழுத்தம்',
          mr: 'उच्च रक्तदाब',
          bn: 'উচ্চ রক্তচাপ',
          gu: 'હાઈ બ્લડ પ્રેશર',
          kn: 'ಹೆಚ್ಚಿನ ರಕ್ತದೊತ್ತಡ',
          ml: 'ഉയർന്ന രക്തസമ്മർദ്ദം',
          pa: 'ਹਾਈ ਬੀਪੀ',
          or: 'ଉଚ୍ଚ ରକ୍ତଚାପ',
          as: 'উচ্চ ৰক্তচাপ',
          ur: 'ہائی بلڈ پریشر',
          sa: 'उच्चरक्तचापः',
          mai: 'हाई बीपी',
          kok: 'हाय बीपी',
          ne: 'उच्च रक्तचाप',
          en: 'High BP / Blurred Vision',
        },
      },
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
    names: {
      hi: 'सीना, फेफड़े, सांस',
      te: 'ఛాతీ, ఊపిరితిత్తులు, శ్వాస',
      ta: 'நெஞ்சு, நுரையீரல், சுவாசம்',
      mr: 'छाती, फुफ्फुस, श्वास',
      bn: 'বুক, ফুসফুস, শ্বাস',
      gu: 'છાતી, ફેફસાં, શ્વાસ',
      kn: 'ಎದೆ, ಶ್ವಾಸಕೋಶ, ಉಸಿರಾಟ',
      ml: 'നെഞ്ച്, ശ്വാസകോശം',
      pa: 'ਛਾਤੀ, ਫੇਫੜੇ, ਸਾਹ',
      or: 'ଛାତି, ଫୁସଫୁସ, ନିଶ୍ୱାସ',
      as: 'বুকু, হাওঁফাওঁ, উশাহ',
      ur: 'سینہ، پھیپھڑے، سانس',
      sa: 'वक्षः, फुफ्फुसः, श्वासः',
      mai: 'छाती, सांस',
      kok: 'हड्डें, श्वास',
      ne: 'छाती, फोक्सो, सास',
      en: 'Chest & Breathing',
    },
    symptoms: [
      {
        tag: 'Chest Pain',
        labels: {
          hi: 'सीने में तेज दर्द व दबाव',
          te: 'ఛాతీ నొప్పి / ఒత్తిడి',
          ta: 'நெஞ்சு வலி / அழுத்தம்',
          mr: 'छातीत तीव्र दुखणे',
          bn: 'বুকে তীব্র ব্যথা ও চাপ',
          gu: 'છાતીમાં દુખાવો અને દબાણ',
          kn: 'ಎದೆ ನೋವು ಮತ್ತು ಒತ್ತಡ',
          ml: 'നെഞ്ചുവേദന',
          pa: 'ਛਾਤੀ ਵਿੱਚ ਦਰਦ',
          or: 'ଛାତି ଯନ୍ତ୍ରଣା',
          as: 'বুকুৰ বিষ',
          ur: 'سینے میں درد',
          sa: 'वक्षोवेदना',
          mai: 'छाती में दर्द',
          kok: 'हड्ड्यांत दुख',
          ne: 'छातीको दुखाइ',
          en: 'Chest Pain / Squeezing',
        },
      },
      {
        tag: 'Shortness of Breath',
        labels: {
          hi: 'सांस लेने में भारीपन',
          te: 'శ్వాస ఆడకపోవడం',
          ta: 'மூச்சுத் திணறல்',
          mr: 'श्वास घेण्यास त्रास',
          bn: 'শ্বাসকষ্ট',
          gu: 'શ્વાસ લેવામાં તકલીફ',
          kn: 'ಉಸಿರಾಟದ ತೊಂದರೆ',
          ml: 'ശ്വാസതടസ്സം',
          pa: 'ਸਾਹ ਲੈਣ ਵਿੱਚ ਤਕਲੀਫ਼',
          or: 'ଶ୍ୱାସକ୍ରିୟାରେ କଷ୍ଟ',
          as: 'উশাহ লোৱাত কষ্ট',
          ur: 'سانس لینے میں دشواری',
          sa: 'श्वासकष्टम्',
          mai: 'सांस लेब में तकलीफ',
          kok: 'श्वास घेवपाक त्रास',
          ne: 'सास फेर्न गाह्रो',
          en: 'Breathing Difficulty',
        },
      },
      {
        tag: 'Cough',
        labels: {
          hi: 'गंभीर खांसी व कफ',
          te: 'తీవ్రమైన దగ్గు మరియు కఫం',
          ta: 'கடுமையான இருமல் & சளி',
          mr: 'खोकला व कफ',
          bn: 'তীব্র কাশি ও কফ',
          gu: 'ખાંસી અને કફ',
          kn: 'ಕೆಮ್ಮು ಮತ್ತು ಕಫ',
          ml: 'ചുമയും കഫക്കെട്ടും',
          pa: 'ਖੰਘ ਅਤੇ ਬਲਗ਼ਮ',
          or: 'କାଶ ଓ କଫ',
          as: 'কাহ আৰু কফ',
          ur: 'کھانسی اور بلغم',
          sa: 'कासः कफः च',
          mai: 'खांसी आ कफ',
          kok: 'खोंकली आनी कफ',
          ne: 'खोकी र खकार',
          en: 'Severe Cough & Phlegm',
        },
      },
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
    names: {
      hi: 'पेट, आंत, पाचन',
      te: 'కడుపు, జీర్ణాశయం',
      ta: 'வயிறு, செரிமானம்',
      mr: 'पोट, पचन',
      bn: 'পেট, হজম',
      gu: 'પેટ, પાચન',
      kn: 'ಹೊಟ್ಟೆ, ಜೀರ್ಣಕ್ರಿಯೆ',
      ml: 'വയറ്, ദഹനം',
      pa: 'ਪੇਟ, ਪਾਚਨ',
      or: 'ପେଟ, ହଜମ',
      as: 'পেট, পাচন',
      ur: 'پیٹ، نظام ہاضمہ',
      sa: 'उदरम्, पचनम्',
      mai: 'पेट, पाचन',
      kok: 'पोट, पचन',
      ne: 'पेट, पाचन',
      en: 'Stomach & Belly',
    },
    symptoms: [
      {
        tag: 'Stomach Pain',
        labels: {
          hi: 'पेट में तेज मरोड़',
          te: 'కడుపులో తీవ్రమైన నొప్పి',
          ta: 'வயிற்று வலி',
          mr: 'पोटात तीव्र मुरडा',
          bn: 'পেটে তীব্র মোচড় ও ব্যথা',
          gu: 'પેટમાં ચૂંક અને દુખાવો',
          kn: 'ತೀವ್ರ ಹೊಟ್ಟೆ ನೋವು',
          ml: 'കഠിനമായ വയറുവೇദന',
          pa: 'ਪੇਟ ਵਿੱਚ ਮਰੋੜ',
          or: 'ପେଟ ଯନ୍ତ୍ରଣା',
          as: 'পেটৰ বিষ',
          ur: 'پیٹ میں شدید درد',
          sa: 'तीव्रोदरवेदना',
          mai: 'पेट में मरोड़',
          kok: 'पोटात दुख',
          ne: 'पेटको दुखाइ',
          en: 'Severe Abdominal Cramp',
        },
      },
      {
        tag: 'Vomiting',
        labels: {
          hi: 'लगातार उल्टी',
          te: 'నిరంతర వాంతులు',
          ta: 'தொடர் வாந்தி',
          mr: 'वारंवार उलट्या',
          bn: 'ক্রমাগত বমি',
          gu: 'વારંવાર ઉલટી',
          kn: 'ಸತತ ವಾಂತಿ',
          ml: 'തുടർച്ചയായ ഛർദ്ദി',
          pa: 'ਲਗਾਤਾਰ ਉਲਟੀ',
          or: 'ଲଗାତାର ବାନ୍ତି',
          as: 'বাৰে বাৰে বমি',
          ur: 'مسلسل الٹی',
          sa: 'निरन्तरवमनम्',
          mai: 'लगातार उल्टी',
          kok: 'परत परत उलटी',
          ne: 'लगातार वान्ता',
          en: 'Repeated Vomiting',
        },
      },
      {
        tag: 'Diarrhea',
        labels: {
          hi: 'दस्त व कमजोरी',
          te: 'విరేచనాలు & నీరసం',
          ta: 'வயிற்றுப்போக்கு & சோர்வு',
          mr: 'जुलाब व अशक्तपणा',
          bn: 'পাতলা পায়খানা ও দুর্বলতা',
          gu: 'ઝાડા અને અશક્તિ',
          kn: 'ಭೇದಿ ಮತ್ತು ಆಯಾಸ',
          ml: 'വയറിളക്കവും ക്ഷീണവും',
          pa: 'ਦਸਤ ਅਤੇ ਕਮਜ਼ੋਰੀ',
          or: 'ଝାଡ଼ା ଓ ଦୁର୍ବଳତା',
          as: 'পেটচলা আৰু দুৰ্বলতা',
          ur: 'دست اور کمزوری',
          sa: 'अतीसारः दौर्बल्यं च',
          mai: 'दस्त आ कमजोरी',
          kok: 'जुलाब आनी अशक्तपण',
          ne: 'पखाला र कमजोरी',
          en: 'Loose Motions / Dehydration',
        },
      },
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
    names: {
      hi: 'हाथ-पैर, जोड़, हड्डी',
      te: 'చేతులు, కాళ్లు, కీళ్లు',
      ta: 'கை, கால், மூட்டுகள்',
      mr: 'हात, पाय, सांधे, हाडे',
      bn: 'হাত, পা, গাঁট, হাড়',
      gu: 'હાથ, પગ, સાંધા, હાડકાં',
      kn: 'ಕೈ, ಕಾಲು, ಕೀಲುಗಳು',
      ml: 'കൈ, കാൽ, സന്ധികൾ',
      pa: 'ਹੱਥ, ਪੈਰ, ਜੋੜ',
      or: 'ହାତ, ଗୋଡ଼, ଗଣ୍ଠି',
      as: 'হাত, ভৰি, গাঁঠি',
      ur: 'ہاتھ، پاؤں، جوڑ',
      sa: 'हस्तः, पादः, सन्धिः',
      mai: 'हाथ, पैर, जोड़',
      kok: 'हात, पांय, सांधे',
      ne: 'हात, खुट्टा, जोर्नी',
      en: 'Hands, Legs & Joints',
    },
    symptoms: [
      {
        tag: 'Injury / Fracture',
        labels: {
          hi: 'हड्डी टूटना / मोच',
          te: 'ఎముక విరగడం / బెణుకు',
          ta: 'எலும்பு முறிவு / சுளுக்கு',
          mr: 'हाड मोडणे / लचक',
          bn: 'হাড় ভাঙা বা মচকে যাওয়া',
          gu: 'હાડકું તૂટવું / મચકોડ',
          kn: 'ಮೂಳೆ ಮುರಿತ / ಉಳುಕು',
          ml: 'അസ്ഥി ഒടിവ് / ഉളുക്ക്',
          pa: 'ਹੱਡੀ ਟੁੱਟਣੀ / ਮੋਚ',
          or: 'ହାଡ଼ ଭାଙ୍ଗିବା / ମୋଚ',
          as: 'হাড় ভগা / মোচোকা',
          ur: 'ہڈی ٹوٹنا / موچ',
          sa: 'अस्थिभङ्गः',
          mai: 'हाड़ टूटब / मोच',
          kok: 'हाड मोडप / लचक',
          ne: 'हड्डी भाँचिनु / मर्कनु',
          en: 'Fracture / Dislocation',
        },
      },
      {
        tag: 'Joint Pain',
        labels: {
          hi: 'जोड़ों में सूजन व दर्द',
          te: 'కీళ్ల వాపు మరియు నొప్పి',
          ta: 'மூட்டு வீக்கம் & வலி',
          mr: 'सांधेदुखी व सूज',
          bn: 'গাঁটে ফোলা ও ব্যথা',
          gu: 'સાંધામાં સોજો અને દુખાવો',
          kn: 'ಕೀಲು ಊತ ಮತ್ತು ನೋವು',
          ml: 'സന്ധി വീക്കവും വേദനയും',
          pa: 'ਜੋੜਾਂ ਦੀ ਸੋਜ ਅਤੇ ਦਰਦ',
          or: 'ଗଣ୍ଠି ଫୁଲିବା ଓ ଯନ୍ତ୍ରଣା',
          as: 'গাঁঠি ফুলা আৰু বিষ',
          ur: 'جوڑوں میں سوجن اور درد',
          sa: 'सन्धिपीडा शोथः च',
          mai: 'जोड़ में सूजन आ दर्द',
          kok: 'सांध्यांक सूज आनी दुख',
          ne: 'जोर्नी सुन्निनु र दुखाइ',
          en: 'Swollen Joint / Arthritis',
        },
      },
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
    names: {
      hi: 'सांप, बिच्छू, जानवर का काटना',
      te: 'పాము, తేలు, జంతువుల కాటు',
      ta: 'பாம்பு, தேள், விலங்கு கடி',
      mr: 'सर्पदंश, विंचू, प्राणी दंश',
      bn: 'সাপ, কাঁকড়াবিছে, পশুর কামড়',
      gu: 'સાપ, વીંછી, જાનવર કરડવું',
      kn: 'ಹಾವು, ಚೇಳು, ಪ್ರಾಣಿ ಕಡಿತ',
      ml: 'പാമ്പ്, തേൾ, മൃഗങ്ങളുടെ കടി',
      pa: 'ਸੱਪ, ਬਿੱਛੂ, ਜਾਨਵਰ ਦਾ ਡੰਗ',
      or: 'ସାପ, ବିଛା, ପଶୁ କାମୁଡ଼ା',
      as: 'সাপ, কেঁকোৰা বিছা, জন্তুৰ কামোৰ',
      ur: 'سانپ، بچھو، جانور کا کاٹنا',
      sa: 'सर्पदंशः, वृश्चिकदंशः',
      mai: 'सांप, बिच्छीक कटाई',
      kok: 'सरोप, विंचू चाबप',
      ne: 'सर्पदंश, बिच्छी, जनावरको टोकाइ',
      en: 'Bite & Emergency',
    },
    symptoms: [
      {
        tag: 'Snake Bite',
        labels: {
          hi: 'सांप का काटना (सर्पदंश)',
          te: 'పాము కాటు (విషపు పాము)',
          ta: 'பாம்பு கடி (விஷக்கடி)',
          mr: 'सापाचा चावा (सर्पदंश)',
          bn: 'সাপের কামড় (বিষাক্ত সাপ)',
          gu: 'સાપ કરડવો (ઝેરી સાપ)',
          kn: 'ಹಾವು ಕಡಿತ',
          ml: 'പാമ്പുകടി',
          pa: 'ਸੱਪ ਦਾ ਡੰਗ',
          or: 'ସାପ କାମୁଡ଼ା',
          as: 'সৰ্পদংশন',
          ur: 'سانپ کا کاٹنا',
          sa: 'सर्पदंशः',
          mai: 'सांपक कटाई',
          kok: 'सरोप चाबप',
          ne: 'सर्पदंश',
          en: 'Snake / Viper Bite',
        },
      },
    ],
    svgIcon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6">
        <circle cx="12" cy="12" r="9" strokeWidth="2" fill="#FEE2E2" stroke="#DC2626" />
        <path d="M12 7v6M12 17h.01" strokeWidth="2.5" strokeLinecap="round" stroke="#DC2626" />
      </svg>
    ),
  },
]

export default function BodyPartSelector({ onAddSymptom, currentSymptoms = '' }) {
  const { language } = useApp()
  const [activeRegion, setActiveRegion] = useState(BODY_REGIONS_DATA[0].id)

  const regionData = BODY_REGIONS_DATA.find((r) => r.id === activeRegion) || BODY_REGIONS_DATA[0]

  const getRegionName = (r) => {
    return r.names[language] || r.names.en || r.names.hi
  }

  const getSymptomLabel = (s) => {
    return s.labels[language] || s.labels.en || s.labels.hi
  }

  const cleanSymptoms = currentSymptoms ? currentSymptoms.toLowerCase() : ''

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-display flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>
              {language === 'te'
                ? 'శరీరంలో ఏ భాగంలో సమస్య ఉంది?'
                : language === 'ta'
                ? 'உடலின் எந்த பகுதியில் பிரச்சனை?'
                : language === 'hi'
                ? 'शरीर के किस हिस्से में तकलीफ है?'
                : language === 'mr'
                ? 'शरीराच्या कोणत्या भागात त्रास होत आहे?'
                : language === 'bn'
                ? 'শরীরের কোন অংশে সমস্যা?'
                : language === 'gu'
                ? 'શરીરના કયા ભાગમાં તકલીફ છે?'
                : language === 'kn'
                ? 'ದೇಹದ ಯಾವ ಭಾಗದಲ್ಲಿ ಸಮಸ್ಯೆಯಿದೆ?'
                : language === 'ml'
                ? 'ശരീരത്തിൽ എവിടെയാണ് പ്രശ്നം?'
                : 'Where does it hurt? (Body Region Selector)'}
            </span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {language === 'te'
              ? 'శరీర భాగాన్ని ఎంచుకుని మీ లక్షణాలను జోడించండి'
              : language === 'ta'
              ? 'உடல் பகுதியைத் தேர்ந்தெடுத்து அறிகுறிகளைச் சேர்க்கவும்'
              : language === 'hi'
              ? 'शरीर के अंग पर क्लिक करें और अपने लक्षण जोड़ें'
              : language === 'mr'
              ? 'शरीराचा भाग निवडून आपली लक्षणे सहज जोडा'
              : 'Tap a body region to choose your specific symptom'}
          </p>
        </div>
      </div>

      {/* Region Tabs / Body Zones */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {BODY_REGIONS_DATA.map((r) => {
          const isActive = r.id === activeRegion
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setActiveRegion(r.id)}
              className={`tap-press p-2.5 sm:p-3 rounded-2xl border text-left flex flex-col items-center justify-center gap-1.5 transition-all ${
                isActive
                  ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-xs ring-2 ring-blue-600/20'
                  : 'border-slate-200/90 bg-slate-50/80 hover:bg-white text-slate-600'
              }`}
            >
              <div className="p-1.5 rounded-xl bg-white shadow-2xs border border-slate-100">{r.svgIcon}</div>
              <span className="text-[11px] font-bold text-center leading-tight">
                {getRegionName(r).split(',')[0]}
              </span>
            </button>
          )
        })}
      </div>

      {/* Active Symptoms Checklist */}
      <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200/80 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">
            {getRegionName(regionData)}
          </span>
          <span className="text-[10px] text-slate-400">Tap to add</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {regionData.symptoms.map((s) => {
            const isAdded = cleanSymptoms.includes(s.tag.toLowerCase()) || cleanSymptoms.includes(getSymptomLabel(s).toLowerCase())
            return (
              <button
                key={s.tag}
                type="button"
                onClick={() => onAddSymptom(getSymptomLabel(s))}
                className={`tap-press p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                  isAdded
                    ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                    : 'bg-white hover:bg-blue-50/60 text-slate-700 border-slate-200'
                }`}
              >
                <div>
                  <p className="text-xs font-bold leading-snug">{getSymptomLabel(s)}</p>
                </div>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ml-2 ${
                  isAdded ? 'bg-white text-blue-700' : 'bg-slate-100 text-slate-400'
                }`}>
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
