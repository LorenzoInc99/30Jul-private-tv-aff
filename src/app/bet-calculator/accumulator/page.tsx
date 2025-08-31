import { Metadata } from 'next';
import BetCalculator from '../../../components/BetCalculator';
import BetCalculatorLayout from '../../components/BetCalculatorLayout';
import { generateBetCalculatorStructuredData } from '../../../lib/structuredData';

export const metadata: Metadata = {
  title: 'Accumulator Calculator | Free Accumulator Betting Calculator | Football Accumulator Bet Calculator',
  description: 'Free accumulator bet calculator for football betting. Calculate returns for accumulator bets instantly. Multiple selections combined for high odds.',
  keywords: 'accumulator calculator, accumulator betting calculator, football accumulator calculator, free accumulator calculator, accumulator odds calculator',
  openGraph: {
    title: 'Accumulator Calculator | Free Accumulator Betting Calculator',
    description: 'Calculate your accumulator bet returns with our free calculator. Perfect for combining multiple football selections.',
    type: 'website',
  },
};

export default function AccumulatorCalculatorPage() {
  const structuredData = generateBetCalculatorStructuredData('Accumulator');

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
            Accumulator Calculator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
            An accumulator, often called an "acca," is a bet with four or more football matches linked together. All selections must win for the bet to pay out. Accas are popular because small stakes can return big winnings, but they are risky since just one wrong prediction makes the entire bet lose.
          </p>
        </div>

        {/* Bet Calculator Component - Pre-selected for Accumulator */}
        <div className="mb-8">
          <BetCalculator defaultBetType="Accumulator" />
        </div>
      </div>
    </BetCalculatorLayout>
  );
}
