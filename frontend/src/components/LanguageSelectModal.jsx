import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, Check, X, ArrowRight, Mic, Sparkles, Search } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { INDIAN_LANGUAGES } from '../utils/i18n.js'

export default function LanguageSelectModal() {
  const { language, setLanguage, langModalOpen, setLangModalOpen, t } = useApp()
  const [selected, setSelected] = useState(language || 'en')
  const [search, setSearch] = useState('')

  if (!langModalOpen) return null

  const handleSelectLanguage = (code) => {
    setSelected(code)
    setLanguage(code)
    try {
      localStorage.setItem('asl:preferred_lang', code)
      localStorage.setItem('asl:lang_selected_first_time', 'true')
    } catch (e) {}
    setLangModalOpen(false)
  }

  const handleConfirm = () => {
    setLanguage(selected)
    try {
      localStorage.setItem('asl:preferred_lang', selected)
      localStorage.setItem('asl:lang_selected_first_time', 'true')
    } catch (e) {}
    setLangModalOpen(false)
  }

  const filteredLangs = INDIAN_LANGUAGES.filter((l) => {
    const q = search.toLowerCase()
    return (
      !q ||
      l.label.toLowerCase().includes(q) ||
      l.englishName.toLowerCase().includes(q) ||
      l.region.toLowerCase().includes(q) ||
      l.short.toLowerCase().includes(q)
    )
  })

  const currentSelectedLang = INDIAN_LANGUAGES.find((l) => l.code === (selected || language))

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.18 }}
          className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden max-h-[88vh] sm:max-h-[85vh] flex flex-col my-auto"
          role="dialog"
          aria-modal="true"
        >
          {/* 1. Compact Header Bar */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white px-4 py-3 sm:py-4 relative shrink-0">
            <button
              onClick={() => setLangModalOpen(false)}
              className="tap-press absolute top-3 right-3 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 pr-8">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/20 border border-white/25 flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-spin-slow" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-white/20 text-white px-2 py-0.2 rounded-full border border-white/25">
                    17 Languages
                  </span>
                </div>
                <h2 className="text-sm sm:text-base font-bold font-display truncate mt-0.5">
                  {t('selectLangTitle')}
                </h2>
                <p className="text-[10.5px] text-blue-100 truncate">
                  {t('selectLangSub')}
                </p>
              </div>
            </div>
          </div>

          {/* 2. Compact Search Bar */}
          <div className="px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-50 border-b border-slate-200 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search language (Telugu, Hindi, Tamil, Marathi)..."
                className="w-full pl-8 pr-3 py-1.5 sm:py-2 rounded-xl bg-white border border-slate-300 text-xs outline-none focus:border-blue-600 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* 3. Scrollable Languages Grid */}
          <div className="p-3 sm:p-4 overflow-y-auto flex-1 space-y-2 min-h-0">
            <div className="flex items-center justify-between px-1 text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-1 font-bold text-slate-700">
                <Mic className="w-3 h-3 text-blue-600" />
                Select Your Native Language:
              </span>
              <span>17 Supported</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {filteredLangs.map((lang) => {
                const isActive = (selected || language) === lang.code
                return (
                  <button
                    type="button"
                    key={lang.code}
                    onClick={() => handleSelectLanguage(lang.code)}
                    className={`tap-press text-left p-2.5 rounded-2xl border transition-all flex items-start justify-between relative group ${
                      isActive
                        ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-600/20 shadow-xs'
                        : 'bg-slate-50/80 hover:bg-white border-slate-200/90 shadow-2xs'
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0 flex-1 pr-1">
                      <span className="text-sm sm:text-base font-extrabold text-slate-900 block truncate">
                        {lang.label}
                      </span>
                      <p className="text-[11px] font-bold text-blue-700 truncate">
                        {lang.englishName}
                      </p>
                      <p className="text-[9.5px] text-slate-500 truncate">
                        {lang.region}
                      </p>
                    </div>

                    {isActive ? (
                      <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    ) : (
                      <span className="text-[9px] font-mono text-slate-400 uppercase font-bold bg-white px-1 py-0.2 rounded border border-slate-200 shrink-0">
                        {lang.short}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 4. Compact Footer Action */}
          <div className="p-3 sm:p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-2 shrink-0">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-slate-400 block">Selected</span>
              <strong className="text-xs text-blue-800 font-bold truncate block">
                {currentSelectedLang?.label} ({currentSelectedLang?.englishName})
              </strong>
            </div>

            <button
              type="button"
              onClick={handleConfirm}
              className="tap-press px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition-all shrink-0"
            >
              <span>{t('continueBtn')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
