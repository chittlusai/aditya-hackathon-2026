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
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return 0
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

// Facility blueprint templates for dynamically generating nearby hospitals around any real-time GPS coordinates
const FACILITY_BLUEPRINTS = [
  {
    id: 1,
    name: 'Ayushman Arogya Mandir (Health Sub-Centre)',
    type: 'Health Sub-Centre',
    address: 'Village Rampur, Near Gram Panchayat Office, Sector 1',
    doctors_available: 1,
    specialist: 'Community Health Officer, Maternal & First Aid',
    medicine_stock: 'In stock',
    phone: '07152-240101',
    icu_beds: 0,
    emergency_ready: false,
    dLat: 0.0055,
    dLng: 0.0042,
  },
  {
    id: 2,
    name: 'Primary Health Centre (PHC), Sector 1',
    type: 'PHC (Govt)',
    address: 'Main Road, Near Bus Stand, Sector 1 Block',
    doctors_available: 2,
    specialist: 'General Physician, Family Medicine',
    medicine_stock: 'In stock',
    phone: '07152-240102',
    icu_beds: 2,
    emergency_ready: true,
    dLat: 0.0110,
    dLng: -0.0085,
  },
  {
    id: 3,
    name: 'Jan Swasthya Kendra & First-Aid Unit',
    type: 'PHC (Govt)',
    address: 'Govindpur Road, Opposite Primary School, Sub-District Zone',
    doctors_available: 2,
    specialist: 'General Physician, Pediatric',
    medicine_stock: 'In stock',
    phone: '07152-240103',
    icu_beds: 1,
    emergency_ready: true,
    dLat: -0.0145,
    dLng: 0.0120,
  },
  {
    id: 4,
    name: 'Community Health Centre (CHC), Central Block',
    type: 'CHC (Govt)',
    address: 'Central Hospital Road, Tehsil Headquarter Complex',
    doctors_available: 5,
    specialist: 'General Physician, Pediatric, Gynecologist',
    medicine_stock: 'In stock',
    phone: '07152-240104',
    icu_beds: 6,
    emergency_ready: true,
    dLat: 0.0220,
    dLng: 0.0240,
  },
  {
    id: 5,
    name: 'Maternal & Child Health Care Hospital',
    type: 'Govt Maternity Centre',
    address: 'NH-6 Link Road, Near Anganwadi Centre, Block East',
    doctors_available: 3,
    specialist: 'Gynecologist, Pediatrician',
    medicine_stock: 'In stock',
    phone: '07152-240105',
    icu_beds: 4,
    emergency_ready: true,
    dLat: -0.0260,
    dLng: -0.0180,
  },
  {
    id: 6,
    name: 'Sub-District Civil Hospital',
    type: 'Govt Hospital',
    address: 'Station Road, Opposite Municipal Office, Mehkar Sub-Division',
    doctors_available: 6,
    specialist: 'Orthopedic, General Surgeon, ENT, General Physician',
    medicine_stock: 'In stock',
    phone: '07152-240106',
    icu_beds: 8,
    emergency_ready: true,
    dLat: 0.0410,
    dLng: -0.0350,
  },
  {
    id: 7,
    name: 'Emergency Trauma & Critical Care Unit',
    type: 'Govt Trauma Hospital',
    address: 'State Highway 10 Bypass, Near Toll Plaza & Highway Crossroad',
    doctors_available: 8,
    specialist: 'Orthopedic, Neurologist, General Surgeon, Emergency Medicine',
    medicine_stock: 'In stock',
    phone: '07152-240107',
    icu_beds: 14,
    emergency_ready: true,
    dLat: -0.0480,
    dLng: 0.0520,
  },
  {
    id: 8,
    name: 'District Multi-Specialty Civil Hospital',
    type: 'District Hospital (Govt)',
    address: 'Civil Lines, Main District Collectorate Square, District HQ',
    doctors_available: 12,
    specialist: 'Cardiologist, Neurologist, Orthopedic, Gynecologist, Pediatrician, General Physician',
    medicine_stock: 'In stock',
    phone: '07152-240108',
    icu_beds: 28,
    emergency_ready: true,
    dLat: 0.0650,
    dLng: 0.0620,
  },
  {
    id: 9,
    name: 'Arogya Rural Dispensary',
    type: 'Govt Dispensary',
    address: 'Bilaspur Rural Sector, Post Bilaspur Gram',
    doctors_available: 1,
    specialist: 'General Medicine',
    medicine_stock: 'In stock',
    phone: '07152-240109',
    icu_beds: 0,
    emergency_ready: false,
    dLat: 0.0160,
    dLng: 0.0190,
  },
  {
    id: 10,
    name: 'Sanjivani Community Clinic',
    type: 'Private Clinic',
    address: 'Market Yard, Shop No. 4, Old Tehsil Market',
    doctors_available: 2,
    specialist: 'General Physician, Dermatologist',
    medicine_stock: 'In stock',
    phone: '07152-240110',
    icu_beds: 0,
    emergency_ready: false,
    dLat: -0.0190,
    dLng: -0.0220,
  },
  {
    id: 11,
    name: 'LifeCare Nursing & Emergency Unit',
    type: 'Private Hospital',
    address: 'Wardha-Nagpur Road, Plot 12, Rural Industrial Belt',
    doctors_available: 4,
    specialist: 'General Physician, Orthopedic, ENT',
    medicine_stock: 'In stock',
    phone: '07152-240111',
    icu_beds: 5,
    emergency_ready: true,
    dLat: 0.0350,
    dLng: 0.0410,
  },
  {
    id: 12,
    name: 'Apex Cardiac & General Hospital',
    type: 'Private Hospital',
    address: 'Kalyan Nagar, Near Water Tank, Ring Road Crossroad',
    doctors_available: 7,
    specialist: 'Cardiologist, General Physician, Nephrologist',
    medicine_stock: 'In stock',
    phone: '07152-240112',
    icu_beds: 12,
    emergency_ready: true,
    dLat: -0.0520,
    dLng: -0.0450,
  },
]

/**
 * Dynamically generates real-time nearby hospitals anchored around the user's live latitude & longitude.
 * Calculates exact Haversine distance and sorts from nearest to farthest.
 */
export function generateHospitalsForCoordinates(userLat, userLng) {
  const baseLat = typeof userLat === 'number' && !isNaN(userLat) ? userLat : 21.1458
  const baseLng = typeof userLng === 'number' && !isNaN(userLng) ? userLng : 79.0882

  const list = FACILITY_BLUEPRINTS.map((facility) => {
    const lat = Number((baseLat + facility.dLat).toFixed(6))
    const lng = Number((baseLng + facility.dLng).toFixed(6))
    const distance_km = calculateDistance(baseLat, baseLng, lat, lng)

    return {
      id: facility.id,
      name: facility.name,
      type: facility.type,
      address: facility.address,
      doctors_available: facility.doctors_available,
      specialist: facility.specialist,
      medicine_stock: facility.medicine_stock,
      phone: facility.phone,
      icu_beds: facility.icu_beds,
      emergency_ready: facility.emergency_ready,
      lat,
      lng,
      distance_km,
    }
  })

  // Sort nearest first
  list.sort((a, b) => a.distance_km - b.distance_km)
  return list
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

  const ADVICE_DICT = {
    Mild: {
      hi: 'आपके लक्षण सामान्य हैं। पर्याप्त पानी पिएं, विश्राम करें और 2 दिन में सुधार न होने पर स्वास्थ्य केंद्र जाएं।',
      te: 'మీ లక్షణాలు తేలికపాటివి. పుష్కలంగా ద్రవాలు తాగండి, విశ్రాంతి తీసుకోండి. 2 రోజుల్లో తగ్గకపోతే స్థానిక ఆరోగ్య కేంద్రాన్ని సందర్శించండి.',
      ta: 'உங்கள் அறிகுறிகள் லேசானவை. போதுமான தண்ணீர் குடிக்கவும், ஓய்வெடுக்கவும்.',
      mr: 'आपली लक्षणे सौम्य आहेत. भरपूर पाणी प्या, विश्रांती घ्या आणि त्रास वाढल्यास डॉक्टरांचा सल्ला घ्या.',
      bn: 'আপনার লক্ষণগুলি মৃদু। পর্যাপ্ত জল পান করুন এবং বিশ্রাম নিন।',
      gu: 'તમારા લક્ષણો સામાન્ય છે. પૂરતું પાણી પીવો અને આરામ કરો.',
      kn: 'ನಿಮ್ಮ ಲಕ್ಷಣಗಳು ಸೌಮ್ಯವಾಗಿವೆ. ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ ಮತ್ತು ಸಾಕಷ್ಟು ನೀರು ಕುಡಿಯಿರಿ.',
      ml: 'നിങ്ങളുടെ ലക്ഷണങ്ങൾ നേരിയതാണ്. വിശ്രമിക്കുക, ധാരാളം വെള്ളം കുടിക്കുക.',
      pa: 'ਤੁਹਾਡੇ ਲੱਛਣ ਆਮ ਹਨ। ਆਰਾਮ ਕਰੋ ਅਤੇ ਕਾਫ਼ੀ ਪਾਣੀ ਪੀਓ।',
      or: 'ଆପଣଙ୍କ ଲକ୍ଷଣ ସାଧାରଣ ଅଟେ। ବିଶ୍ରାମ ନିଅନ୍ତୁ ଏବଂ ଯଥେଷ୍ଟ ପାଣି ପିଅନ୍ତୁ।',
      as: 'আপোনাৰ লক্ষণসমূহ সাধাৰণ। জিৰণি লওক আৰু পৰ্যাপ্ত পানী খাওক।',
      ur: 'آپ کی علامات معمولی ہیں۔ کافی پانی پیئیں اور آرام کریں۔',
      sa: 'भवतः लक्षणाणि सामान्यानि सन्ति। पर्याप्तं जलं पिबन्तु, विश्रामं कुर्वन्तु।',
      mai: 'अहाँक लक्षण सामान्य अछि। पानि पिबू आ आराम करू।',
      kok: 'तुमचीं लक्षणां सादारण आसात. विश्रांती घेयात आनी उदक पियेयात.',
      ne: 'तपाईंको लक्षणहरू सामान्य छन्। आराम गर्नुहोस् र प्रशस्त पानी पिउनुहोस्।',
      en: 'Your symptoms appear mild. Rest, stay hydrated, and visit a local clinic if symptoms persist.',
    },
    Moderate: {
      hi: 'आपकी स्थिति में चिकित्सकीय जांच आवश्यक है। कृपया आज ही नजदीकी प्राथमिक स्वास्थ्य केंद्र (PHC) या सीएचसी में डॉक्टर से मिलें।',
      te: 'మీ పరిస్థితికి వైద్య పరీక్ష అవసరం. దయచేసి ఈరోజే సమీపంలోని ప్రాథమిక ఆరోగ్య కేంద్రం (PHC) లేదా సీహెచ్‌సీకి వెళ్లండి.',
      ta: 'மருத்துவ பரிசோதனை தேவை. இன்றே ஆரம்ப சுகாதார நிலையத்திற்கு (PHC) செல்லவும்.',
      mr: 'आपली तपासणी आवश्यक आहे. कृपया आजच जवळच्या प्राथमिक आरोग्य केंद्रात (PHC) डॉक्टरांचा सल्ला घ्या.',
      bn: 'ডাক্তারি পরীক্ষা প্রয়োজন। আজই নিকটস্থ প্রাথমিক স্বাস্থ্য কেন্দ্রে (PHC) যান।',
      gu: 'તબીબી તપાસ જરૂરી છે. આજે જ નજીકના પ્રાથમિક આરોગ્ય કેન્દ્ર (PHC) ની મુલાકાત લો.',
      kn: 'ವೈದ್ಯಕೀಯ ತಪಾಸಣೆ ಅಗತ್ಯವಿದೆ. ಇಂದೇ ಸಮೀಪದ ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಕೇಂದ್ರಕ್ಕೆ (PHC) ಭೇಟಿ ನೀಡಿ.',
      ml: 'ഡോക്ടറുടെ പരിശോധന ആവശ്യം. ഇന്ന് തന്നെ പ്രാഥമിക ആരോഗ്യ കേന്ദ്രത്തിൽ (PHC) പോകുക.',
      pa: 'ਡਾਕਟਰੀ ਜਾਂਚ ਦੀ ਲੋੜ ਹੈ। ਅੱਜ ਹੀ ਨੇੜਲੇ ਪ੍ਰਾਇਮਰੀ ਹੈਲਥ ਸੈਂਟਰ (PHC) ਜਾਓ।',
      or: 'ଡାକ୍ତରୀ ପରୀକ୍ଷା ଆବଶ୍ୟକ। ଆଜି ହିଁ ପ୍ରାଥମିକ ସ୍ୱାସ୍ଥ୍ୟ କେନ୍ଦ୍ର (PHC) କୁ ଯାଆନ୍ତୁ।',
      as: 'চিকিৎসকৰ পৰীক্ষা প্ৰয়োজন। আজিই প্ৰাথমিক স্বাস্থ্য কেন্দ্ৰলৈ (PHC) যাওক।',
      ur: 'طبی معائنہ ضروری ہے۔ آج ہی پرائمری ہیلتھ سنٹر (PHC) جائیں۔',
      sa: 'वैद्यकीयपरीक्षणम् आवश्यकम्। अद्यैव प्राथमिकस्वास्थ्यकेन्द्रं गच्छतु।',
      mai: 'डॉक्टर स जांच आवश्यक अछि। आजि प्राथमिक स्वास्थ्य केंद्र जाउ।',
      kok: 'वैजकी तपासणी गरजेची. आयजच प्राथमिक भलायकी केंद्रांत वचात.',
      ne: 'स्वास्थ्य जाँच आवश्यक छ। आजै प्राथमिक स्वास्थ्य केन्द्र जानुहोस्।',
      en: 'Your symptoms require clinical evaluation within the next 4-6 hours. Visit a nearby PHC or Community Health Centre.',
    },
    Emergency: {
      hi: 'गंभीर स्थिति के लक्षण हैं। कृपया बिना देर किए नजदीकी अस्पताल के इमरजेंसी वार्ड में जाएं या 108 एम्बुलेंस को कॉल करें।',
      te: 'తీవ్రమైన అత్యవసర పరిస్థితి గుర్తించబడింది. దయచేసి వెంటనే సమీప ఆసుపత్రికి వెళ్లండి లేదా 108 అంబులెన్స్‌కు కాల్ చేయండి.',
      ta: 'தீவிர அறிகுறிகள். உடனடியாக மருத்துவமனைக்கு செல்லவும் அல்லது 108 அழைக்கவும்.',
      mr: 'गंभीर स्थिती आढळली आहे. तातडीने जवळच्या रुग्णालयात जा किंवा १०८ रुग्णवाहिका बोलवा.',
      bn: 'জরুরি অবস্থা। অবিলম্বে নিকটস্থ হাসপাতালে যান অথবা ১০৮ কল করুন।',
      gu: 'ગંભીર લક્ષણો છે. તરત જ નજીકની હોસ્પિટલમાં જાઓ અથવા 108 પર કૉલ કરો.',
      kn: 'ತುರ್ತು ಪರಿಸ್ಥಿತಿ. ತಕ್ಷಣ ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆಗೆ ಹೋಗಿ ಅಥವಾ 108 ಗೆ ಕರೆ ಮಾಡಿ.',
      ml: 'ഗുരുതരമായ അവസ്ഥ. ഉടൻ അടുത്തുള്ള ആശുപത്രിയിൽ പോകുക അല്ലെങ്കിൽ 108 വിളിക്കുക.',
      pa: 'ਗੰਭੀਰ ਸਥਿਤੀ ਹੈ। ਤੁਰੰਤ ਹਸਪਤਾਲ ਜਾਓ ਜਾਂ 108 ਐਂਬੂਲੈਂਸ ਬੁਲਾਓ।',
      or: 'ଗୁରୁତର ସ୍ଥିତି। ତୁରନ୍ତ ଡାକ୍ତରଖାନା ଯାଆନ୍ତୁ ବା 108 କଲ୍ କରନ୍ତୁ।',
      as: 'গুৰুতৰ অৱস্থা। ততালিকে চিকিৎসালয়লৈ যাওক বা ১০৮ মাতক।',
      ur: 'ہنگامی حالت۔ فوری طور پر قریبی ہسپتال جائیں یا 108 کال کریں۔',
      sa: 'आत्ययिकी स्थितिः। अविलम्बं चिकित्सालयं गच्छतु १०८ वा आह्वयतु।',
      mai: 'गंभीर स्थिति अछि। तुरंत अस्पताल जाउ वा 108 बजाउ।',
      kok: 'गंभीर स्थिती आसा. तातडीन हॉस्पिटलांत वचात वा १०८ कॉल करात.',
      ne: 'गम्भीर अवस्था। तत्काल अस्पताल जानुहोस् वा १०८ बोलाउनुहोस्।',
      en: 'Critical health condition detected. Please reach the nearest emergency hospital immediately or call 108 ambulance service.',
    },
  }

  if (emergencyScore >= 3) {
    urgency = 'Emergency'
    confidence = Math.min(0.99, 0.72 + emergencyScore * 0.04)
  } else if (moderateScore >= 3 || emergencyScore > 0) {
    urgency = 'Moderate'
    confidence = Math.min(0.95, 0.65 + moderateScore * 0.04)
  }

  const langDict = ADVICE_DICT[urgency] || ADVICE_DICT.Moderate
  const advice = langDict[language] || langDict.en || langDict.hi

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
