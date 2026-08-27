import { CheckCircle2, AlertTriangle, Siren } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

export default function UrgencyBadge({ urgency }) {
  const { t } = useApp()

  const config = {
    Mild: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-950',
      border: 'border-emerald-300',
      badgeBg: 'bg-emerald-700 text-white',
      badgeText: 'Triage Level 1 · Mild',
      Icon: CheckCircle2,
      label: t('mild'),
      sub: t('mildSub'),
    },
    Moderate: {
      bg: 'bg-amber-50',
      text: 'text-amber-950',
      border: 'border-amber-300',
      badgeBg: 'bg-amber-600 text-white',
      badgeText: 'Triage Level 2 · Moderate',
      Icon: AlertTriangle,
      label: t('moderate'),
      sub: t('moderateSub'),
    },
    Emergency: {
      bg: 'bg-red-50',
      text: 'text-red-950',
      border: 'border-red-400',
      badgeBg: 'bg-red-700 text-white',
      badgeText: 'Triage Level 3 · Emergency',
      Icon: Siren,
      label: t('emergency'),
      sub: t('emergencySub'),
    },
  }[urgency] || {
    bg: 'bg-slate-50',
    text: 'text-slate-900',
    border: 'border-slate-300',
    badgeBg: 'bg-slate-700 text-white',
    badgeText: 'Standard Evaluation',
    Icon: CheckCircle2,
    label: urgency || 'Standard Evaluation',
    sub: '',
  }

  const Icon = config.Icon

  return (
    <div
      className={`p-5 rounded-xl border ${config.bg} ${config.border}`}
      role="status"
    >
      <div className="flex items-start gap-3.5">
        <div
          className={`w-10 h-10 rounded-lg shrink-0 flex items-center justify-center ${config.badgeBg}`}
        >
          <Icon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/80 border border-slate-300 text-slate-800">
              {config.badgeText}
            </span>
            <h3 className={`text-base font-bold ${config.text}`}>
              {config.label}
            </h3>
          </div>
          <p className="text-xs text-slate-800 mt-1 leading-relaxed">
            {config.sub}
          </p>
        </div>
      </div>
    </div>
  )
}
