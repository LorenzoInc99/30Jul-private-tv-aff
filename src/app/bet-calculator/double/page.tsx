import { Metadata } from 'next';
import BetCalculator from '../../../components/BetCalculator';
import BetCalculatorLayout from '../../components/BetCalculatorLayout';

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
  return (
    <BetCalculatorLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <li><a href="/" className="hover:text-blue-600 dark:hover:text-blue-400">Home</a></li>
            <li>/</li>
            <li><a href="/bet-calculator" className="hover:text-blue-600 dark:hover:text-blue-400">Bet Calculator</a></li>
            <li>/</li>
            <li className="text-gray-900 dark:text-white font-medium">Double Bet</li>
          </ol>
        </nav>

        {/* SEO-optimized header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Double Bet Calculator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Calculate your double bet returns instantly. Combine two selections for higher potential returns.
          </p>
        </div>

        {/* Bet Calculator Component - Pre-selected for Double */}
        <div className="mb-8">
          <BetCalculator defaultBetType="Double" />
        </div>

        {/* SEO Content Section */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Double Bet Calculator Guide
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* What is a Double Bet */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                What is a Double Bet?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                A double bet combines two selections into one bet. BOTH selections must win for you to collect. If either loses, you lose your stake.
              </p>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Example:</h4>
                <p className="text-sm text-green-800 dark:text-green-200">
                  £10 on Man United (2.50) + Arsenal (1.80)<br/>
                  <strong>Combined odds:</strong> 2.50 × 1.80 = 4.50<br/>
                  <strong>If both win:</strong> You get £45 (stake × 4.50)<br/>
                  <strong>If either loses:</strong> You lose your £10 stake
                </p>
              </div>
            </div>

            {/* How to Calculate */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                How to Calculate Double Bets
              </h3>
              <div className="space-y-3 text-gray-600 dark:text-gray-300">
                <div className="flex items-start">
                  <span className="text-blue-500 mr-2 font-bold">1.</span>
                  <span>Enter your stake amount</span>
                </div>
                <div className="flex items-start">
                  <span className="text-blue-500 mr-2 font-bold">2.</span>
                  <span>Add two selections with their odds</span>
                </div>
                <div className="flex items-start">
                  <span className="text-blue-500 mr-2 font-bold">3.</span>
                  <span>View your potential return instantly</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Formula:</strong> Return = Stake × (Odds1 × Odds2)
                </p>
              </div>
            </div>

            {/* Related Calculators */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Related Calculators
              </h3>
              <div className="space-y-2">
                <a href="/bet-calculator/single" className="block p-3 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <span className="font-medium text-gray-900 dark:text-white">Single Bet Calculator</span>
                  <span className="block text-sm text-gray-600 dark:text-gray-400">One selection</span>
                </a>
                <a href="/bet-calculator/treble" className="block p-3 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <span className="font-medium text-gray-900 dark:text-white">Treble Bet Calculator</span>
                  <span className="block text-sm text-gray-600 dark:text-gray-400">Three selections combined</span>
                </a>
                <a href="/bet-calculator/accumulator" className="block p-3 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <span className="font-medium text-gray-900 dark:text-white">Accumulator Calculator</span>
                  <span className="block text-sm text-gray-600 dark:text-gray-400">Multiple selections</span>
                </a>
                <a href="/bet-calculator/lucky15" className="block p-3 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <span className="font-medium text-gray-900 dark:text-white">Lucky 15 Calculator</span>
                  <span className="block text-sm text-gray-600 dark:text-gray-400">15 bets on 4 selections</span>
                </a>
              </div>
            </div>
          </div>

          {/* Double Bet Tips */}
          <div className="mt-8 p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-3">
              Double Bet Tips for Football
            </h3>
            <ul className="space-y-2 text-yellow-800 dark:text-yellow-200">
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                <span>Choose selections with good form and favorable matchups</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                <span>Consider teams playing at home - they have better win rates</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                <span>Look for value in odds - avoid heavily favored teams</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                <span>Research head-to-head records and recent form</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                <span>Consider both teams to score markets for higher odds</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </BetCalculatorLayout>
  );
}
