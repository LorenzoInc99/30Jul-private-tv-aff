"use client";
import Link from 'next/link';
import { SITE_TITLE } from '../../lib/constants';
import CountryFlag from '../../components/CountryFlag';

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD') // Normalize unicode characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics (accents, umlauts, etc.)
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

function CompetitionsStructuredData({ competitions }: { competitions: any[] }) {
  if (!competitions.length) return null;
  
  const itemListElements = competitions.map((competition, idx) => ({
    '@type': 'ListItem',
    position: idx + 1,
    item: {
      '@type': 'SportsLeague',
      name: competition.name,
      url: `/competition/${competition.id}-${slugify(competition.name)}`,
      sport: 'Football'
    }
  }));

  const schema = {
    '@context': 'http://schema.org',
    '@type': 'CollectionPage',
    name: 'All Football Competitions',
    description: 'Complete list of football competitions, leagues, and tournaments',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: itemListElements,
      numberOfItems: itemListElements.length
    }
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export default function CompetitionsListClient({ competitions }: { competitions: any[] }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
      <CompetitionsStructuredData competitions={competitions} />
      <div className="container mx-auto p-4 md:p-8 max-w-7xl flex-grow">
        <header className="flex justify-between items-center mb-6">
          <Link href="/" className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight no-underline hover:text-indigo-600 dark:hover:text-indigo-400">
            {SITE_TITLE}
          </Link>
          <nav className="flex items-center space-x-6">
            <Link 
              href="/competitions" 
              className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
            >
              All Competitions
            </Link>
            <Link 
              href="/teams" 
              className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
            >
              All Competitions
            </Link>
          </nav>
        </header>
        
        <main className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              All Football Competitions
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Browse all competitions, leagues, and tournaments
            </p>
          </div>

          {competitions.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              No competitions found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {competitions.map((competition) => {
                const matchCount = competition.Events?.[0]?.count || 0;
                return (
                  <Link
                    key={competition.id}
                    href={`/competition/${competition.id}-${slugify(competition.name)}`}
                    className="group block bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                  >
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        {competition.country && (
                          <CountryFlag 
                            imagePath={competition.country.image_path} 
                            countryName={competition.country.name} 
                            size="sm" 
                          />
                        )}
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {competition.name}
                        </h2>
                      </div>
                      <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        <span className="text-sm">
                          {matchCount} {matchCount === 1 ? 'match' : 'matches'}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
} 