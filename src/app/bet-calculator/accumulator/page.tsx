import { Metadata } from 'next';
import BetCalculator from '../../../components/BetCalculator';
import BetCalculatorLayout from '../../components/BetCalculatorLayout';

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
            <li className="text-gray-900 dark:text-white font-medium">Accumulator</li>
          </ol>
        </nav>

        {/* SEO-optimized header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Accumulator Calculator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Calculate your accumulator bet returns instantly. Combine multiple selections for potentially massive returns.
          </p>
        </div>

        {/* Bet Calculator Component - Pre-selected for Accumulator */}
        <div className="mb-8">
          <BetCalculator defaultBetType="Accumulator" />
        </div>

        {/* SEO Content Section */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Accumulator Calculator Guide
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* What is an Accumulator */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                What is an Accumulator?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                An accumulator combines multiple selections into one bet. ALL selections must win for you to collect. If any one loses, you lose your entire stake.
              </p>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Example:</h4>
                <p className="text-sm text-green-800 dark:text-green-200">
                  £5 on 5 teams all to win<br/>
                  <strong>Combined odds:</strong> 2.00 × 1.80 × 2.20 × 1.60 × 1.90 = 24.08<br/>
                  <strong>If all 5 win:</strong> You get £120.40 (stake × 24.08)<br/>
                  <strong>If any lose:</strong> You lose your £5 stake
                </p>
              </div>
            </div>

            {/* How to Calculate */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                How to Calculate Accumulator Bets
              </h3>
              <div className="space-y-3 text-gray-600 dark:text-gray-300">
                <div className="flex items-start">
                  <span className="text-blue-500 mr-2 font-bold">1.</span>
                  <span>Enter your stake amount</span>
                </div>
                <div className="flex items-start">
                  <span className="text-blue-500 mr-2 font-bold">2.</span>
                  <span>Add multiple selections with their odds</span>
                </div>
                <div className="flex items-start">
                  <span className="text-blue-500 mr-2 font-bold">3.</span>
                  <span>View your potential return instantly</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Formula:</strong> Return = Stake × (Odds1 × Odds2 × Odds3 × ...)
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
                <a href="/bet-calculator/double" className="block p-3 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <span className="font-medium text-gray-900 dark:text-white">Double Bet Calculator</span>
                  <span className="block text-sm text-gray-600 dark:text-gray-400">Two selections combined</span>
                </a>
                <a href="/bet-calculator/treble" className="block p-3 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <span className="font-medium text-gray-900 dark:text-white">Treble Bet Calculator</span>
                  <span className="block text-sm text-gray-600 dark:text-gray-400">Three selections combined</span>
                </a>
                <a href="/bet-calculator/lucky15" className="block p-3 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <span className="font-medium text-gray-900 dark:text-white">Lucky 15 Calculator</span>
                  <span className="block text-sm text-gray-600 dark:text-gray-400">15 bets on 4 selections</span>
                </a>
              </div>
            </div>
          </div>

          {/* Accumulator Risk Warning */}
          <div className="mt-8 p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-3">
              ⚠️ Accumulator Risk Warning
            </h3>
            <ul className="space-y-2 text-red-800 dark:text-red-200">
              <li className="flex items-start">
                <span className="text-red-600 mr-2">•</span>
                <span><strong>High Risk:</strong> If any one selection loses, you lose your entire stake</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-600 mr-2">•</span>
                <span><strong>No Insurance:</strong> Unlike Lucky bets, there's no partial payout</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-600 mr-2">•</span>
                <span><strong>High Reward:</strong> Potential for massive returns with small stakes</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-600 mr-2">•</span>
                <span><strong>Popular:</strong> Very popular for weekend football betting</span>
              </li>
            </ul>
          </div>

          {/* Accumulator Tips */}
          <div className="mt-8 p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-3">
              Accumulator Tips for Football
            </h3>
            <ul className="space-y-2 text-yellow-800 dark:text-yellow-200">
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                <span>Keep stakes small - the risk is very high</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                <span>Choose teams with strong home form and good odds</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                <span>Consider both teams to score markets for variety</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                <span>Perfect for weekend football when many matches are played</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                <span>Research all teams thoroughly - one bad pick loses everything</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </BetCalculatorLayout>
  );
}
