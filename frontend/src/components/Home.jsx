import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Stethoscope,
  Building2,
  Phone,
  Sparkles,
  MapPin,
  ShieldCheck,
  Clock,
  ArrowRight,
  Pill,
  Siren,
  FileText,
  Video,
  Navigation,
  CheckCircle2,
  Calendar,
  HeartPulse,
} from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import VisualSymptomSelector from './VisualSymptomSelector.jsx'

// Full comprehensive multilingual translations for Home Dashboard
const HOME_I18N = {
  en: {
    welcome: 'Welcome back',
    verified: 'ABDM Verified',
    gpsActive: 'GPS Radar Active',
    triageTag: '⚡ 10ms Offline AI',
    triageTitle: 'Check Symptoms & Health Triage',
    triageSub: 'Tap interactive body parts or speak in 17 Indian languages for zero-delay triage & PHC matching.',
    triageBtn: 'Start Symptom Check',
    doctorLive: 'Live Doctor Available',
    doctorTitle: 'WhatsApp Doctor Video Call',
    doctorSub: 'Live teleconsultation with Dr. Rajesh Sharma featuring Gemini AI Face/Pain HUD and ElevenLabs real doctor voice.',
    doctorBtn: 'Start Video Call Now',
    hospitalsTag: 'GPS Radar',
    hospitalsCount: 'Facilities Near You',
    hospitalsTitle: 'Nearby PHC & CHC Hospitals',
    hospitalsSub: 'Check driving distances, on-duty doctors, ICU beds & oxygen availability.',
    hospitalsBtn: 'View Hospital Radar & Live Map →',
    medicinesTag: 'Daily Schedule',
    medicinesSlot: 'Morning • Afternoon • Night',
    medicinesTitle: 'Daily Pill Tracker & Medicines',
    medicinesSub: 'Organizes tablets with food instructions, exact timings & clinical purpose.',
    medicinesBtn: 'Check Pill Timings & Stock →',
  },
  te: {
    welcome: 'నమస్కారం',
    verified: 'ABDM ధృవీకరించబడింది',
    gpsActive: 'GPS రాడార్ సక్రియం',
    triageTag: '⚡ 10ms ఆఫ్‌లైన్ AI',
    triageTitle: 'లక్షణాలు & ఆరోగ్య పరీక్ష',
    triageSub: 'శరీర భాగాలపై నొక్కి లేదా మీ సొంత భాషలో మాట్లాడి తక్షణ వైద్య సలహా & ఆసుపత్రి మార్గం పొందండి.',
    triageBtn: 'ఆరోగ్య పరీక్ష ప్రారంభించండి',
    doctorLive: 'డాక్టర్ అందుబాటులో ఉన్నారు',
    doctorTitle: 'వాట్సాప్ డాక్టర్ వీడియో కాల్',
    doctorSub: 'డాక్టర్ రాజేష్ శర్మతో మాట్లాడండి — ముఖ కవళికల AI స్కాన్ & సహజమైన తెలుగు వాయిస్ సలహా.',
    doctorBtn: 'వీడియో కాల్ ప్రారంభించండి',
    hospitalsTag: 'GPS రాడార్',
    hospitalsCount: 'సమీప కేంద్రాలు',
    hospitalsTitle: 'సమీప ప్రాథమిక ఆరోగ్య కేంద్రాలు (PHC)',
    hospitalsSub: 'ఖచ్చితమైన దూరం, డ్యూటీలో ఉన్న డాక్టర్లు, ICU పడకలు & ఆక్సిజన్ లభ్యతను చూడండి.',
    hospitalsBtn: 'ఆసుపత్రుల మ్యాప్ & దూరం చూడండి →',
    medicinesTag: 'రోజువారీ షెడ్యూల్',
    medicinesSlot: 'ఉదయం • మధ్యాహ్నం • రాత్రి',
    medicinesTitle: 'రోజువారీ మందుల షెడ్యూల్ & మాత్రలు',
    medicinesSub: 'ఉదయం 08:00 AM, మధ్యాహ్నం 01:30 PM, రాత్రి 08:30 PM ఆహార సూచనలు & మందుల ఉపయోగం.',
    medicinesBtn: 'మందుల సమయాలు & నిల్వ చూడండి →',
  },
  hi: {
    welcome: 'नमस्ते',
    verified: 'ABDM सत्यापित',
    gpsActive: 'GPS रडार सक्रिय',
    triageTag: '⚡ 10ms ऑफलाइन AI',
    triageTitle: 'बीमारी व लक्षणों की जांच करें',
    triageSub: 'चित्रों पर टच करके या अपनी भाषा में बोलकर बीमारी की गंभीरता और सही अस्पताल जानें।',
    triageBtn: 'जांच शुरू करें',
    doctorLive: 'डॉक्टर उपलब्ध हैं',
    doctorTitle: 'डॉक्टर वीडियो कॉल (WhatsApp)',
    doctorSub: 'डॉ. राजेश शर्मा से लाइव बात करें — चेहरे के दर्द का AI विश्लेषण व वास्तविक आवाज़ में परामर्श।',
    doctorBtn: 'कॉल शुरू करें',
    hospitalsTag: 'GPS रडार',
    hospitalsCount: 'नजदीकी केंद्र',
    hospitalsTitle: 'नजदीकी सरकारी स्वास्थ्य केंद्र (PHC/CHC)',
    hospitalsSub: 'सटीक दूरी, उपस्थित डॉक्टर, आपातकालीन बेड्स व ऑक्सीजन की उपलब्धता देखें।',
    hospitalsBtn: 'अस्पताल व नक्शा देखें →',
    medicinesTag: 'दैनिक तालिका',
    medicinesSlot: 'सुबह • दोपहर • रात',
    medicinesTitle: 'दैनिक दवाई तालिका व गोली ट्रैकर',
    medicinesSub: 'सुबह (08:00 AM), दोपहर (01:30 PM), रात (08:30 PM) भोजन के साथ समय व उपयोग।',
    medicinesBtn: 'दवाई समय व स्टॉक देखें →',
  },
  ta: {
    welcome: 'வணக்கம்',
    verified: 'ABDM சரிபார்க்கப்பட்டது',
    gpsActive: 'GPS ரேடார் இயங்குகிறது',
    triageTag: '⚡ 10ms ஆஃப்லைன் AI',
    triageTitle: 'அறிகுறிகள் & சுகாதார பரிசோதனை',
    triageSub: 'படங்களைத் தொட்டு அல்லது உங்கள் மொழியில் பேசி நோயின் தீவிரத்தை உடனடியாக சோதிக்கவும்.',
    triageBtn: 'பரிசோதனையைத் தொடங்கு',
    doctorLive: 'மருத்துவர் தயார்',
    doctorTitle: 'வாட்ஸ்அப் மருத்துவர் வீடியோ அழைப்பு',
    doctorSub: 'டாக்டர் ராஜேஷ் சர்மாவுடன் நேரடி ஆலோசனை — AI முகம் ஸ்கேன் & தமிழ் குரல் வழிகாட்டல்.',
    doctorBtn: 'வீடியோ அழைப்பைத் தொடங்கு',
    hospitalsTag: 'GPS ரேடார்',
    hospitalsCount: 'அருகிலுள்ள மையங்கள்',
    hospitalsTitle: 'அருகிலுள்ள ஆரம்ப சுகாதார நிலையங்கள் (PHC)',
    hospitalsSub: 'நேரடி தூரம், பணியில் உள்ள மருத்துவர்கள், படுக்கைகள் & ஆக்ஸிஜன் இருப்பு.',
    hospitalsBtn: 'மருத்துவமனை வரைபடம் காண்க →',
    medicinesTag: 'தினசரி அட்டவணை',
    medicinesSlot: 'காலை • மதியம் • இரவு',
    medicinesTitle: 'தினசரி மாத்திரை அட்டவணை & மருந்துகள்',
    medicinesSub: 'காலை 08:00 AM, மதியம் 01:30 PM, இரவு 08:30 PM உணவு குறிப்புகளுடன்.',
    medicinesBtn: 'மருந்து நேரங்களை சரிபார்க்கவும் →',
  },
  mr: {
    welcome: 'नमस्ते',
    verified: 'ABDM पडताळणी झाली',
    gpsActive: 'GPS रडार सक्रिय',
    triageTag: '⚡ 10ms ऑफलाइन AI',
    triageTitle: 'लक्षणे व आरोग्य तपासणी',
    triageSub: 'चित्रांवर क्लिक करून किंवा बोलून आजाराची तपासणी करा आणि जवळच्या आरोग्य केंद्राचा मार्ग मिळवा.',
    triageBtn: 'आरोग्य तपासणी सुरू करा',
    doctorLive: 'डॉक्टर उपलब्ध आहेत',
    doctorTitle: 'डॉक्टर व्हिडिओ कॉल (WhatsApp)',
    doctorSub: 'डॉ. राजेश शर्मा यांच्याशी थेट संपर्क — AI चेहरे विश्लेषण व अस्सल मराठी आवाजात सल्ला.',
    doctorBtn: 'व्हिडिओ कॉल सुरू करा',
    hospitalsTag: 'GPS रडार',
    hospitalsCount: 'जवळची केंद्रे',
    hospitalsTitle: 'जवळची प्राथमिक आरोग्य केंद्रे (PHC)',
    hospitalsSub: 'थेट अंतर, उपस्थित डॉक्टर, ICU बेड्स आणि ऑक्सिजन उपलब्धता तपासा.',
    hospitalsBtn: 'रुग्णालय नकाशा पहा →',
    medicinesTag: 'दैनिक वेळापत्रक',
    medicinesSlot: 'सकाळी • दुपारी • रात्री',
    medicinesTitle: 'दैनिक औषध वेळापत्रक व गोळ्या',
    medicinesSub: 'सकाळी 08:00 AM, दुपारी 01:30 PM, रात्री 08:30 PM आहाराच्या सूचनांसह.',
    medicinesBtn: 'औषध वेळापत्रक पहा →',
  },
  bn: {
    welcome: 'নমস্কার',
    verified: 'ABDM যাচাইকৃত',
    gpsActive: 'GPS রাডার সক্রিয়',
    triageTag: '⚡ 10ms অফলাইন AI',
    triageTitle: 'লক্ষণ ও স্বাস্থ্য মূল্যায়ন',
    triageSub: 'ছবিতে স্পর্শ করে বা কথা বলে আপনার রোগের তীব্রতা পরীক্ষা করুন এবং হাসপাতালে পৌঁছান।',
    triageBtn: 'স্বাস্থ্য পরীক্ষা শুরু করুন',
    doctorLive: 'ডাক্তার উপলব্ধ আছেন',
    doctorTitle: 'হোয়াটসঅ্যাপ ডাক্তার ভিডিও কল',
    doctorSub: 'ডাঃ রাজেশ শর্মার সাথে সরাসরি পরামর্শ — AI মুখমণ্ডল স্ক্যান এবং বাস্তব বাংলা কণ্ঠে পরামর্শ।',
    doctorBtn: 'ভিডিও কল শুরু করুন',
    hospitalsTag: 'GPS রাডার',
    hospitalsCount: 'নিকটবর্তী কেন্দ্র',
    hospitalsTitle: 'নিকটবর্তী প্রাথমিক স্বাস্থ্য কেন্দ্র (PHC)',
    hospitalsSub: 'সরাসরি দূরত্ব, উপস্থিত ডাক্তার, বেড এবং অক্সিজেন প্রাপ্যতা দেখুন।',
    hospitalsBtn: 'হাসপাতালের মানচিত্র দেখুন →',
    medicinesTag: 'দৈনিক সময়সূচী',
    medicinesSlot: 'সকাল • দুপুর • রাত',
    medicinesTitle: 'দৈনিক ওষুধ ও পিল ট্র্যাকার',
    medicinesSub: 'সকাল 08:00 AM, দুপুর 01:30 PM, রাত 08:30 PM খাবারের নির্দেশিকা সহ।',
    medicinesBtn: 'ওষুধের সময়সূচী দেখুন →',
  },
  kn: {
    welcome: 'ನಮಸ್ಕಾರ',
    verified: 'ABDM ಪರಿಶೀಲಿಸಲಾಗಿದೆ',
    gpsActive: 'GPS ರೇಡಾರ್ ಸಕ್ರಿಯ',
    triageTag: '⚡ 10ms ಆಫ್‌ಲೈನ್ AI',
    triageTitle: 'ರೋಗಲಕ್ಷಣಗಳು ಮತ್ತು ಆರೋಗ್ಯ ತಪಾಸಣೆ',
    triageSub: 'ಚಿತ್ರಗಳನ್ನು ಸ್ಪರ್ಶಿಸಿ ಅಥವಾ ಮಾತನಾಡಿ ನಿಮ್ಮ ಆರೋಗ್ಯ ತಪಾಸಣೆ ಮಾಡಿ ಮತ್ತು ಆಸ್ಪತ್ರೆ ತಲುಪಿ.',
    triageBtn: 'ತಪಾಸಣೆ ಪ್ರಾರಂಭಿಸಿ',
    doctorLive: 'ವೈದ್ಯರು ಲಭ್ಯವಿದ್ದಾರೆ',
    doctorTitle: 'ವಾಟ್ಸಾಪ್ ವೈದ್ಯರ ವೀಡಿಯೊ ಕರೆ',
    doctorSub: 'ಡಾ. ರಾಜೇಶ್ ಶರ್ಮಾ ಅವರೊಂದಿಗೆ ನೇರ ಸಮಾಲೋಚನೆ — AI ಮುಖ ಸ್ಕ್ಯಾನ್ ಮತ್ತು ಧ್ವನಿ ಸಲಹೆ.',
    doctorBtn: 'ವೀಡಿಯೊ ಕರೆ ಪ್ರಾರಂಭಿಸಿ',
    hospitalsTag: 'GPS ರೇಡಾರ್',
    hospitalsCount: 'ಹತ್ತಿರದ ಕೇಂದ್ರಗಳು',
    hospitalsTitle: 'ಹತ್ತಿರದ ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಕೇಂದ್ರಗಳು (PHC)',
    hospitalsSub: 'ಲೈವ್ ದೂರ, ಲಭ್ಯವಿರುವ ವೈದ್ಯರು, ಹಾಸಿಗೆಗಳು ಮತ್ತು ಆಮ್ಲಜನಕ ಪರಿಶೀಲಿಸಿ.',
    hospitalsBtn: 'ಆಸ್ಪತ್ರೆ ನಕ್ಷೆ ವೀಕ್ಷಿಸಿ →',
    medicinesTag: 'ದೈನಂದಿನ ವೇಳಾಪಟ್ಟಿ',
    medicinesSlot: 'ಬೆಳಿಗ್ಗೆ • ಮಧ್ಯಾಹ್ನ • ರಾತ್ರಿ',
    medicinesTitle: 'ದೈನಂದಿನ ಮಾತ್ರೆ ವೇಳಾಪಟ್ಟಿ ಮತ್ತು ಔಷಧಗಳು',
    medicinesSub: 'ಬೆಳಿಗ್ಗೆ 08:00 AM, ಮಧ್ಯಾಹ್ನ 01:30 PM, ರಾತ್ರಿ 08:30 PM ಆಹಾರದ ಸೂಚನೆಗಳೊಂದಿಗೆ.',
    medicinesBtn: 'ಔಷಧ ವೇಳಾಪಟ್ಟಿ ವೀಕ್ಷಿಸಿ →',
  },
  gu: {
    welcome: 'નમસ્તે',
    verified: 'ABDM ચકાસાયેલ',
    gpsActive: 'GPS રડાર સક્રિય',
    triageTag: '⚡ 10ms ઑફલાઇન AI',
    triageTitle: 'લક્ષણો અને સ્વાસ્થ્ય તપાસ',
    triageSub: 'ચિત્રો પર ક્લિક કરીને અથવા બોલીને બીમારીની તપાસ કરો અને નજીકના આરોગ્ય કેન્દ્ર પહોંચો.',
    triageBtn: 'તપાસ શરૂ કરો',
    doctorLive: 'ડૉક્ટર ઉપલબ્ધ છે',
    doctorTitle: 'ડૉક્ટર વિડિઓ કૉલ (WhatsApp)',
    doctorSub: 'ડૉ. રાજેશ શર્મા સાથે લાઈવ વાતચીત — AI ચહેરા સ્કેન અને ગુજરાતી અવાજમાં સલાહ.',
    doctorBtn: 'વિડિઓ કૉલ શરૂ કરો',
    hospitalsTag: 'GPS રડાર',
    hospitalsCount: 'નજીકના કેન્દ્રો',
    hospitalsTitle: 'નજીકના પ્રાથમિક આરોગ્ય કેન્દ્રો (PHC)',
    hospitalsSub: 'ચોક્કસ અંતર, ફરજ પરના ડૉક્ટરો, પથારી અને ઓક્સિજનની સ્થિતિ જુઓ.',
    hospitalsBtn: 'હોસ્પિટલ નકશો જુઓ →',
    medicinesTag: 'દૈનિક સમયપત્રક',
    medicinesSlot: 'સવારે • બપોરે • રાત્રે',
    medicinesTitle: 'દૈનિક દવાઓ અને ગોળીઓનું સમયપત્રક',
    medicinesSub: 'સવારે 08:00 AM, બપોરે 01:30 PM, રાત્રે 08:30 PM જમવાના નિયમો સાથે.',
    medicinesBtn: 'દવાનો સમય જુઓ →',
  },
  ml: {
    welcome: 'നമസ്കാരം',
    verified: 'ABDM സ്ഥിരീകരിച്ചു',
    gpsActive: 'GPS റഡാർ സജീവം',
    triageTag: '⚡ 10ms ഓഫ്‌ലൈൻ AI',
    triageTitle: 'ലക്ഷണങ്ങളും ആരോഗ്യ പരിശോധനയും',
    triageSub: 'ചിത്രങ്ങളിൽ തൊട്ടോ സംസാരിച്ചോ ആരോഗ്യ പരിശോധന നടത്തി അടുത്തുള്ള ആശുപത്രി കണ്ടെത്തുക.',
    triageBtn: 'പരിശോധന ആരംഭിക്കുക',
    doctorLive: 'ഡോക്ടർ ലഭ്യമാണ്',
    doctorTitle: 'വാട്സാപ്പ് ഡോക്ടർ വീഡിയോ കോൾ',
    doctorSub: 'ഡോ. രാജേഷ് ശർമ്മയുമായി തത്സമയ കൺസൾട്ടേഷൻ — AI മുഖം സ്കാൻ & ശബ്ദ ഉപദേശം.',
    doctorBtn: 'വീഡിയോ കോൾ ആരംഭിക്കുക',
    hospitalsTag: 'GPS റഡാർ',
    hospitalsCount: 'അടുത്തുള്ള കേന്ദ്രങ്ങൾ',
    hospitalsTitle: 'അടുത്തുള്ള പ്രാഥമിക ആരോഗ്യ കേന്ദ്രങ്ങൾ (PHC)',
    hospitalsSub: 'തത്സമയ ദൂരം, ഡ്യൂട്ടിയിലുള്ള ഡോക്ടർമാർ, കിടക്കകൾ എന്നിവ പരിശോധിക്കുക.',
    hospitalsBtn: 'ആശുപത്രി മാപ്പ് കാണുക →',
    medicinesTag: 'ദിവസേനയുള്ള ഷെഡ്യൂൾ',
    medicinesSlot: 'രാവിലെ • ഉച്ചയ്ക്ക് • രാത്രി',
    medicinesTitle: 'ദിവസേനയുള്ള മരുന്ന് ഷെഡ്യൂൾ',
    medicinesSub: 'രാവിലെ 08:00 AM, ഉച്ചയ്ക്ക് 01:30 PM, രാത്രി 08:30 PM ഭക്ഷണ നിർദ്ദേശങ്ങളോടെ.',
    medicinesBtn: 'മരുന്ന് സമയം പരിശോധിക്കുക →',
  },
}

export default function Home() {
  const {
    go,
    setSosOpen,
    t,
    language,
    hospitals,
    currentUser,
    userCoords,
    setGpsModalOpen,
    startVideoCall,
  } = useApp()

  const langKey = language || 'en'
  const text = HOME_I18N[langKey] || HOME_I18N.en

  const handleVisualSelect = () => {
    go('check')
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6">
      {/* 1. Modern Citizen Welcome & Status Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-blue-500/20 shrink-0">
            {currentUser?.name?.charAt(0) || 'R'}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                {text.welcome},
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {text.verified}
              </span>
            </div>
            <h1 className="text-base sm:text-xl font-extrabold text-slate-900 truncate">
              {currentUser?.name || 'Ramesh Kumar'}
            </h1>
          </div>
        </div>

        {/* GPS Location & Emergency SOS Quick Actions */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setGpsModalOpen(true)}
            className="tap-press flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 px-3 py-2 rounded-2xl border border-slate-200 transition-all"
          >
            <Navigation className="w-3.5 h-3.5 text-blue-600" />
            <span className="truncate max-w-[130px] sm:max-w-none">{userCoords?.label || text.gpsActive}</span>
          </button>

          <button
            type="button"
            onClick={() => setSosOpen(true)}
            className="tap-press inline-flex items-center justify-center gap-1.5 text-xs font-extrabold bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 rounded-2xl shadow-md shadow-red-500/25 transition-all"
          >
            <Siren className="w-3.5 h-3.5 animate-pulse" />
            <span>108 SOS</span>
          </button>
        </div>
      </motion.div>

      {/* 2. Flagship Interactive Feature Cards (2 Hero Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* HERO CARD 1: AI Health Triage & Body Map */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative rounded-3xl p-5 sm:p-7 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white shadow-xl shadow-blue-600/15 overflow-hidden flex flex-col justify-between group"
        >
          {/* Subtle Background Art */}
          <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />

          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-inner">
                <Stethoscope className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 text-white px-2.5 py-1 rounded-full border border-white/25">
                {text.triageTag}
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-tight">
                {text.triageTitle}
              </h2>
              <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed mt-1">
                {text.triageSub}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => go('check')}
            className="tap-press mt-5 w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-blue-50 text-blue-900 font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 transition-all relative z-10"
          >
            <span>{text.triageBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>

        {/* HERO CARD 2: WhatsApp Doctor Video Consultation */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative rounded-3xl p-5 sm:p-7 bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 text-white shadow-xl shadow-emerald-600/15 overflow-hidden flex flex-col justify-between group"
        >
          {/* Subtle Background Art */}
          <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-emerald-400/15 blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />

          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-inner">
                <Video className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/30 text-emerald-200 px-2.5 py-1 rounded-full border border-emerald-400/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {text.doctorLive}
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-tight">
                {text.doctorTitle}
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed mt-1">
                {text.doctorSub}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => startVideoCall()}
            className="tap-press mt-5 w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-950 font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 transition-all relative z-10"
          >
            <span>{text.doctorBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>

      {/* 3. Secondary Bento Grid (Nearby Hospitals & Pill Tracker) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card 3: Nearby Hospitals & Live GPS Map */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-300 transition-all group"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                  {text.hospitalsTag}
                </span>
                <span className="text-[10px] font-bold text-slate-500">
                  {hospitals?.length || 18} {text.hospitalsCount}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mt-1">
                {text.hospitalsTitle}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {text.hospitalsSub}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => go('map')}
            className="tap-press w-full py-2.5 px-3.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-800 hover:text-blue-700 font-bold text-xs border border-slate-200 transition-all flex items-center justify-center gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5 text-teal-600" />
            <span>{text.hospitalsBtn}</span>
          </button>
        </motion.div>

        {/* Card 4: Daily Pill Tracker & Medicine Timings */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-300 transition-all group"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                  {text.medicinesTag}
                </span>
                <span className="text-[10px] font-bold text-slate-500">
                  {text.medicinesSlot}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mt-1">
                {text.medicinesTitle}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {text.medicinesSub}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => go('medicines')}
            className="tap-press w-full py-2.5 px-3.5 rounded-xl bg-slate-50 hover:bg-amber-50 text-slate-800 hover:text-amber-800 font-bold text-xs border border-slate-200 transition-all flex items-center justify-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>{text.medicinesBtn}</span>
          </button>
        </motion.div>
      </div>

      {/* 4. Visual 1-Tap Body Symptoms Selector */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-7 shadow-xs"
      >
        <VisualSymptomSelector onSelectSymptom={handleVisualSelect} selectedSymptoms={[]} />
      </motion.div>
    </div>
  )
}
