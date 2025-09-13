import { Metadata } from 'next';
import Link from 'next/link';
import BetCalculator from '../../components/BetCalculator';
import BetCalculatorLayout from '../components/BetCalculatorLayout';
import { generateBetCalculatorStructuredData } from '../../lib/structuredData';

export const metadata: Metadata = {
  title: 'Free Bet Calculator | Football Betting Calculator | Odds Calculator',
  description: 'Free football betting calculator. Calculate returns for singles, doubles, trebles, and accumulators. Get accurate odds calculations for all bet types.',
  keywords: 'betting calculator, free bet calculator, odds calculator, football bet calculator, betting odds calculator, free betting calculator',
      openGraph: {
      title: 'Free Bet Calculator | Football Betting Calculator',
      description: 'Calculate your football betting returns with our free bet calculator. Supports singles, doubles, trebles, and accumulators.',
      type: 'website',
    },
};

export default function BetCalculatorPage() {
  const structuredData = generateBetCalculatorStructuredData('General');

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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Free Bet Calculator - Football Betting Calculator & Odds Calculator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Use our free betting calculator to calculate your football betting returns instantly. 
            Our odds calculator supports all popular bet types including singles, doubles, trebles, and accumulators.
          </p>
        </div>

        {/* Bet Calculator Component */}
        <div className="mb-8">
          <BetCalculator />
        </div>
      </div>
    </BetCalculatorLayout>
  );
}
