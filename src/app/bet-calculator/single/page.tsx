import { Metadata } from 'next';
import BetCalculator from '../../../components/BetCalculator';
import BetCalculatorLayout from '../../components/BetCalculatorLayout';

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
            <li className="text-gray-900 dark:text-white font-medium">Single Bet</li>
          </ol>
        </nav>

        {/* SEO-optimized header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Single Bet Calculator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Calculate your single bet returns instantly. Perfect for beginners and the most popular bet type in football betting.
          </p>
        </div>

        {/* Bet Calculator Component - Pre-selected for Single */}
        <div className="mb-8">
          <BetCalculator defaultBetType="Single" />
        </div>

        {/* SEO Content Section */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Single Bet Calculator Guide
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* What is a Single Bet */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                What is a Single Bet?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                A single bet is the simplest form of betting - one bet on one selection. If your selection wins, you win. If it loses, you lose your stake.
              </p>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Example:</h4>
                <p className="text-sm text-green-800 dark:text-green-200">
                  £10 on Manchester United to win at 2.50 odds<br/>
                  <strong>If they win:</strong> You get £25 (stake × odds)<br/>
                  <strong>If they lose:</strong> You lose your £10 stake
                </p>
              </div>
            </div>

            {/* How to Calculate */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                How to Calculate Single Bets
              </h3>
              <div className="space-y-3 text-gray-600 dark:text-gray-300">
                <div className="flex items-start">
                  <span className="text-blue-500 mr-2 font-bold">1.</span>
                  <span>Enter your stake amount</span>
                </div>
                <div className="flex items-start">
                  <span className="text-blue-500 mr-2 font-bold">2.</span>
                  <span>Add your selection with the odds</span>
                </div>
                <div className="flex items-start">
                  <span className="text-blue-500 mr-2 font-bold">3.</span>
                  <span>View your potential return instantly</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Formula:</strong> Return = Stake × Odds
                </p>
              </div>
            </div>

            {/* Related Calculators */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Related Calculators
              </h3>
              <div className="space-y-2">
                <a href="/bet-calculator/double" className="block p-3 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <span className="font-medium text-gray-900 dark:text-white">Double Bet Calculator</span>
                  <span className="block text-sm text-gray-600 dark:text-gray-400">Two selections combined</span>
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

          {/* Single Bet Tips */}
          <div className="mt-8 p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-3">
              Single Bet Tips for Football
            </h3>
            <ul className="space-y-2 text-yellow-800 dark:text-yellow-200">
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                <span>Start with single bets if you're new to betting</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                <span>Research team form, head-to-head records, and injuries</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                <span>Look for value odds - don't just bet on favorites</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                <span>Set a budget and stick to it</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                <span>Consider both teams to score and over/under markets</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </BetCalculatorLayout>
  );
}
