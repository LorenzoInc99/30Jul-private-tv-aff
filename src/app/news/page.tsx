import React from 'react';

export default function NewsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Football News
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Stay updated with the latest football news and updates
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Placeholder news cards */}
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-gray-500 dark:text-gray-400">News Image</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Football News Article {item}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                This is a placeholder for football news content. The news section will be populated with real football news and updates.
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>2 hours ago</span>
                <span>Read More →</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              News Section Coming Soon
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We're working on bringing you the latest football news, transfer updates, and match analysis.
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
              Get Notified
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
