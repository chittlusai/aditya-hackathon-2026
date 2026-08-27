/**
 * AppContext.jsx
 * Central state store for Arogya Setu Local
 * Handles roles, multilingual translation, live hospital capacity,
 * offline patient records, GPS location tracking & distance calculation,
 * and emergency SOS modal.
 */
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { TRANSLATIONS } from '../utils/i18n.js'
import { INITIAL_HOSPITALS, calculateDistance } from '../utils/localTriage.js'

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
  const [activeSlip, setActiveSlip] = useState(null)
  const [gpsModalOpen, setGpsModalOpen] = useState(false)

  // Live GPS Coordinates
  const [userCoords, setUserCoords] = useState({
    lat: 21.1458,
    lng: 79.0882,
    active: false,
    label: 'Rampur Rural Sector',
  })
  const [gpsStatus, setGpsStatus] = useState('prompt') // 'prompt' | 'granted' | 'denied' | 'loading'

  // Hospitals state (with offline persistence)
  const [hospitals, setHospitals] = useState(() => {
    try {
      const saved = localStorage.getItem(HOSPITALS_STORAGE_KEY)
      return saved ? JSON.parse(saved) : INITIAL_HOSPITALS
    } catch {
      return INITIAL_HOSPITALS
    }
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

  // Recalculate hospital distances whenever userCoords change
  const recalculateHospitalDistances = useCallback((coords) => {
    if (!coords || !coords.lat || !coords.lng) return

    setHospitals((prev) => {
      const recalculated = prev.map((h) => {
        if (h.lat && h.lng) {
          const dist = calculateDistance(coords.lat, coords.lng, h.lat, h.lng)
          return { ...h, distance_km: dist }
        }
        return h
      })
      // Sort nearest first
      recalculated.sort((a, b) => (a.distance_km || 99) - (b.distance_km || 99))
      return recalculated
    })
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

  // Screen Navigation
  const go = useCallback((targetScreen) => {
    setScreen(targetScreen)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Request real device GPS
  const requestGpsLocation = useCallback((isManual = true) => {
    if (!navigator.geolocation) {
      if (isManual) alert('Geolocation is not supported by your browser.')
      setGpsStatus('denied')
      return
    }

    setGpsStatus('loading')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          active: true,
          label: 'Live Device GPS',
        }
        setUserCoords(coords)
        setGpsStatus('granted')
        setGpsModalOpen(false)
        localStorage.setItem(GPS_PERMISSION_STORAGE_KEY, 'true')
        recalculateHospitalDistances(coords)
      },
      (err) => {
        console.warn('GPS request denied or timed out:', err)
        setGpsStatus('denied')
        if (isManual && err.code === 1) {
          alert('Location permission was denied. Please allow location in your browser settings to find nearest hospitals.')
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }, [recalculateHospitalDistances])

  // Auto-check GPS on first load if already previously granted
  useEffect(() => {
    if (localStorage.getItem(GPS_PERMISSION_STORAGE_KEY) === 'true') {
      requestGpsLocation(false)
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
