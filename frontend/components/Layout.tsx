import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { 
  Bars3Icon, 
  XMarkIcon, 
  GlobeAltIcon,
  MagnifyingGlassIcon,
  UserIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export default function Layout({ children, title, description }: LayoutProps) {
  const { t, i18n } = useTranslation('common');
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);

  const navigation = [
    { name: t('navigation.home'), href: '/' },
    { name: t('navigation.restaurants'), href: '/restaurants' },
    { name: t('navigation.mosques'), href: '/mosques' },
    { name: t('navigation.shops'), href: '/shops' },
    { name: t('navigation.community'), href: '/community' },
  ];

  const languages = [
    { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  ];

  const changeLanguage = async (locale: string) => {
    const { pathname, asPath, query } = router;
    await router.push({ pathname, query }, asPath, { locale });
    setLanguageMenuOpen(false);
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <>
      <Head>
        <title>{title ? `${title} - ${t('site.title')}` : t('site.title')}</title>
        <meta name="description" content={description || t('site.description')} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Language alternates for SEO */}
        {languages.map(lang => (
          <link
            key={lang.code}
            rel="alternate"
            hrefLang={lang.code}
            href={`${process.env.NEXT_PUBLIC_SITE_URL}/${lang.code}${router.asPath}`}
          />
        ))}
        
        {/* Open Graph */}
        <meta property="og:title" content={title ? `${title} - ${t('site.title')}` : t('site.title')} />
        <meta property="og:description" content={description || t('site.description')} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_SITE_URL}${router.asPath}`} />
        <meta property="og:image" content={`${process.env.NEXT_PUBLIC_SITE_URL}/images/og-image.jpg`} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title ? `${title} - ${t('site.title')}` : t('site.title')} />
        <meta name="twitter:description" content={description || t('site.description')} />
        <meta name="twitter:image" content={`${process.env.NEXT_PUBLIC_SITE_URL}/images/og-image.jpg`} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex items-center">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">H</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">
                    {t('site.name')}
                  </span>
                </Link>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`text-sm font-medium transition-colors ${
                      router.pathname === item.href
                        ? 'text-green-600 border-b-2 border-green-600'
                        : 'text-gray-700 hover:text-green-600'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              {/* Right side actions */}
              <div className="flex items-center space-x-4">
                {/* Search button */}
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </button>

                {/* Favorites */}
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <HeartIcon className="h-5 w-5" />
                </button>

                {/* Language Selector */}
                <div className="relative">
                  <button
                    onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                    className="flex items-center space-x-1 p-2 text-gray-700 hover:text-green-600 transition-colors"
                  >
                    <GlobeAltIcon className="h-5 w-5" />
                    <span className="text-sm font-medium">{currentLanguage.flag}</span>
                  </button>

                  {languageMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                      <div className="py-1">
                        {languages.map((language) => (
                          <button
                            key={language.code}
                            onClick={() => changeLanguage(language.code)}
                            className={`flex items-center space-x-3 w-full px-4 py-2 text-sm text-left hover:bg-gray-100 ${
                              i18n.language === language.code ? 'bg-green-50 text-green-600' : 'text-gray-700'
                            }`}
                          >
                            <span className="text-lg">{language.flag}</span>
                            <span>{language.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* User menu */}
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <UserIcon className="h-5 w-5" />
                </button>

                {/* Mobile menu button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {mobileMenuOpen ? (
                    <XMarkIcon className="h-6 w-6" />
                  ) : (
                    <Bars3Icon className="h-6 w-6" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`block px-3 py-2 text-base font-medium rounded-md transition-colors ${
                      router.pathname === item.href
                        ? 'text-green-600 bg-green-50'
                        : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </header>

        {/* Main Content */}
        <main>{children}</main>

        {/* Footer */}
        <footer className="bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Company Info */}
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">H</span>
                  </div>
                  <span className="text-xl font-bold">{t('site.name')}</span>
                </div>
                <p className="text-gray-300 mb-4 max-w-md">
                  {t('footer.description')}
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    Facebook
                  </a>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    Instagram
                  </a>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    Twitter
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('footer.quick_links')}</h3>
                <ul className="space-y-2">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Support */}
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('footer.support')}</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/help" className="text-gray-300 hover:text-white transition-colors">
                      {t('footer.help')}
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                      {t('footer.contact')}
                    </Link>
                  </li>
                  <li>
                    <Link href="/register-business" className="text-gray-300 hover:text-white transition-colors">
                      {t('footer.register_business')}
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy" className="text-gray-300 hover:text-white transition-colors">
                      {t('footer.privacy')}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-300 text-sm">
                © 2025 {t('site.name')}. {t('footer.rights_reserved')}
              </p>
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <span className="text-gray-300 text-sm">{t('footer.made_in_sweden')}</span>
                <span className="text-lg">🇸🇪</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Click outside handler for language menu */}
      {languageMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setLanguageMenuOpen(false)}
        />
      )}
    </>
  );
}
