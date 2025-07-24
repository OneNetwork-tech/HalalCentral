module.exports = {
  i18n: {
    defaultLocale: 'sv',
    locales: ['en', 'sv', 'ar'],
    localeDetection: true,
    domains: [
      {
        domain: 'halalcentral.se',
        defaultLocale: 'sv',
      },
      {
        domain: 'en.halalcentral.se',
        defaultLocale: 'en',
      },
      {
        domain: 'ar.halalcentral.se',
        defaultLocale: 'ar',
      },
    ],
  },
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  saveMissing: false,
  strictMode: true,
  serializeConfig: false,
  react: {
    useSuspense: false,
  },
  interpolation: {
    escapeValue: false,
  },
  // Swedish-specific formatting
  lng: 'sv',
  fallbackLng: 'sv',
  debug: process.env.NODE_ENV === 'development',
  
  // Custom namespace loading
  ns: ['common', 'vendor', 'institute', 'auth', 'checkout', 'search'],
  defaultNS: 'common',
  
  // Swedish locale formatting
  formatters: {
    currency: (value, lng, options) => {
      return new Intl.NumberFormat(lng === 'sv' ? 'sv-SE' : lng, {
        style: 'currency',
        currency: options.currency || 'SEK',
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
  },
}
