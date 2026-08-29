import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  Phone,
  Navigation,
  CheckCircle,
  MapPin,
} from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

export default function HospitalCard({ hospital, urgency, isTop = true }) {
  const { t } = useApp()
  const [open, setOpen] = useState(false)

  if (!hospital) return null

  const stockBadge = (() => {
    const s = (hospital.medicine_stock || '').toLowerCase()
    if (s.includes('out') || s.includes('समाप्त') || s.includes('संपले')) {
      return {
        label: t('outOfStock'),
        style: 'bg-red-50 border-red-200 text-red-700',
      }
    }
    if (s.includes('low') || s.includes('कम') || s.includes('कमी')) {
      return {
        label: t('lowStock'),
        style: 'bg-amber-50 border-amber-200 text-amber-800',
      }
    }
    return {
      label: t('inStock'),
      style: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    }
  })()

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${hospital.lat || 21.1458},${hospital.lng || 79.0882}`

  return (
    <div
      className={`bg-white rounded-lg overflow-hidden border transition-all ${
        isTop ? 'border-primary ring-2 ring-primary/10' : 'border-border-soft'
      }`}
    >
      {/* Top Header Strip */}
      <div className="bg-slate-50 px-5 py-3 border-b border-border-soft flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
            isTop ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white text-text-main border-border-soft'
          }`}>
            {isTop ? t('primaryMatchBadge') : hospital.type}
          </span>
          <span className="text-xs text-text-muted font-medium">{t('facilityId')}: #GOV-{hospital.id}</span>
        </div>

        <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{hospital.distance_km} {t('kmAway')}</span>
        </span>
      </div>

      <div className="p-5">
        {/* Hospital Name & Type */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-bold text-text-main text-base sm:text-lg font-display">
              {hospital.name}
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              {hospital.type} • {hospital.specialist || 'General Medicine'}
            </p>
          </div>

          {hospital.phone && (
            <a
              href={`tel:${hospital.phone}`}
              className="tap-press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary-50 hover:bg-primary-100 text-primary border border-primary-100 font-bold text-xs shadow-sm"
              aria-label={`Call ${hospital.name}`}
            >
              <Phone className="w-3.5 h-3.5 text-primary" />
              <span>{t('callDesk')}</span>
            </a>
          )}
        </div>

        {/* Clinical Statistics Grid */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-2.5 rounded-md bg-slate-50 border border-border-soft">
            <span className="text-[10px] uppercase font-bold text-text-muted block mb-0.5">
              {t('thDistance')}
            </span>
            <p className="font-bold text-xs text-text-main">{hospital.distance_km} km</p>
          </div>

          <div className="p-2.5 rounded-md bg-slate-50 border border-border-soft">
            <span className="text-[10px] uppercase font-bold text-text-muted block mb-0.5">
              {t('doctorsOnDuty')}
            </span>
            <p className="font-bold text-xs text-emerald-700">{hospital.doctors_available} {t('inStock')}</p>
          </div>

          <div className="p-2.5 rounded-md bg-slate-50 border border-border-soft">
            <span className="text-[10px] uppercase font-bold text-text-muted block mb-0.5">
              {t('thSpecialist')}
            </span>
            <p className="font-bold text-xs text-text-main truncate">{hospital.specialist?.split(',')[0] || 'General'}</p>
          </div>

          <div className="p-2.5 rounded-md bg-slate-50 border border-border-soft">
            <span className="text-[10px] uppercase font-bold text-text-muted block mb-0.5">
              {t('thMedicines')}
            </span>
            <span className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-bold border ${stockBadge.style}`}>
              {stockBadge.label}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-3 border-t border-border-soft flex flex-col sm:flex-row items-center gap-2.5">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="tap-press w-full sm:flex-1 min-h-[40px] rounded-md bg-slate-50 hover:bg-slate-100 text-text-muted text-xs font-bold flex items-center justify-center gap-1.5 border border-border-soft"
          >
            <Navigation className="w-3.5 h-3.5 text-primary" />
            <span>{t('getDirections')}</span>
          </a>

          {hospital.phone && (
            <a
              href={`tel:${hospital.phone}`}
              className="tap-press w-full sm:flex-1 min-h-[40px] rounded-md bg-primary hover:bg-primary-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Phone className="w-3.5 h-3.5 text-white" />
              <span>{t('callDesk')}: {hospital.phone}</span>
            </a>
          )}
        </div>

        {/* Accordion: Why this hospital? */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mt-3 w-full flex items-center justify-between p-2.5 rounded-md bg-slate-50 hover:bg-primary-50/50 border border-border-soft text-text-muted text-xs font-bold tap-press"
          aria-expanded={open}
        >
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-primary" />
            <span>{t('whyRecommended')}</span>
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <div className="mt-2.5 p-3.5 rounded-md bg-slate-50 border border-border-soft text-xs text-text-muted space-y-1.5 leading-relaxed">
                <p>{hospital.match_reason}</p>
                <div className="pt-2 border-t border-border-soft flex items-center justify-between text-text-muted">
                  <span>{t('allocationCriteria')}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
