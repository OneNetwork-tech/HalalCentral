import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';

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
  prayer_schedule?: {
    fajr: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
    jumma?: string;
  };
  images?: {
    logo?: string;
    cover?: string;
  };
}

export default function MosquesPage() {
  const { t, i18n } = useTranslation('common');
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInstitutes();
  }, []);

  const fetchInstitutes = async () => {
    try {
      const response = await fetch('/api/institutes');
      const data = await response.json();
      // Filter for mosques only
      const mosques = data.institutes.filter((institute: Institute) => 
        institute.institute_type === 'mosque'
      );
      setInstitutes(mosques);
    } catch (error) {
      console.error('Error fetching institutes:', error);
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
        <title>{`${t('navigation.mosques', { defaultValue: 'Mosques' })} - HalalCentral`}</title>
        <meta name="description" content={t('pages.mosques.description', { defaultValue: 'Find mosques and Islamic centers in Sweden' })} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900">{t('navigation.mosques')}</h1>
            <p className="mt-2 text-gray-600">{t('pages.mosques.subtitle')}</p>
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
          ) : institutes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">{t('pages.mosques.no_mosques')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {institutes.map((institute) => (
                <Link key={institute.id} href={`/institute/${institute.id}`} className="block">
                  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    {institute.images?.cover ? (
                      <img 
                        src={institute.images.cover} 
                        alt={getLocalizedText(institute.name)}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-48" />
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {getLocalizedText(institute.name)}
                      </h3>
                      
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {getLocalizedText(institute.description)}
                      </p>
                      
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        <span>{formatAddress(institute.address)}</span>
                      </div>
                      
                      {institute.prayer_schedule && (
                        <div className="mt-4">
                          <h4 className="font-medium text-gray-900 mb-2">{t('prayer_times.today')}</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">{t('prayer_times.fajr')}</span>
                              <span className="font-medium">{institute.prayer_schedule.fajr}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">{t('prayer_times.dhuhr')}</span>
                              <span className="font-medium">{institute.prayer_schedule.dhuhr}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">{t('prayer_times.asr')}</span>
                              <span className="font-medium">{institute.prayer_schedule.asr}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">{t('prayer_times.maghrib')}</span>
                              <span className="font-medium">{institute.prayer_schedule.maghrib}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">{t('prayer_times.isha')}</span>
                              <span className="font-medium">{institute.prayer_schedule.isha}</span>
                            </div>
                            {institute.prayer_schedule.jumma && (
                              <div className="flex justify-between col-span-2 pt-2 border-t">
                                <span className="text-gray-600">{t('prayer_times.jumma')}</span>
                                <span className="font-medium">{institute.prayer_schedule.jumma}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
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
