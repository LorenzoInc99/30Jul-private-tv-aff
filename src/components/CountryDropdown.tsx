'use client';

import { useState, useEffect, useRef } from 'react';

interface Country {
  id: number;
  name: string;
  image_path?: string;
}

interface CountryDropdownProps {
  selectedCountry: Country | null;
  onCountryChange: (country: Country | null) => void;
  className?: string;
  showLabel?: boolean;
}

export default function CountryDropdown({ 
  selectedCountry, 
  onCountryChange, 
  className = '',
  showLabel = true
}: CountryDropdownProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch countries on mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('/api/get-countries');
        const data = await response.json();
        
        if (data.countries) {
          setCountries(data.countries);
        }
      } catch (error) {
        console.error('Error fetching countries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCountrySelect = (country: Country) => {
    onCountryChange(country);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClearSelection = () => {
    onCountryChange(null);
    setIsOpen(false);
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-sm text-gray-600 dark:text-gray-400">Country</span>
        <div className="w-32 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="flex items-center gap-2">
        {showLabel && (
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-600 dark:text-gray-400">Channels</span>
            <div className="group relative">
              <svg className="w-3 h-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Filter channels by country
              </div>
            </div>
          </div>
        )}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors min-w-[120px]"
          >
            {selectedCountry ? (
              <div className="flex items-center gap-2">
                {selectedCountry.image_path && (
                  <img 
                    src={selectedCountry.image_path} 
                    alt={selectedCountry.name}
                    className="w-4 h-4 rounded-sm"
                  />
                )}
                <span className="truncate">{selectedCountry.name}</span>
              </div>
            ) : (
              <span className="text-gray-500 dark:text-gray-400">All Channels</span>
            )}
            <svg 
              className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-60 overflow-hidden">
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search countries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          
          <div className="max-h-48 overflow-y-auto">
            {filteredCountries.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                No countries found
              </div>
            ) : (
              <>
                <button
                  onClick={handleClearSelection}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    !selectedCountry ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-sm bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                      <span className="text-xs">📺</span>
                    </div>
                    <span>All Channels</span>
                  </div>
                </button>
                
                {filteredCountries.map((country) => (
                  <button
                    key={country.id}
                    onClick={() => handleCountrySelect(country)}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      selectedCountry?.id === country.id ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {country.image_path ? (
                        <img 
                          src={country.image_path} 
                          alt={country.name}
                          className="w-4 h-4 rounded-sm"
                        />
                      ) : (
                        <div className="w-4 h-4 rounded-sm bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                          <span className="text-xs">🏳️</span>
                        </div>
                      )}
                      <span>{country.name}</span>
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
