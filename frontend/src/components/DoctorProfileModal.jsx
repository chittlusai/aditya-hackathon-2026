import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Stethoscope,
  Video,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Award,
  BookOpen,
  Calendar,
  X,
  Star,
  Users,
  Activity,
  Heart,
  MessageSquare,
} from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

export default function DoctorProfileModal() {
  const {
    doctorProfileModalOpen,
    setDoctorProfileModalOpen,
    selectedDoctorForProfile,
    startVideoCall,
    currentUser,
    role,
  } = useApp()

  const [teleconsultStatus, setTeleconsultStatus] = useState('Available Online')
  const [appointmentBooked, setAppointmentBooked] = useState(false)

  if (!doctorProfileModalOpen || !selectedDoctorForProfile) return null

  const doc = selectedDoctorForProfile

  const handleStartCall = () => {
    setDoctorProfileModalOpen(false)
    startVideoCall(
      {
        name: currentUser?.name || 'Citizen (Patient)',
        age: 34,
        gender: 'Male',
        symptoms: 'Fever, cough, body pain, seeking doctor teleconsultation',
        vitals: { bp: '122/80', spo2: '98%', pulse: '76', temp: '99.2°F' },
      },
      doc,
      role === 'doctor' // isDoctorView
    )
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.18 }}
          className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
          role="dialog"
          aria-modal="true"
        >
          {/* Top Banner */}
          <div className="bg-gradient-to-r from-teal-800 via-blue-900 to-indigo-950 text-white p-5 sm:p-6 relative shrink-0">
            <button
              onClick={() => setDoctorProfileModalOpen(false)}
              className="tap-press absolute top-4 right-4 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="relative shrink-0">
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-white/20 border-2 border-white/40 flex items-center justify-center text-2xl font-bold font-display shadow-inner">
                  👨‍⚕️
                </div>
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-[9px] font-bold">
                  ✓
                </span>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-400/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-300" />
                    ABDM Verified Medical Officer
                  </span>
                  <span className="text-xs text-blue-200 font-mono">Reg #MCI-MH-88210</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold font-display mt-1">
                  {doc.name || 'Dr. Rajesh Sharma'}
                </h2>
                <p className="text-xs text-blue-100 font-medium mt-0.5">
                  {doc.qualification || 'MBBS, MD (General Medicine)'} • {doc.specialty || 'Chief Medical Officer'}
                </p>
                <p className="text-[11px] text-teal-200 flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3 text-teal-300 shrink-0" />
                  <span>{doc.hospitalName || 'Rampur Primary Health Centre (PHC)'} • Room #{doc.room || '03'}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
            {/* Quick Stats Strip */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Experience</span>
                <span className="font-extrabold text-sm text-slate-900 mt-0.5 block">{doc.experience || '14+ Years'}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Consultations</span>
                <span className="font-extrabold text-sm text-blue-700 mt-0.5 block">1,420+ Rural</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Rating</span>
                <span className="font-extrabold text-sm text-amber-600 mt-0.5 flex items-center justify-center gap-0.5">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>4.9 / 5.0</span>
                </span>
              </div>
            </div>

            {/* Video Teleconsultation Ready Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-950 text-sm">
                      Live Teleconsultation Video Room
                    </h4>
                    <p className="text-[11px] text-emerald-800">
                      Govt eSanjeevani / Rural Video Consultation (Free Service)
                    </p>
                  </div>
                </div>

                <span className="text-[10.5px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-600 text-white shadow-2xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  Doctor Online
                </span>
              </div>

              <button
                type="button"
                onClick={handleStartCall}
                className="tap-press w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Video className="w-4 h-4" />
                <span>Connect Live Video Call Now</span>
              </button>
            </div>

            {/* Clinical Details */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 block">
                Clinical Credentials & Hospital Timings:
              </span>

              <div className="grid grid-cols-2 gap-2 text-[11.5px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">OPD Hours:</span>
                  <span className="font-bold text-slate-900">{doc.timings || '09:00 AM – 04:00 PM'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Consultation Fee:</span>
                  <span className="font-bold text-emerald-700">₹0 (Free Govt Service)</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Specialization:</span>
                  <span className="font-bold text-slate-900">{doc.specialty || 'General Medicine & Emergency'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Languages Spoken:</span>
                  <span className="font-bold text-slate-900">{doc.languages?.join(', ') || 'Hindi, Marathi, English, Telugu'}</span>
                </div>
              </div>
            </div>

            {/* Doctor Bio */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-700 block">About Clinician:</span>
              <p className="text-slate-600 text-xs leading-relaxed">
                Senior medical officer with over 14 years of frontline experience managing rural Primary Health Centres, community epidemic management, maternal emergency stabilizations, and chronic hypertension/diabetes programs.
              </p>
            </div>
          </div>

          {/* Footer Action */}
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setDoctorProfileModalOpen(false)}
              className="tap-press px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs"
            >
              Close
            </button>

            <button
              type="button"
              onClick={handleStartCall}
              className="tap-press px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Video className="w-4 h-4" />
              <span>Launch Video Consultation</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
