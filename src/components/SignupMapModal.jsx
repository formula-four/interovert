import React, { useCallback, useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { X, Loader2, MapPin } from 'lucide-react'
import { parseNominatimResult, nominatimReverse } from '../utils/nominatimAddress'

const DEFAULT_CENTER = [20.5937, 78.9629]
const DEFAULT_ZOOM = 5

let leafletDefaultIconsPatched = false
function fixLeafletIcons() {
  if (leafletDefaultIconsPatched) return
  leafletDefaultIconsPatched = true
  const proto = L.Icon.Default.prototype
  if (Object.prototype.hasOwnProperty.call(proto, '_getIconUrl')) {
    delete proto._getIconUrl
  }
  L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
  })
}

function MapEvents({ onLatLng }) {
  useMapEvents({
    click(e) {
      onLatLng(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

/**
 * @param {{ open: boolean, onClose: () => void, onSelect: (fields: object) => void }} props
 */
export default function SignupMapModal({ open, onClose, onSelect }) {
  const [position, setPosition] = useState(null)
  const [resolving, setResolving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) fixLeafletIcons()
  }, [open])

  useEffect(() => {
    if (!open) {
      setPosition(null)
      setError('')
      setResolving(false)
    }
  }, [open])

  const handleLatLng = useCallback(async (lat, lng) => {
    setPosition([lat, lng])
    setError('')
    setResolving(true)
    try {
      const data = await nominatimReverse(lat, lng)
      if (!data) {
        setError('Could not resolve this point. Try another tap or use search.')
        setResolving(false)
        return
      }
      const fields = parseNominatimResult(data)
      onSelect(fields)
    } catch {
      setError('Network error. Try again.')
    } finally {
      setResolving(false)
    }
  }, [onSelect])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="signup-map-title"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-gray-600 bg-gray-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
          <h2 id="signup-map-title" className="flex items-center gap-2 text-sm font-semibold text-white">
            <MapPin className="h-4 w-4 text-indigo-400" aria-hidden />
            Select on map
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white"
            aria-label="Close map"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="px-4 py-2 text-xs text-gray-400">
          Tap a location. We fill your address from OpenStreetMap (Nominatim). Data © OpenStreetMap contributors.
        </p>
        <div className="relative h-80 w-full shrink-0 sm:h-96">
          <MapContainer
            center={DEFAULT_CENTER}
            zoom={DEFAULT_ZOOM}
            className="h-full w-full z-0"
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapEvents onLatLng={handleLatLng} />
            {position && <Marker position={position} />}
          </MapContainer>
          {resolving && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-400" aria-hidden />
            </div>
          )}
        </div>
        {error && (
          <p className="px-4 py-2 text-xs text-rose-400">{error}</p>
        )}
        <div className="border-t border-gray-700 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg bg-gray-800 py-2 text-sm font-medium text-gray-200 hover:bg-gray-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
