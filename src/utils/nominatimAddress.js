/**
 * Parses a Nominatim result's `address` block into signup address fields.
 */
export function parseNominatimResult(result) {
  const a = result.address || {}
  const line1 =
    [a.house_number, a.road].filter(Boolean).join(' ') ||
    a.neighbourhood ||
    a.suburb ||
    ''
  const city =
    a.city || a.town || a.village || a.municipality || a.county || ''
  return {
    line1,
    city,
    state: a.state || '',
    country: a.country || '',
    postalCode: a.postcode || '',
  }
}

export async function nominatimReverse(lat, lng) {
  const url = new URL('https://nominatim.openstreetmap.org/reverse')
  url.searchParams.set('lat', String(lat))
  url.searchParams.set('lon', String(lng))
  url.searchParams.set('format', 'json')
  url.searchParams.set('addressdetails', '1')
  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) return null
  return res.json()
}
