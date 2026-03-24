/** @type {string[]} */
export const INDIAN_STATES_AND_UTS = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
]

export const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'District of Columbia', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
  'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
  'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah',
  'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming',
]

export const CANADA_PROVINCES = [
  'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador',
  'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island',
  'Quebec', 'Saskatchewan', 'Yukon',
]

export const AUSTRALIA_STATES = [
  'Australian Capital Territory', 'New South Wales', 'Northern Territory', 'Queensland',
  'South Australia', 'Tasmania', 'Victoria', 'Western Australia',
]

export const UK_NATIONS = ['England', 'Northern Ireland', 'Scotland', 'Wales']

/** @type {Record<string, string[]>} */
export const STATES_BY_COUNTRY = {
  India: INDIAN_STATES_AND_UTS,
  'United States': US_STATES,
  Canada: CANADA_PROVINCES,
  Australia: AUSTRALIA_STATES,
  'United Kingdom': UK_NATIONS,
}

export function getStatesForCountry(countryName) {
  if (!countryName) return null
  return STATES_BY_COUNTRY[countryName] || null
}

function buildCountryList() {
  try {
    const dn = new Intl.DisplayNames(['en'], { type: 'region' })
    const names = []
    for (let i = 65; i <= 90; i += 1) {
      for (let j = 65; j <= 90; j += 1) {
        const code = String.fromCharCode(i) + String.fromCharCode(j)
        const name = dn.of(code)
        if (
          name
          && name !== code
          && !/^unknown/i.test(name)
          && !name.includes('European Union')
          && !name.includes('United Nations')
        ) {
          names.push(name)
        }
      }
    }
    return [...new Set(names)].sort((a, b) => a.localeCompare(b))
  } catch {
    return ['India', 'United States', 'United Kingdom', 'Canada', 'Australia']
  }
}

export const COUNTRIES = buildCountryList()
