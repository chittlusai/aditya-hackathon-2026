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

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.18 }}
          className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 relative shrink-0">
            <button
              onClick={() => setLangModalOpen(false)}
              className="tap-press absolute top-4 right-4 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/25 flex items-center justify-center shrink-0">
                <Globe className="w-6 h-6 text-white animate-spin-slow" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-2.5 py-0.5 rounded-full border border-white/25">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  17 Official Indian Languages Supported
                </span>
                <h2 className="text-lg sm:text-xl font-bold font-display mt-0.5">
                  {t('selectLangTitle')}
                </h2>
                <p className="text-[11px] text-blue-100 mt-0.5 leading-relaxed">
                  {t('selectLangSub')}
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search language (e.g. Telugu, Hindi, Tamil, Marathi, Bengali)..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm outline-none focus:border-blue-600 transition-all"
              />
            </div>
          </div>

          {/* Languages Grid Body */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-blue-600" />
                <span>Voice & Text Supported in all 17 Languages:</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Tap to Select
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
              {filteredLangs.map((lang) => {
                const isActive = (selected || language) === lang.code
                return (
                  <button
                    type="button"
                    key={lang.code}
                    onClick={() => handleSelectLanguage(lang.code)}
                    className={`tap-press text-left p-3 sm:p-3.5 rounded-2xl border transition-all flex items-start justify-between relative group ${
                      isActive
                        ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-600/20 shadow-xs'
                        : 'bg-slate-50/70 hover:bg-white border-slate-200/90 hover:border-blue-300 shadow-2xs'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base sm:text-lg font-extrabold text-slate-900 leading-none">
                          {lang.label}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-blue-700">
                        {lang.englishName}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate max-w-[130px]">
                        {lang.region}
                      </p>
                    </div>

                    {isActive ? (
                      <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-400 uppercase font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                        {lang.short}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Footer Action */}
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
            <span className="text-xs text-slate-600 font-medium">
              Selected: <strong className="text-blue-700 font-bold">{INDIAN_LANGUAGES.find(l => l.code === (selected || language))?.label} ({INDIAN_LANGUAGES.find(l => l.code === (selected || language))?.englishName})</strong>
            </span>

            <button
              type="button"
              onClick={handleConfirm}
              className="tap-press px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition-all"
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
