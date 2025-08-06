import { TransactionBaseService } from "@medusajs/medusa"

export class SwedishBusinessVerificationService extends TransactionBaseService {
  
  /**
   * Verify Swedish organization number using Luhn algorithm
   * Swedish organization numbers are 10 digits: YYMMDD-XXXX
   */
  async verifyOrganizationNumber(orgNumber: string): Promise<{
    valid: boolean
    formatted?: string
    type?: 'company' | 'association' | 'individual'
    error?: string
  }> {
    try {
      // Clean the organization number
      const cleanOrgNumber = orgNumber.replace(/\D/g, '')
      
      if (cleanOrgNumber.length !== 10) {
        return {
          valid: false,
          error: 'Organization number must be 10 digits'
        }
      }

      // Validate using Luhn algorithm
      const isValid = this.validateLuhnAlgorithm(cleanOrgNumber)
      
      if (!isValid) {
        return {
          valid: false,
          error: 'Invalid organization number checksum'
        }
      }

      // Format the number
      const formatted = `${cleanOrgNumber.slice(0, 6)}-${cleanOrgNumber.slice(6)}`
      
      // Determine type based on third digit
      const thirdDigit = parseInt(cleanOrgNumber[2])
      let type: 'company' | 'association' | 'individual'
      
      if (thirdDigit >= 2 && thirdDigit <= 9) {
        type = 'company'
      } else if (thirdDigit >= 0 && thirdDigit <= 1) {
        type = 'association'
      } else {
        type = 'individual'
      }

      return {
        valid: true,
        formatted,
        type
      }
    } catch (error) {
      return {
        valid: false,
        error: 'Failed to validate organization number'
      }
    }
  }

  /**
   * Validate Swedish organization number using Luhn algorithm
   */
  private validateLuhnAlgorithm(number: string): boolean {
    const digits = number.split('').map(Number)
    let sum = 0
    
    // Process first 9 digits
    for (let i = 0; i < 9; i++) {
      let digit = digits[i]
      
      // Double every second digit (positions 1, 3, 5, 7)
      if (i % 2 === 1) {
        digit *= 2
        // If result is > 9, subtract 9
        if (digit > 9) {
          digit -= 9
        }
      }
      
      sum += digit
    }
    
    // Calculate check digit
    const checkDigit = (10 - (sum % 10)) % 10
    
    // Compare with the last digit
    return checkDigit === digits[9]
  }

  /**
   * Verify business with Bolagsverket (Swedish Companies Registration Office)
   * This would integrate with their API in production
   */
  async verifyWithBolagsverket(orgNumber: string): Promise<{
    verified: boolean
    companyName?: string
    status?: string
    registrationDate?: Date
    error?: string
  }> {
    try {
      // In production, this would call Bolagsverket API
      // For now, we'll simulate the verification
      
      const orgValidation = await this.verifyOrganizationNumber(orgNumber)
      
      if (!orgValidation.valid) {
        return {
          verified: false,
          error: orgValidation.error
        }
      }

      // Mock API call to Bolagsverket
      // In production: const response = await this.callBolagsverketAPI(orgNumber)
      
      return {
        verified: true,
        companyName: `Mock Company ${orgNumber}`,
        status: 'active',
        registrationDate: new Date()
      }
    } catch (error) {
      return {
        verified: false,
        error: 'Failed to verify with Bolagsverket'
      }
    }
  }

  /**
   * Validate Swedish postal code format
   */
  validateSwedishPostalCode(postalCode: string): boolean {
    // Swedish postal codes: 5 digits, format XXX XX
    const cleanCode = postalCode.replace(/\s/g, '')
    const postalRegex = /^[0-9]{5}$/
    return postalRegex.test(cleanCode)
  }

  /**
   * Validate Swedish phone number
   */
  validateSwedishPhoneNumber(phoneNumber: string): {
    valid: boolean
    formatted?: string
    type?: 'mobile' | 'landline'
  } {
    // Remove all non-digits
    const cleanNumber = phoneNumber.replace(/\D/g, '')
    
    // Swedish numbers can start with +46 or 0
    let nationalNumber = cleanNumber
    
    if (cleanNumber.startsWith('46')) {
      nationalNumber = '0' + cleanNumber.slice(2)
    }
    
    if (!nationalNumber.startsWith('0')) {
      return { valid: false }
    }
    
    // Swedish mobile numbers: 070, 072, 073, 076, 079
    // Landline numbers vary by region
    const mobileRegex = /^0(70|72|73|76|79)[0-9]{7}$/
    const landlineRegex = /^0[1-9][0-9]{7,8}$/
    
    if (mobileRegex.test(nationalNumber)) {
      return {
        valid: true,
        formatted: `${nationalNumber.slice(0, 3)}-${nationalNumber.slice(3, 6)} ${nationalNumber.slice(6, 8)} ${nationalNumber.slice(8)}`,
        type: 'mobile'
      }
    }
    
    if (landlineRegex.test(nationalNumber)) {
      return {
        valid: true,
        formatted: nationalNumber.replace(/(\d{2,3})(\d{3})(\d{2})(\d{2})/, '$1-$2 $3 $4'),
        type: 'landline'
      }
    }
    
    return { valid: false }
  }

  /**
   * Get Swedish county (län) from postal code
   */
  getCountyFromPostalCode(postalCode: string): string | null {
    const cleanCode = postalCode.replace(/\s/g, '')
    const firstTwo = parseInt(cleanCode.slice(0, 2))
    
    // Simplified mapping of postal codes to counties
    const countyMap: { [key: string]: string } = {
      '10-19': 'Stockholm',
      '20-26': 'Västmanland',
      '27-29': 'Uppsala',
      '30-34': 'Östergötland',
      '35-39': 'Jönköping',
      '40-49': 'Västra Götaland',
      '50-56': 'Halland',
      '57-59': 'Skåne',
      '60-64': 'Värmland',
      '65-69': 'Örebro',
      '70-74': 'Västmanland',
      '75-77': 'Dalarna',
      '78-79': 'Gävleborg',
      '80-83': 'Västernorrland',
      '84-85': 'Jämtland',
      '90-94': 'Västerbotten',
      '95-99': 'Norrbotten'
    }
    
    for (const [range, county] of Object.entries(countyMap)) {
      const [min, max] = range.split('-').map(Number)
      if (firstTwo >= min && firstTwo <= max) {
        return county
      }
    }
    
    return null
  }

  /**
   * Validate Swedish VAT number (Momsregistreringsnummer)
   */
  validateSwedishVATNumber(vatNumber: string): boolean {
    // Swedish VAT numbers: SE + 10 digits + 01
    const cleanVAT = vatNumber.replace(/\s/g, '').toUpperCase()
    const vatRegex = /^SE[0-9]{10}01$/
    
    if (!vatRegex.test(cleanVAT)) {
      return false
    }
    
    // Extract organization number and validate it
    const orgNumber = cleanVAT.slice(2, 12)
    return this.validateLuhnAlgorithm(orgNumber)
  }

  /**
   * Format Swedish address according to local standards
   */
  formatSwedishAddress(address: {
    street: string
    postalCode: string
    city: string
    county?: string
  }): string {
    const formattedPostal = address.postalCode.replace(/(\d{3})(\d{2})/, '$1 $2')
    
    return [
      address.street,
      `${formattedPostal} ${address.city.toUpperCase()}`,
      address.county
    ].filter(Boolean).join('\n')
  }
}
