import { Metadata } from 'next';
import Link from 'next/link';
import BetCalculator from '../../../components/BetCalculator';
import BetCalculatorLayout from '../../components/BetCalculatorLayout';
import { generateBetCalculatorStructuredData } from '../../../lib/structuredData';

export const metadata: Metadata = {
  title: 'Treble Bet Calculator | Free Treble Betting Calculator | Football Treble Bet Calculator',
  description: 'Free treble bet calculator for football betting. Calculate returns for treble bets instantly. Combine three selections for higher returns.',
  keywords: 'treble bet calculator, treble betting calculator, football treble bet calculator, free treble bet calculator, treble odds calculator',
  openGraph: {
    title: 'Treble Bet Calculator | Free Treble Betting Calculator',
    description: 'Calculate your treble bet returns with our free calculator. Combine three selections for higher potential returns.',
    type: 'website',
  },
};

export default function TrebleBetCalculatorPage() {
  const structuredData = generateBetCalculatorStructuredData('Treble');

  return (
    <BetCalculatorLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="container mx-auto px-4 py-2">

        {/* Back to Scores Button */}
        <div className="mb-6">
          <Link 
            href="/"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Scores & Fixtures
          </Link>
        </div>

        {/* SEO-optimized header */}
        <div className="mb-2">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Treble Bet Calculator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
            A treble is when you bet on three football matches at once, combining them into one bet. All three results must be correct for you to win. The odds are multiplied together, offering higher potential returns than doubles, but with increased risk since all three predictions must succeed.
          </p>
        </div>

        {/* Bet Calculator Component - Pre-selected for Treble */}
        <div className="mb-8">
          <BetCalculator defaultBetType="Treble" />
        </div>


      </div>
    </BetCalculatorLayout>
  );
}
