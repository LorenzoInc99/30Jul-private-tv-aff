import { Metadata } from 'next';
import Link from 'next/link';
import BetCalculator from '../../../components/BetCalculator';
import BetCalculatorLayout from '../../components/BetCalculatorLayout';
import { generateBetCalculatorStructuredData } from '../../../lib/structuredData';

export const metadata: Metadata = {
  title: 'Single Bet Calculator | Free Single Betting Calculator | Football Single Bet Calculator',
  description: 'Free single bet calculator for football betting. Calculate returns for single bets instantly. Perfect for beginners and experienced bettors.',
  keywords: 'single bet calculator, single betting calculator, football single bet calculator, free single bet calculator, single odds calculator',
  openGraph: {
    title: 'Single Bet Calculator | Free Single Betting Calculator',
    description: 'Calculate your single bet returns with our free calculator. Perfect for football betting beginners.',
    type: 'website',
  },
};

export default function SingleBetCalculatorPage() {
  const structuredData = generateBetCalculatorStructuredData('Single');

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
            Single Bet Calculator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
            A single bet is the simplest form of betting. You pick one football match and predict the outcome, such as which team will win. If your prediction is correct, you win. If not, you lose your stake. Singles are easy to understand and very popular with beginners.
          </p>
        </div>

        {/* Bet Calculator Component - Pre-selected for Single */}
        <div className="mb-8">
          <BetCalculator defaultBetType="Single" />
        </div>


      </div>
    </BetCalculatorLayout>
  );
}
