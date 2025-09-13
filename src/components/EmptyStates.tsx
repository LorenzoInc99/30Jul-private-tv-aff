import React from 'react';

interface EmptyStateProps {
  type: 'no-matches' | 'error' | 'loading' | 'no-favorites' | 'no-results';
  onAction?: () => void;
  actionText?: string;
  customMessage?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  type, 
  onAction, 
  actionText, 
  customMessage 
}) => {
  const getContent = () => {
    switch (type) {
      case 'no-matches':
        return {
          icon: (
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          title: 'No matches found',
          message: customMessage || 'No football matches are scheduled for this date. Try selecting a different date or check back later.',
          actionText: actionText || 'Go to Today',
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
    <div className="text-center py-12 px-4">
      <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
        {content.icon}
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
        {content.title}
      </h3>
      
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto leading-relaxed">
        {content.message}
      </p>
      
      {content.actionText && content.action && (
        <button 
          onClick={content.action}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 hover:scale-105 active:scale-95 font-medium shadow-lg hover:shadow-xl"
        >
          {content.actionText}
        </button>
      )}
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
