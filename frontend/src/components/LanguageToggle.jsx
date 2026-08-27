import { useApp } from '../context/AppContext.jsx'
import { Globe } from 'lucide-react'

export default function LanguageToggle() {
  const { language, setLanguage, LANGS } = useApp()

  return (
    <div
      role="group"
      aria-label="Language"
      className="inline-flex items-center bg-slate-100 border border-slate-200 rounded-full p-1 shadow-inner"
    >
      <span className="hidden sm:flex items-center pl-2 pr-1 text-slate-400">
        <Globe className="w-3.5 h-3.5" />
      </span>
      {LANGS.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => setLanguage(l.code)}
          className={`tap-press min-h-[30px] px-3 rounded-full text-xs font-bold transition-all duration-150 ${
            language === l.code
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          aria-pressed={language === l.code}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}
