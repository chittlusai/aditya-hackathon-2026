import { AnimatePresence, motion } from 'framer-motion'
import { WifiOff, ShieldCheck } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

export default function OfflineBanner() {
  const { isOnline } = useApp()

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="sticky top-0 z-50 w-full bg-amber-50 text-amber-900 border-b border-amber-200"
          role="status"
        >
          <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong>Offline Mode Active:</strong> Running local triage engine & cached hospital database on your device.
              </span>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              Local Device Active
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
