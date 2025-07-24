import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import Layout from '../components/Layout';
import Link from 'next/link';
import { 
  MagnifyingGlassIcon, 
  MapPinIcon, 
  ClockIcon, 
  StarIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

interface Restaurant {
  id: string;
  name: { [key: string]: string };
  description: { [key: string]: string };
  cuisine_type: string;
  address: {
    street: string;
    city: string;
    postal_code: string;
  };
  average_rating: number;
  total_reviews: number;
  is_open_now: boolean;
  offers_delivery: boolean;
  delivery_time_minutes?: number;
  minimum_order?: number;
  images?: {
    logo?: string;
    cover?: string;
  };
}

const cuisineTypes = [
  { value: 'middle_eastern', label: 'Middle Eastern' },
  { value: 'south_asian', label: 'South Asian' },
  { value: 'north_african', label: 'North African' },
  { value: 'turkish', label: 'Turkish' },
  { value: 'persian', label: 'Persian' },
  { value: 'malaysian', label: 'Malaysian' },
  { value: 'international', label: 'International' },
  { value: 'swedish_halal', label: 'Swedish Halal' },
];

export default function RestaurantsPage() {
  const { t, i18n } = useTranslation('common');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [deliveryOnly, setDeliveryOnly] = useState(false);
  const [openNow, setOpenNow] = useState(false);
  const [sortBy, setSortBy] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchRestaurants();
  }, [selectedCuisine, selectedCity, deliveryOnly, openNow, sortBy]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, this would be an API call
      // For now, we'll use mock data
      const mockRestaurants: Restaurant[] = [
        {
          id: '1',
          name: {
            sv: 'Al-Salam Restaurang',
            en: 'Al-Salam Restaurant',
            ar: 'مطعم السلام'
          },
          description: {
            sv: 'Autentisk mellanöstern mat med traditionella recept från Libanon och Syrien',
            en: 'Authentic Middle Eastern cuisine with traditional recipes from Lebanon and Syria',
            ar: 'مأكولات شرق أوسطية أصيلة مع وصفات تقليدية من لبنان وسوريا'
          },
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
          delivery_time_minutes: 35,
          minimum_order: 150,
          images: {
            logo: '/images/restaurants/al-salam-logo.jpg',
            cover: '/images/restaurants/al-salam-cover.jpg'
          }
        },
        {
          id: '2',
          name: {
            sv: 'Istanbul Kebab & Grill',
            en: 'Istanbul Kebab & Grill',
            ar: 'إسطنبول كباب وشواء'
          },
          description: {
            sv: 'Äkta turkisk mat med färska ingredienser och traditionella kryddor',
            en: 'Authentic Turkish food with fresh ingredients and traditional spices',
            ar: 'طعام تركي أصيل مع مكونات طازجة وتوابل تقليدية'
          },
          cuisine_type: 'turkish',
          address: {
            street: 'Götgatan 78',
            city: 'Stockholm',
            postal_code: '11830'
          },
          average_rating: 4.2,
          total_reviews: 89,
          is_open_now: false,
          offers_delivery: true,
          delivery_time_minutes: 25,
          minimum_order: 120
        },
        {
          id: '3',
          name: {
            sv: 'Karachi Kitchen',
            en: 'Karachi Kitchen',
            ar: 'مطبخ كراتشي'
          },
          description: {
            sv: 'Smakrik pakistansk och indisk mat med autentiska kryddor',
            en: 'Flavorful Pakistani and Indian cuisine with authentic spices',
            ar: 'مأكولات باكستانية وهندية لذيذة مع توابل أصيلة'
          },
          cuisine_type: 'south_asian',
          address: {
            street: 'Hornsgatan 92',
            city: 'Stockholm',
            postal_code: '11721'
          },
          average_rating: 4.7,
          total_reviews: 203,
          is_open_now: true,
          offers_delivery: false,
          delivery_time_minutes: 0,
          minimum_order: 0
        }
      ];

      // Apply filters
      let filteredRestaurants = mockRestaurants;

      if (selectedCuisine) {
        filteredRestaurants = filteredRestaurants.filter(r => r.cuisine_type === selectedCuisine);
      }

      if (selectedCity) {
        filteredRestaurants = filteredRestaurants.filter(r => 
          r.address.city.toLowerCase().includes(selectedCity.toLowerCase())
        );
      }

      if (deliveryOnly) {
        filteredRestaurants = filteredRestaurants.filter(r => r.offers_delivery);
      }

      if (openNow) {
        filteredRestaurants = filteredRestaurants.filter(r => r.is_open_now);
      }

      // Apply sorting
      switch (sortBy) {
        case 'rating':
          filteredRestaurants.sort((a, b) => b.average_rating - a.average_rating);
          break;
        case 'reviews':
          filteredRestaurants.sort((a, b) => b.total_reviews - a.total_reviews);
          break;
        case 'delivery_time':
          filteredRestaurants.sort((a, b) => (a.delivery_time_minutes || 999) - (b.delivery_time_minutes || 999));
          break;
      }

      setRestaurants(filteredRestaurants);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  const getLocalizedText = (textObj: { [key: string]: string }) => {
    return textObj[i18n.language] || textObj['sv'] || textObj['en'] || Object.values(textObj)[0];
  };

  const formatAddress = (address: any) => {
    return `${address.street}, ${address.postal_code.slice(0, 3)} ${address.postal_code.slice(3)} ${address.city.toUpperCase()}`;
  };

  const getCuisineLabel = (cuisineType: string) => {
    const cuisine = cuisineTypes.find(c => c.value === cuisineType);
    return cuisine ? t(`cuisine.${cuisine.value}`) : cuisineType;
  };

  return (
    <Layout 
      title={t('pages.restaurants.title')}
      description={t('pages.restaurants.description')}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('pages.restaurants.title')}
          </h1>
          <p className="text-gray-600">
            {t('pages.restaurants.subtitle')}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('search.restaurant_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </form>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <FunnelIcon className="h-5 w-5" />
              <span>{t('filters.toggle')}</span>
            </button>

            <div className="flex items-center space-x-4">
              <label className="text-sm text-gray-600">
                {t('filters.sort_by')}:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="rating">{t('filters.sort.rating')}</option>
                <option value="reviews">{t('filters.sort.reviews')}</option>
                <option value="delivery_time">{t('filters.sort.delivery_time')}</option>
              </select>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Cuisine Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('filters.cuisine_type')}
                  </label>
                  <select
                    value={selectedCuisine}
                    onChange={(e) => setSelectedCuisine(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">{t('filters.all_cuisines')}</option>
                    {cuisineTypes.map(cuisine => (
                      <option key={cuisine.value} value={cuisine.value}>
                        {t(`cuisine.${cuisine.value}`)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('filters.city')}
                  </label>
                  <input
                    type="text"
                    placeholder={t('filters.city_placeholder')}
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* Checkboxes */}
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={deliveryOnly}
                      onChange={(e) => setDeliveryOnly(e.target.checked)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {t('filters.delivery_only')}
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={openNow}
                      onChange={(e) => setOpenNow(e.target.checked)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {t('filters.open_now')}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-gray-600">
            {loading ? t('loading') : t('results_count', { count: restaurants.length })}
          </p>
        </div>

        {/* Restaurant Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">{t('no_results')}</p>
            <p className="text-gray-400 mt-2">{t('try_different_filters')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <Link key={restaurant.id} href={`/restaurant/${restaurant.id}`}>
                <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  {restaurant.images?.cover && (
                    <img 
                      src={restaurant.images.cover} 
                      alt={getLocalizedText(restaurant.name)}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {getLocalizedText(restaurant.name)}
                      </h3>
                      {restaurant.is_open_now && (
                        <span className="flex items-center text-green-600 text-sm">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {t('status.open_now')}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-500 mb-2">
                      {getCuisineLabel(restaurant.cuisine_type)}
                    </p>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {getLocalizedText(restaurant.description)}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                        <span>{restaurant.average_rating}</span>
                        <span className="ml-1">({restaurant.total_reviews})</span>
                      </div>
                      
                      <div className="flex items-center">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        <span>{restaurant.address.city}</span>
                      </div>
                    </div>
                    
                    {restaurant.offers_delivery && (
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {t('features.delivery_available')}
                        </span>
                        
                        {restaurant.delivery_time_minutes && (
                          <span className="text-sm text-gray-500">
                            {restaurant.delivery_time_minutes} min
                          </span>
                        )}
                      </div>
                    )}
                    
                    {restaurant.minimum_order && restaurant.minimum_order > 0 && (
                      <div className="mt-2 text-xs text-gray-500">
                        {t('minimum_order')}: {restaurant.minimum_order} kr
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'sv', ['common'])),
    },
  };
};
