import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileCode,
  Download,
  Copy,
  Check,
  X,
  Share2,
  CheckCircle2,
  Database,
} from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

export default function FhirExportModal() {
  const { fhirExportModalOpen, setFhirExportModalOpen, result, currentUser, selectedReferral } = useApp()
  const [copied, setCopied] = useState(false)

  if (!fhirExportModalOpen) return null

  const fhirBundle = {
    resourceType: 'Bundle',
    id: `bundle-asl-${Date.now()}`,
    meta: {
      lastUpdated: new Date().toISOString(),
      profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/DocumentBundle'],
    },
    identifier: {
      system: 'https://ndhm.in/phc-referral',
      value: selectedReferral?.refId || 'REF-2026-8891',
    },
    type: 'document',
    timestamp: new Date().toISOString(),
    entry: [
      {
        fullUrl: 'urn:uuid:patient-01',
        resource: {
          resourceType: 'Patient',
          id: 'patient-01',
          identifier: [
            {
              system: 'https://healthid.ndhm.gov.in',
              value: currentUser?.abhaNumber || '91-8821-4401-9923',
            },
          ],
          name: [{ text: selectedReferral?.patientName || currentUser?.name || 'Savita Devi' }],
          gender: selectedReferral?.gender?.toLowerCase() || 'female',
          birthDate: '1998-05-12',
          address: [{ text: selectedReferral?.village || 'Rampur Village, Ward 3, Nagpur Rural' }],
        },
      },
      {
        fullUrl: 'urn:uuid:encounter-01',
        resource: {
          resourceType: 'Encounter',
          id: 'encounter-01',
          status: 'in-progress',
          class: {
            system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
            code: 'EMER',
            display: 'Emergency Triage Encounter',
          },
          subject: { reference: 'urn:uuid:patient-01' },
          serviceProvider: {
            display: selectedReferral?.targetFacility || 'Gangaon Community Health Centre (CHC)',
          },
        },
      },
      {
        fullUrl: 'urn:uuid:condition-01',
        resource: {
          resourceType: 'Condition',
          id: 'condition-01',
          clinicalStatus: {
            coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active' }],
          },
          verificationStatus: {
            coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status', code: 'provisional' }],
          },
          category: [
            {
              coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-category', code: 'encounter-diagnosis' }],
            },
          ],
          severity: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '24484000',
                display: selectedReferral?.urgency || 'Emergency (High Urgency)',
              },
            ],
          },
          code: {
            text: selectedReferral?.reasonForReferral || 'Severe Preeclampsia / Retrosternal Chest Pain',
          },
          subject: { reference: 'urn:uuid:patient-01' },
        },
      },
      {
        fullUrl: 'urn:uuid:observation-vitals',
        resource: {
          resourceType: 'Observation',
          id: 'observation-vitals',
          status: 'final',
          category: [
            {
              coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'vital-signs' }],
            },
          ],
          code: { text: 'Clinical Vitals Sign Panel' },
          subject: { reference: 'urn:uuid:patient-01' },
          component: [
            {
              code: { text: 'Blood Pressure' },
              valueString: selectedReferral?.vitals?.bp || '160/110 mmHg',
            },
            {
              code: { text: 'SpO2 Oxygen Saturation' },
              valueString: selectedReferral?.vitals?.spo2 || '97%',
            },
            {
              code: { text: 'Pulse Rate' },
              valueString: `${selectedReferral?.vitals?.pulse || 92} bpm`,
            },
          ],
        },
      },
    ],
  }

  const jsonString = JSON.stringify(fhirBundle, null, 2)

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `FHIR_ABDM_Bundle_${selectedReferral?.refId || 'Record'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.18 }}
          className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-5 sm:p-6 relative shrink-0">
            <button
              onClick={() => setFhirExportModalOpen(false)}
              className="tap-press absolute top-4 right-4 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center shrink-0">
                <FileCode className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-400/20">
                  Feature 20 • HL7 FHIR R4 & ABDM Interoperability Bridge
                </span>
                <h2 className="text-lg sm:text-xl font-bold font-display mt-0.5">
                  Interoperable Health Record Bridge
                </h2>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Standardized JSON payload for seamless health record handoff across Indian public hospitals
                </p>
              </div>
            </div>
          </div>

          {/* JSON View */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3 bg-slate-950 text-slate-100 font-mono text-xs">
            <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5 text-blue-400 font-bold">
                <Database className="w-3.5 h-3.5" />
                <span>FHIR DocumentBundle (HL7 R4 + NDHM Profile)</span>
              </span>
              <span>Valid JSON • UTF-8</span>
            </div>

            <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 overflow-x-auto text-[11px] text-emerald-300 leading-relaxed max-h-[380px]">
              {jsonString}
            </pre>
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={handleCopy}
              className="tap-press px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy JSON'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="tap-press px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download FHIR Bundle (.json)</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
