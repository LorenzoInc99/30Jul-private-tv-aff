import { Metadata } from 'next';
import BetCalculator from '../../../components/BetCalculator';
import BetCalculatorLayout from '../../components/BetCalculatorLayout';
import { generateBetCalculatorStructuredData } from '../../../lib/structuredData';

export const metadata: Metadata = {
  title: 'Treble Bet Calculator | Free Treble Betting Calculator | Football Treble Bet Calculator',
  description: 'Free treble bet calculator for football betting. Calculate returns for treble bets instantly. Three selections combined for higher odds.',
  keywords: 'treble bet calculator, treble betting calculator, football treble bet calculator, free treble bet calculator, treble odds calculator',
  openGraph: {
    title: 'Treble Bet Calculator | Free Treble Betting Calculator',
    description: 'Calculate your treble bet returns with our free calculator. Perfect for combining three football selections.',
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

        {/* SEO-optimized header */}
        <div className="mb-2">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Treble Bet Calculator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
            A treble is a bet on three football matches combined into one. Just like a double, the odds are multiplied, but now all three results must be correct to win. The payout can be much bigger, but the risk is also higher since one wrong result means the whole bet loses.
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
