import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { t, i18n } = useTranslation('common');
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const changeLanguage = (lng: string) => {
    router.push(router.asPath, router.asPath, { locale: lng });
  };

  const currentLanguage = i18n.language;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-green-600">HalalCentral</span>
              </Link>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:ml-6 md:flex md:space-x-8">
                <Link href="/restaurants" className="text-gray-900 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
                  {t('navigation.restaurants')}
                </Link>
                <Link href="/mosques" className="text-gray-900 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
                  {t('navigation.mosques')}
                </Link>
                <Link href="/shops" className="text-gray-900 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
                  {t('navigation.shops')}
                </Link>
                <Link href="/community" className="text-gray-900 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
                  {t('navigation.community')}
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center">
              {/* Language Selector */}
              <div className="relative">
                <select
                  value={currentLanguage}
                  onChange={(e) => changeLanguage(e.target.value)}
                  className="bg-white border border-gray-300 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="sv">🇸🇪 Svenska</option>
                  <option value="en">🇬🇧 English</option>
                  <option value="ar">🇸🇦 العربية</option>
                </select>
              </div>
              
              {/* Mobile menu button */}
              <button
                type="button"
                className="md:hidden ml-2 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <Link href="/restaurants" className="text-gray-900 hover:text-green-600 block px-3 py-2 rounded-md text-base font-medium">
                {t('navigation.restaurants')}
              </Link>
              <Link href="/mosques" className="text-gray-900 hover:text-green-600 block px-3 py-2 rounded-md text-base font-medium">
                {t('navigation.mosques')}
              </Link>
              <Link href="/shops" className="text-gray-900 hover:text-green-600 block px-3 py-2 rounded-md text-base font-medium">
                {t('navigation.shops')}
              </Link>
              <Link href="/community" className="text-gray-900 hover:text-green-600 block px-3 py-2 rounded-md text-base font-medium">
                {t('navigation.community')}
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">HalalCentral</h3>
              <p className="text-gray-300">
                {t('footer.description')}
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('footer.for_businesses')}</h3>
              <ul className="space-y-2">
                <li><Link href="/register-business" className="text-gray-300 hover:text-white">{t('footer.register_business')}</Link></li>
                <li><Link href="/business-benefits" className="text-gray-300 hover:text-white">{t('footer.business_benefits')}</Link></li>
                <li><Link href="/pricing" className="text-gray-300 hover:text-white">{t('footer.pricing')}</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('footer.for_users')}</h3>
              <ul className="space-y-2">
                <li><Link href="/restaurants" className="text-gray-300 hover:text-white">{t('navigation.restaurants')}</Link></li>
                <li><Link href="/mosques" className="text-gray-300 hover:text-white">{t('navigation.mosques')}</Link></li>
                <li><Link href="/shops" className="text-gray-300 hover:text-white">{t('navigation.shops')}</Link></li>
                <li><Link href="/community" className="text-gray-300 hover:text-white">{t('navigation.community')}</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('footer.company')}</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-300 hover:text-white">{t('footer.about')}</Link></li>
                <li><Link href="/contact" className="text-gray-300 hover:text-white">{t('footer.contact')}</Link></li>
                <li><Link href="/privacy" className="text-gray-300 hover:text-white">{t('footer.privacy')}</Link></li>
                <li><Link href="/terms" className="text-gray-300 hover:text-white">{t('footer.terms')}</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} HalalCentral. {t('footer.all_rights_reserved')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}