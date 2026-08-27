/**
 * localTriage.js
 * Offline-first clinical triage engine, GPS calculator, and dynamic hospital ranker.
 */

// Keyword rules with multilingual triggers (English, Hindi, Marathi)
const EMERGENCY_SIGNALS = [
  { term: 'chest pain', weight: 4 },
  { term: 'सीने में दर्द', weight: 4 },
  { term: 'छातीत दुखणे', weight: 4 },
  { term: 'heart attack', weight: 5 },
  { term: 'stroke', weight: 5 },
  { term: 'cant breathe', weight: 5 },
  { term: "can't breathe", weight: 5 },
  { term: 'cannot breathe', weight: 5 },
  { term: 'shortness of breath', weight: 4 },
  { term: 'सांस लेने में तकलीफ', weight: 4 },
  { term: 'श्वास घेण्यास त्रास', weight: 4 },
  { term: 'unconscious', weight: 5 },
  { term: 'बेहोश', weight: 5 },
  { term: 'seizure', weight: 5 },
  { term: 'दौरा', weight: 5 },
  { term: 'severe bleeding', weight: 5 },
  { term: 'खून बहना', weight: 5 },
  { term: 'snake bite', weight: 5 },
  { term: 'सांप', weight: 5 },
  { term: 'poison', weight: 5 },
  { term: 'anaphylaxis', weight: 5 },
  { term: 'fracture', weight: 3 },
  { term: 'head injury', weight: 4 },
  { term: 'choking', weight: 5 },
]

const MODERATE_SIGNALS = [
  { term: 'high fever', weight: 3 },
  { term: 'तेज बुखार', weight: 3 },
  { term: 'तीव्र ताप', weight: 3 },
  { term: 'fever 3 days', weight: 3 },
  { term: 'fever for 3 days', weight: 3 },
  { term: 'persistent fever', weight: 3 },
  { term: 'vomiting', weight: 2 },
  { term: 'उल्टी', weight: 2 },
  { term: 'diarrhea', weight: 2 },
  { term: 'दस्त', weight: 2 },
  { term: 'dehydration', weight: 3 },
  { term: 'abdominal pain', weight: 2 },
  { term: 'पेट दर्द', weight: 2 },
  { term: 'dizziness', weight: 2 },
  { term: 'चक्कर', weight: 2 },
  { term: 'infection', weight: 2 },
  { term: 'asthma', weight: 3 },
  { term: 'wheezing', weight: 2 },
  { term: 'severe headache', weight: 2 },
  { term: 'सिरदर्द', weight: 2 },
  { term: 'wound', weight: 2 },
  { term: 'pregnancy pain', weight: 4 },
]

const SPECIALTY_MAP = {
  cardio: ['chest pain', 'heart', 'bp high', 'hypertension', 'सीने में दर्द', 'छातीत दुखणे', 'cardiac'],
  neuro: ['seizure', 'stroke', 'headache', 'dizziness', 'faint', 'चक्कर', 'दौरा', 'बेहोश'],
  ortho: ['fracture', 'bone', 'joint', 'sprain', 'knee', 'accident', 'चोट', 'हड्डी'],
  pediatric: ['child', 'baby', 'infant', 'toddler', 'kid', 'बच्चा', 'मूल'],
  gyn: ['pregnant', 'pregnancy', 'labor', 'period', 'bleeding', 'गर्भवती', 'गरोदर'],
  ent: ['ear', 'throat', 'sinus', 'cough', 'cold', 'गला', 'कान'],
  derm: ['rash', 'skin', 'itching', 'allergy', 'दाद', 'त्वचा'],
  general: ['fever', 'headache', 'vomiting', 'diarrhea', 'weakness', 'बुखार', 'ताप']
}

// 18 Mock Hospital Facilities with realistic rural coordinates (Center: Latitude 21.1458, Longitude 79.0882)
export const INITIAL_HOSPITALS = [
  {
    id: 1,
    name: 'Primary Health Centre, Rampur',
    distance_km: 2.3,
    type: 'PHC (Govt)',
    doctors_available: 2,
    specialist: 'General Physician',
    medicine_stock: 'In stock',
    phone: '+91-9876543210',
    lat: 21.1550,
    lng: 79.0980,
    icu_beds: 1,
    emergency_ready: true,
  },
  {
    id: 2,
    name: 'Community Health Centre, Govindpur',
    distance_km: 6.8,
    type: 'CHC (Govt)',
    doctors_available: 4,
    specialist: 'General Physician, Pediatric',
    medicine_stock: 'In stock',
    phone: '+91-9876543211',
    lat: 21.1820,
    lng: 79.1250,
    icu_beds: 4,
    emergency_ready: true,
  },
  {
    id: 3,
    name: 'District Civil Hospital',
    distance_km: 14.2,
    type: 'District Hospital (Govt)',
    doctors_available: 8,
    specialist: 'Cardiologist, Neurologist, Orthopedic, General Physician, Pediatric, Gynecologist',
    medicine_stock: 'In stock',
    phone: '+91-9876543212',
    lat: 21.2200,
    lng: 79.1600,
    icu_beds: 18,
    emergency_ready: true,
  },
  {
    id: 4,
    name: 'Sub-District Hospital, Mehkar',
    distance_km: 9.1,
    type: 'Govt Hospital',
    doctors_available: 3,
    specialist: 'General Physician, Orthopedic, ENT',
    medicine_stock: 'Low stock',
    phone: '+91-9876543213',
    lat: 21.1100,
    lng: 79.0200,
    icu_beds: 3,
    emergency_ready: true,
  },
  {
    id: 5,
    name: 'Arogya Clinic, Lakhanpur',
    distance_km: 1.1,
    type: 'Private Clinic',
    doctors_available: 1,
    specialist: 'General Physician',
    medicine_stock: 'In stock',
    phone: '+91-9876543214',
    lat: 21.1490,
    lng: 79.0910,
    icu_beds: 0,
    emergency_ready: false,
  },
  {
    id: 6,
    name: 'Shri Ram Health Centre',
    distance_km: 4.7,
    type: 'Private Clinic',
    doctors_available: 2,
    specialist: 'Dermatologist, General Physician',
    medicine_stock: 'In stock',
    phone: '+91-9876543215',
    lat: 21.1350,
    lng: 79.1200,
    icu_beds: 1,
    emergency_ready: false,
  },
  {
    id: 7,
    name: 'Sanjeevani Multispeciality Hospital',
    distance_km: 11.5,
    type: 'Private Hospital',
    doctors_available: 5,
    specialist: 'Cardiologist, General Physician, Neurologist',
    medicine_stock: 'In stock',
    phone: '+91-9876543216',
    lat: 21.2050,
    lng: 79.1450,
    icu_beds: 10,
    emergency_ready: true,
  },
  {
    id: 8,
    name: 'Maa Durga Maternity Home',
    distance_km: 5.0,
    type: 'Maternity Care (Private)',
    doctors_available: 2,
    specialist: 'Gynecologist, Pediatric',
    medicine_stock: 'In stock',
    phone: '+91-9876543217',
    lat: 21.1620,
    lng: 79.0600,
    icu_beds: 2,
    emergency_ready: true,
  },
  {
    id: 9,
    name: 'Jeevan Jyoti Clinic',
    distance_km: 3.2,
    type: 'Private Clinic',
    doctors_available: 1,
    specialist: 'General Physician',
    medicine_stock: 'Out of stock',
    phone: '+91-9876543218',
    lat: 21.1380,
    lng: 79.0720,
    icu_beds: 0,
    emergency_ready: false,
  },
  {
    id: 10,
    name: 'Rural Health Sub-Centre, Pathara',
    distance_km: 0.8,
    type: 'Sub-Centre (Govt)',
    doctors_available: 1,
    specialist: 'None',
    medicine_stock: 'Low stock',
    phone: '+91-9876543219',
    lat: 21.1440,
    lng: 79.0830,
    icu_beds: 0,
    emergency_ready: false,
  },
  {
    id: 11,
    name: 'Sai Super-Speciality Hospital',
    distance_km: 16.4,
    type: 'Private Super-Speciality',
    doctors_available: 6,
    specialist: 'Cardiologist, Orthopedic, Neurologist, General Physician, Dermatologist',
    medicine_stock: 'In stock',
    phone: '+91-9876543220',
    lat: 21.2400,
    lng: 79.1800,
    icu_beds: 15,
    emergency_ready: true,
  },
  {
    id: 12,
    name: 'Govt Ayurvedic Dispensary, Bhilwara',
    distance_km: 7.6,
    type: 'Ayurvedic (Govt)',
    doctors_available: 1,
    specialist: 'Ayurvedic Practitioner',
    medicine_stock: 'In stock',
    phone: '+91-9876543221',
    lat: 21.1700,
    lng: 79.0300,
    icu_beds: 0,
    emergency_ready: false,
  },
  {
    id: 13,
    name: 'Lifecare Emergency Hospital',
    distance_km: 8.9,
    type: 'Private Emergency',
    doctors_available: 4,
    specialist: 'Cardiologist, Neurologist, Orthopedic',
    medicine_stock: 'In stock',
    phone: '+91-9876543222',
    lat: 21.1900,
    lng: 79.0700,
    icu_beds: 8,
    emergency_ready: true,
  },
  {
    id: 14,
    name: 'Jan Swasthya Kendra, Khandwa',
    distance_km: 5.5,
    type: 'PHC (Govt)',
    doctors_available: 2,
    specialist: 'General Physician, Pediatric',
    medicine_stock: 'In stock',
    phone: '+91-9876543223',
    lat: 21.1200,
    lng: 79.1100,
    icu_beds: 2,
    emergency_ready: true,
  },
  {
    id: 15,
    name: 'Apollo Rural Clinic',
    distance_km: 12.0,
    type: 'Private Clinic',
    doctors_available: 3,
    specialist: 'General Physician, ENT, Dermatologist',
    medicine_stock: 'In stock',
    phone: '+91-9876543224',
    lat: 21.2100,
    lng: 79.0500,
    icu_beds: 2,
    emergency_ready: true,
  },
  {
    id: 16,
    name: 'Trauma & Emergency Centre',
    distance_km: 13.7,
    type: 'Govt Trauma Hospital',
    doctors_available: 7,
    specialist: 'Orthopedic, Neurologist, General Physician',
    medicine_stock: 'In stock',
    phone: '+91-9876543225',
    lat: 21.2250,
    lng: 79.1300,
    icu_beds: 12,
    emergency_ready: true,
  },
  {
    id: 17,
    name: 'Sahara Women & Child Hospital',
    distance_km: 6.0,
    type: 'Private Maternity & Child',
    doctors_available: 3,
    specialist: 'Gynecologist, Pediatric',
    medicine_stock: 'In stock',
    phone: '+91-9876543226',
    lat: 21.1650,
    lng: 79.1150,
    icu_beds: 4,
    emergency_ready: true,
  },
  {
    id: 18,
    name: 'Smile Dental & Skin Clinic',
    distance_km: 4.3,
    type: 'Private Clinic',
    doctors_available: 2,
    specialist: 'Dentist, Dermatologist',
    medicine_stock: 'In stock',
    phone: '+91-9876543227',
    lat: 21.1400,
    lng: 79.1100,
    icu_beds: 0,
    emergency_ready: false,
  }
]

// Haversine formula for calculating GPS distance between two coordinates in km
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Number((R * c).toFixed(1))
}

export function detectSpecialty(text) {
  const t = (text || '').toLowerCase()
  const scores = {}
  for (const [spec, keywords] of Object.entries(SPECIALTY_MAP)) {
    scores[spec] = 0
    for (const k of keywords) {
      if (t.includes(k.toLowerCase())) scores[spec]++
    }
  }
  const best = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b)
  return scores[best] > 0 ? best : 'general'
}

/**
 * Local offline triage assessment with optional Vitals risk calculation
 */
export function classifyLocalUrgency(symptomText = '', vitals = {}, language = 'en') {
  const lower = symptomText.toLowerCase()
  let emergencyScore = 0
  let moderateScore = 0
  const matched = []

  // Check emergency keywords
  for (const item of EMERGENCY_SIGNALS) {
    if (lower.includes(item.term.toLowerCase())) {
      emergencyScore += item.weight
      if (!matched.includes(item.term)) matched.push(item.term)
    }
  }

  // Check moderate keywords
  for (const item of MODERATE_SIGNALS) {
    if (lower.includes(item.term.toLowerCase())) {
      moderateScore += item.weight
      if (!matched.includes(item.term)) matched.push(item.term)
    }
  }

  // Vitals Risk Escalation
  const spo2 = Number(vitals.spo2)
  const pulse = Number(vitals.pulse)
  const temp = Number(vitals.temp)
  const isPregnant = Boolean(vitals.isPregnant)

  if (spo2 && spo2 < 90) {
    emergencyScore += 5
    matched.push(`Critical SpO2 (${spo2}%)`)
  } else if (spo2 && spo2 < 94) {
    moderateScore += 3
    matched.push(`Low SpO2 (${spo2}%)`)
  }

  if (pulse && (pulse > 130 || pulse < 45)) {
    emergencyScore += 4
    matched.push(`Abnormal Pulse (${pulse} bpm)`)
  }

  if (temp && temp >= 103) {
    moderateScore += 3
    matched.push(`High Fever (${temp}°F)`)
  }

  if (isPregnant && (emergencyScore > 0 || moderateScore > 2)) {
    emergencyScore += 3
    matched.push('High-risk pregnancy flag')
  }

  // Determine urgency level
  let urgency = 'Mild'
  let confidence = 0.65
  let advice = 'Your symptoms appear mild. Rest, stay hydrated, and visit a local clinic if symptoms persist.'

  if (emergencyScore >= 3) {
    urgency = 'Emergency'
    confidence = Math.min(0.99, 0.72 + emergencyScore * 0.04)
    advice = 'Critical health condition detected. Please reach the nearest emergency hospital immediately or call 108 ambulance service.'
  } else if (moderateScore >= 3 || emergencyScore > 0) {
    urgency = 'Moderate'
    confidence = Math.min(0.95, 0.65 + moderateScore * 0.04)
    advice = 'Your symptoms require clinical evaluation within the next 4-6 hours. Visit a nearby PHC or Community Health Centre.'
  }

  return {
    urgency,
    confidence: Number(confidence.toFixed(2)),
    matched_keywords: matched,
    advice,
  }
}

/**
 * Score and rank hospitals
 */
export function matchLocalHospital(urgency, symptoms, hospitalList = INITIAL_HOSPITALS, userCoords = null) {
  if (!hospitalList || hospitalList.length === 0) return null

  // If user coordinates provided, update distances
  const hospitals = hospitalList.map(h => {
    if (userCoords && userCoords.lat && userCoords.lng && h.lat && h.lng) {
      const calculatedDist = calculateDistance(userCoords.lat, userCoords.lng, h.lat, h.lng)
      return { ...h, distance_km: calculatedDist }
    }
    return h
  })

  const specialty = detectSpecialty(symptoms)
  
  let wDist = 0.50, wAvail = 0.20, wSpec = 0.15, wStock = 0.15
  if (urgency === 'Emergency') {
    wDist = 0.45; wAvail = 0.35; wSpec = 0.15; wStock = 0.05
  } else if (urgency === 'Moderate') {
    wDist = 0.30; wAvail = 0.30; wSpec = 0.25; wStock = 0.15
  }

  const maxDist = Math.max(...hospitals.map(h => h.distance_km || 1), 1)
  const maxAvail = Math.max(...hospitals.map(h => h.doctors_available || 1), 1)

  const scoredHospitals = hospitals.map(h => {
    const dist = h.distance_km || 1
    const avail = h.doctors_available || 0
    const specText = (h.specialist || '').toLowerCase()
    
    // Stock Score
    const stockLower = (h.medicine_stock || '').toLowerCase()
    let stockScore = 0.5
    if (stockLower.includes('in stock') || stockLower.includes('good')) stockScore = 1.0
    else if (stockLower.includes('low')) stockScore = 0.4
    else if (stockLower.includes('out')) stockScore = 0.0

    // Distance Score (closer = better)
    const distScore = 1.0 - (dist / (maxDist * 1.1))

    // Doctor availability
    const availScore = avail / (maxAvail || 1)

    // Specialist Score
    let specScore = 0.3
    if (specialty !== 'general' && specText.includes(specialty)) {
      specScore = 1.0
    } else if (h.specialist && h.specialist !== 'None') {
      specScore = 0.6
    }

    const totalScore = (wDist * distScore) + (wAvail * availScore) + (wSpec * specScore) + (wStock * stockScore)

    // Match Reason
    const reasons = []
    if (urgency === 'Emergency') reasons.push('Closest equipped emergency care')
    else if (urgency === 'Moderate') reasons.push('Optimal for secondary clinical care')
    else reasons.push('Convenient nearby primary health option')

    if (h.doctors_available >= 3) reasons.push(`${h.doctors_available} doctors on duty`)
    if (specialty !== 'general' && specText.includes(specialty)) {
      reasons.push(`${specialty.toUpperCase()} specialist available`)
    }
    if (stockScore === 1.0) reasons.push('Full essential medicine inventory')
    if (dist < 4) reasons.push(`Only ${dist.toFixed(1)} km away`)

    const matchReason = 'Selected: ' + reasons.join(' • ') + '.'

    return {
      ...h,
      match_score: Number(Math.max(0.1, totalScore).toFixed(3)),
      match_reason: matchReason,
    }
  })

  // Sort descending
  scoredHospitals.sort((a, b) => b.match_score - a.match_score)

  return {
    best: scoredHospitals[0],
    alternatives: scoredHospitals.slice(1, 4),
    all: scoredHospitals
  }
}
