import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { MapPinIcon, ClockIcon, StarIcon } from '@heroicons/react/24/outline';

interface Vendor {
  id: string;
  name: { [key: string]: string };
  description: { [key: string]: string };
  business_type: string;
  address: {
    street: string;
    city: string;
    postal_code: string;
  };
  average_rating?: number;
  total_reviews?: number;
  is_open_now?: boolean;
  images?: {
    logo?: string;
    cover?: string;
  };
}

export default function ShopsPage() {
  const { t, i18n } = useTranslation('common');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await fetch('/api/vendors');
      const data = await response.json();
      // Filter for shops (butchers, grocery stores, etc.)
      const shops = data.vendors.filter((vendor: Vendor) => 
        vendor.business_type === 'butcher' || 
        vendor.business_type === 'grocery_store' ||
        vendor.business_type === 'bakery'
      );
      setVendors(shops);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLocalizedText = (textObj: { [key: string]: string }) => {
    return textObj[i18n.language] || textObj['sv'] || textObj['en'] || Object.values(textObj)[0];
  };

  const formatAddress = (address: any) => {
    return `${address.street}, ${address.postal_code.slice(0, 3)} ${address.postal_code.slice(3)} ${address.city.toUpperCase()}`;
  };

  return (
    <>
      <Head>
        <title>{`${t('navigation.shops', { defaultValue: 'Shops' })} - HalalCentral`}</title>
        <meta name="description" content={t('pages.shops.description', { defaultValue: 'Find halal shops and stores in Sweden' })} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900">{t('navigation.shops')}</h1>
            <p className="mt-2 text-gray-600">{t('pages.shops.subtitle')}</p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                  <div className="h-48 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : vendors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">{t('pages.shops.no_shops')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vendors.map((vendor) => (
                <Link key={vendor.id} href={`/vendor/${vendor.id}`} className="block">
                  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    {vendor.images?.cover ? (
                      <img 
                        src={vendor.images.cover} 
                        alt={getLocalizedText(vendor.name)}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-48" />
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
                      
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        <span>{formatAddress(vendor.address)}</span>
                      </div>
                      
                      {vendor.average_rating && (
                        <div className="flex items-center mb-3">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon 
                                key={i} 
                                className={`h-4 w-4 ${i < Math.floor(vendor.average_rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                          <span className="ml-2 text-sm text-gray-600">
                            {vendor.average_rating} ({vendor.total_reviews} {t('reviews.reviews')})
                          </span>
                        </div>
                      )}
                      
                      <div className="mt-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {t(`business_types.${vendor.business_type}`)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
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
