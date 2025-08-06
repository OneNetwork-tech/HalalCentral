import { TransactionBaseService } from "@medusajs/medusa"

export class LocationService extends TransactionBaseService {
  async findNearbyBusinesses(
    latitude: number,
    longitude: number,
    radius: number = 10,
    businessType?: 'vendor' | 'institute',
    filters?: {
      cuisine_types?: string[]
      dietary_options?: string[]
      verified_only?: boolean
    }
  ) {
    let query = `
      SELECT *, 
        (6371 * acos(cos(radians($1)) * cos(radians(CAST(address->>'coordinates'->>'lat' AS FLOAT))) 
        * cos(radians(CAST(address->>'coordinates'->>'lng' AS FLOAT)) - radians($2)) 
        + sin(radians($1)) * sin(radians(CAST(address->>'coordinates'->>'lat' AS FLOAT))))) AS distance
      FROM ${businessType === 'vendor' ? 'vendor' : businessType === 'institute' ? 'institute' : '(SELECT *, \'vendor\' as entity_type FROM vendor UNION ALL SELECT *, \'institute\' as entity_type FROM institute)'} 
      WHERE address->>'coordinates' IS NOT NULL
        AND active = true
    `

    const params = [latitude, longitude, radius]
    let paramIndex = 3

    if (filters?.verified_only) {
      query += ` AND verified = true`
    }

    if (filters?.cuisine_types && filters.cuisine_types.length > 0) {
      query += ` AND cuisine_types ?| array[$${paramIndex}]`
      params.push(filters.cuisine_types)
      paramIndex++
    }

    query += ` HAVING distance < $${paramIndex} ORDER BY distance`
    params.push(radius)

    return await this.manager_.query(query, params)
  }

  async geocodeAddress(address: string): Promise<{lat: number, lng: number} | null> {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&region=se&key=${process.env.GOOGLE_MAPS_API_KEY}`
      )
      
      const data = await response.json()
      
      if (data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location
        return {
          lat: location.lat,
          lng: location.lng
        }
      }
      
      return null
    } catch (error) {
      console.error('Geocoding error:', error)
      return null
    }
  }

  async reverseGeocode(lat: number, lng: number): Promise<any> {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.GOOGLE_MAPS_API_KEY}`
      )
      
      const data = await response.json()
      return data.results[0] || null
    } catch (error) {
      console.error('Reverse geocoding error:', error)
      return null
    }
  }
}