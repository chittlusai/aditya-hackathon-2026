import { motion } from 'framer-motion'
import { WifiOff, X, ShieldCheck } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { useState } from 'react'

export default function OfflineBanner() {
  const { isOnline, t } = useApp()
  const [dismissed, setDismissed] = useState(false)

  if (isOnline || dismissed) return null

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="bg-amber-50 border-b border-amber-200 text-amber-900 text-xs overflow-hidden"
      role="alert"
    >
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="font-semibold">
            {t('offlineBanner')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            Local Device Active
          </span>
          <button
            onClick={() => setDismissed(true)}
            className="text-amber-700 hover:text-amber-900 p-1"
            aria-label="Dismiss offline banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
