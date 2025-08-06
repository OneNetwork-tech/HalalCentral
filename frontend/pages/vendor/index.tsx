import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { MagnifyingGlassIcon, MapPinIcon, ClockIcon, StarIcon } from '@heroicons/react/24/outline';

interface Vendor {
  id: string;
  name: { [key: string]: string };
  description: { [key: string]: string };
  vendor_type: string;
  cuisine_type?: string;
  address: {
    street: string;
    city: string;
    postal_code: string;
  };
  average_rating: number;
  total_reviews: number;
  is_open_now: boolean;
  offers_delivery: boolean;
  images?: {
    logo?: string;
    cover?: string;
  };
}

interface Institute {
  id: string;
  name: { [key: string]: string };
  description: { [key: string]: string };
  institute_type: string;
  address: {
    street: string;
    city: string;
    postal_code: string;
  };
  images?: {
    logo?: string;
    cover?: string;
  };
}

export default function HomePage() {
  const { t, i18n } = useTranslation('common');
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [featuredVendors, setFeaturedVendors] = useState<Vendor[]>([]);
  const [nearbyInstitutes, setNearbyInstitutes] = useState<Institute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch featured vendors and nearby institutes
    fetchFeaturedContent();
  }, []);

  const fetchFeaturedContent = async () => {
    try {
      // In a real implementation, these would be API calls
      // For now, we'll use mock data
      const mockVendors: Vendor[] = [
        {
          id: '1',
          name: {
            sv: 'Al-Salam Restaurang',
            en: 'Al-Salam Restaurant',
            ar: 'مطعم السلام'
          },
          description: {
            sv: 'Autentisk mellanöstern mat i hjärtat av Stockholm',
            en: 'Authentic Middle Eastern cuisine in the heart of Stockholm',
            ar: 'مأكولات شرق أوسطية أصيلة في قلب ستوكهولم'
          },
          vendor_type: 'restaurant',
          cuisine_type: 'middle_eastern',
          address: {
            street: 'Drottninggatan 45',
            city: 'Stockholm',
            postal_code: '11122'
          },
          average_rating: 4.5,
          total_reviews: 127,
          is_open_now: true,
          offers_delivery: true,
          images: {
            logo: '/images/vendors/al-salam-logo.jpg',
            cover: '/images/vendors/al-salam-cover.jpg'
          }
        },
        {
          id: '2',
          name: {
            sv: 'Halal Kött & Delikatesser',
            en: 'Halal Meat & Delicatessen',
            ar: 'لحوم حلال ومأكولات شهية'
          },
          description: {
            sv: 'Färskt halalkött och specialiteter från hela världen',
            en: 'Fresh halal meat and specialties from around the world',
            ar: 'لحوم حلال طازجة وتخصصات من جميع أنحاء العالم'
          },
          vendor_type: 'butcher',
          address: {
            street: 'Götgatan 78',
            city: 'Stockholm',
            postal_code: '11830'
          },
          average_rating: 4.8,
          total_reviews: 89,
          is_open_now: false,
          offers_delivery: false
        }
      ];

      const mockInstitutes: Institute[] = [
        {
          id: '1',
          name: {
            sv: 'Stockholms Islamiska Centrum',
            en: 'Stockholm Islamic Center',
            ar: 'المركز الإسلامي في ستوكهولم'
          },
          description: {
            sv: 'Huvudmoskén i Stockholm med utbildningsprogram och samhällstjänster',
            en: 'Main mosque in Stockholm with educational programs and community services',
            ar: 'المسجد الرئيسي في ستوكهولم مع البرامج التعليمية والخدمات المجتمعية'
          },
          institute_type: 'mosque',
          address: {
            street: 'Kapellgränd 10',
            city: 'Stockholm',
            postal_code: '11625'
          }
        }
      ];

      setFeaturedVendors(mockVendors);
      setNearbyInstitutes(mockInstitutes);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching content:', error);
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery, 'in', location);
  };

  const formatAddress = (address: any) => {
    return `${address.street}, ${address.postal_code.slice(0, 3)} ${address.postal_code.slice(3)} ${address.city.toUpperCase()}`;
  };

  const getLocalizedText = (textObj: { [key: string]: string }) => {
    return textObj[i18n.language] || textObj['sv'] || textObj['en'] || Object.values(textObj)[0];
  };

  return (
    <>
      <Head>
        <title>{t('site.title')} - {t('site.tagline')}</title>
        <meta name="description" content={t('site.description')} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                {t('hero.title')}
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                {t('hero.subtitle')}
              </p>

              {/* Search Form */}
              <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t('search.placeholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 text-gray-900 rounded-md border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex-1 relative">
                    <MapPinIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t('search.location_placeholder')}
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 text-gray-900 rounded-md border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-md font-semibold transition-colors"
                  >
                    {t('search.button')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Link href="/restaurants" className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">🍽️</div>
              <h3 className="font-semibold text-gray-900">{t('categories.restaurants')}</h3>
            </Link>
            <Link href="/mosques" className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">🕌</div>
              <h3 className="font-semibold text-gray-900">{t('categories.mosques')}</h3>
            </Link>
            <Link href="/shops" className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">🛒</div>
              <h3 className="font-semibold text-gray-900">{t('categories.shops')}</h3>
            </Link>
            <Link href="/community" className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">👥</div>
              <h3 className="font-semibold text-gray-900">{t('categories.community')}</h3>
            </Link>
          </div>
        </div>

        {/* Featured Vendors */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">{t('sections.featured_vendors')}</h2>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredVendors.map((vendor) => (
                <Link key={vendor.id} href={`/vendor/${vendor.id}`}>
                  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    {vendor.images?.cover && (
                      <img 
                        src={vendor.images.cover} 
                        alt={getLocalizedText(vendor.name)}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {getLocalizedText(vendor.name)}
                        </h3>
                        {vendor.is_open_now && (
                          <span className="flex items-center text-green-600 text-sm">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {t('status.open_now')}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {getLocalizedText(vendor.description)}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center">
                          <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                          <span>{vendor.average_rating}</span>
                          <span className="ml-1">({vendor.total_reviews})</span>
                        </div>
                        
                        <div className="flex items-center">
                          <MapPinIcon className="h-4 w-4 mr-1" />
                          <span>{vendor.address.city}</span>
                        </div>
                      </div>
                      
                      {vendor.offers_delivery && (
                        <div className="mt-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {t('features.delivery_available')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Nearby Institutes */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">{t('sections.nearby_institutes')}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nearbyInstitutes.map((institute) => (
                <Link key={institute.id} href={`/institute/${institute.id}`}>
                  <div className="bg-gray-50 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {getLocalizedText(institute.name)}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {getLocalizedText(institute.description)}
                    </p>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      <span>{formatAddress(institute.address)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-green-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h2 className="text-3xl font-bold mb-4">{t('cta.title')}</h2>
            <p className="text-xl mb-8 opacity-90">{t('cta.description')}</p>
            <div className="space-x-4">
              <Link href="/register-business" className="bg-white text-green-600 px-8 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors">
                {t('cta.register_business')}
              </Link>
              <Link href="/about" className="border border-white text-white px-8 py-3 rounded-md font-semibold hover:bg-white hover:text-green-600 transition-colors">
                {t('cta.learn_more')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'sv', ['common'])),
    },
  };
};
