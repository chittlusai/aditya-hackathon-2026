import { useApp } from '../context/AppContext.jsx'
import { Globe } from 'lucide-react'

export default function LanguageToggle() {
  const { language, setLanguage, LANGS } = useApp()

  return (
    <div
      role="group"
      aria-label="Language"
      className="inline-flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5"
    >
      {LANGS.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => setLanguage(l.code)}
          className={`tap-press h-7 px-2 sm:px-2.5 rounded-md text-[11px] font-bold transition-all duration-150 ${
            language === l.code
              ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80 font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          aria-pressed={language === l.code}
        >
          <span className="sm:hidden">{l.short}</span>
          <span className="hidden sm:inline">{l.label}</span>
        </button>
      ))}
    </div>
  )
}
