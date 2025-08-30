import { Metadata } from 'next';
import BetCalculator from '../../../components/BetCalculator';
import BetCalculatorLayout from '../../components/BetCalculatorLayout';

export const metadata: Metadata = {
  title: 'Lucky 15 Calculator | Free Lucky 15 Betting Calculator | Football Lucky 15 Bet Calculator',
  description: 'Free Lucky 15 bet calculator for football betting. Calculate returns for Lucky 15 bets instantly. 15 bets on 4 selections with insurance.',
  keywords: 'lucky 15 calculator, lucky 15 betting calculator, football lucky 15 calculator, free lucky 15 calculator, lucky 15 odds calculator',
  openGraph: {
    title: 'Lucky 15 Calculator | Free Lucky 15 Betting Calculator',
    description: 'Calculate your Lucky 15 bet returns with our free calculator. Perfect for football betting with insurance.',
    type: 'website',
  },
};

export default function Lucky15CalculatorPage() {
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
            <li className="text-gray-900 dark:text-white font-medium">Lucky 15</li>
          </ol>
        </nav>

        {/* SEO-optimized header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Lucky 15 Calculator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Calculate your Lucky 15 bet returns instantly. 15 bets on 4 selections with great insurance - you can win even if only 1 selection wins.
          </p>
        </div>

        {/* Bet Calculator Component - Pre-selected for Lucky 15 */}
        <div className="mb-8">
          <BetCalculator defaultBetType="Lucky 15" />
        </div>

        {/* SEO Content Section */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Lucky 15 Calculator Guide
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* What is a Lucky 15 */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                What is a Lucky 15?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                A Lucky 15 is 15 bets on 4 selections: 4 singles, 6 doubles, 4 trebles, and 1 fourfold. It provides excellent insurance - you can win even if only 1 selection wins.
              </p>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Example:</h4>
                <p className="text-sm text-green-800 dark:text-green-200">
                  £1 stake per bet = £15 total stake<br/>
                  <strong>If 1 team wins:</strong> You win on 1 single<br/>
                  <strong>If 2 teams win:</strong> You win on 2 singles + 1 double<br/>
                  <strong>If 3 teams win:</strong> You win on 3 singles + 3 doubles + 1 treble<br/>
                  <strong>If all 4 win:</strong> You win on all 15 bets + potential bonus
                </p>
              </div>
            </div>

            {/* How to Calculate */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                How to Calculate Lucky 15 Bets
              </h3>
              <div className="space-y-3 text-gray-600 dark:text-gray-300">
                <div className="flex items-start">
                  <span className="text-blue-500 mr-2 font-bold">1.</span>
                  <span>Enter your stake amount (this is per bet)</span>
                </div>
                <div className="flex items-start">
                  <span className="text-blue-500 mr-2 font-bold">2.</span>
                  <span>Add exactly 4 selections with their odds</span>
                </div>
                <div className="flex items-start">
                  <span className="text-blue-500 mr-2 font-bold">3.</span>
                  <span>View your potential returns for all scenarios</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Total Stake:</strong> Stake per bet × 15<br/>
                  <strong>Insurance:</strong> You can win even with just 1 winner
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
                <a href="/bet-calculator/lucky31" className="block p-3 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <span className="font-medium text-gray-900 dark:text-white">Lucky 31 Calculator</span>
                  <span className="block text-sm text-gray-600 dark:text-gray-400">31 bets on 5 selections</span>
                </a>
              </div>
            </div>
          </div>

          {/* Lucky 15 Breakdown */}
          <div className="mt-8 p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-3">
              Lucky 15 Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-800 dark:text-purple-200">
              <div>
                <h4 className="font-semibold mb-2">Bet Types:</h4>
                <ul className="space-y-1">
                  <li>• 4 Single bets (one on each selection)</li>
                  <li>• 6 Double bets (all possible pairs)</li>
                  <li>• 4 Treble bets (all possible triples)</li>
                  <li>• 1 Fourfold bet (all 4 selections)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Winning Scenarios:</h4>
                <ul className="space-y-1">
                  <li>• 1 winner: Win on 1 single</li>
                  <li>• 2 winners: Win on 2 singles + 1 double</li>
                  <li>• 3 winners: Win on 3 singles + 3 doubles + 1 treble</li>
                  <li>• 4 winners: Win on all 15 bets + potential bonus</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Lucky 15 Tips */}
          <div className="mt-8 p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-3">
              Lucky 15 Tips for Football
            </h3>
            <ul className="space-y-2 text-yellow-800 dark:text-yellow-200">
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                <span>Choose 4 teams with good form and reasonable odds (1.50-3.00)</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                <span>Consider Premier League teams playing at home</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                <span>Look for teams with good head-to-head records</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                <span>Many bookmakers offer bonuses if all 4 selections win</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                <span>Perfect for weekend football when many matches are played</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </BetCalculatorLayout>
  );
}
