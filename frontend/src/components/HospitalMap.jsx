import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Phone, Navigation, Crosshair, Radio } from 'lucide-react'
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

function RecenterControl({ targetPos, zoom = 13 }) {
  const map = useMap()
  return (
    <button
      type="button"
      onClick={() => {
        if (targetPos && targetPos[0] && targetPos[1]) {
          map.flyTo(targetPos, zoom, { animate: true, duration: 1.2 })
        }
      }}
      className="tap-press absolute top-3 right-3 z-[1000] p-2.5 rounded-xl bg-white/95 backdrop-blur-sm border border-slate-300 text-slate-700 hover:text-blue-600 hover:border-blue-500 shadow-md flex items-center gap-1.5 text-xs font-bold transition-all"
      title="Recenter to Live GPS"
    >
      <Crosshair className="w-4 h-4 text-blue-600 animate-pulse" />
      <span className="hidden sm:inline">Live GPS Center</span>
    </button>
  )
}

const createUserIcon = () =>
  L.divIcon({
    className: 'custom-user-marker',
    html: `
      <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
        <span style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background-color: #2563EB; opacity: 0.4; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
        <span style="position: relative; width: 14px; height: 14px; border-radius: 50%; background-color: #2563EB; border: 2.5px solid #FFFFFF; box-shadow: 0 2px 4px rgba(0,0,0,0.35);"></span>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })

const createHospitalIcon = (isRecommended, isEmergency) => {
  const bg = isEmergency ? '#DC2626' : isRecommended ? '#2563EB' : '#475569'
  const size = isRecommended ? 34 : 28
  
  // Clean SVG icons instead of emojis
  const svgIcon = isEmergency
    ? `<svg class="w-4 h-4 text-white animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 12a5 5 0 0 1 5-5v0a5 5 0 0 1 5 5v6H7v-6z"/><path d="M5 20a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1H5v-1z"/><path d="M12 4V2"/><path d="M4 7 2 5"/><path d="m20 7 2-2"/></svg>`
    : isRecommended
    ? `<svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
    : `<svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" /><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M12 6v4"/><path d="M10 8h4"/></svg>`

  return L.divIcon({
    className: 'custom-hospital-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        border-radius: 10px;
        background-color: ${bg};
        color: #FFFFFF;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #FFFFFF;
        box-shadow: 0 2px 6px rgba(15, 23, 42, 0.3);
        cursor: pointer;
      ">
        ${svgIcon}
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
      className="w-full rounded-2xl overflow-hidden border border-slate-200 relative bg-white shadow-sm"
    >
      <MapContainer
        center={mapCenter}
        zoom={recommendedHospital ? 13 : 13}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <MapUpdater center={mapCenter} zoom={recommendedHospital ? 13 : 13} />
        <RecenterControl targetPos={userPos} zoom={13} />

        {/* Clean OpenStreetMap Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Real-time GPS Accuracy Radius Circle */}
        <Circle
          center={userPos}
          radius={Math.min(userCoords?.accuracy || 120, 400)}
          pathOptions={{
            color: '#2563EB',
            fillColor: '#3B82F6',
            fillOpacity: 0.12,
            weight: 1.5,
            dashArray: '4, 4',
          }}
        />

        {/* User GPS Location Marker */}
        <Marker position={userPos} icon={createUserIcon()}>
          <Popup>
            <div className="p-1 text-xs">
              <div className="flex items-center gap-1.5 text-blue-600 font-bold mb-0.5">
                <Radio className="w-3 h-3 animate-pulse" />
                <span>{userCoords?.label || t('mapYouAreHere')}</span>
              </div>
              <p className="text-slate-600 text-[11px]">
                {t('mapCurrentGps')}: <strong>{userPos[0].toFixed(4)}° N, {userPos[1].toFixed(4)}° E</strong>
              </p>
              {userCoords?.accuracy && (
                <p className="text-slate-500 text-[10px] mt-0.5">
                  GPS Accuracy: ±{Math.round(userCoords.accuracy)} meters
                </p>
              )}
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
                <div className="p-1 min-w-[210px] text-xs">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-1 mb-1.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                      isRec ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-slate-700 border-slate-200'
                    }`}>
                      {isRec ? t('mapTopMatch') : h.type}
                    </span>
                    <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
                      {h.distance_km} {t('kmAway')}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 leading-snug">
                    {h.name}
                  </h4>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    {t('mapSpecialist')}: <strong>{h.specialist || 'General'}</strong>
                  </p>
                  <p className="text-slate-600 text-[11px]">
                    {t('mapDoctors')}: <strong>{h.doctors_available} on duty</strong>
                  </p>

                  <div className="mt-2.5 pt-1.5 border-t border-slate-200 flex items-center gap-1.5">
                    {h.phone && (
                      <a
                        href={`tel:${h.phone}`}
                        className="flex-1 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-center font-bold text-[11px] flex items-center justify-center gap-1 border border-blue-200"
                      >
                        <Phone className="w-3 h-3 text-blue-600" />
                        <span>{t('mapCall')}</span>
                      </a>
                    )}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-center font-bold text-[11px] flex items-center justify-center gap-1 shadow-xs"
                    >
                      <Navigation className="w-3 h-3 text-white" />
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
              color: '#2563EB',
              weight: 3.5,
              opacity: 0.85,
              dashArray: '6, 6',
            }}
          />
        )}
      </MapContainer>

      {/* Legend & Real-Time Status Pill */}
      <div className="absolute bottom-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-2 text-[10px] text-slate-700 flex items-center gap-3 shadow-md pointer-events-auto">
          <span className="flex items-center gap-1 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
            {t('mapLegendYou')}
          </span>
          <span className="flex items-center gap-1 font-semibold">
            <span className="w-2.5 h-2.5 rounded bg-blue-600 inline-block" />
            {t('mapLegendRecommended')}
          </span>
          <span className="flex items-center gap-1 font-semibold">
            <span className="w-2.5 h-2.5 rounded bg-red-600 inline-block" />
            {t('mapLegendEmergency')}
          </span>
        </div>

        <div className="bg-slate-900/90 text-white rounded-xl px-3 py-1.5 text-[10px] font-mono font-semibold shadow-md flex items-center gap-1.5 backdrop-blur-sm pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Real-Time Proximity Radar: {allHospitals.length} nearby centres</span>
        </div>
      </div>
    </div>
  )
}
