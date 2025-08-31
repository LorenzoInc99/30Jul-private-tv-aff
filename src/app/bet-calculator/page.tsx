import { Metadata } from 'next';
import BetCalculator from '../../components/BetCalculator';
import BetCalculatorLayout from '../components/BetCalculatorLayout';

export const metadata: Metadata = {
  title: 'Free Bet Calculator | Football Betting Calculator | Odds Calculator',
  description: 'Free football betting calculator. Calculate returns for singles, doubles, trebles, accumulators, and more. Get accurate odds calculations for all bet types.',
  keywords: 'betting calculator, free bet calculator, odds calculator, football bet calculator, betting odds calculator, free betting calculator',
  openGraph: {
    title: 'Free Bet Calculator | Football Betting Calculator',
    description: 'Calculate your football betting returns with our free bet calculator. Supports singles, doubles, trebles, accumulators, and more.',
    type: 'website',
  },
};

export default function BetCalculatorPage() {
  return (
    <BetCalculatorLayout>
      <div className="container mx-auto px-4 py-2">

        {/* SEO-optimized header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Free Bet Calculator - Football Betting Calculator & Odds Calculator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Use our free betting calculator to calculate your football betting returns instantly. 
            Our odds calculator supports all popular bet types including singles, doubles, trebles, accumulators, and more.
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
