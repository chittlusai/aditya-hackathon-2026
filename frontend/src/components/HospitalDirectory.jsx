import { useState, useMemo } from 'react'
import { MapPin, Navigation, Search, Filter, ShieldCheck, Phone, CheckCircle2, AlertTriangle, Building2, Stethoscope, Bed, Pill } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import HospitalMap from './HospitalMap.jsx'
import HospitalCard from './HospitalCard.jsx'

const DIRECTORY_I18N = {
  en: {
    verifiedTag: 'Verified Facilities Online',
    directoryTitle: 'Verified Nearby Health Centres Directory',
    directorySub: 'Government Primary Health Centres (PHC), Community Centres (CHC), and District Hospitals anchored to live GPS.',
    gpsButton: 'Live High-Accuracy GPS',
    mapSectionTitle: 'Interactive Proximity Map',
    showingCentres: 'Showing centres near your live GPS coordinates',
    searchPlaceholder: 'Search by hospital name, address, village, or specialty…',
    availableText: 'Available Facilities',
    chipAll: 'All Centres',
    chipEmergency: '🚨 Emergency / ICU',
    chipGovt: '🏛️ Govt PHC / CHC',
    chipDoctors: '👨‍⚕️ Doctors on Duty',
    chipMedicine: '💊 Medicine In Stock',
  },
  te: {
    verifiedTag: 'ధృవీకరించబడిన ఆరోగ్య కేంద్రాలు',
    directoryTitle: 'సమీప ప్రభుత్వ ఆరోగ్య కేంద్రాల డైరెక్టరీ',
    directorySub: 'మీ లైవ్ GPS ఆధారంగా లెక్కించబడిన ప్రాథమిక ఆరోగ్య కేంద్రాలు (PHC), కమ్యూనిటీ కేంద్రాలు (CHC) & జిల్లా ఆసుపత్రులు.',
    gpsButton: 'లైవ్ GPS లొకేషన్',
    mapSectionTitle: 'ఇంటరాక్టివ్ సమీప ఆసుపత్రుల మ్యాప్',
    showingCentres: 'మీ సమీపంలో అందుబాటులో ఉన్న కేంద్రాలు',
    searchPlaceholder: 'ఆసుపత్రి పేరు, ఊరు, చిరునామా లేదా స్పెషలిస్ట్ శోధించండి…',
    availableText: 'కేంద్రాలు అందుబాటులో ఉన్నాయి',
    chipAll: 'అన్ని కేంద్రాలు',
    chipEmergency: '🚨 అత్యవసరం / ICU',
    chipGovt: '🏛️ ప్రభుత్వ PHC / CHC',
    chipDoctors: '👨‍⚕️ డాక్టర్లు అందుబాటులో ఉన్నారు',
    chipMedicine: '💊 మందుల నిల్వ ఉంది',
  },
  hi: {
    verifiedTag: 'सत्यापित स्वास्थ्य केंद्र उपलब्ध',
    directoryTitle: 'निकटतम सरकारी स्वास्थ्य केंद्र निर्देशिका',
    directorySub: 'लाइव GPS के आधार पर प्राथमिक स्वास्थ्य केंद्र (PHC), सामुदायिक केंद्र (CHC) व जिला अस्पताल।',
    gpsButton: 'सटीक GPS लोकेशन',
    mapSectionTitle: 'इंटरैक्टिव नजदीकी अस्पताल नक्शा',
    showingCentres: 'आपके नजदीकी स्वास्थ्य केंद्र',
    searchPlaceholder: 'अस्पताल का नाम, पता, गांव या विशेषज्ञ खोजें…',
    availableText: 'उपलब्ध स्वास्थ्य केंद्र',
    chipAll: 'सभी केंद्र',
    chipEmergency: '🚨 आपातकालीन / ICU',
    chipGovt: '🏛️ सरकारी PHC / CHC',
    chipDoctors: '👨‍⚕️ डॉक्टर उपस्थित',
    chipMedicine: '💊 दवाई स्टॉक उपलब्ध',
  },
  ta: {
    verifiedTag: 'சரிபார்க்கப்பட்ட மையங்கள்',
    directoryTitle: 'அருகிலுள்ள அரசு சுகாதார நிலையங்கள்',
    directorySub: 'நேரடி GPS அடிப்படையிலான ஆரம்ப சுகாதார நிலையங்கள் (PHC) மற்றும் அரசு மருத்துவமனைகள்.',
    gpsButton: 'நேரடி GPS இருப்பிடம்',
    mapSectionTitle: 'அருகிலுள்ள மருத்துவமனை வரைபடம்',
    showingCentres: 'அருகிலுள்ள மையங்கள்',
    searchPlaceholder: 'மருத்துவமனை பெயர் அல்லது முகவரியைத் தேடுங்கள்…',
    availableText: 'மையங்கள் உள்ளன',
    chipAll: 'அனைத்து மையங்கள்',
    chipEmergency: '🚨 அவசர சிகிச்சை / ICU',
    chipGovt: '🏛️ அரசு PHC / CHC',
    chipDoctors: '👨‍⚕️ மருத்துவர்கள் உள்ளனர்',
    chipMedicine: '💊 மருந்து இருப்பு உள்ளது',
  },
}

export default function HospitalDirectory() {
  const { hospitals, t, userCoords, setGpsModalOpen, language } = useApp()
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')

  const langKey = language || 'en'
  const text = DIRECTORY_I18N[langKey] || DIRECTORY_I18N.en

  const filteredHospitals = useMemo(() => {
    return (hospitals || []).filter((h) => {
      if (!h) return false
      // 1. Text search match
      const q = search.toLowerCase().trim()
      const matchesSearch =
        !q ||
        (h.name || '').toLowerCase().includes(q) ||
        (h.address || '').toLowerCase().includes(q) ||
        (h.type || '').toLowerCase().includes(q) ||
        (h.specialist || '').toLowerCase().includes(q)

      if (!matchesSearch) return false

      // 2. Filter chip match
      if (filterType === 'emergency') {
        return h.emergency_ready || (h.icu_beds && h.icu_beds > 0)
      }
      if (filterType === 'govt') {
        const typeLower = (h.type || '').toLowerCase()
        return typeLower.includes('govt') || typeLower.includes('phc') || typeLower.includes('chc') || typeLower.includes('sub-centre') || typeLower.includes('district')
      }
      if (filterType === 'doctors') {
        return (h.doctors_available || 0) > 0
      }
      if (filterType === 'medicine') {
        return (h.medicine_stock || '').toLowerCase().includes('in stock')
      }

      return true
    })
  }, [hospitals, search, filterType])

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6">
      {/* Top Header Banner with Live GPS Indicator */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
                  {t('bannerCategory')}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {hospitals.length} {text.verifiedTag}
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-bold text-slate-900 font-display mt-0.5">
                {text.directoryTitle}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {text.directorySub}
              </p>
            </div>
          </div>

          {/* GPS Location Refresh Button */}
          <button
            type="button"
            onClick={() => setGpsModalOpen(true)}
            className="tap-press self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold shadow-2xs transition-all shrink-0"
          >
            <Navigation className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <span>
              {userCoords?.active
                ? `GPS: ${userCoords.lat.toFixed(3)}°N, ${userCoords.lng.toFixed(3)}°E`
                : text.gpsButton}
            </span>
          </button>
        </div>
      </div>

      {/* Map Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
            <span>{text.mapSectionTitle}</span>
          </span>
          <span className="text-[11px] text-slate-500">
            {filteredHospitals.length} {text.showingCentres}
          </span>
        </div>
        <HospitalMap allHospitals={filteredHospitals} height="360px" />
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={text.searchPlaceholder}
              className="w-full pl-9 pr-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-blue-600 outline-hidden transition-all"
            />
          </div>

          <div className="text-xs font-semibold text-slate-500 whitespace-nowrap hidden sm:block">
            {filteredHospitals.length} / {hospitals.length} {text.availableText}
          </div>
        </div>

        {/* Filter Chips Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: text.chipAll, count: hospitals.length },
            { id: 'emergency', label: text.chipEmergency },
            { id: 'govt', label: text.chipGovt },
            { id: 'doctors', label: text.chipDoctors },
            { id: 'medicine', label: text.chipMedicine },
          ].map((chip) => {
            const active = filterType === chip.id
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setFilterType(chip.id)}
                className={`tap-press px-3 py-1.5 rounded-xl border font-bold text-xs whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  active
                    ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{chip.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Hospital Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredHospitals.map((h, idx) => (
          <HospitalCard key={h.id} hospital={h} isTop={idx === 0} />
        ))}
      </div>
    </div>
  )
}
