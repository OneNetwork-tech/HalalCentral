// Test Swedish Business Validation Logic
console.log('Testing Swedish Business Validation...\n');

// Test Organization Number Validation (Luhn Algorithm)
function validateLuhnAlgorithm(number) {
  const digits = number.split('').map(Number);
  let sum = 0;
  
  // Process first 9 digits
  for (let i = 0; i < 9; i++) {
    let digit = digits[i];
    
    // Double every second digit (positions 1, 3, 5, 7)
    if (i % 2 === 1) {
      digit *= 2;
      // If result is > 9, subtract 9
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
  }
  
  // Calculate check digit
  const checkDigit = (10 - (sum % 10)) % 10;
  
  // Compare with the last digit
  return checkDigit === digits[9];
}

function verifyOrganizationNumber(orgNumber) {
  try {
    // Clean the organization number
    const cleanOrgNumber = orgNumber.replace(/\D/g, '');
    
    if (cleanOrgNumber.length !== 10) {
      return {
        valid: false,
        error: 'Organization number must be 10 digits'
      };
    }

    // Validate using Luhn algorithm
    const isValid = validateLuhnAlgorithm(cleanOrgNumber);
    
    if (!isValid) {
      return {
        valid: false,
        error: 'Invalid organization number checksum'
      };
    }

    // Format the number
    const formatted = `${cleanOrgNumber.slice(0, 6)}-${cleanOrgNumber.slice(6)}`;
    
    // Determine type based on third digit
    const thirdDigit = parseInt(cleanOrgNumber[2]);
    let type;
    
    if (thirdDigit >= 2 && thirdDigit <= 9) {
      type = 'company';
    } else if (thirdDigit >= 0 && thirdDigit <= 1) {
      type = 'association';
    } else {
      type = 'individual';
    }

    return {
      valid: true,
      formatted,
      type
    };
  } catch (error) {
    return {
      valid: false,
      error: 'Failed to validate organization number'
    };
  }
}

// Test Swedish Phone Number Validation
function validateSwedishPhoneNumber(phoneNumber) {
  // Remove all non-digits
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  
  // Swedish numbers can start with +46 or 0
  let nationalNumber = cleanNumber;
  
  if (cleanNumber.startsWith('46')) {
    nationalNumber = '0' + cleanNumber.slice(2);
  }
  
  if (!nationalNumber.startsWith('0')) {
    return { valid: false };
  }
  
  // Swedish mobile numbers: 070, 072, 073, 076, 079
  // Landline numbers vary by region
  const mobileRegex = /^0(70|72|73|76|79)[0-9]{7}$/;
  const landlineRegex = /^0[1-9][0-9]{7,8}$/;
  
  if (mobileRegex.test(nationalNumber)) {
    return {
      valid: true,
      formatted: `${nationalNumber.slice(0, 3)}-${nationalNumber.slice(3, 6)} ${nationalNumber.slice(6, 8)} ${nationalNumber.slice(8)}`,
      type: 'mobile'
    };
  }
  
  if (landlineRegex.test(nationalNumber)) {
    return {
      valid: true,
      formatted: nationalNumber.replace(/(\d{2,3})(\d{3})(\d{2})(\d{2})/, '$1-$2 $3 $4'),
      type: 'landline'
    };
  }
  
  return { valid: false };
}

// Test Swedish Postal Code Validation
function validateSwedishPostalCode(postalCode) {
  // Swedish postal codes: 5 digits, format XXX XX
  const cleanCode = postalCode.replace(/\s/g, '');
  const postalRegex = /^[0-9]{5}$/;
  return postalRegex.test(cleanCode);
}

// Test Cases
console.log('=== Organization Number Tests ===');
const orgNumbers = [
  '556016-0680', // Valid company number
  '802002-4280', // Valid association number
  '121212-1212', // Invalid number
  '5560160680',  // Valid without dash
  '123456789'    // Too short
];

orgNumbers.forEach(orgNum => {
  const result = verifyOrganizationNumber(orgNum);
  console.log(`${orgNum}: ${result.valid ? '✅ VALID' : '❌ INVALID'} ${result.formatted || ''} ${result.type || ''} ${result.error || ''}`);
});

console.log('\n=== Phone Number Tests ===');
const phoneNumbers = [
  '070-123 45 67',  // Valid mobile
  '+46701234567',   // Valid mobile with country code
  '08-123 456 78',  // Valid Stockholm landline
  '031-123 45 67',  // Valid Gothenburg landline
  '123-456-789'     // Invalid
];

phoneNumbers.forEach(phone => {
  const result = validateSwedishPhoneNumber(phone);
  console.log(`${phone}: ${result.valid ? '✅ VALID' : '❌ INVALID'} ${result.formatted || ''} (${result.type || 'unknown'})`);
});

console.log('\n=== Postal Code Tests ===');
const postalCodes = [
  '11122',    // Valid Stockholm
  '111 22',   // Valid with space
  '40123',    // Valid Gothenburg
  '1234',     // Too short
  'ABC12'     // Invalid characters
];

postalCodes.forEach(postal => {
  const result = validateSwedishPostalCode(postal);
  console.log(`${postal}: ${result ? '✅ VALID' : '❌ INVALID'}`);
});

console.log('\n=== Swedish Date/Time Formatting Tests ===');

// Test Swedish date formatting
const testDate = new Date('2024-01-15T14:30:00');

console.log('Date formatting:');
console.log(`Swedish date: ${testDate.toLocaleDateString('sv-SE')}`);
console.log(`Swedish time: ${testDate.toLocaleTimeString('sv-SE', { hour12: false })}`);
console.log(`Swedish currency: ${new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(299.50)}`);

console.log('\n=== Business Hours Logic Test ===');

// Test business hours logic
const businessHours = {
  monday: { open: '09:00', close: '17:00' },
  tuesday: { open: '09:00', close: '17:00' },
  wednesday: { open: '09:00', close: '17:00' },
  thursday: { open: '09:00', close: '17:00' },
  friday: { open: '09:00', close: '17:00' },
  saturday: { open: '10:00', close: '15:00' },
  sunday: { closed: true }
};

function isOpenNow(businessHours) {
  const now = new Date();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = dayNames[now.getDay()];
  const currentTime = now.toLocaleTimeString('sv-SE', { hour12: false, hour: '2-digit', minute: '2-digit' });
  
  const todayHours = businessHours[currentDay];
  if (!todayHours || todayHours.closed) return false;
  
  return currentTime >= todayHours.open && currentTime <= todayHours.close;
}

console.log(`Current day: ${new Date().toLocaleDateString('sv-SE', { weekday: 'long' })}`);
console.log(`Current time: ${new Date().toLocaleTimeString('sv-SE', { hour12: false })}`);
console.log(`Business open now: ${isOpenNow(businessHours) ? '✅ OPEN' : '❌ CLOSED'}`);

console.log('\n✅ All Swedish validation tests completed successfully!');
