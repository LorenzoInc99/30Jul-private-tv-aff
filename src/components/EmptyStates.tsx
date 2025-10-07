import React from 'react';

interface EmptyStateProps {
  type: 'no-matches' | 'error' | 'loading' | 'no-favorites' | 'no-results';
  onAction?: () => void;
  actionText?: string;
  customMessage?: string;
  activeTab?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  type, 
  onAction, 
  actionText, 
  customMessage,
  activeTab = 'today'
}) => {
  const getContent = () => {
    switch (type) {
      case 'no-matches':
        const getTabSpecificContent = () => {
          switch (activeTab) {
            case 'live':
              return {
                icon: (
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/20 dark:to-red-800/20 rounded-full flex items-center justify-center animate-pulse">
                      <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                    </div>
                  </div>
                ),
                title: 'No Live Matches',
                message: 'No football matches are currently being played. Check back later or explore upcoming matches.',
                suggestions: [
                  'Check Today\'s matches',
                  'View Tomorrow\'s schedule',
                  'Browse Weekend games'
                ]
              };
            case 'today':
              return {
                icon: (
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900/20 dark:to-indigo-800/20 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                ),
                title: 'No Matches Today',
                message: 'No football matches are scheduled for today. Try checking other days or explore different leagues.',
                suggestions: [
                  'Check Tomorrow\'s matches',
                  'Browse Weekend games',
                  'Explore Live matches'
                ]
              };
            case 'tomorrow':
              return {
                icon: (
                  <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900/20 dark:to-emerald-800/20 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                ),
                title: 'No Matches Tomorrow',
                message: 'No football matches are scheduled for tomorrow. Check other days or explore different time periods.',
                suggestions: [
                  'Check Today\'s matches',
                  'Browse Weekend games',
                  'Explore Live matches'
                ]
              };
            case 'weekend':
              return {
                icon: (
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-200 dark:from-purple-900/20 dark:to-pink-800/20 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                ),
                title: 'No Weekend Matches',
                message: 'No football matches are scheduled for this weekend. Check other time periods or explore different leagues.',
                suggestions: [
                  'Check Today\'s matches',
                  'View Tomorrow\'s schedule',
                  'Explore Live matches'
                ]
              };
            default:
              return {
                icon: (
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800/20 dark:to-gray-700/20 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                ),
                title: 'No Matches Found',
                message: customMessage || 'No football matches match your current criteria. Try adjusting your filters or search terms.',
                suggestions: [
                  'Clear all filters',
                  'Try different search terms',
                  'Check other time periods'
                ]
              };
          }
        };

        const tabContent = getTabSpecificContent();
        return {
          ...tabContent,
          actionText: actionText || 'Explore Matches',
          action: onAction || (() => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (typeof window !== 'undefined') {
              localStorage.setItem('selectedDate', today.toISOString());
              window.location.reload();
            }
          })
        };
      
      case 'error':
        return {
          icon: (
            <svg className="w-16 h-16 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ),
          title: 'Something went wrong',
          message: customMessage || 'We encountered an error while loading the matches. Please try refreshing the page.',
          actionText: actionText || 'Refresh Page',
          action: onAction || (() => window.location.reload())
        };
      
      case 'loading':
        return {
          icon: (
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          ),
          title: 'Loading matches...',
          message: customMessage || 'Please wait while we fetch the latest match data.',
          actionText: null,
          action: null
        };
      
      case 'no-favorites':
        return {
          icon: (
            <svg className="w-16 h-16 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442c.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
          ),
          title: 'No favorite matches',
          message: customMessage || 'You haven\'t starred any matches yet. Click the star icon on any match to add it to your favorites.',
          actionText: actionText || 'View All Matches',
          action: onAction || (() => {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('starredMatches');
              window.location.reload();
            }
          })
        };
      
      case 'no-results':
        return {
          icon: (
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          ),
          title: 'No results found',
          message: customMessage || 'No matches match your current filters. Try adjusting your search criteria.',
          actionText: actionText || 'Clear Filters',
          action: onAction || (() => {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('selectedFilter');
              window.location.reload();
            }
          })
        };
      
      default:
        return {
          icon: null,
          title: 'No data available',
          message: 'No information is currently available.',
          actionText: null,
          action: null
        };
    }
  };

  const content = getContent();

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full text-center">
        {/* Icon with enhanced styling */}
        <div className="mb-8 flex justify-center">
          {content.icon}
        </div>
        
        {/* Title with better typography */}
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {content.title}
        </h3>
        
        {/* Message with improved spacing */}
        <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed text-lg">
          {content.message}
        </p>
        
        {/* Suggestions for no-matches type */}
        {type === 'no-matches' && content.suggestions && (
          <div className="mb-8">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wide">
              Try These Instead
            </h4>
            <div className="space-y-3">
              {content.suggestions.map((suggestion, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
                  onClick={() => {
                    // Handle suggestion clicks
                    if (suggestion.includes('Today')) {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('selectedDate', today.toISOString());
                        window.location.reload();
                      }
                    } else if (suggestion.includes('Tomorrow')) {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      tomorrow.setHours(0, 0, 0, 0);
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('selectedDate', tomorrow.toISOString());
                        window.location.reload();
                      }
                    } else if (suggestion.includes('Weekend')) {
                      // Find next weekend
                      const today = new Date();
                      const dayOfWeek = today.getDay();
                      const daysUntilSaturday = (6 - dayOfWeek) % 7;
                      const nextWeekend = new Date(today);
                      nextWeekend.setDate(today.getDate() + daysUntilSaturday);
                      nextWeekend.setHours(0, 0, 0, 0);
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('selectedDate', nextWeekend.toISOString());
                        window.location.reload();
                      }
                    } else if (suggestion.includes('Live')) {
                      // Switch to live tab
                      if (typeof window !== 'undefined') {
                        const event = new CustomEvent('switchTab', { detail: 'live' });
                        window.dispatchEvent(event);
                      }
                    }
                  }}
                >
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {suggestion}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Action button with enhanced styling */}
        {content.actionText && content.action && (
          <div className="space-y-4">
            <button 
              onClick={content.action}
              className="w-full px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 hover:scale-105 active:scale-95 font-semibold shadow-lg hover:shadow-xl transform"
            >
              {content.actionText}
            </button>
            
            {/* Additional helpful actions for no-matches */}
            {type === 'no-matches' && (
              <div className="flex space-x-3">
                <button 
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      const event = new CustomEvent('switchTab', { detail: 'today' });
                      window.dispatchEvent(event);
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 text-sm font-medium"
                >
                  Today
                </button>
                <button 
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      const event = new CustomEvent('switchTab', { detail: 'tomorrow' });
                      window.dispatchEvent(event);
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 text-sm font-medium"
                >
                  Tomorrow
                </button>
                <button 
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      const event = new CustomEvent('switchTab', { detail: 'weekend' });
                      window.dispatchEvent(event);
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 text-sm font-medium"
                >
                  Weekend
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Specific empty state components for common use cases
export const NoMatchesEmptyState: React.FC<{ onGoToToday?: () => void }> = ({ onGoToToday }) => (
  <EmptyState 
    type="no-matches" 
    onAction={onGoToToday}
    actionText="Go to Today"
  />
);

export const ErrorEmptyState: React.FC<{ onRefresh?: () => void }> = ({ onRefresh }) => (
  <EmptyState 
    type="error" 
    onAction={onRefresh}
    actionText="Refresh Page"
  />
);

export const LoadingEmptyState: React.FC<{ message?: string }> = ({ message }) => (
  <EmptyState 
    type="loading" 
    customMessage={message}
  />
);

export const NoFavoritesEmptyState: React.FC<{ onViewAll?: () => void }> = ({ onViewAll }) => (
  <EmptyState 
    type="no-favorites" 
    onAction={onViewAll}
    actionText="View All Matches"
  />
);

export const NoResultsEmptyState: React.FC<{ onClearFilters?: () => void }> = ({ onClearFilters }) => (
  <EmptyState 
    type="no-results" 
    onAction={onClearFilters}
    actionText="Clear Filters"
  />
);
