import { useState, useMemo } from 'react'
import { MapPin, Navigation, Search, Filter, ShieldCheck, Phone, CheckCircle2, AlertTriangle, Building2, Stethoscope, Bed, Pill } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import HospitalMap from './HospitalMap.jsx'
import HospitalCard from './HospitalCard.jsx'

export default function HospitalDirectory() {
  const { hospitals, t, userCoords, setGpsModalOpen, language } = useApp()
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all') // 'all' | 'emergency' | 'govt' | 'doctors' | 'medicine'

  const filteredHospitals = useMemo(() => {
    return hospitals.filter((h) => {
      // 1. Text search match
      const q = search.toLowerCase().trim()
      const matchesSearch =
        !q ||
        h.name.toLowerCase().includes(q) ||
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
                  {hospitals.length} Verified Facilities Online
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-bold text-slate-900 font-display mt-0.5">
                {t('mapTitle')}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('mapSub')}
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
                : t('useGps')}
            </span>
          </button>
        </div>
      </div>

      {/* Map Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
            <span>Interactive Proximity Map</span>
          </span>
          <span className="text-[11px] text-slate-500">
            Showing {filteredHospitals.length} centres
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
              placeholder={
                language === 'hi'
                  ? 'अस्पताल का नाम, पता या डॉक्टर खोजें...'
                  : language === 'mr'
                  ? 'रुग्णालयाचे नाव, पत्ता किंवा डॉक्टर शोधा...'
                  : 'Search by hospital name, address, village, or specialty...'
              }
              className="w-full pl-9 pr-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-blue-600 outline-none transition-all"
            />
          </div>

          <div className="text-xs font-semibold text-slate-500 whitespace-nowrap hidden sm:block">
            {filteredHospitals.length} of {hospitals.length} Available
          </div>
        </div>

        {/* Filter Chips Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: language === 'hi' ? 'सभी केंद्र' : language === 'mr' ? 'सर्व केंद्रे' : 'All Centres', count: hospitals.length },
            { id: 'emergency', label: language === 'hi' ? '🚨 आपातकालीन / ICU' : language === 'mr' ? '🚨 आपत्कालीन / ICU' : '🚨 Emergency / ICU' },
            { id: 'govt', label: language === 'hi' ? '🏛️ सरकारी PHC/CHC' : language === 'mr' ? '🏛️ शासकीय PHC/CHC' : '🏛️ Govt PHC / CHC' },
            { id: 'doctors', label: language === 'hi' ? '👨‍⚕️ डॉक्टर उपस्थित' : language === 'mr' ? '👨‍⚕️ डॉक्टर उपस्थित' : '👨‍⚕️ Doctors on Duty' },
            { id: 'medicine', label: language === 'hi' ? '💊 दवाई स्टॉक उपलब्ध' : language === 'mr' ? '💊 औषध साठा उपलब्ध' : '💊 Medicine In Stock' },
          ].map((chip) => {
            const active = filterType === chip.id
            return (
              <button
                type="button"
                key={chip.id}
                onClick={() => setFilterType(chip.id)}
                className={`tap-press px-3 py-1.5 rounded-xl font-bold whitespace-nowrap border transition-all text-xs flex items-center gap-1.5 shrink-0 ${
                  active
                    ? 'bg-blue-600 border-blue-600 text-white shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{chip.label}</span>
                {chip.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    active ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {chip.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Structured Hospital List with Exact Physical Addresses & 1-Tap Directions */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>
              {language === 'hi'
                ? 'निकटतम स्वास्थ्य केंद्र सूची (दूरी के अनुसार)'
                : language === 'mr'
                ? 'जवळपासची आरोग्य केंद्र यादी (अंतरानुसार)'
                : 'Verified Health Facilities (Nearest First)'}
            </span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Sorted by live GPS proximity
          </span>
        </div>

        {filteredHospitals.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-xs space-y-2">
            <AlertTriangle className="w-6 h-6 text-amber-500 mx-auto" />
            <p className="font-bold text-slate-800 text-sm">
              {language === 'hi' ? 'कोई अस्पताल नहीं मिला' : language === 'mr' ? 'कोणतेही रुग्णालय आढळले नाही' : 'No matching facilities found'}
            </p>
            <p>
              {language === 'hi'
                ? 'कृपया अपने खोज शब्द बदलें या सभी केंद्र फ़िल्टर चुनें।'
                : language === 'mr'
                ? 'कृपया आपले शोध शब्द बदला किंवा सर्व केंद्रे निवडा.'
                : 'Try adjusting your search terms or select "All Centres" filter.'}
            </p>
            <button
              type="button"
              onClick={() => { setSearch(''); setFilterType('all') }}
              className="mt-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200 inline-block"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredHospitals.map((h, idx) => (
              <HospitalCard
                key={h.id}
                hospital={h}
                isTop={idx === 0 && !search && filterType === 'all'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
