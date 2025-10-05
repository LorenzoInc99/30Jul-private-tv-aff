"use client";

import { useState } from 'react';

export default function TestAccessibilityPage() {
  const [showOdds, setShowOdds] = useState(false);
  const [showTv, setShowTv] = useState(false);
  const [timezone, setTimezone] = useState('auto');

  const TIMEZONES = [
    { value: 'auto', label: 'Auto (Local Time)' },
    { value: 'Europe/London', label: 'GMT/BST' },
    { value: 'Europe/Paris', label: 'CET/CEST' },
    { value: 'America/New_York', label: 'ET' },
    { value: 'America/Chicago', label: 'CT' },
    { value: 'America/Denver', label: 'MT' },
    { value: 'America/Los_Angeles', label: 'PT' },
    { value: 'Australia/Sydney', label: 'AET' },
    { value: 'Asia/Tokyo', label: 'JST' },
    { value: 'UTC', label: 'UTC' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto max-w-4xl px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Accessibility Test Page
        </h1>
        
        {/* Test Section 1: Toggle Buttons */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Test 1: Toggle Buttons (Current Issues)
          </h2>
          
          <div className="space-y-4">
            {/* Current problematic toggle buttons */}
            <div className="flex items-center gap-2">
              <span className={`text-sm transition-colors duration-500 ${showOdds ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}`}>
                Odds
              </span>
              <button
                onClick={() => setShowOdds(!showOdds)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-500 focus:outline-none focus:ring-0 focus:border-0 focus:shadow-none ${
                  showOdds ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-500 ${
                    showOdds ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-sm transition-colors duration-500 ${showTv ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}`}>
                TV
              </span>
              <button
                onClick={() => setShowTv(!showTv)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-500 focus:outline-none focus:ring-0 focus:border-0 focus:shadow-none ${
                  showTv ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-500 ${
                    showTv ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Test Section 2: Select Elements */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Test 2: Select Elements (Current Issues)
          </h2>
          
          <div className="space-y-4">
            {/* Current problematic select */}
            <div>
              <select
                className="appearance-none rounded-md py-1.5 pl-2 pr-6 text-xs font-medium bg-white border-gray-300 focus:outline-none focus:ring-0 focus:border-0 dark:bg-gray-800 dark:border-gray-600 dark:text-white max-w-[200px]"
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
              >
                {TIMEZONES.map(tz => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Test Section 3: Contrast Issues */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Test 3: Contrast Issues
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded">
              <p className="text-gray-400 dark:text-gray-500">
                ❌ This text has poor contrast (text-gray-400)
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                ✅ This text has good contrast (text-gray-600)
              </p>
            </div>
          </div>
        </div>

        {/* Test Section 4: Touch Target Size */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Test 4: Touch Target Size
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <button className="h-6 w-6 bg-indigo-600 rounded text-white text-xs">
                ❌ Too Small (24px)
              </button>
              <button className="h-8 w-8 bg-indigo-600 rounded text-white text-xs">
                ✅ Better Size (32px)
              </button>
              <button className="h-11 w-11 bg-indigo-600 rounded text-white text-xs">
                ✅ Full Size (44px)
              </button>
            </div>
          </div>
        </div>

        {/* Test Section 5: Improved Versions */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 mb-8 shadow-sm border border-green-200 dark:border-green-800">
          <h2 className="text-xl font-semibold text-green-900 dark:text-green-100 mb-4">
            Test 5: Improved Versions (After Fixes)
          </h2>
          
          <div className="space-y-6">
            {/* Improved toggle buttons */}
            <div>
              <h3 className="text-lg font-medium text-green-900 dark:text-green-100 mb-2">
                Improved Toggle Buttons
              </h3>
              <div className="flex items-center gap-2">
                <span className={`text-sm transition-colors duration-500 ${showOdds ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}`}>
                  Odds
                </span>
                <button
                  onClick={() => setShowOdds(!showOdds)}
                  aria-label={`${showOdds ? 'Hide' : 'Show'} odds display`}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                    showOdds ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-500 ${
                      showOdds ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Improved select */}
            <div>
              <h3 className="text-lg font-medium text-green-900 dark:text-green-100 mb-2">
                Improved Select Element
              </h3>
              <div>
                <label htmlFor="timezone-select-improved" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select Timezone
                </label>
                <select
                  id="timezone-select-improved"
                  className="appearance-none rounded-md py-2 pl-3 pr-8 text-sm font-medium bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white min-w-[200px]"
                  value={timezone}
                  onChange={e => setTimezone(e.target.value)}
                >
                  {TIMEZONES.map(tz => (
                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Improved contrast */}
            <div>
              <h3 className="text-lg font-medium text-green-900 dark:text-green-100 mb-2">
                Improved Contrast
              </h3>
              <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded">
                <p className="text-gray-600 dark:text-gray-300">
                  ✅ This text has improved contrast and is easier to read
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 shadow-sm border border-blue-200 dark:border-blue-800">
          <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
            Testing Instructions
          </h2>
          <div className="space-y-2 text-blue-800 dark:text-blue-200">
            <p>1. <strong>Run Lighthouse</strong> on this page to test accessibility</p>
            <p>2. <strong>Test with screen reader</strong> (if available)</p>
            <p>3. <strong>Test on mobile</strong> to check touch targets</p>
            <p>4. <strong>Compare before/after</strong> scores</p>
            <p className="text-sm text-blue-600 dark:text-blue-300 mt-2">
              <strong>Note:</strong> 32px+ touch targets are recommended for mobile, 44px+ for full accessibility compliance
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
