/**
 * AppContext.jsx
 * Central state store for Arogya Setu Local
 * Handles roles, multilingual translation, live hospital capacity,
 * offline patient records, GPS location tracking & distance calculation,
 * and emergency SOS modal.
 */
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { TRANSLATIONS } from '../utils/i18n.js'
import { INITIAL_HOSPITALS, calculateDistance, generateHospitalsForCoordinates } from '../utils/localTriage.js'

const AppContext = createContext(null)

const LANGS = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'hi', label: 'हिन्दी', short: 'HI' },
  { code: 'mr', label: 'मराठी', short: 'MR' },
]

const PATIENTS_STORAGE_KEY = 'asl:patient_records_v1'
const HOSPITALS_STORAGE_KEY = 'asl:hospital_capacity_v1'
const GPS_PERMISSION_STORAGE_KEY = 'asl:gps_permission_granted'

export function AppProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('asl:preferred_lang') || 'en'
  })
  const [role, setRole] = useState('patient') // 'patient' | 'asha' | 'admin'
  const [screen, setScreen] = useState('home') // 'home' | 'check' | 'result' | 'asha' | 'admin' | 'map' | 'about'
  const [result, setResult] = useState(null)
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const [sosOpen, setSosOpen] = useState(false)
  const [gpsModalOpen, setGpsModalOpen] = useState(false)
  const [adminAuthModalOpen, setAdminAuthModalOpen] = useState(false)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem('asl:admin_auth') === 'true'
    } catch {
      return false
    }
  })
  const [userCoords, setUserCoords] = useState({
    lat: 21.1458,
    lng: 79.0882,
    accuracy: 35,
    active: false,
    label: 'Rampur Rural Sector',
  })
  const [gpsStatus, setGpsStatus] = useState('prompt') // 'prompt' | 'granted' | 'denied' | 'loading'
  const watchIdRef = useRef(null)

  // Hospitals state (dynamically anchored nearby around user)
  const [hospitals, setHospitals] = useState(() => {
    return generateHospitalsForCoordinates(21.1458, 79.0882)
  })

  // ASHA Patient Records state
  const [patientRecords, setPatientRecords] = useState(() => {
    try {
      const saved = localStorage.getItem(PATIENTS_STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Recalculate and regenerate nearby hospitals whenever userCoords change
  const applyCoordinates = useCallback((lat, lng, label = 'Live GPS Location', accuracy = 25) => {
    const coords = {
      lat,
      lng,
      accuracy,
      active: true,
      label,
    }
    setUserCoords(coords)
    const nearby = generateHospitalsForCoordinates(lat, lng)
    setHospitals(nearby)
    try {
      localStorage.setItem(HOSPITALS_STORAGE_KEY, JSON.stringify(nearby))
    } catch (e) {}
  }, [])

  // Sync language preference
  const changeLanguage = useCallback((lang) => {
    setLanguage(lang)
    localStorage.setItem('asl:preferred_lang', lang)
  }, [])

  // Translation helper
  const t = useCallback((key) => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.en
    return dict[key] || TRANSLATIONS.en[key] || key
  }, [language])

  // Admin Login / Logout
  const adminLogin = useCallback((pin) => {
    const validPins = ['1080', 'ADMIN2026', '1234']
    if (validPins.includes((pin || '').trim())) {
      setIsAdminAuthenticated(true)
      try {
        sessionStorage.setItem('asl:admin_auth', 'true')
      } catch (e) {}
      setRole('admin')
      setAdminAuthModalOpen(false)
      setScreen('admin')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return true
    }
    return false
  }, [])

  const adminLogout = useCallback(() => {
    setIsAdminAuthenticated(false)
    try {
      sessionStorage.removeItem('asl:admin_auth')
    } catch (e) {}
    setRole('patient')
    setScreen('home')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Screen Navigation with Admin Gate
  const go = useCallback((targetScreen) => {
    if (targetScreen === 'admin' && !isAdminAuthenticated) {
      setAdminAuthModalOpen(true)
      return
    }
    if (targetScreen === 'admin') {
      setRole('admin')
    } else if (targetScreen === 'asha') {
      setRole('asha')
    } else {
      setRole('patient')
    }
    setScreen(targetScreen)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [isAdminAuthenticated])

  // Request real device GPS and activate real-time continuous watch
  const requestGpsLocation = useCallback((isManual = true) => {
    if (!navigator.geolocation) {
      if (isManual) alert('Geolocation is not supported by your browser.')
      setGpsStatus('denied')
      return
    }

    setGpsStatus('loading')

    // 1. Immediate position fix
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords
        applyCoordinates(latitude, longitude, 'Live Device GPS (Real-Time)', accuracy || 20)
        setGpsStatus('granted')
        setGpsModalOpen(false)
        localStorage.setItem(GPS_PERMISSION_STORAGE_KEY, 'true')

        // 2. Start continuous real-time watch
        if (watchIdRef.current) {
          navigator.geolocation.clearWatch(watchIdRef.current)
        }

        watchIdRef.current = navigator.geolocation.watchPosition(
          (livePos) => {
            const { latitude: liveLat, longitude: liveLng, accuracy: liveAcc } = livePos.coords
            applyCoordinates(liveLat, liveLng, 'Live Device GPS (Real-Time)', liveAcc || 20)
          },
          (err) => {
            console.warn('Real-time GPS watch error:', err)
          },
          { enableHighAccuracy: true, maximumAge: 3000, timeout: 15000 }
        )
      },
      (err) => {
        console.warn('GPS request denied or timed out:', err)
        setGpsStatus('denied')
        if (isManual && err.code === 1) {
          alert('Location permission was denied. Please allow location in your browser settings to find nearest hospitals in real time.')
        }
      },
      { timeout: 12000, enableHighAccuracy: true }
    )
  }, [applyCoordinates])

  // Auto-check GPS on load if permission previously granted or prompt automatically
  useEffect(() => {
    if (localStorage.getItem(GPS_PERMISSION_STORAGE_KEY) === 'true') {
      requestGpsLocation(false)
    } else if (navigator.geolocation) {
      // Attempt passive real-time location query
      requestGpsLocation(false)
    }

    return () => {
      if (watchIdRef.current && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [requestGpsLocation])

  // Online / Offline tracking
  useEffect(() => {
    const goOnline = () => setIsOnline(true)
    const goOffline = () => setIsOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  // Hospital status update (Admin Portal)
  const updateHospitalCapacity = useCallback((hospitalId, updates) => {
    setHospitals((prev) => {
      const updated = prev.map((h) => (h.id === hospitalId ? { ...h, ...updates } : h))
      try {
        localStorage.setItem(HOSPITALS_STORAGE_KEY, JSON.stringify(updated))
      } catch (e) {
        console.error('Failed to save hospitals to storage', e)
      }
      return updated
    })
  }, [])

  // Save Patient Record (ASHA Portal)
  const savePatientRecord = useCallback((patientData) => {
    const newRecord = {
      id: 'REC-' + Date.now().toString(36).toUpperCase(),
      createdAt: new Date().toISOString(),
      ...patientData,
    }
    setPatientRecords((prev) => {
      const updated = [newRecord, ...prev]
      try {
        localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(updated))
      } catch (e) {
        console.error('Failed to persist patient record', e)
      }
      return updated
    })
    return newRecord
  }, [])

  // Delete Patient Record
  const deletePatientRecord = useCallback((recordId) => {
    setPatientRecords((prev) => {
      const updated = prev.filter((p) => p.id !== recordId)
      localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage: changeLanguage,
        t,
        LANGS,
        role,
        setRole,
        screen,
        go,
        result,
        setResult,
        isOnline,
        sosOpen,
        setSosOpen,
        userCoords,
        setUserCoords,
        applyCoordinates,
        gpsStatus,
        gpsModalOpen,
        setGpsModalOpen,
        requestGpsLocation,
        hospitals,
        updateHospitalCapacity,
        patientRecords,
        savePatientRecord,
        deletePatientRecord,
        activeSlip,
        setActiveSlip,
        adminAuthModalOpen,
        setAdminAuthModalOpen,
        isAdminAuthenticated,
        adminLogin,
        adminLogout,
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
