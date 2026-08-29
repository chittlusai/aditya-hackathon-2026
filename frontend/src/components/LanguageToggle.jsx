import { useApp } from '../context/AppContext.jsx'
import { Globe, ChevronDown } from 'lucide-react'
import { INDIAN_LANGUAGES } from '../utils/i18n.js'

export default function LanguageToggle() {
  const { language, setLangModalOpen } = useApp()
  const currentLang = INDIAN_LANGUAGES.find((l) => l.code === language) || INDIAN_LANGUAGES[0]

  return (
    <button
      type="button"
      onClick={() => setLangModalOpen(true)}
      className="tap-press inline-flex items-center gap-1.5 px-2.5 sm:px-3 h-8 sm:h-9 rounded-xl bg-slate-100/90 hover:bg-slate-200/80 border border-slate-300 text-slate-800 text-xs font-bold transition-all shadow-2xs group"
      title="Choose from 17 Indian Languages"
      aria-label="Select Language"
    >
      <Globe className="w-3.5 h-3.5 text-blue-600 group-hover:rotate-45 transition-transform" />
      <span className="font-extrabold text-blue-700">{currentLang.label}</span>
      <span className="text-[10px] text-slate-400 font-mono hidden md:inline">({currentLang.short})</span>
      <ChevronDown className="w-3 h-3 text-slate-500" />
    </button>
  )
}
