import { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Phone, Navigation } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

// Helper to recenter map dynamically
function MapUpdater({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom || 13, { animate: true })
    }
  }, [center, zoom, map])
  return null
}

const createUserIcon = () =>
  L.divIcon({
    className: 'custom-user-marker',
    html: `
      <div style="position: relative; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;">
        <span style="position: absolute; width: 22px; height: 22px; border-radius: 50%; background-color: #2563eb; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
        <span style="position: relative; width: 14px; height: 14px; border-radius: 50%; background-color: #1d4ed8; border: 2px solid #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></span>
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  })

const createHospitalIcon = (isRecommended, isEmergency) => {
  const bg = isEmergency ? '#b91c1c' : isRecommended ? '#1d4ed8' : '#047857'
  const symbol = isEmergency ? '🚨' : isRecommended ? '⭐' : '🏥'
  const size = isRecommended ? 32 : 26

  return L.divIcon({
    className: 'custom-hospital-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        border-radius: 8px;
        background-color: ${bg};
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${isRecommended ? '14px' : '11px'};
        border: 2px solid #ffffff;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        cursor: pointer;
      ">
        ${symbol}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

export default function HospitalMap({
  recommendedHospital,
  allHospitals = [],
  height = '420px',
}) {
  const { userCoords, t } = useApp()

  const defaultCenter = [21.1458, 79.0882]

  const userPos = useMemo(() => {
    if (userCoords?.lat && userCoords?.lng) {
      return [userCoords.lat, userCoords.lng]
    }
    return defaultCenter
  }, [userCoords])

  const mapCenter = useMemo(() => {
    if (recommendedHospital?.lat && recommendedHospital?.lng) {
      return [
        (userPos[0] + recommendedHospital.lat) / 2,
        (userPos[1] + recommendedHospital.lng) / 2,
      ]
    }
    return userPos
  }, [recommendedHospital, userPos])

  const routePolyline = useMemo(() => {
    if (
      userPos &&
      recommendedHospital?.lat &&
      recommendedHospital?.lng
    ) {
      return [userPos, [recommendedHospital.lat, recommendedHospital.lng]]
    }
    return null
  }, [userPos, recommendedHospital])

  return (
    <div
      style={{ height }}
      className="w-full rounded-xl overflow-hidden border border-slate-300 relative bg-slate-100 shadow-sm"
    >
      <MapContainer
        center={mapCenter}
        zoom={recommendedHospital ? 13 : 12}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <MapUpdater center={mapCenter} zoom={recommendedHospital ? 13 : 12} />

        {/* Clean OpenStreetMap Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* User GPS Location Marker */}
        <Marker position={userPos} icon={createUserIcon()}>
          <Popup>
            <div className="p-1 text-xs">
              <p className="font-bold text-blue-900">{t('mapYouAreHere')}</p>
              <p className="text-slate-600 text-[11px] mt-0.5">
                {t('mapCurrentGps')}: {userPos[0].toFixed(4)}, {userPos[1].toFixed(4)}
              </p>
            </div>
          </Popup>
        </Marker>

        {/* Hospital Markers */}
        {allHospitals.map((h) => {
          if (!h.lat || !h.lng) return null
          const isRec = recommendedHospital?.id === h.id
          const isEmerg = h.emergency_ready || h.type?.toLowerCase().includes('district')

          return (
            <Marker
              key={h.id}
              position={[h.lat, h.lng]}
              icon={createHospitalIcon(isRec, isEmerg)}
            >
              <Popup>
                <div className="p-1 min-w-[200px] text-xs">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-1 mb-1.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isRec ? 'bg-blue-100 text-blue-900' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {isRec ? t('mapTopMatch') : h.type}
                    </span>
                    <span className="text-slate-800 font-bold">{h.distance_km} {t('kmAway')}</span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 leading-snug">
                    {h.name}
                  </h4>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    {t('mapSpecialist')}: <strong>{h.specialist || 'General'}</strong>
                  </p>
                  <p className="text-slate-600 text-[11px]">
                    {t('mapDoctors')}: <strong>{h.doctors_available}</strong>
                  </p>

                  <div className="mt-2.5 pt-1.5 border-t border-slate-100 flex items-center gap-1.5">
                    {h.phone && (
                      <a
                        href={`tel:${h.phone}`}
                        className="flex-1 py-1 rounded bg-blue-50 text-blue-900 hover:bg-blue-100 text-center font-bold text-[11px] flex items-center justify-center gap-1 border border-blue-200"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{t('mapCall')}</span>
                      </a>
                    )}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-1 rounded bg-slate-100 text-slate-800 hover:bg-slate-200 text-center font-bold text-[11px] flex items-center justify-center gap-1 border border-slate-300"
                    >
                      <Navigation className="w-3 h-3 text-blue-800" />
                      <span>{t('mapRoute')}</span>
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}

        {/* Route Line */}
        {routePolyline && (
          <Polyline
            positions={routePolyline}
            pathOptions={{
              color: '#1d4ed8',
              weight: 3.5,
              opacity: 0.8,
              dashArray: '6, 6',
            }}
          />
        )}
      </MapContainer>

      {/* Legend Badge */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 border border-slate-300 rounded-lg p-2 text-[10px] text-slate-800 flex items-center gap-3 shadow-md">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-700 inline-block" />
          {t('mapLegendYou')}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded bg-blue-800 inline-block" />
          {t('mapLegendRecommended')}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded bg-red-700 inline-block" />
          {t('mapLegendEmergency')}
        </span>
      </div>
    </div>
  )
}
