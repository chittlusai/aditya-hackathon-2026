/**
 * AppContext.jsx
 * Comprehensive Central State Store for Arogya Setu Local (SIH26133).
 * Integrates all 20 upgrade blueprint features:
 * Roles & Auth (Patient, Doctor, ASHA, Admin) with SQLite Backend Database Persistence,
 * Real HTML5 URL Routing Synchronization (/home, /check, /hospitals, /medicines, /history, /doctor, /asha, /admin),
 * Multilingual Translations (17 languages), Live Hospital & Doctor Mesh,
 * Smart Queue Prediction, Medicine & Diagnostics Network,
 * Dedicated Full-Page Medical Assessment History,
 * Referral Lifecycle Journey Tracking, High-Risk Watchlist, MCH Pathway, Chronic Care,
 * Teleconsultation Video Calling Room, Doctor Profile Desk,
 * Consent Vault (ABDM) & FHIR Interoperability Bridge.
 */
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { TRANSLATIONS, INDIAN_LANGUAGES } from '../utils/i18n.js'
import { INITIAL_HOSPITALS, calculateDistance, generateHospitalsForCoordinates } from '../utils/localTriage.js'
import {
  INITIAL_DOCTORS,
  ESSENTIAL_MEDICINES,
  DIAGNOSTIC_TESTS,
  INITIAL_REFERRALS,
  HIGH_RISK_WATCHLIST,
  MCH_PATHWAY_DATA,
  CHRONIC_CARE_DATA,
  DISTRICT_ANALYTICS,
} from '../utils/featureData.js'

const AppContext = createContext(null)

const PATIENTS_STORAGE_KEY = 'asl:patient_records_v1'
const HOSPITALS_STORAGE_KEY = 'asl:hospital_capacity_v1'
const USER_STORAGE_KEY = 'asl:current_user_v1'
const REFERRALS_STORAGE_KEY = 'asl:referrals_v1'
const REPORTS_STORAGE_KEY = 'asl:patient_assessment_history_v1'

export const getScreenFromPath = (pathname) => {
  if (typeof pathname !== 'string') return 'home'
  const clean = pathname.replace(/^\/+|\/+$/g, '').toLowerCase()
  if (!clean || clean === 'home') return 'home'
  if (['check', 'symptoms', 'triage'].includes(clean)) return 'check'
  if (['result', 'triage-result'].includes(clean)) return 'result'
  if (['map', 'hospitals', 'facilities', 'directory'].includes(clean)) return 'map'
  if (['medicines', 'tests', 'labs', 'pharmacy'].includes(clean)) return 'medicines'
  if (['history', 'reports', 'medical-history'].includes(clean)) return 'history'
  if (['doctor', 'opd', 'doctor-workbench'].includes(clean)) return 'doctor'
  if (['asha', 'asha-portal', 'field-worker'].includes(clean)) return 'asha'
  if (['admin', 'directorate', 'command'].includes(clean)) return 'admin'
  if (['about', 'info'].includes(clean)) return 'about'
  return 'home'
}

export function AppProvider({ children }) {
  // 1. Language State
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('asl:preferred_lang') || 'en'
  })
  const [langModalOpen, setLangModalOpen] = useState(() => {
    try {
      return localStorage.getItem('asl:lang_selected_first_time') !== 'true'
    } catch {
      return false
    }
  })

  // 2. Authentication & Role State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [role, setRole] = useState(() => {
    return currentUser?.role || 'patient'
  })
  const [authModalOpen, setAuthModalOpen] = useState(false)

  // 3. Navigation Screen & Real URL Synchronization
  // 'home' | 'check' | 'result' | 'map' | 'asha' | 'doctor' | 'admin' | 'medicines' | 'history' | 'about'
  const [screen, setScreen] = useState(() => {
    if (typeof window !== 'undefined') {
      return getScreenFromPath(window.location.pathname)
    }
    return 'home'
  })
  const [result, setResult] = useState(null)
  const [activeSlip, setActiveSlip] = useState(null)

  // 4. Feature Modals
  const [sosOpen, setSosOpen] = useState(false)
  const [gpsModalOpen, setGpsModalOpen] = useState(false)
  const [doctorMeshModalOpen, setDoctorMeshModalOpen] = useState(false)
  const [referralTrackerModalOpen, setReferralTrackerModalOpen] = useState(false)
  const [consentVaultModalOpen, setConsentVaultModalOpen] = useState(false)
  const [fhirExportModalOpen, setFhirExportModalOpen] = useState(false)
  const [historyModalOpen, setHistoryModalOpen] = useState(false)
  const [selectedReferral, setSelectedReferral] = useState(null)

  // 5. Doctor Profile & Teleconsultation Video Call
  const [doctorProfileModalOpen, setDoctorProfileModalOpen] = useState(false)
  const [selectedDoctorForProfile, setSelectedDoctorForProfile] = useState(INITIAL_DOCTORS[0])
  const [videoCallModalOpen, setVideoCallModalOpen] = useState(false)
  const [activeVideoSession, setActiveVideoSession] = useState(null)

  // 6. Connectivity & GPS
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const [userCoords, setUserCoords] = useState({
    lat: 21.1458,
    lng: 79.0882,
    accuracy: 35,
    active: false,
    label: 'Rampur Rural Sector',
  })
  const [gpsStatus, setGpsStatus] = useState('prompt') // 'prompt' | 'granted' | 'denied' | 'loading'
  const watchIdRef = useRef(null)

  // 7. Dynamic Facilities & Health Mesh Database
  const [hospitals, setHospitals] = useState(() => {
    return generateHospitalsForCoordinates(21.1458, 79.0882)
  })
  const [doctors, setDoctors] = useState(INITIAL_DOCTORS)
  const [medicines, setMedicines] = useState(ESSENTIAL_MEDICINES)
  const [diagnostics, setDiagnostics] = useState(DIAGNOSTIC_TESTS)

  // 8. Referral Pipeline & Care Continuity
  const [referrals, setReferrals] = useState(() => {
    try {
      const saved = localStorage.getItem(REFERRALS_STORAGE_KEY)
      return saved ? JSON.parse(saved) : INITIAL_REFERRALS
    } catch {
      return INITIAL_REFERRALS
    }
  })
  const [highRiskWatchlist, setHighRiskWatchlist] = useState(HIGH_RISK_WATCHLIST)
  const [mchRecords, setMchRecords] = useState(MCH_PATHWAY_DATA)
  const [chronicCareData, setChronicCareData] = useState(CHRONIC_CARE_DATA)
  const [districtAnalytics, setDistrictAnalytics] = useState(DISTRICT_ANALYTICS)

  // 9. Offline Patient Records (ASHA)
  const [patientRecords, setPatientRecords] = useState(() => {
    try {
      const saved = localStorage.getItem(PATIENTS_STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Online / Offline Listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Browser History & URL Popstate Listener
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        const targetScreen = getScreenFromPath(window.location.pathname)
        setScreen(targetScreen)
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Auto-open Auth modal after first-time language selection is done
  useEffect(() => {
    if (!langModalOpen && !currentUser) {
      const timer = setTimeout(() => {
        setAuthModalOpen(true)
      }, 350)
      return () => clearTimeout(timer)
    }
  }, [langModalOpen, currentUser])

  // Screen navigation helper with real URL updates
  const go = useCallback((targetScreen) => {
    setScreen(targetScreen)
    if (typeof window !== 'undefined') {
      const targetPath = targetScreen === 'home' ? '/' : `/${targetScreen}`
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ screen: targetScreen }, '', targetPath)
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Login handler with persistent SQLite Database synchronization
  const loginUser = useCallback((userObj) => {
    setCurrentUser(userObj)
    setRole(userObj.role || 'patient')
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userObj))
    } catch (e) {}

    // Send login to SQLite database
    try {
      fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userObj),
      }).catch((err) => console.warn('Offline mode: Saved login to local storage'))
    } catch (e) {}

    // Auto navigate to role specific dashboard
    if (userObj.role === 'doctor') go('doctor')
    else if (userObj.role === 'asha') go('asha')
    else if (userObj.role === 'admin') go('admin')
    else go('home')
  }, [go])

  // Logout handler
  const logoutUser = useCallback(() => {
    setCurrentUser(null)
    setRole('patient')
    go('home')
    try {
      localStorage.removeItem(USER_STORAGE_KEY)
    } catch (e) {}
  }, [go])

  // Switch role directly
  const switchRole = useCallback((newRole) => {
    setRole(newRole)
    if (newRole === 'doctor') {
      if (!currentUser || currentUser.role !== 'doctor') {
        loginUser({
          id: 'DR-101',
          name: 'Dr. Rajesh Sharma',
          role: 'doctor',
          title: 'Chief Medical Officer (MBBS, MD)',
          facility: 'Rampur Primary Health Centre (PHC)',
          regNo: 'MCI-MH-88210',
          specialty: 'General Medicine',
        })
      }
      go('doctor')
    } else if (newRole === 'asha') {
      if (!currentUser || currentUser.role !== 'asha') {
        loginUser({
          id: 'ASHA-404',
          name: 'Anita Devi',
          role: 'asha',
          title: 'Accredited Social Health Activist (ASHA)',
          facility: 'Rampur Sector Sub-Centre',
          sector: 'Rampur Village & South Tola',
        })
      }
      go('asha')
    } else if (newRole === 'admin') {
      if (!currentUser || currentUser.role !== 'admin') {
        loginUser({
          id: 'ADM-DIST-01',
          name: 'Dr. K. Verma',
          role: 'admin',
          title: 'District Chief Medical Officer (Admin)',
          facility: 'Nagpur Rural District Health Directorate',
        })
      }
      go('admin')
    } else {
      setRole('patient')
      go('home')
    }
  }, [currentUser, loginUser, go])

  // Translation helper
  const t = useCallback((key) => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.en
    return dict[key] || TRANSLATIONS.en[key] || key
  }, [language])

  const changeLanguage = useCallback((lang) => {
    setLanguage(lang)
    localStorage.setItem('asl:preferred_lang', lang)
  }, [])

  // GPS Coordinate Applier
  const applyCoordinates = useCallback((lat, lng, label = 'Live GPS Location', accuracy = 25) => {
    const coords = { lat, lng, accuracy, active: true, label }
    setUserCoords(coords)
    const nearby = generateHospitalsForCoordinates(lat, lng)
    setHospitals(nearby)
  }, [])

  // Save Assessment / Triage Report to SQLite database
  const saveAssessmentReport = useCallback((reportData) => {
    const newReport = {
      id: `REP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      user_id: currentUser?.id || 'PAT-DEMO-01',
      patient_name: reportData.name || currentUser?.name || 'Citizen (Patient)',
      phone: reportData.phone || currentUser?.phone || '',
      age: reportData.age || 34,
      gender: reportData.gender || 'Male',
      symptoms: reportData.symptoms || reportData.inputText || 'Health assessment check',
      urgency: reportData.urgency || 'Moderate',
      vitals: reportData.vitals || {},
      advice: reportData.advice || '',
      hospital: reportData.hospital || null,
      hospital_name: reportData.hospital?.name || 'Rampur Primary Health Centre',
      hospital_distance: reportData.hospital?.distance_km || 3.2,
      prescribed_medicines: reportData.prescribed_medicines || ['Paracetamol 500mg (1 TDS)'],
      doctor_notes: reportData.doctor_notes || 'Triage completed.',
      risk_factors: reportData.risk_factors || [],
      created_at: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    }

    // Save to local cache
    try {
      const localReports = JSON.parse(localStorage.getItem(REPORTS_STORAGE_KEY) || '[]')
      localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify([newReport, ...localReports]))
    } catch (e) {}

    // Save to SQLite backend database
    try {
      fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReport),
      }).catch(() => {})
    } catch (e) {}

    return newReport
  }, [currentUser])

  // Start Real-Time Teleconsultation Video Call
  const startVideoCall = useCallback((patientData = null, doctorData = null, isDoctorView = false) => {
    const defaultDoctor = doctorData || doctors[0]
    const defaultPatient = patientData || {
      name: currentUser?.name || 'Citizen (Patient)',
      age: 34,
      gender: 'Male',
      symptoms: result?.urgency ? 'Evaluated with ' + result.urgency + ' symptoms' : 'General fever, headache, body pain for 3 days',
      vitals: { bp: '125/82', spo2: '97%', pulse: '78', temp: '99.4°F' },
      phone: currentUser?.phone || '+91 98221 55432',
    }

    const callId = `CALL-${Date.now().toString().slice(-6)}`

    // Log call start to SQLite
    try {
      fetch('/api/teleconsult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          call_id: callId,
          patient_name: defaultPatient.name,
          doctor_name: defaultDoctor.name,
          symptoms: defaultPatient.symptoms,
          vitals: defaultPatient.vitals,
        }),
      }).catch(() => {})
    } catch (e) {}

    setActiveVideoSession({
      doctor: defaultDoctor,
      patient: defaultPatient,
      isDoctorView,
      callId,
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    })
    setVideoCallModalOpen(true)
  }, [doctors, currentUser, result])

  const endVideoCall = useCallback(() => {
    setVideoCallModalOpen(false)
    setActiveVideoSession(null)
  }, [])

  const openDoctorProfile = useCallback((doc = null) => {
    setSelectedDoctorForProfile(doc || doctors[0])
    setDoctorProfileModalOpen(true)
  }, [doctors])

  // Update Referral Stage in 6-stage lifecycle
  const updateReferralStage = useCallback((refId, nextStageIndex, note = '') => {
    const stages = ['Created', 'Accepted', 'En Route', 'Arrived', 'In Consultation', 'Closed']
    setReferrals((prev) => {
      const updated = prev.map((r) => {
        if (r.refId === refId) {
          return {
            ...r,
            stageIndex: nextStageIndex,
            status: stages[nextStageIndex] || r.status,
            lastUpdate: note || `Updated to ${stages[nextStageIndex]} at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          }
        }
        return r
      })
      try {
        localStorage.setItem(REFERRALS_STORAGE_KEY, JSON.stringify(updated))
      } catch (e) {}
      return updated
    })
  }, [])

  // Add new referral
  const createNewReferral = useCallback((referralPacket) => {
    const newRef = {
      refId: `REF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: 'Just Now',
      status: 'Created',
      stageIndex: 0,
      stalledAlert: false,
      lastUpdate: 'Referral generated and dispatched to receiving facility queue',
      ...referralPacket,
    }
    setReferrals((prev) => {
      const updated = [newRef, ...prev]
      try {
        localStorage.setItem(REFERRALS_STORAGE_KEY, JSON.stringify(updated))
      } catch (e) {}
      return updated
    })
    return newRef
  }, [])

  // Update Hospital Capacity
  const updateHospitalCapacity = useCallback((hospitalId, updates) => {
    setHospitals((prev) => {
      const updated = prev.map((h) => {
        if (h.id === hospitalId || String(h.id) === String(hospitalId)) {
          return { ...h, ...updates }
        }
        return h
      })
      return updated
    })
  }, [])

  // ASHA Patient record saving
  const savePatientRecord = useCallback((patientData) => {
    const newRecord = {
      id: `PAT-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      displayDate: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      ...patientData,
    }
    setPatientRecords((prev) => {
      const updated = [newRecord, ...prev]
      try {
        localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(updated))
      } catch (e) {}
      return updated
    })
    return newRecord
  }, [])

  const deletePatientRecord = useCallback((recordId) => {
    setPatientRecords((prev) => {
      const updated = prev.filter((p) => p.id !== recordId)
      try {
        localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(updated))
      } catch (e) {}
      return updated
    })
  }, [])

  return (
    <AppContext.Provider
      value={{
        // i18n
        language,
        setLanguage: changeLanguage,
        t,
        INDIAN_LANGUAGES,
        langModalOpen,
        setLangModalOpen,

        // Auth & Roles & SQLite DB
        currentUser,
        role,
        setRole: switchRole,
        authModalOpen,
        setAuthModalOpen,
        loginUser,
        logoutUser,
        switchRole,

        // Navigation & URL Routing
        screen,
        go,
        result,
        setResult,
        activeSlip,
        setActiveSlip,

        // Network data
        hospitals,
        updateHospitalCapacity,
        doctors,
        setDoctors,
        medicines,
        setMedicines,
        diagnostics,
        setDiagnostics,

        // Doctor Profile & Video Call
        doctorProfileModalOpen,
        setDoctorProfileModalOpen,
        selectedDoctorForProfile,
        setSelectedDoctorForProfile,
        openDoctorProfile,
        videoCallModalOpen,
        setVideoCallModalOpen,
        activeVideoSession,
        startVideoCall,
        endVideoCall,

        // History & Assessment Reports
        historyModalOpen,
        setHistoryModalOpen,
        saveAssessmentReport,

        // 20-Feature Workflows
        referrals,
        updateReferralStage,
        createNewReferral,
        selectedReferral,
        setSelectedReferral,
        highRiskWatchlist,
        setHighRiskWatchlist,
        mchRecords,
        setMchRecords,
        chronicCareData,
        setChronicCareData,
        districtAnalytics,

        // ASHA records
        patientRecords,
        savePatientRecord,
        deletePatientRecord,

        // Modals
        sosOpen,
        setSosOpen,
        gpsModalOpen,
        setGpsModalOpen,
        doctorMeshModalOpen,
        setDoctorMeshModalOpen,
        referralTrackerModalOpen,
        setReferralTrackerModalOpen,
        consentVaultModalOpen,
        setConsentVaultModalOpen,
        fhirExportModalOpen,
        setFhirExportModalOpen,

        // System & Location
        isOnline,
        userCoords,
        setUserCoords,
        applyCoordinates,
        gpsStatus,
        setGpsStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
