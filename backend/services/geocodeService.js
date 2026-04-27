import axios from 'axios';

const NOMINATIM_HEADERS = {
  'User-Agent': 'Interovert-CollegeProject/1.0 (contact: admin@interovert.local)',
  'Accept-Language': 'en',
};

async function nominatimSearch(query, { limit = 1, addressDetails = 0 } = {}) {
  const { data } = await axios.get('https://nominatim.openstreetmap.org/search', {
    params: { q: query.trim(), format: 'json', limit, addressdetails: addressDetails },
    headers: NOMINATIM_HEADERS,
    timeout: 6000,
  });
  if (!Array.isArray(data)) return [];
  return data;
}

/**
 * Geocode a human-readable address string using OpenStreetMap Nominatim.
 * Tries the full address first, then progressively shorter versions
 * (dropping the most specific parts) so building names etc. don't
 * prevent a match on the broader locality.
 * Returns { lat, lng } or null on failure.
 */
export async function geocodeAddress(addressString) {
  if (!addressString || !addressString.trim()) return null;

  const parts = addressString.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return null;

  try {
    for (let i = 0; i < parts.length; i++) {
      const query = parts.slice(i).join(', ');
      const data = await nominatimSearch(query, { limit: 1 });
      if (data.length > 0) {
        if (i > 0) console.log(`[geocode] matched on simplified query: "${query}"`);
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
    }
    return null;
  } catch (err) {
    console.warn('[geocode] Failed to geocode address:', err?.message || 'unknown error');
    return null;
  }
}

/**
 * Validate an address by querying Nominatim and returning the top candidates.
 * Status codes:
 *   - 'ok'        : exactly one strong match
 *   - 'ambiguous' : multiple plausible matches; caller should let user pick
 *   - 'not_found' : no candidates at all
 *
 * Each candidate: { lat, lng, displayName, type, importance }
 */
export async function validateAddress(addressString) {
  if (!addressString || !addressString.trim()) {
    return { status: 'not_found', primary: null, candidates: [] };
  }
  try {
    const raw = await nominatimSearch(addressString, { limit: 5, addressDetails: 1 });
    if (raw.length === 0) {
      return { status: 'not_found', primary: null, candidates: [] };
    }
    const candidates = raw.map((r) => ({
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
      displayName: r.display_name,
      type: r.type || r.class || '',
      importance: typeof r.importance === 'number' ? r.importance : 0,
      address: r.address || {},
    }));

    const primary = candidates[0];
    // Single result, OR top result clearly dominant (importance gap ≥ 0.15) → 'ok'
    let status = 'ok';
    if (candidates.length > 1) {
      const gap = primary.importance - candidates[1].importance;
      if (gap < 0.15) status = 'ambiguous';
    }
    return { status, primary, candidates };
  } catch (err) {
    console.warn('[geocode] validateAddress failed:', err?.message || 'unknown error');
    return { status: 'not_found', primary: null, candidates: [] };
  }
}

/**
 * Build a single formatted address string from parts.
 */
export function buildFormattedAddress({ line1, line2, city, state, postalCode, country }) {
  return [line1, line2, city, state, postalCode, country]
    .map((p) => (p || '').trim())
    .filter(Boolean)
    .join(', ');
}
