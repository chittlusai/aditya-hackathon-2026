import { X, Printer, Share2, QrCode, ShieldCheck, CheckCircle2 } from 'lucide-react'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-2xl text-slate-800 my-auto print:border-none print:shadow-none print:m-0 print:p-0">
        
        {/* Prominent High-Visibility Floating Close "X" Button */}
        <button
          type="button"
          onClick={onClose}
          className="tap-press absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900 hover:bg-red-600 text-white flex items-center justify-center print:hidden border-2 border-white shadow-lg transition-all z-50 group"
          title="Close Referral Slip"
          aria-label="Close Referral Slip"
        >
          <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
        </button>

        {/* Official Header with National Tricolor strip & Rx */}
        <div className="border-b-2 border-slate-900 pb-3 mb-4 text-left pr-10 sm:pr-12">
          <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Government of India · Ministry of Health & Family Welfare
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
              OPD PRIORITY PASS
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <img
                src="/logo.png"
                alt="Arogya Setu"
                className="w-10 h-10 object-contain rounded-xl p-0.5 border border-blue-100 bg-white shadow-2xs"
              />
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
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                {t('slipRefLabel')}
              </span>
              <span className="font-mono font-bold text-xs sm:text-sm text-blue-700">
                {slipData.refId || 'REF-' + Math.floor(100000 + Math.random() * 900000)}
              </span>
            </div>
          </div>
        </div>

        {/* Patient Demographics */}
        <div className="grid grid-cols-3 gap-2 bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase">
              {t('slipPatient')}
            </span>
            <span className="font-bold text-slate-900">{slipData.name || 'Citizen (Patient)'}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase">
              {t('slipAgeGender')}
            </span>
            <span className="font-bold text-slate-900">
              {slipData.age ? `${slipData.age} Yrs` : '34 Yrs'} / {slipData.gender || 'Male'}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase">
              {t('slipDate')}
            </span>
            <span className="font-bold text-slate-900">
              {slipData.date || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Symptoms Section */}
        <div className="mb-4 text-left">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            {t('slipSymptoms')}
          </span>
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium">
            "{slipData.symptoms || 'General weakness & health assessment'}"
          </div>
        </div>

        {/* Triage Urgency Assessment */}
        <div className="mb-4 text-left">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            {t('slipTriageStatus')}
          </span>
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-950 text-sm">
                {slipData.urgency || 'Triage Level 1 · Mild'}
              </span>
              <span className="text-[10px] font-bold bg-white text-emerald-800 px-2 py-0.5 rounded border border-emerald-300 font-mono">
                {t('slipAutoTriage')}
              </span>
            </div>
            <p className="text-slate-700 leading-relaxed text-[11.5px] pt-1">
              {slipData.advice || 'Patient evaluated and advised to rest and monitor vitals.'}
            </p>
          </div>
        </div>

        {/* Vitals Ribbon if available */}
        {slipData.vitals && Object.keys(slipData.vitals).length > 0 && (
          <div className="mb-4 text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              {t('slipVitalsRecorded')}
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              {slipData.vitals.spo2 && (
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[9px] text-slate-400 block font-bold">SpO2 Oxygen (%)</span>
                  <span className="font-bold text-slate-900">{slipData.vitals.spo2}%</span>
                </div>
              )}
              {slipData.vitals.pulse && (
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[9px] text-slate-400 block font-bold">Pulse Rate (bpm)</span>
                  <span className="font-bold text-slate-900">{slipData.vitals.pulse} bpm</span>
                </div>
              )}
              {slipData.vitals.bp && (
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[9px] text-slate-400 block font-bold">Blood Pressure</span>
                  <span className="font-bold text-slate-900">{slipData.vitals.bp}</span>
                </div>
              )}
              {slipData.vitals.temp && (
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[9px] text-slate-400 block font-bold">Temperature (°F)</span>
                  <span className="font-bold text-slate-900">{slipData.vitals.temp}°F</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Target Referral Hospital */}
        {slipData.hospital && (
          <div className="mb-4 text-left">
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                  {t('slipAssignedFacility')}
                </span>
                <h4 className="font-bold text-sm text-slate-900">{slipData.hospital.name}</h4>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  📍 {slipData.hospital.address || 'Rural Block Sector'} {slipData.hospital.distance_km ? `· ${slipData.hospital.distance_km} km away` : ''} {slipData.hospital.phone ? `· Call: ${slipData.hospital.phone}` : ''}
                </p>
              </div>
              <div className="shrink-0 text-center">
                <QrCode className="w-10 h-10 text-slate-800 mx-auto" />
                <span className="text-[8px] font-mono text-slate-500 block">SCAN AT OPD</span>
              </div>
            </div>
          </div>
        )}

        {/* Doctor Verification & Physical Stamp Seal */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mb-4 flex items-center justify-between text-[11px] text-slate-600">
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
        <div className="flex flex-wrap items-center gap-2.5 print:hidden pt-3 border-t border-slate-200">
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

          <button
            type="button"
            onClick={onClose}
            className="tap-press min-h-[44px] px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 border border-slate-200"
          >
            <X className="w-4 h-4" />
            <span>Close Slip</span>
          </button>
        </div>
      </div>
    </div>
  )
}
