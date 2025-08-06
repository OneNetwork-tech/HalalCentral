import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';

export default function CommunityPage() {
  const { t } = useTranslation('common');

  const communityFeatures = [
    {
      title: t('community.events.title'),
      description: t('community.events.description'),
      icon: '📅',
      link: '/events'
    },
    {
      title: t('community.jobs.title'),
      description: t('community.jobs.description'),
      icon: '💼',
      link: '/jobs'
    },
    {
      title: t('community.volunteer.title'),
      description: t('community.volunteer.description'),
      icon: '🤝',
      link: '/volunteer'
    },
    {
      title: t('community.education.title'),
      description: t('community.education.description'),
      icon: '📚',
      link: '/education'
    }
  ];

  return (
    <>
      <Head>
        <title>{`${t('navigation.community', { defaultValue: 'Community' })} - HalalCentral`}</title>
        <meta name="description" content={t('pages.community.description', { defaultValue: 'Community services and events for the Swedish Muslim community' })} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h1 className="text-4xl font-bold mb-4">{t('navigation.community')}</h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              {t('pages.community.subtitle')}
            </p>
          </div>
        </div>

        {/* Community Features */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {communityFeatures.map((feature, index) => (
              <Link key={index} href={feature.link} className="block">
                <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Community Resources */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              {t('pages.community.resources_title')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-5xl mb-4">🕌</div>
                <h3 className="text-xl font-semibold mb-2">{t('pages.community.resource_mosques')}</h3>
                <p className="text-gray-600 mb-4">
                  {t('pages.community.resource_mosques_desc')}
                </p>
                <Link href="/mosques" className="text-green-600 font-medium hover:text-green-700">
                  {t('pages.community.explore_mosques')}
                </Link>
              </div>
              
              <div className="text-center">
                <div className="text-5xl mb-4">🍽️</div>
                <h3 className="text-xl font-semibold mb-2">{t('pages.community.resource_restaurants')}</h3>
                <p className="text-gray-600 mb-4">
                  {t('pages.community.resource_restaurants_desc')}
                </p>
                <Link href="/restaurants" className="text-green-600 font-medium hover:text-green-700">
                  {t('pages.community.explore_restaurants')}
                </Link>
              </div>
              
              <div className="text-center">
                <div className="text-5xl mb-4">🛒</div>
                <h3 className="text-xl font-semibold mb-2">{t('pages.community.resource_shops')}</h3>
                <p className="text-gray-600 mb-4">
                  {t('pages.community.resource_shops_desc')}
                </p>
                <Link href="/shops" className="text-green-600 font-medium hover:text-green-700">
                  {t('pages.community.explore_shops')}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-green-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h2 className="text-3xl font-bold mb-4">{t('pages.community.cta_title')}</h2>
            <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
              {t('pages.community.cta_description')}
            </p>
            <div className="space-x-4">
              <Link href="/register-business" className="bg-white text-green-600 px-8 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors inline-block">
                {t('pages.community.register_business')}
              </Link>
              <Link href="/contact" className="border border-white text-white px-8 py-3 rounded-md font-semibold hover:bg-white hover:text-green-600 transition-colors inline-block">
                {t('pages.community.contact_us')}
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
