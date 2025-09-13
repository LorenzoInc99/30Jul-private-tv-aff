'use client';

import { BetType } from './hooks/useBetCalculation';

interface BettingGuideProps {
  currentBetType: BetType;
}

export default function BettingGuide({ currentBetType }: BettingGuideProps) {
  const betTypes = [
    {
      type: 'Single' as BetType,
      name: 'Single Bet',
      description: 'The simplest and most straightforward bet type. You bet on one selection and if it wins, you get your stake multiplied by the odds.',
      example: '£10 on Manchester United to win at 2.50 odds',
      calculation: 'If they win: £25 (stake × odds)',
      risk: 'Low Risk',
      difficulty: 'Beginner Friendly',
      color: 'green'
    },
    {
      type: 'Double' as BetType,
      name: 'Double Bet',
      description: 'Two selections combined into one bet. BOTH selections must win for you to collect. The odds are multiplied together for potentially higher returns.',
      example: 'Man United (2.50) + Arsenal (1.80)',
      calculation: 'Combined odds: 2.50 × 1.80 = 4.50',
      risk: 'Medium Risk',
      difficulty: 'Popular Choice',
      color: 'yellow'
    },
    {
      type: 'Treble' as BetType,
      name: 'Treble Bet',
      description: 'Three selections combined into one bet. ALL THREE selections must win for you to collect. Higher risk but much higher potential returns.',
      example: 'Man United (2.50) + Arsenal (1.80) + Liverpool (2.00)',
      calculation: 'Combined odds: 2.50 × 1.80 × 2.00 = 9.00',
      risk: 'High Risk',
      difficulty: 'High Reward',
      color: 'orange'
    },
    {
      type: 'Accumulator' as BetType,
      name: 'Accumulator Bet',
      description: 'Multiple selections (4 or more) combined into one bet. ALL selections must win for you to collect. Very high risk but potentially massive returns.',
      example: '5 teams all to win at 2.00 odds each',
      calculation: 'Combined odds: 2.00 × 2.00 × 2.00 × 2.00 × 2.00 = 32.00',
      risk: 'Very High Risk',
      difficulty: 'Massive Potential',
      color: 'red'
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green': return 'bg-green-100 text-green-800 border-green-200';
      case 'yellow': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'orange': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'red': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getColorDot = (color: string) => {
    switch (color) {
      case 'green': return 'bg-green-500';
      case 'yellow': return 'bg-yellow-500';
      case 'orange': return 'bg-orange-500';
      case 'red': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Football Betting Guide</h2>
      
      <div className="space-y-6">
        {betTypes.map((betType) => (
          <div 
            key={betType.type}
            className={`border-2 rounded-xl shadow-sm transition-all duration-200 ${
              currentBetType === betType.type 
                ? 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-blue-50 shadow-md' 
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="px-6 py-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    currentBetType === betType.type ? 'bg-indigo-500' : 'bg-gray-300'
                  }`}></div>
                  <span className="text-lg font-semibold text-gray-900">{betType.name}</span>
                  {currentBetType === betType.type && (
                    <span className="ml-3 text-xs bg-indigo-600 text-white px-3 py-1 rounded-full font-medium">
                      Active
                    </span>
                  )}
                </div>
                <button
                  onClick={() => window.location.href = `/bet-calculator/${betType.type.toLowerCase()}`}
                  className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  Try This
                </button>
              </div>
              
              <p className="text-gray-700 mb-4 leading-relaxed">{betType.description}</p>
              
              <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Example Calculation
                </h4>
                <p className="text-sm text-gray-600 mb-3 font-medium">{betType.example}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center py-2 px-3 bg-blue-50 rounded">
                    <span className="text-gray-700">Combined odds:</span>
                    <span className="font-semibold text-blue-700">{betType.calculation}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex flex-wrap gap-2">
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${getColorClasses(betType.color)}`}>
                  <span className={`w-2 h-2 rounded-full mr-1.5 ${getColorDot(betType.color)}`}></span>
                  {betType.risk}
                </span>
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-1.5"></span>
                  {betType.difficulty}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
