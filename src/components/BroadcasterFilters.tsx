"use client";
import { useState } from 'react';
import CountryDropdown from './CountryDropdown';

interface BroadcasterFiltersProps {
  onFiltersChange: (filters: {
    geoLocation: string;
    subscriptionType: string[];
    selectedCountry: { id: number; name: string; image_path?: string } | null;
  }) => void;
}

export default function BroadcasterFilters({ onFiltersChange }: BroadcasterFiltersProps) {
  const [geoLocation, setGeoLocation] = useState('all');
  const [subscriptionType, setSubscriptionType] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<{ id: number; name: string; image_path?: string } | null>(null);

  const handleGeoChange = (value: string) => {
    setGeoLocation(value);
    onFiltersChange({ geoLocation: value, subscriptionType, selectedCountry });
  };

  const handleSubscriptionChange = (value: string) => {
    const newSelection = subscriptionType.includes(value)
      ? subscriptionType.filter(item => item !== value)
      : [...subscriptionType, value];
    
    setSubscriptionType(newSelection);
    onFiltersChange({ geoLocation, subscriptionType: newSelection, selectedCountry });
  };

  const handleCountryChange = (country: { id: number; name: string; image_path?: string } | null) => {
    setSelectedCountry(country);
    onFiltersChange({ geoLocation, subscriptionType, selectedCountry: country });
  };

  return (
    <div className="flex gap-2">
      {/* Country Filter */}
      <CountryDropdown 
        selectedCountry={selectedCountry} 
        onCountryChange={handleCountryChange}
        className="min-w-[140px]"
        showLabel={false}
      />

      {/* Access Filter - Multi-select */}
      <select
        value={subscriptionType.length === 0 ? 'all' : subscriptionType.join(',')}
        onChange={(e) => {
          if (e.target.value === 'all') {
            setSubscriptionType([]);
            onFiltersChange({ geoLocation, subscriptionType: [] });
          } else {
            const values = e.target.value.split(',');
            setSubscriptionType(values);
            onFiltersChange({ geoLocation, subscriptionType: values });
          }
        }}
        className="px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      >
        <option value="all">All Access Types</option>
        <option value="free">Free to Watch</option>
        <option value="subscription">Subscription Required</option>
        <option value="trial">Free Trial Available</option>
        <option value="free,subscription">Free + Subscription</option>
        <option value="free,trial">Free + Trial</option>
        <option value="subscription,trial">Subscription + Trial</option>
        <option value="free,subscription,trial">All Types</option>
      </select>
    </div>
  );
}
