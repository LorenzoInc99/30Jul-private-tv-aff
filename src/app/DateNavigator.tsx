"use client";
import { useState, useRef, useEffect } from 'react';

export default function DateNavigator({ selectedDate, onChange }: { selectedDate: Date; onChange: (date: Date) => void }) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));
  const calendarRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendar]);

  // Generate calendar days
  const getCalendarDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  const calendarDays = getCalendarDays(currentMonth);

  const handleDateSelect = (date: Date) => {
    onChange(date);
    setShowCalendar(false);
  };

  const isSelectedDate = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const isTodayDate = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  return (
    <nav className="w-full py-0 px-0 flex items-center justify-between relative">
      <div className="flex items-center w-full justify-between">
        {/* Single Container with All Navigation Elements */}
        <div className="flex items-center rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
          {/* Previous Day Button */}
          <button
            className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-0 focus:border-0 transition-all duration-200 hover:scale-105 active:scale-95 rounded-l-lg"
            onClick={() => onChange(new Date(selectedDate.getTime() - 86400000))}
            aria-label="Previous day"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          
          {/* Date Display with Separate Calendar Icon */}
          <div className="flex items-center justify-center py-1 min-w-[70px] text-sm font-bold text-gray-900 dark:text-white relative">
            {/* Standalone Clickable Calendar Icon */}
            <button
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors focus:outline-none focus:ring-0 focus:border-0"
              onClick={() => setShowCalendar(!showCalendar)}
              aria-label="Open calendar"
            >
              <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
            
            {/* Date Text */}
            <span>
              {`${selectedDate.getDate().toString().padStart(2, '0')}/${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}`}
            </span>
            
            {/* Calendar Popup */}
            {showCalendar && (
              <div 
                ref={calendarRef}
                className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 min-w-[280px]"
              >
                {/* Calendar Header */}
                <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 rounded-t-2xl">
                  <button
                    onClick={goToPreviousMonth}
                    className="p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <button
                    onClick={goToNextMonth}
                    className="p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Days of Week */}
                <div className="grid grid-cols-7 gap-1 p-2">
                  {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 p-2">
                  {calendarDays.map((date, index) => (
                    <button
                      key={index}
                      onClick={() => handleDateSelect(date)}
                      className={`
                        w-8 h-8 rounded-xl text-sm font-medium transition-colors
                        ${isSelectedDate(date) 
                          ? 'bg-indigo-600 text-white' 
                          : isTodayDate(date)
                          ? 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white'
                          : isCurrentMonth(date)
                          ? 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                          : 'text-gray-400 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }
                      `}
                    >
                      {date.getDate()}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Next Day Button */}
          <button
            className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-0 focus:border-0 transition-all duration-200 hover:scale-105 active:scale-95 rounded-r-lg"
            onClick={() => onChange(new Date(selectedDate.getTime() + 86400000))}
            aria-label="Next day"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
    </nav>
  );
} 