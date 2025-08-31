import { Metadata } from 'next';
import BetCalculator from '../../../components/BetCalculator';
import BetCalculatorLayout from '../../components/BetCalculatorLayout';
import { generateBetCalculatorStructuredData } from '../../../lib/structuredData';

export const metadata: Metadata = {
  title: 'Double Bet Calculator | Free Double Betting Calculator | Football Double Bet Calculator',
  description: 'Free double bet calculator for football betting. Calculate returns for double bets instantly. Two selections combined for higher odds.',
  keywords: 'double bet calculator, double betting calculator, football double bet calculator, free double bet calculator, double odds calculator',
  openGraph: {
    title: 'Double Bet Calculator | Free Double Betting Calculator',
    description: 'Calculate your double bet returns with our free calculator. Perfect for combining two football selections.',
    type: 'website',
  },
};

export default function DoubleBetCalculatorPage() {
  const structuredData = generateBetCalculatorStructuredData('Double');

  return (
    <BetCalculatorLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="container mx-auto px-4 py-2">

        {/* SEO-optimized header */}
        <div className="mb-2">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Double Bet Calculator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
            A double is when you bet on two football matches at once, combining them into one bet. Both results must be correct for you to win. The odds are multiplied together, so the potential payout is higher than singles, but the risk is greater since both predictions must succeed.
          </p>
        </div>

        {/* Bet Calculator Component - Pre-selected for Double */}
        <div className="mb-8">
          <BetCalculator defaultBetType="Double" />
        </div>


      </div>
    </BetCalculatorLayout>
  );
}
