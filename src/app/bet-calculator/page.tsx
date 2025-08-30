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
      <div className="container mx-auto px-4 py-8">
        {/* SEO-optimized header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Free Bet Calculator - Football Betting Calculator & Odds Calculator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Use our free betting calculator to calculate your football betting returns instantly. 
            Our odds calculator supports all popular bet types including singles, doubles, trebles, accumulators, and more.
          </p>
        </div>

        {/* Comprehensive SEO Content Section */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            What is a Betting Calculator?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            A betting calculator, also known as an odds calculator or bet calculator, is an essential tool for any football bettor. 
            It helps you calculate potential returns, profits, and odds for different types of bets before placing them. 
            Our free bet calculator takes the guesswork out of betting calculations and ensures you always know exactly what you could win.
          </p>
          
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            How Does a Bet Calculator Work?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Our betting calculator works by taking your stake amount and the odds for each selection, then calculating the potential return. 
            For simple bets like singles, it multiplies your stake by the odds. For complex bets like accumulators, it combines multiple odds 
            to give you the total potential return. The odds calculator also shows your potential profit (return minus stake) and the combined odds.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Key Features of Our Bet Calculator:</h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Free to use - no registration required</li>
                <li>• Supports all popular bet types</li>
                <li>• Instant calculations</li>
                <li>• Mobile-friendly design</li>
                <li>• Accurate odds calculations</li>
                <li>• Perfect for football betting</li>
              </ul>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Why Use Our Odds Calculator?</h4>
              <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                <li>• Compare different bet types easily</li>
                <li>• Calculate potential returns before betting</li>
                <li>• Understand betting odds better</li>
                <li>• Make informed betting decisions</li>
                <li>• Save time on manual calculations</li>
                <li>• Avoid calculation errors</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bet Calculator Component */}
        <BetCalculator />

        {/* SEO Content Section */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Football Betting Calculator Guide - Understanding Different Bet Types
          </h2>
          
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Popular Bet Types Explained
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Our betting calculator supports all the most popular bet types used in football betting. 
              Understanding how each bet type works is crucial for making informed betting decisions. 
              Here's how each bet type functions and when to use them:
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Single Bet</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  The simplest bet type - you bet on one selection. If it wins, you get your stake multiplied by the odds.
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <strong>Example:</strong> £10 on Manchester United to win at 2.00 odds = £20 return
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Double Bet</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  Two selections combined. Both must win for you to collect. Odds are multiplied together.
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <strong>Example:</strong> £10 on 2 teams at 2.00 each = £40 return (if both win)
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Treble Bet</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  Three selections combined. All three must win for you to collect. Higher risk, higher potential returns.
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <strong>Example:</strong> £10 on 3 teams at 2.00 each = £80 return (if all win)
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Accumulator</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  Multiple selections (4 or more) combined. All must win for you to collect. Very high risk but massive potential returns.
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <strong>Example:</strong> £5 on 5 teams at 2.00 each = £160 return (if all win)
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Lucky 15</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  A combination bet with 4 selections: 4 singles, 6 doubles, 4 trebles, and 1 fourfold accumulator.
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <strong>Example:</strong> £1 stake = 15 bets total. You can win even if some selections lose.
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Patent</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  A combination bet with 3 selections: 3 singles, 3 doubles, and 1 treble.
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <strong>Example:</strong> £1 stake = 7 bets total. Good for covering multiple outcomes.
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Popular Bet Types
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="font-medium text-gray-900 dark:text-white">Single Bet</span>
                  <a href="/bet-calculator/single" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
                    Calculate →
                  </a>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="font-medium text-gray-900 dark:text-white">Double Bet</span>
                  <a href="/bet-calculator/double" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
                    Calculate →
                  </a>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="font-medium text-gray-900 dark:text-white">Treble Bet</span>
                  <a href="/bet-calculator/treble" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
                    Calculate →
                  </a>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="font-medium text-gray-900 dark:text-white">Accumulator</span>
                  <a href="/bet-calculator/accumulator" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
                    Calculate →
                  </a>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="font-medium text-gray-900 dark:text-white">Lucky 15</span>
                  <a href="/bet-calculator/lucky15" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
                    Calculate →
                  </a>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Why Use Our Bet Calculator?
              </h3>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Instant calculations for all bet types</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Accurate odds calculations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Free to use, no registration required</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Mobile-friendly design</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Perfect for football betting</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
              How to Use Our Betting Calculator
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-800 dark:text-blue-200">
              <li><strong>Choose Your Bet Type:</strong> Select from single, double, treble, accumulator, or combination bets</li>
              <li><strong>Enter Your Stake:</strong> Input the amount you want to bet (per bet or total stake)</li>
              <li><strong>Add Your Selections:</strong> Enter each team/outcome and their odds</li>
              <li><strong>View Results Instantly:</strong> See your potential returns, profit, and combined odds</li>
              <li><strong>Compare Options:</strong> Try different stake amounts and bet types to find the best value</li>
            </ol>
          </div>
          
          <div className="mt-6 p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-3">
              Betting Calculator Tips for Football
            </h3>
            <ul className="space-y-2 text-green-800 dark:text-green-200">
              <li><strong>Start Small:</strong> Use our odds calculator to test different bet types before placing real money</li>
              <li><strong>Understand Risk:</strong> Higher odds mean higher potential returns but also higher risk</li>
              <li><strong>Compare Bookmakers:</strong> Use our betting calculator to compare odds from different bookmakers</li>
              <li><strong>Bankroll Management:</strong> Calculate your potential losses before placing bets</li>
              <li><strong>Value Betting:</strong> Look for bets where the calculated probability is better than the bookmaker's odds</li>
            </ul>
          </div>
        </div>
      </div>
    </BetCalculatorLayout>
  );
}
