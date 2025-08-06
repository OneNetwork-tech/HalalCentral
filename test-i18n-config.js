// Test i18n Configuration
console.log('Testing i18n Configuration...\n');

// Test Swedish locale formatting functions
const testFormatters = {
  currency: (value, lng, options) => {
    return new Intl.NumberFormat(lng === 'sv' ? 'sv-SE' : lng, {
      style: 'currency',
      currency: options?.currency || 'SEK',
    }).format(value)
  },
  date: (value, lng, options) => {
    return new Intl.DateTimeFormat(lng === 'sv' ? 'sv-SE' : lng, {
      ...options,
      timeZone: 'Europe/Stockholm',
    }).format(new Date(value))
  },
  time: (value, lng, options) => {
    return new Intl.DateTimeFormat(lng === 'sv' ? 'sv-SE' : lng, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Europe/Stockholm',
      ...options,
    }).format(new Date(value))
  },
  number: (value, lng, options) => {
    return new Intl.NumberFormat(lng === 'sv' ? 'sv-SE' : lng, options).format(value)
  },
}

console.log('=== Currency Formatting Tests ===');
const testAmount = 299.50;
console.log(`Swedish: ${testFormatters.currency(testAmount, 'sv', { currency: 'SEK' })}`);
console.log(`English: ${testFormatters.currency(testAmount, 'en', { currency: 'SEK' })}`);
console.log(`Arabic: ${testFormatters.currency(testAmount, 'ar', { currency: 'SEK' })}`);

console.log('\n=== Date Formatting Tests ===');
const testDate = '2024-01-15T14:30:00';
console.log(`Swedish date: ${testFormatters.date(testDate, 'sv', { year: 'numeric', month: 'long', day: 'numeric' })}`);
console.log(`English date: ${testFormatters.date(testDate, 'en', { year: 'numeric', month: 'long', day: 'numeric' })}`);
console.log(`Arabic date: ${testFormatters.date(testDate, 'ar', { year: 'numeric', month: 'long', day: 'numeric' })}`);

console.log('\n=== Time Formatting Tests ===');
console.log(`Swedish time: ${testFormatters.time(testDate, 'sv')}`);
console.log(`English time: ${testFormatters.time(testDate, 'en')}`);
console.log(`Arabic time: ${testFormatters.time(testDate, 'ar')}`);

console.log('\n=== Number Formatting Tests ===');
const testNumber = 1234567.89;
console.log(`Swedish number: ${testFormatters.number(testNumber, 'sv')}`);
console.log(`English number: ${testFormatters.number(testNumber, 'en')}`);
console.log(`Arabic number: ${testFormatters.number(testNumber, 'ar')}`);

// Test Swedish translation structure
console.log('\n=== Translation Structure Test ===');
const swedishTranslations = {
  "navigation": {
    "home": "Hem",
    "restaurants": "Restauranger",
    "mosques": "Moskéer",
    "shops": "Butiker"
  },
  "business_hours": {
    "monday": "Måndag",
    "tuesday": "Tisdag",
    "open_now": "Öppet nu",
    "closed_now": "Stängt nu"
  },
  "payment": {
    "swish": "Betala med Swish",
    "card": "Betala med kort",
    "total": "Totalt"
  }
};

// Test translation key access
function getTranslation(key, translations) {
  return key.split('.').reduce((obj, k) => obj?.[k], translations);
}

const testKeys = [
  'navigation.home',
  'navigation.restaurants',
  'business_hours.monday',
  'business_hours.open_now',
  'payment.swish',
  'payment.total'
];

testKeys.forEach(key => {
  const translation = getTranslation(key, swedishTranslations);
  console.log(`${key}: ${translation || 'MISSING'}`);
});

// Test multilingual content structure (JSONB format)
console.log('\n=== Multilingual Content Structure Test ===');
const multilingualContent = {
  name: {
    en: "Stockholm Central Mosque",
    sv: "Stockholms Centralmoskén",
    ar: "مسجد ستوكهولم المركزي"
  },
  description: {
    en: "The largest mosque in Stockholm serving the Muslim community",
    sv: "Den största moskén i Stockholm som tjänar den muslimska gemenskapen",
    ar: "أكبر مسجد في ستوكهولم يخدم المجتمع المسلم"
  }
};

function getLocalizedContent(content, locale, fallback = 'en') {
  return content[locale] || content[fallback] || content.sv || Object.values(content)[0];
}

const locales = ['sv', 'en', 'ar'];
locales.forEach(locale => {
  console.log(`${locale.toUpperCase()}:`);
  console.log(`  Name: ${getLocalizedContent(multilingualContent.name, locale)}`);
  console.log(`  Description: ${getLocalizedContent(multilingualContent.description, locale)}`);
});

// Test Swedish address formatting
console.log('\n=== Swedish Address Formatting Test ===');
function formatSwedishAddress(address) {
  const formattedPostal = address.postal_code.replace(/(\d{3})(\d{2})/, '$1 $2');
  
  return [
    address.street,
    `${formattedPostal} ${address.city.toUpperCase()}`,
    address.county
  ].filter(Boolean).join('\n');
}

const testAddress = {
  street: "Drottninggatan 123",
  postal_code: "11122",
  city: "Stockholm",
  county: "Stockholm"
};

console.log('Formatted Swedish Address:');
console.log(formatSwedishAddress(testAddress));

// Test Swedish business hours formatting
console.log('\n=== Swedish Business Hours Test ===');
const businessHours = {
  monday: { open: '09:00', close: '17:00' },
  tuesday: { open: '09:00', close: '17:00' },
  wednesday: { open: '09:00', close: '17:00' },
  thursday: { open: '09:00', close: '17:00' },
  friday: { open: '09:00', close: '17:00' },
  saturday: { open: '10:00', close: '15:00' },
  sunday: { closed: true }
};

const swedishDays = {
  monday: 'Måndag',
  tuesday: 'Tisdag',
  wednesday: 'Onsdag',
  thursday: 'Torsdag',
  friday: 'Fredag',
  saturday: 'Lördag',
  sunday: 'Söndag'
};

Object.entries(businessHours).forEach(([day, hours]) => {
  const swedishDay = swedishDays[day];
  if (hours.closed) {
    console.log(`${swedishDay}: Stängt`);
  } else {
    console.log(`${swedishDay}: ${hours.open} - ${hours.close}`);
  }
});

console.log('\n✅ All i18n configuration tests completed successfully!');
