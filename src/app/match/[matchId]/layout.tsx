import React from 'react';

export default function MatchDetailLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-300 min-h-screen">
      {children}
    </div>
  );
} 