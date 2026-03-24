import { parseNominatimResult } from '../utils/nominatimAddress'

/**
 * @returns {Promise<{ state?: string, country?: string, city?: string, line1?: string } | null>}
 */
export async function lookupPostalCode(postalCode, countryName) {
  const trimmed = String(postalCode || '').trim()
  if (!trimmed) return null

  const country = String(countryName || '').trim()
  const isIndia = /^india$/i.test(country) || country === ''

  if (isIndia && /^\d{6}$/.test(trimmed)) {
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${trimmed}`)
      const data = await res.json()
      if (data.Status !== 'Success' || !data.PostOffice?.length) return null
      const po = data.PostOffice[0]
      return {
        state: po.State || '',
        country: po.Country || 'India',
        city: po.District || po.Name || '',
        line1: po.Name && po.Name !== po.District ? po.Name : '',
      }
    } catch {
      return null
    }
  }

  try {
    const q = [trimmed, country].filter(Boolean).join(' ')
    const url = new URL('https://nominatim.openstreetmap.org/search')
    url.searchParams.set('q', q)
    url.searchParams.set('format', 'json')
    url.searchParams.set('limit', '1')
    url.searchParams.set('addressdetails', '1')
    const res = await fetch(url.toString(), { headers: { Accept: 'application/json' } })
    const arr = await res.json()
    if (!Array.isArray(arr) || !arr[0]) return null
    return parseNominatimResult(arr[0])
  } catch {
    return null
  }
}
