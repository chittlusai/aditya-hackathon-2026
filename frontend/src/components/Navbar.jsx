import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home,
  Stethoscope,
  MapPin,
  Siren,
  Pill,
  ShieldCheck,
  User,
  Video,
  FileText,
  Menu,
  X,
  Sparkles,
  LogOut,
} from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import LanguageToggle from './LanguageToggle.jsx'

const NAV_I18N = {
  en: {
    home: 'Home',
    check: 'Check Symptoms',
    call: 'WhatsApp Doctor Call',
    map: 'Nearby Hospitals',
    medicines: 'Pills & Medicines',
    history: 'My Records & Slips',
    sos: '108 SOS',
    tagline: 'Rural Health & AI Triage Mesh',
  },
  te: {
    home: 'హోమ్',
    check: 'ఆరోగ్య తనిఖీ',
    call: 'వాట్సాప్ డాక్టర్ కాల్',
    map: 'సమీప ఆసుపత్రులు',
    medicines: 'మందుల షెడ్యూల్',
    history: 'నా రికార్డులు & స్లిప్పులు',
    sos: '108 అత్యవసరం',
    tagline: 'గ్రామీణ ఆరోగ్య & AI తనిఖీ వ్యవస్థ',
  },
  hi: {
    home: 'होम',
    check: 'बीमारी जांच',
    call: 'डॉक्टर वीडियो कॉल',
    map: 'नजदीकी अस्पताल',
    medicines: 'दवाई व गोलियां',
    history: 'मेरी पर्चियां व इतिहास',
    sos: '108 एम्बुलेंस',
    tagline: 'ग्रामीण स्वास्थ्य व AI जांच नेटवर्क',
  },
  ta: {
    home: 'முகப்பு',
    check: 'சுகாதார பரிசோதனை',
    call: 'மருத்துவர் வீடியோ அழைப்பு',
    map: 'அருகிலுள்ள மருத்துவமனைகள்',
    medicines: 'மருந்துகள் & மாத்திரைகள்',
    history: 'எனது பதிவுகள் & சீட்டுகள்',
    sos: '108 அவசர ஊர்தி',
    tagline: 'கிராமப்புற சுகாதாரம் & AI நெட்வொர்க்',
  },
  mr: {
    home: 'मुख्यपृष्ठ',
    check: 'आरोग्य तपासणी',
    call: 'डॉक्टर व्हिडिओ कॉल',
    map: 'जवळची रुग्णालये',
    medicines: 'औषध वेळापत्रक',
    history: 'आरोग्य नोंदी व पर्च्या',
    sos: '108 रुग्णवाहिका',
    tagline: 'ग्रामीण आरोग्य व AI तपासणी नेटवर्क',
  },
  bn: {
    home: 'হোম',
    check: 'স্বাস্থ্য পরীক্ষা',
    call: 'ডাক্তার ভিডিও কল',
    map: 'নিকটবর্তী হাসপাতাল',
    medicines: 'ওষুধ ও পিল ট্র্যাকার',
    history: 'আমার রেকর্ড ও প্রেসক্রিপশন',
    sos: '108 অ্যাম্বুলেন্স',
    tagline: 'গ্রামীণ স্বাস্থ্য ও AI নেটওয়ার্ক',
  },
  kn: {
    home: 'ಮುಖಪುಟ',
    check: 'ಆರೋಗ್ಯ ತಪಾಸಣೆ',
    call: 'ವೈದ್ಯರ ವೀಡಿಯೊ ಕರೆ',
    map: 'ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆಗಳು',
    medicines: 'ಮಾತ್ರೆ ವೇಳಾಪಟ್ಟಿ',
    history: 'ನನ್ನ ದಾಖಲೆಗಳು',
    sos: '108 ತುರ್ತು ಸೇವೆ',
    tagline: 'ಗ್ರಾಮೀಣ ಆರೋಗ್ಯ & AI ನೆಟ್‌ವರ್ಕ್',
  },
  gu: {
    home: 'હોમ',
    check: 'સ્વાસ્થ્ય તપાસ',
    call: 'ડૉક્ટર વિડિઓ કૉલ',
    map: 'નજીકની હોસ્પિટલો',
    medicines: 'દવાઓનું સમયપત્રક',
    history: 'મારા રેકોર્ડ્સ અને ચિઠ્ઠી',
    sos: '108 એમ્બ્યુલન્સ',
    tagline: 'ગ્રામીણ આરોગ્ય & AI નેટવર્ક',
  },
  ml: {
    home: 'ഹോം',
    check: 'ആരോഗ്യ പരിശോധന',
    call: 'ഡോക്ടർ വീഡിയോ കോൾ',
    map: 'അടുത്തുള്ള ആശുപത്രികൾ',
    medicines: 'മരുന്ന് ഷെഡ്യൂൾ',
    history: 'എന്റെ റെക്കോർഡുകൾ',
    sos: '108 ആംബുലൻസ്',
    tagline: 'ഗ്രാമീണ ആരോഗ്യം & AI നെറ്റ്‌വർക്ക്',
  },
}

export default function Navbar() {
  const {
    screen,
    go,
    setSosOpen,
    language,
    t,
    currentUser,
    setAuthModalOpen,
    startVideoCall,
    logoutUser,
  } = useApp()

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const navRef = useRef(null)

  const langKey = language || 'en'
  const text = NAV_I18N[langKey] || NAV_I18N.en

  // Close drawer on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setMobileDrawerOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const closeDrawer = () => {
    setMobileDrawerOpen(false)
  }

  // Mobile Bottom Navigation Bar Items (Thumb Friendly)
  const mobileNavItems = [
    { key: 'home', label: text.home, icon: Home, action: () => go('home') },
    { key: 'check', label: text.check, icon: Stethoscope, action: () => go('check') },
    { key: 'map', label: text.map, icon: MapPin, action: () => go('map') },
    { key: 'medicines', label: text.medicines, icon: Pill, action: () => go('medicines') },
    { key: 'history', label: text.history, icon: FileText, action: () => go('history') },
  ]

  return (
    <>
      {/* Top Banner Ribbon */}
      <div className="h-[2.5px] w-full grid grid-cols-3">
        <div className="bg-[#FF9933]" />
        <div className="bg-slate-100" />
        <div className="bg-[#138808]" />
      </div>

      {/* Main Header Bar */}
      <header ref={navRef} className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
          {/* 1. Left: Brand Logo & Title (Clean - Zero Box Border) */}
          <button
            type="button"
            onClick={() => {
              closeDrawer()
              go('home')
            }}
            className="tap-press flex items-center gap-2.5 text-left shrink-0 group min-w-0"
          >
            <img
              src="/logo.png"
              alt="Arogya Setu Logo"
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain rounded-xl group-hover:scale-105 transition-transform shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight leading-none truncate">
                <span className="inline sm:hidden">Arogya Setu</span>
                <span className="hidden sm:inline">{t('appName')}</span>
              </span>
              <span className="text-[9px] sm:text-[10px] text-blue-600 font-bold tracking-wide uppercase mt-0.5 hidden sm:inline truncate">
                {text.tagline}
              </span>
            </div>
          </button>

          {/* 2. Center: Desktop Navigation Menu */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              type="button"
              onClick={() => go('home')}
              className={`tap-press px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                screen === 'home'
                  ? 'bg-blue-50 text-blue-700 font-extrabold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>{text.home}</span>
            </button>

            <button
              type="button"
              onClick={() => go('check')}
              className={`tap-press px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                screen === 'check'
                  ? 'bg-blue-50 text-blue-700 font-extrabold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
              <span>{text.check}</span>
            </button>

            <button
              type="button"
              onClick={() => startVideoCall()}
              className="tap-press px-3 py-2 rounded-xl text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition-all flex items-center gap-1.5"
            >
              <Video className="w-3.5 h-3.5 text-emerald-600" />
              <span>{text.call}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </button>

            <button
              type="button"
              onClick={() => go('map')}
              className={`tap-press px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                screen === 'map'
                  ? 'bg-blue-50 text-blue-700 font-extrabold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>{text.map}</span>
            </button>

            <button
              type="button"
              onClick={() => go('medicines')}
              className={`tap-press px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                screen === 'medicines'
                  ? 'bg-blue-50 text-blue-700 font-extrabold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Pill className="w-3.5 h-3.5 text-amber-600" />
              <span>{text.medicines}</span>
            </button>

            <button
              type="button"
              onClick={() => go('history')}
              className={`tap-press px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                screen === 'history'
                  ? 'bg-blue-50 text-blue-700 font-extrabold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-teal-600" />
              <span>{text.history}</span>
            </button>
          </nav>

          {/* 3. Right: SOS Emergency Button, Language & Citizen Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* 108 SOS Button */}
            <button
              type="button"
              onClick={() => setSosOpen(true)}
              className="tap-press px-2.5 sm:px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-extrabold text-xs shadow-md shadow-red-500/20 flex items-center gap-1.5 transition-all"
            >
              <Siren className="w-3.5 h-3.5 animate-pulse" />
              <span>{text.sos}</span>
            </button>

            {/* Language Switcher */}
            <LanguageToggle />

            {/* Citizen Profile Button */}
            {currentUser && (
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="tap-press hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all border border-slate-200"
                title="Edit Citizen Profile"
              >
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {currentUser.name?.charAt(0) || 'U'}
                </div>
                <span className="truncate max-w-[100px]">{currentUser.name || 'Citizen'}</span>
              </button>
            )}

            {/* Mobile Hamburger Drawer Toggle */}
            <button
              type="button"
              onClick={() => setMobileDrawerOpen((prev) => !prev)}
              className="tap-press lg:hidden p-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
              aria-label="Toggle Navigation Menu"
            >
              {mobileDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Menu Drawer */}
        <AnimatePresence>
          {mobileDrawerOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden bg-white border-b border-slate-200 p-3 space-y-2 overflow-hidden shadow-lg"
            >
              <button
                type="button"
                onClick={() => { closeDrawer(); go('home') }}
                className="tap-press w-full text-left p-2.5 rounded-xl hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center gap-2"
              >
                <Home className="w-4 h-4 text-blue-600" />
                <span>{text.home}</span>
              </button>

              <button
                type="button"
                onClick={() => { closeDrawer(); go('check') }}
                className="tap-press w-full text-left p-2.5 rounded-xl hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center gap-2"
              >
                <Stethoscope className="w-4 h-4 text-blue-600" />
                <span>{text.check}</span>
              </button>

              <button
                type="button"
                onClick={() => { closeDrawer(); startVideoCall() }}
                className="tap-press w-full text-left p-2.5 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs flex items-center gap-2"
              >
                <Video className="w-4 h-4 text-emerald-600" />
                <span>{text.call}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-auto" />
              </button>

              <button
                type="button"
                onClick={() => { closeDrawer(); go('map') }}
                className="tap-press w-full text-left p-2.5 rounded-xl hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center gap-2"
              >
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>{text.map}</span>
              </button>

              <button
                type="button"
                onClick={() => { closeDrawer(); go('medicines') }}
                className="tap-press w-full text-left p-2.5 rounded-xl hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center gap-2"
              >
                <Pill className="w-4 h-4 text-amber-600" />
                <span>{text.medicines}</span>
              </button>

              <button
                type="button"
                onClick={() => { closeDrawer(); go('history') }}
                className="tap-press w-full text-left p-2.5 rounded-xl hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-teal-600" />
                <span>{text.history}</span>
              </button>

              <button
                type="button"
                onClick={() => { closeDrawer(); setAuthModalOpen(true) }}
                className="tap-press w-full text-left p-2.5 rounded-xl bg-blue-50 text-blue-900 font-bold text-xs flex items-center gap-2 border-t border-slate-100"
              >
                <User className="w-4 h-4 text-blue-600" />
                <span>{currentUser?.name || 'Citizen'} (Profile)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  closeDrawer()
                  if (window.confirm('Are you sure you want to log out of your citizen account?')) {
                    logoutUser()
                  }
                }}
                className="tap-press w-full text-left p-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs flex items-center gap-2 border border-red-200/60"
              >
                <LogOut className="w-4 h-4 text-red-600" />
                <span>Logout (నిష్క్రమించండి)</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 shadow-lg flex items-center justify-around">
        {mobileNavItems.map((item) => {
          const Icon = item.icon
          const isActive = screen === item.key
          return (
            <button
              key={item.key}
              type="button"
              onClick={item.action}
              className={`tap-press flex flex-col items-center justify-center p-1 rounded-xl min-w-[58px] transition-all ${
                isActive ? 'text-blue-600 font-extrabold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-blue-600' : ''}`} />
              <span className="text-[10px] mt-0.5 truncate max-w-[70px]">{item.label}</span>
            </button>
          )
        })}
      </div>
    </>
  )
}
