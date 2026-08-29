import { CheckCircle2, AlertTriangle, Siren, Clock, Home, Building2 } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

export default function UrgencyBadge({ urgency }) {
  const { t, language } = useApp()

  const isMild = urgency === 'Mild'
  const isMod = urgency === 'Moderate'
  const isEm = urgency === 'Emergency'

  const ACTIONS_MAP = {
    Mild: {
      hi: { title: 'घर पर आराम व सामान्य देखभाल', time: 'सामान्य स्थिति', desc: 'पर्याप्त पानी पिएं, आराम करें। जरूरत पड़ने पर आशा कार्यकर्ता या नजदीकी स्वास्थ्य उप-केंद्र से संपर्क करें।' },
      te: { title: 'ఇంటి వద్ద విశ్రాంతి & సంరక్షణ', time: 'సాధారణ పరిస్థితి', desc: 'పుష్కలంగా ద్రవాలు తాగండి, విశ్రాంతి తీసుకోండి. అవసరమైతే ఆశా కార్యకర్త లేదా సబ్ సెంటర్‌ను సంప్రదించండి.' },
      ta: { title: 'வீட்டில் ஓய்வு & பராமரிப்பு', time: 'சாதாரண நிலை', desc: 'போதுமான தண்ணீர் குடிக்கவும், ஓய்வெடுக்கவும். தேவைப்பட்டால் ஆஷா பணியாளரை அணுகவும்.' },
      mr: { title: 'घरी विश्रांती व प्राथमिक काळजी', time: 'स्थिती सामान्य आहे', desc: 'पुरेसे पाणी प्या, विश्रांती घ्या. गरज भासल्यास आशा सेविकेशी संपर्क साधा.' },
      bn: { title: 'বাড়িতে বিশ্রাম ও যত্ন', time: 'স্বাভাবিক অবস্থা', desc: 'পর্যাপ্ত জল পান করুন এবং বিশ্রাম নিন। প্রয়োজনে আশা কর্মীর সাথে যোগাযোগ করুন।' },
      gu: { title: 'ઘરે આરામ અને સંભાળ', time: 'સામાન્ય સ્થિતિ', desc: 'પૂરતું પાણી પીવો અને આરામ કરો. જરૂર જણાયે આશા વર્કરનો સંપર્ક કરો.' },
      kn: { title: 'ಮನೆಯಲ್ಲಿ ವಿಶ್ರಾಂತಿ ಮತ್ತು ಆರೈಕೆ', time: 'ಸಾಮಾನ್ಯ ಸ್ಥಿತಿ', desc: 'ಸಾಕಷ್ಟು ನೀರು ಕುಡಿಯಿರಿ ಮತ್ತು ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ.' },
      ml: { title: 'വീട്ടിൽ വിശ്രമവും പരിചരണവും', time: 'സാധാരണ നില', desc: 'ധാരാളം വെള്ളം കുടിക്കുക, വിശ്രಮിക്കുക.' },
      pa: { title: 'ਘਰ ਵਿੱਚ ਆਰਾਮ ਅਤੇ ਦੇਖਭਾਲ', time: 'ਆਮ ਸਥਿਤੀ', desc: 'ਕਾਫ਼ੀ ਪਾਣੀ ਪੀਓ ਅਤੇ ਆਰਾਮ ਕਰੋ।' },
      or: { title: 'ଘରେ ବିଶ୍ରାମ ଓ ଯତ୍ନ', time: 'ସାଧାରଣ ସ୍ଥିତି', desc: 'ଯଥେଷ୍ଟ ପାଣି ପିଅନ୍ତୁ ଏବଂ ବିଶ୍ରାମ ନିଅନ୍ତୁ।' },
      as: { title: 'ঘৰত জিৰণি আৰু যত্ন', time: 'সাধাৰণ অৱস্থা', desc: 'পৰ্যাপ্ত পানী খাওক আৰু জিৰণি লওক।' },
      ur: { title: 'گھر پر آرام اور دیکھ بھال', time: 'معمول کی حالت', desc: 'کافی پانی پیئیں اور آرام کریں۔' },
      sa: { title: 'गृहे विश्रामः परिचर्या च', time: 'सामान्यस्थितिः', desc: 'पर्याप्तं जलं पिबन्तु, विश्रामं कुर्वन्तु।' },
      mai: { title: 'घर पर आराम आ देखभाल', time: 'सामान्य स्थिति', desc: 'पर्याप्त पानि पिबू आ आराम करू।' },
      kok: { title: 'घरा विश्रांती आनी काळजी', time: 'सादारण स्थिती', desc: 'पुरो तितलें उदक पियेयात आनी विश्रांती घेयात.' },
      ne: { title: 'घरमै आराम र हेरचाह', time: 'सामान्य अवस्था', desc: 'प्रशस्त पानी पिउनुहोस् र आराम गर्नुहोस्।' },
      en: { title: 'Home Rest & Local Sub-Centre Care', time: 'Stable Condition', desc: 'Stay hydrated and rested. Consult your local ASHA worker or Health Sub-Centre if needed.' },
    },
    Moderate: {
      hi: { title: 'आज ही प्राथमिक स्वास्थ्य केंद्र (PHC) जाएं', time: 'आज ही डॉक्टर को दिखाएं (12-24 घंटे में)', desc: 'बीमारी बढ़ने से पहले नजदीकी प्राथमिक स्वास्थ्य केंद्र या सीएचसी में डॉक्टर से परामर्श लें।' },
      te: { title: 'ఈరోజే ప్రాథమిక ఆరోగ్య కేంద్రం (PHC) కి వెళ్లండి', time: 'ఈరోజే డాక్టర్‌ను కలవండి (12-24 గంటల్లో)', desc: 'లక్షణాలు తీవ్రమయ్యే ముందు సమీపంలోని ప్రాథమిక లేదా కమ్యూనిటీ ఆరోగ్య కేంద్రంలో డాక్టర్‌ను సంప్రదించండి.' },
      ta: { title: 'இன்றே ஆரம்ப சுகாதார நிலையத்திற்கு (PHC) செல்லவும்', time: 'இன்றே மருத்துவரை பார்க்கவும்', desc: 'அறிகுறிகள் தீவிரமடைவதற்குள் மருத்துவரை அணுகவும்.' },
      mr: { title: 'आजच प्राथमिक आरोग्य केंद्रात (PHC) जा', time: 'आजच डॉक्टरांना दाखवा (१२-२४ तासांत)', desc: 'त्रास वाढण्यापूर्वी जवळच्या प्राथमिक आरोग्य केंद्रात डॉक्टरांचा सल्ला घ्या.' },
      bn: { title: 'আজই প্রাথমিক স্বাস্থ্য কেন্দ্রে (PHC) যান', time: 'আজই ডাক্তার দেখান (১২-২৪ ঘণ্টার মধ্যে)', desc: 'অবস্থা গুরুতর হওয়ার আগেই ডাক্তারের পরামর্শ নিন।' },
      gu: { title: 'આજે જ પ્રાથમિક આરોગ્ય કેન્દ્ર (PHC) ની મુલાકાત લો', time: 'આજે જ ડૉક્ટરને બતાવો', desc: 'બીમારી વધે તે પહેલાં નજીકના આરોગ્ય કેન્દ્રમાં ડૉક્ટરની સલાહ લો.' },
      kn: { title: 'ಇಂದೇ ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಕೇಂದ್ರಕ್ಕೆ (PHC) ಭೇಟಿ ನೀಡಿ', time: 'ಇಂದೇ ವೈದ್ಯರನ್ನು ಭೇಟಿ ಮಾಡಿ', desc: 'ರೋಗಲಕ್ಷಣಗಳು ಉಲ್ಬಣಗೊಳ್ಳುವ ಮುನ್ನ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.' },
      ml: { title: 'ഇന്ന് തന്നെ പ്രാഥമിക ആരോഗ്യ കേന്ദ്രത്തിൽ (PHC) പോകുക', time: 'ഇന്ന് തന്നെ ഡോക്ടറെ കാണുക', desc: 'ലക്ഷണങ്ങൾ കൂടുന്നതിന് മുൻപ് ഡോക്ടറെ കാണുക.' },
      pa: { title: 'ਅੱਜ ਹੀ ਪ੍ਰਾਇਮਰੀ ਹੈਲਥ ਸੈਂਟਰ (PHC) ਜਾਓ', time: 'ਅੱਜ ਹੀ ਡਾਕਟਰ ਨੂੰ ਦਿਖਾਓ', desc: 'ਲੱਛਣ ਵਧਣ ਤੋਂ ਪਹਿਲਾਂ ਡਾਕਟਰ ਦੀ ਸਲਾਹ ਲਓ।' },
      or: { title: 'ଆଜି ହିଁ ପ୍ରାଥମିକ ସ୍ୱାସ୍ଥ୍ୟ କେନ୍ଦ୍ର (PHC) କୁ ଯାଆନ୍ତୁ', time: 'ଆଜି ହିଁ ଡାକ୍ତରଙ୍କୁ ଦେଖାନ୍ତୁ', desc: 'ଲକ୍ଷଣ ବଢ଼ିବା ପୂର୍ବରୁ ଡାକ୍ତରଙ୍କ ପରାମର୍ଶ ନିଅନ୍ତୁ।' },
      as: { title: 'আজিই প্ৰাথমিক স্বাস্থ্য কেন্দ্ৰলৈ (PHC) যাওক', time: 'আজিই চিকিৎসকক দেখুৱাওক', desc: 'অসুস্থতা বৃদ্ধি পোৱাৰ পূৰ্বেই চিকিৎসকৰ পৰামৰ্শ লওক।' },
      ur: { title: 'آج ہی پرائمری ہیلتھ سنٹر (PHC) جائیں', time: 'آج ہی ڈاکٹر کو دکھائیں', desc: 'علامات بڑھنے سے پہلے ڈاکٹر سے رجوع کریں۔' },
      sa: { title: 'अद्यैव प्राथमिकस्वास्थ्यकेन्द्रं गच्छतु', time: 'अद्यैव वैद्यं पश्यतु', desc: 'रोगाधिक्यात् पूर्वं वैद्यपरामर्शं स्वीकुर्वन्तु।' },
      mai: { title: 'आजि प्राथमिक स्वास्थ्य केंद्र जाउ', time: 'आजि डॉक्टर के देखाउ', desc: 'बीमारी बढ़बा स पहिले डॉक्टर स सलाह लिअ।' },
      kok: { title: 'आयजच प्राथमिक भलायकी केंद्रांत वचात', time: 'आयजच डॉक्टरांक दाखयात', desc: 'त्रास वाडचे आदीं डॉक्टरांचो सल्लो घेयात.' },
      ne: { title: 'आजै प्राथमिक स्वास्थ्य केन्द्र जानुहोस्', time: 'आजै डाक्टरलाई देखाउनुहोस्', desc: 'लक्षण बढ्नु अगावै डाक्टरको सल्लाह लिनुहोस्।' },
      en: { title: 'Visit Primary Health Centre (PHC) Today', time: 'See Doctor Today (Within 12-24 hrs)', desc: 'Consult a medical doctor at your nearest PHC/CHC before symptoms worsen.' },
    },
    Emergency: {
      hi: { title: 'तुरंत अस्पताल जाएं या 108 एम्बुलेंस बुलाएं', time: 'आपातकालीन स्थिति (बिना देर किए)', desc: 'यह गंभीर स्थिति है। बिना देर किए नजदीकी अस्पताल के इमरजेंसी वार्ड में जाएं या 108 एम्बुलेंस को कॉल करें।' },
      te: { title: 'వెంటనే ఆసుపత్రికి వెళ్లండి లేదా 108 అంబులెన్స్ పిలవండి', time: 'అత్యవసర పరిస్థితి (వెంటనే)', desc: 'ఇది తీవ్రమైన అత్యవసర పరిస్థితి. ఆలస్యం చేయకుండా వెంటనే సమీప ఆసుపత్రికి వెళ్లండి లేదా 108 కాల్ చేయండి.' },
      ta: { title: 'உடனடியாக மருத்துவமனைக்கு செல்லவும் அல்லது 108 அழைக்கவும்', time: 'அவசர நிலை (உடனடியாக)', desc: 'தீவிர அறிகுறிகள். உடனடியாக அவசர சிகிச்சைப் பிரிவிற்கு செல்லவும்.' },
      mr: { title: 'तातडीने रुग्णालयात जा किंवा १०८ बोलवा', time: 'त्वरित (तातडीची आपत्कालीन स्थिती)', desc: 'ही गंभीर स्थिती आहे. विलंब न करता जवळच्या रुग्णालयात जा किंवा १०८ रुग्णवाहिका बोलवा.' },
      bn: { title: 'অবিলম্বে হাসপাতালে যান অথবা ১০৮ কল করুন', time: 'জরুরি অবস্থা (দেরি করবেন না)', desc: 'এটি গুরুতর অবস্থা। অবিলম্বে জরুরি বিভাগে যান অথবা ১০৮ কল করুন।' },
      gu: { title: 'તરત જ હોસ્પિટલ જાઓ અથવા 108 બોલાવો', time: 'ઇમરજન્સી (વિલંબ કર્યા વિના)', desc: 'આ ગંભીર સ્થિતિ છે. તરત જ નજીકના ઇમરજન્સી વોર્ડમાં જાઓ અથવા 108 પર કૉલ કરો.' },
      kn: { title: 'ತಕ್ಷಣ ಆಸ್ಪತ್ರೆಗೆ ಹೋಗಿ ಅಥವಾ 108 ಗೆ ಕರೆ ಮಾಡಿ', time: 'ತುರ್ತು ಪರಿಸ್ಥಿತಿ (ತಕ್ಷಣ)', desc: 'ಇದು ಗಂಭೀರ ಸ್ಥಿತಿಯಾಗಿದೆ. ತಕ್ಷಣ ತುರ್ತು ಚಿಕಿತ್ಸಾ ವಿಭಾಗಕ್ಕೆ ತೆರಳಿ.' },
      ml: { title: 'ഉടൻ ആശുപത്രിയിൽ പോകുക അല്ലെങ്കിൽ 108 വിളിക്കുക', time: 'അടിയന്തരാവസ്ഥ (ഉടൻ)', desc: 'ഗുരുതരമായ അവസ്ഥയാണ്. ഉടൻ അടുത്തുള്ള ആശുപത്രിയിൽ എത്തുക.' },
      pa: { title: 'ਤੁਰੰਤ ਹਸਪਤਾਲ ਜਾਓ ਜਾਂ 108 ਐਂਬੂਲੈਂਸ ਬੁਲਾਓ', time: 'ਐਮਰਜੈਂਸੀ (ਬਿਨਾਂ ਦੇਰੀ)', desc: 'ਇਹ ਗੰਭੀਰ ਸਥਿਤੀ ਹੈ। ਤੁਰੰਤ ਹਸਪਤਾਲ ਜਾਓ।' },
      or: { title: 'ତୁରନ୍ତ ଡାକ୍ତରଖାନା ଯାଆନ୍ତୁ ବା 108 ଡାକନ୍ତୁ', time: 'ଜରୁରୀକାଳୀନ (ବିଳମ୍ବ ନକରି)', desc: 'ଏହା ଗୁରୁତର ସ୍ଥିତି। ତୁରନ୍ତ ଡାକ୍ତରଖାନା ଯାଆନ୍ତୁ।' },
      as: { title: 'ততালিকে চিকিৎসালয়লৈ যাওক বা ১০৮ মাতক', time: 'জৰুৰীকালীন (পলম নকৰিব)', desc: 'এয়া গুৰুতৰ অৱস্থা। ততালিকে জৰুৰীকালীন বিভাগলৈ যাওক।' },
      ur: { title: 'فوری طور پر ہسپتال جائیں یا 108 کال کریں', time: 'ہنگامی صورتحال (بلا تاخیر)', desc: 'یہ نازک حالت ہے۔ فوری طور پر قریبی ہسپتال پہنچیں۔' },
      sa: { title: 'झटिति चिकित्सालयं गच्छतु १०८ वा आह्वयतु', time: 'आत्ययिकी स्थितिः', desc: 'इयं गम्भीरा स्थितिः। अविलम्बं चिकित्सालयं गच्छतु।' },
      mai: { title: 'तुरंत अस्पताल जाउ वा 108 बजाउ', time: 'आपातकालीन स्थिति', desc: 'ई गंभीर स्थिति अछि। बिना देरी अस्पताल जाउ।' },
      kok: { title: 'रोकडेंच हॉस्पिटलांत वचात वा १०८ कॉल करात', time: 'आणीबाणी स्थिती', desc: 'ही गंभीर स्थिती आसा. तातडीन हॉस्पिटलांत वचात.' },
      ne: { title: 'तत्काल अस्पताल जानुहोस् वा १०८ बोलाउनुहोस्', time: 'आपतकालीन अवस्था', desc: 'यो गम्भीर अवस्था हो। ढिलो नगरी अस्पताल जानुहोस्।' },
      en: { title: 'Immediate Hospital Visit or Call 108', time: 'Immediate Emergency (Do Not Delay)', desc: 'Critical condition. Reach the nearest hospital emergency ward immediately or call 108 ambulance.' },
    },
  }

  const currentTier = ACTIONS_MAP[urgency] || ACTIONS_MAP.Moderate
  const langAction = currentTier[language] || currentTier.en || currentTier.hi

  const visualConfig = {
    Mild: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-950',
      badgeBg: 'bg-emerald-600 text-white',
      borderRing: 'ring-2 ring-emerald-500/20',
      icon: Home,
    },
    Moderate: {
      bg: 'bg-amber-50 border-amber-200 text-amber-950',
      badgeBg: 'bg-amber-600 text-white',
      borderRing: 'ring-2 ring-amber-500/20',
      icon: Building2,
    },
    Emergency: {
      bg: 'bg-red-50 border-red-200 text-red-950',
      badgeBg: 'bg-red-600 text-white',
      borderRing: 'ring-2 ring-red-500/20',
      icon: Siren,
    },
  }[urgency] || {
    bg: 'bg-blue-50 border-blue-200 text-blue-950',
    badgeBg: 'bg-blue-600 text-white',
    borderRing: '',
    icon: CheckCircle2,
  }

  const ActionIcon = visualConfig.icon

  return (
    <div className="space-y-3">
      {/* Visual 3-Level Traffic Light Meter */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Urgency Traffic-Light Meter</span>
          </span>
          <span className="text-[11px] font-bold text-slate-800">
            {isMild ? t('triageLevel1') : isMod ? t('triageLevel2') : t('triageLevel3')}
          </span>
        </div>

        {/* 3-Tier Step Bar */}
        <div className="grid grid-cols-3 gap-2">
          {/* Level 1: Mild */}
          <div
            className={`p-2 sm:p-2.5 rounded-xl border text-center transition-all ${
              isMild
                ? 'bg-emerald-500 text-white border-emerald-600 font-extrabold shadow-sm ring-2 ring-emerald-500/30'
                : 'bg-slate-50 text-slate-500 border-slate-200 opacity-60'
            }`}
          >
            <span className="text-[10px] font-mono block opacity-80">LEVEL 1</span>
            <span className="text-xs font-bold block truncate">{t('mild')}</span>
          </div>

          {/* Level 2: Moderate */}
          <div
            className={`p-2 sm:p-2.5 rounded-xl border text-center transition-all ${
              isMod
                ? 'bg-amber-500 text-white border-amber-600 font-extrabold shadow-sm ring-2 ring-amber-500/30'
                : 'bg-slate-50 text-slate-500 border-slate-200 opacity-60'
            }`}
          >
            <span className="text-[10px] font-mono block opacity-80">LEVEL 2</span>
            <span className="text-xs font-bold block truncate">{t('moderate')}</span>
          </div>

          {/* Level 3: Emergency */}
          <div
            className={`p-2 sm:p-2.5 rounded-xl border text-center transition-all ${
              isEm
                ? 'bg-red-600 text-white border-red-700 font-extrabold shadow-sm ring-2 ring-red-500/30 animate-pulse'
                : 'bg-slate-50 text-slate-500 border-slate-200 opacity-60'
            }`}
          >
            <span className="text-[10px] font-mono block opacity-80">LEVEL 3</span>
            <span className="text-xs font-bold block truncate">{t('emergency')}</span>
          </div>
        </div>
      </div>

      {/* Direct Doctor Recommended Action Box */}
      <div className={`p-4 sm:p-5 rounded-2xl border ${visualConfig.bg} ${visualConfig.borderRing} shadow-xs space-y-2`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl ${visualConfig.badgeBg} flex items-center justify-center shrink-0 shadow-2xs`}>
              <ActionIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
                Clinical Recommendation
              </span>
              <h3 className="font-extrabold text-sm sm:text-base leading-snug">
                {langAction.title}
              </h3>
            </div>
          </div>

          <span className={`text-[10px] sm:text-xs font-extrabold px-2.5 py-1 rounded-full ${visualConfig.badgeBg} shadow-2xs whitespace-nowrap`}>
            {langAction.time}
          </span>
        </div>

        <p className="text-xs sm:text-sm leading-relaxed opacity-90 pt-1">
          {langAction.desc}
        </p>
      </div>
    </div>
  )
}
