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
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-2xl text-slate-800 my-8 print:border-none print:shadow-none print:m-0 print:p-0">
        {/* Close Button (Hidden when printing) */}
        <button
          onClick={onClose}
          className="tap-press absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center print:hidden border border-slate-200"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Official Header with National Tricolor strip & Rx */}
        <div className="border-b-2 border-slate-900 pb-3 mb-4 text-left">
          <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Government of India · Ministry of Health & Family Welfare
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
              OPD PRIORITY PASS
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold shadow-xs">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 font-display uppercase tracking-tight">
                  {t('slipHeader')}
                </h3>
                <p className="text-[11px] text-slate-500 font-semibold">
                  {t('slipSubHeader')}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-[10px] text-slate-400 uppercase font-bold">{t('slipRefNo')}</p>
              <p className="text-xs font-mono font-bold text-blue-700">
                {slipData.id || 'REF-' + Math.floor(100000 + Math.random() * 900000)}
              </p>
            </div>
          </div>
        </div>

        {/* Patient Details Grid */}
        <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 mb-3.5 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div>
              <span className="text-slate-500 font-semibold block text-[10px] uppercase tracking-wider">{t('thPatientName')}:</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{slipData.name || 'Walk-in Citizen'}</p>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block text-[10px] uppercase tracking-wider">{t('thAgeGender')}:</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{slipData.age ? `${slipData.age} Yrs` : '—'} / {slipData.gender || '—'}</p>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block text-[10px] uppercase tracking-wider">{t('slipDate')}</span>
              <p className="font-semibold text-slate-700 mt-0.5">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
            </div>
          </div>
        </div>

        {/* Recorded Chief Complaints & Symptoms */}
        {slipData.symptoms && (
          <div className="mb-3.5 p-3 rounded-xl border border-slate-200 bg-white text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Chief Complaints / Symptoms Recorded:
            </span>
            <p className="font-semibold text-slate-800 leading-relaxed">
              "{slipData.symptoms}"
            </p>
          </div>
        )}

        {/* Triage Assessment Level */}
        <div className="mb-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            {t('slipTriageStatus')}
          </span>
          <div className={`p-3.5 rounded-xl border text-xs font-semibold ${
            slipData.urgency === 'Emergency'
              ? 'bg-red-50 border-red-200 text-red-900'
              : slipData.urgency === 'Moderate'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
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
          <div className="mb-3.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              {t('slipVitalsTitle')}
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-center text-xs">
              {slipData.vitals.spo2 && (
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[10px] block font-semibold">{t('spo2')}</span>
                  <span className="font-bold text-slate-900">{slipData.vitals.spo2}%</span>
                </div>
              )}
              {slipData.vitals.pulse && (
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[10px] block font-semibold">{t('pulse')}</span>
                  <span className="font-bold text-slate-900">{slipData.vitals.pulse} bpm</span>
                </div>
              )}
              {slipData.vitals.bp && (
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[10px] block font-semibold">{t('bp')}</span>
                  <span className="font-bold text-slate-900">{slipData.vitals.bp}</span>
                </div>
              )}
              {slipData.vitals.temp && (
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[10px] block font-semibold">{t('temp')}</span>
                  <span className="font-bold text-slate-900">{slipData.vitals.temp}°F</span>
                </div>
              )}
              {slipData.vitals.sugar && (
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[10px] block font-semibold">{t('sugar')}</span>
                  <span className="font-bold text-slate-900">{slipData.vitals.sugar} mg</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Assigned Health Facility */}
        {slipData.hospital && (
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 mb-3.5 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-blue-700 block">
                {t('slipAssignedFacility')}
              </span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">
                {slipData.hospital.name}
              </p>
              <p className="text-slate-600 text-xs mt-0.5 font-medium flex items-center gap-1">
                <span>📍 {slipData.hospital.address || 'Rural Block Sector'}</span>
              </p>
              <p className="text-slate-600 text-[11px] mt-0.5">
                {slipData.hospital.type} · {slipData.hospital.distance_km} {t('kmAway')} · {t('callDesk')}: {slipData.hospital.phone || 'Available on visit'}
              </p>
            </div>

            <div className="w-14 h-14 bg-white rounded-lg p-1 shrink-0 flex items-center justify-center border border-slate-200 shadow-xs">
              <QrCode className="w-11 h-11 text-slate-800" />
            </div>
          </div>
        )}

        {/* Doctor Verification & Physical Stamp Seal */}
        <div className="p-3 bg-blue-50/40 border border-blue-200/80 rounded-xl mb-4 flex items-center justify-between text-[11px] text-slate-600">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full border-2 border-dashed border-blue-700 text-blue-800 font-bold flex flex-col items-center justify-center text-[8px] uppercase tracking-tighter shadow-xs">
              <span>SEAL</span>
              <span className="text-[6px]">MoHFW</span>
            </div>
            <div>
              <p className="font-bold text-slate-800">Govt. Rural Health Mission Verified</p>
              <p className="text-[10px] text-slate-500">Authorized for priority OPD / Emergency queue</p>
            </div>
          </div>
          <div className="text-right">
            <div className="w-24 border-b border-slate-400 mb-1" />
            <span className="text-[10px] text-slate-600 font-semibold block">Doctor On Duty</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 print:hidden pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={handlePrint}
            className="tap-press flex-1 min-h-[44px] rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>{t('slipPrintBtn')}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="tap-press min-h-[44px] px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Share2 className="w-4 h-4 text-blue-600" />
            <span>{t('slipShareBtn')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
