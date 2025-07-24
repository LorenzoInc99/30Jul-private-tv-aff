"use client";
import { useState } from 'react';
import { useRef } from 'react';

export default function DateNavigator({ selectedDate, onChange }: { selectedDate: Date; onChange: (date: Date) => void }) {
  // Helper to format date as YYYY-MM-DD for input[type=date]
  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isToday = selectedDate.toDateString() === today.toDateString();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const isTomorrow = selectedDate.toDateString() === tomorrow.toDateString();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

  return (
    <nav className="w-full py-1 px-1 md:px-4 flex items-center justify-between">
      <div className="flex items-center w-full justify-between">
        <button
          className="p-1 md:p-2.5 rounded bg-transparent text-gray-600 dark:text-gray-300 focus:outline-none transition-colors md:hover:bg-transparent md:active:bg-transparent"
          onClick={() => onChange(new Date(selectedDate.getTime() - 86400000))}
          aria-label="Previous day"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-7 md:w-7" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
        </button>
        <span
          className="flex items-center justify-center rounded-lg px-10 py-1 min-w-[180px] md:min-w-[220px] mx-2 text-base md:text-lg font-bold text-gray-100 md:bg-transparent md:dark:bg-transparent"
        >
          {isToday ? 'Today' : isTomorrow ? 'Tomorrow' : `${selectedDate.getDate().toString().padStart(2, '0')}/${(selectedDate.getMonth()+1).toString().padStart(2, '0')}`}
        </span>
        {showDatePicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" onClick={() => setShowDatePicker(false)}>
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6" onClick={e => e.stopPropagation()}>
              <input
                ref={dateInputRef}
                type="date"
                className="p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
                value={formatDate(selectedDate)}
                onChange={e => {
                  const d = new Date(e.target.value);
                  if (!isNaN(d.getTime())) onChange(d);
                  setShowDatePicker(false);
                }}
                autoFocus
              />
              <button
                className="ml-4 px-3 py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onClick={() => setShowDatePicker(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        <button
          className="p-2 md:p-2.5 rounded bg-transparent text-gray-600 dark:text-gray-300 focus:outline-none transition-colors md:hover:bg-transparent md:active:bg-transparent"
          onClick={() => onChange(new Date(selectedDate.getTime() + 86400000))}
          aria-label="Next day"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-7 md:w-7" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
        </button>
      </div>
      <div className="hidden md:flex items-center space-x-2">
        <button
          className="px-4 py-2 rounded bg-transparent text-gray-700 dark:text-gray-200 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 md:border-0 md:hover:bg-transparent md:active:bg-transparent"
          onClick={() => onChange(new Date(today))}
          disabled={isToday}
        >
          Today
        </button>
        <button
          className="p-2 rounded bg-transparent text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 md:border-0 md:hover:bg-transparent md:active:bg-transparent"
          aria-label="Open calendar"
          onClick={() => setShowDatePicker(true)}
          type="button"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>
      </div>
    </nav>
  );
} 