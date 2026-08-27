import { X, Printer, Share2, QrCode, ShieldCheck } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

export default function DigitalHealthSlip({ slipData, onClose }) {
  const { t } = useApp()

  if (!slipData) return null

  const handlePrint = () => {
    window.print()
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Arogya Referral Slip - ${slipData.name || 'Patient'}`,
        text: `Referral Slip: Patient: ${slipData.name || 'Citizen'}, Triage Level: ${slipData.urgency}, Assigned Facility: ${slipData.hospital?.name || 'Local PHC'}`,
        url: window.location.href,
      }).catch(() => {})
    } else {
      navigator.clipboard?.writeText(
        `Arogya Setu Referral Slip: Patient: ${slipData.name || 'Citizen'}, Triage: ${slipData.urgency}, Facility: ${slipData.hospital?.name || 'Local PHC'}`
      )
      alert('Referral details copied to clipboard.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white border border-slate-300 rounded-xl p-6 sm:p-8 shadow-xl text-slate-900 my-8 print:border-none print:shadow-none print:m-0 print:p-0">
        {/* Close Button (Hidden when printing) */}
        <button
          onClick={onClose}
          className="tap-press absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center print:hidden border border-slate-200"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Official Header */}
        <div className="border-b-2 border-slate-800 pb-3 mb-4 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded bg-blue-900 text-white flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 font-display uppercase tracking-tight">
                  {t('slipHeader')}
                </h3>
                <p className="text-[11px] text-slate-600 font-semibold">
                  {t('slipSubHeader')}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-[10px] text-slate-500 uppercase font-bold">{t('slipRefNo')}</p>
              <p className="text-xs font-mono font-bold text-blue-900">
                {slipData.id || 'REF-' + Math.floor(100000 + Math.random() * 900000)}
              </p>
            </div>
          </div>
        </div>

        {/* Patient Details Table */}
        <div className="border border-slate-300 rounded-lg p-3.5 bg-slate-50 mb-4 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div>
              <span className="text-slate-500 font-semibold">{t('thPatientName')}:</span>
              <p className="font-bold text-slate-900">{slipData.name || 'Walk-in Citizen'}</p>
            </div>
            <div>
              <span className="text-slate-500 font-semibold">{t('thAgeGender')}:</span>
              <p className="font-bold text-slate-900">{slipData.age ? `${slipData.age} Yrs` : '—'} / {slipData.gender || '—'}</p>
            </div>
            <div>
              <span className="text-slate-500 font-semibold">{t('slipDate')}</span>
              <p className="font-semibold text-slate-800">{new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        </div>

        {/* Triage Assessment Level */}
        <div className="mb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
            {t('slipTriageStatus')}
          </span>
          <div className={`p-3 rounded-lg border text-xs font-semibold ${
            slipData.urgency === 'Emergency'
              ? 'bg-red-50 border-red-300 text-red-950'
              : slipData.urgency === 'Moderate'
              ? 'bg-amber-50 border-amber-300 text-amber-950'
              : 'bg-emerald-50 border-emerald-300 text-emerald-950'
          }`}>
            <p className="font-bold text-sm mb-0.5">
              {slipData.urgency === 'Emergency' ? t('triageLevel3') : slipData.urgency === 'Moderate' ? t('triageLevel2') : t('triageLevel1')}
            </p>
            <p className="text-slate-700 font-normal leading-relaxed">
              {slipData.advice || t('mildSub')}
            </p>
          </div>
        </div>

        {/* Recorded Vitals */}
        {slipData.vitals && Object.values(slipData.vitals).some(Boolean) && (
          <div className="mb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
              {t('slipVitalsTitle')}
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-center text-xs">
              {slipData.vitals.spo2 && (
                <div className="p-1.5 rounded bg-slate-100 border border-slate-300">
                  <span className="text-slate-500 text-[10px] block font-semibold">{t('spo2')}</span>
                  <span className="font-bold text-slate-900">{slipData.vitals.spo2}%</span>
                </div>
              )}
              {slipData.vitals.pulse && (
                <div className="p-1.5 rounded bg-slate-100 border border-slate-300">
                  <span className="text-slate-500 text-[10px] block font-semibold">{t('pulse')}</span>
                  <span className="font-bold text-slate-900">{slipData.vitals.pulse} bpm</span>
                </div>
              )}
              {slipData.vitals.bp && (
                <div className="p-1.5 rounded bg-slate-100 border border-slate-300">
                  <span className="text-slate-500 text-[10px] block font-semibold">{t('bp')}</span>
                  <span className="font-bold text-slate-900">{slipData.vitals.bp}</span>
                </div>
              )}
              {slipData.vitals.temp && (
                <div className="p-1.5 rounded bg-slate-100 border border-slate-300">
                  <span className="text-slate-500 text-[10px] block font-semibold">{t('temp')}</span>
                  <span className="font-bold text-slate-900">{slipData.vitals.temp}°F</span>
                </div>
              )}
              {slipData.vitals.sugar && (
                <div className="p-1.5 rounded bg-slate-100 border border-slate-300">
                  <span className="text-slate-500 text-[10px] block font-semibold">{t('sugar')}</span>
                  <span className="font-bold text-slate-900">{slipData.vitals.sugar} mg</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Assigned Health Facility */}
        {slipData.hospital && (
          <div className="p-3 rounded-lg border border-slate-300 bg-slate-50 mb-5 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-blue-900 block">
                {t('slipAssignedFacility')}
              </span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">
                {slipData.hospital.name}
              </p>
              <p className="text-slate-600 text-xs">
                {slipData.hospital.type} · {slipData.hospital.distance_km} {t('kmAway')} · {t('callDesk')}: {slipData.hospital.phone || 'Available on visit'}
              </p>
            </div>

            <div className="w-14 h-14 bg-white rounded p-1 shrink-0 flex items-center justify-center border border-slate-300">
              <QrCode className="w-12 h-12 text-slate-800" />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 print:hidden pt-2 border-t border-slate-200">
          <button
            type="button"
            onClick={handlePrint}
            className="tap-press flex-1 min-h-[44px] rounded-lg bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>{t('slipPrintBtn')}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="tap-press min-h-[44px] px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Share2 className="w-4 h-4 text-blue-800" />
            <span>{t('slipShareBtn')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
