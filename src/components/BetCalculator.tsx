'use client';

import { useState, useEffect } from 'react';
import { useBetCalculation } from './hooks/useBetCalculation';

interface BetSelection {
  id: string;
  outcome: string;
  odds: number;
}

interface BetCalculation {
  totalOutlay: number;
  totalReturn: number;
  totalProfit: number;
  combinedOdds: number;
}

type BetType = 'Single' | 'Double' | 'Treble' | 'Accumulator';

interface BetCalculatorProps {
  defaultBetType?: BetType;
}

export default function BetCalculator({ defaultBetType = 'Single' }: BetCalculatorProps) {
  const [betType, setBetType] = useState<BetType>(defaultBetType);

  const [numberOfSelections, setNumberOfSelections] = useState<number>(defaultBetType === 'Double' ? 2 : defaultBetType === 'Treble' ? 3 : defaultBetType === 'Accumulator' ? 4 : 1);


  const [stake, setStake] = useState<number>(10);
  
  // Initialize selections based on defaultBetType
  const getInitialSelections = () => {
    const requiredSelections = defaultBetType === 'Double' ? 2 : defaultBetType === 'Treble' ? 3 : defaultBetType === 'Accumulator' ? 4 : 1;
    const selections: BetSelection[] = [];
    for (let i = 1; i <= requiredSelections; i++) {
      selections.push({ id: i.toString(), outcome: 'Winner', odds: 2 });
    }
    return selections;
  };
  
  const [selections, setSelections] = useState<BetSelection[]>(getInitialSelections());
  // Use the custom hook for calculations
  const calculation = useBetCalculation(selections, stake);

  // Get required selections for each bet type
  const getRequiredSelections = (type: BetType): number => {
    switch (type) {
      case 'Single': return 1;
      case 'Double': return 2;
      case 'Treble': return 3;
      case 'Accumulator': return 4;
      default: return 1;
    }
  };

  // Get number of bets for each bet type
  const getNumberOfBets = (type: BetType): number => {
    switch (type) {
      case 'Single': return 1;
      case 'Double': return 1;
      case 'Treble': return 1;
      case 'Accumulator': return 1;
      default: return 1;
    }
  };

  // Check if bet type needs number of selections input
  const needsNumberOfSelectionsInput = (type: BetType): boolean => {
    // Only Accumulator needs user input for number of selections
    // All other bet types have fixed requirements
    return type === 'Accumulator';
  };

  // Update bet type and automatically adjust selections
  const updateBetType = (newBetType: BetType) => {
    setBetType(newBetType);
    const requiredSelections = getRequiredSelections(newBetType);
    setNumberOfSelections(requiredSelections);
    
    // Update selections array
    const newSelections: BetSelection[] = [];
    for (let i = 1; i <= requiredSelections; i++) {
      const existing = selections.find(s => s.id === i.toString());
      newSelections.push({
        id: i.toString(),
        outcome: existing?.outcome || 'Winner',
        odds: existing?.odds || 2
      });
    }
    setSelections(newSelections);

    // Navigate to specific bet type page
    const currentPath = window.location.pathname;
      const betTypePath = newBetType.toLowerCase().replace(' ', '');
      const targetPath = `/bet-calculator/${betTypePath}`;
    
    // Navigate if we're on main calculator page or if we're on a different sub-page
    if (currentPath === '/bet-calculator' || (currentPath !== targetPath && currentPath.startsWith('/bet-calculator/'))) {
        window.location.href = targetPath;
    }
  };

  // Initialize bet type based on defaultBetType prop
  useEffect(() => {
    if (defaultBetType !== betType) {
      updateBetType(defaultBetType);
    }
  }, [defaultBetType]);

  // Calculate bet when any input changes
  useEffect(() => {
    // The calculation is now handled by the custom hook
  }, [selections, stake, betType]);

  // Generate all possible combinations of selections
  const generateCombinations = (arr: BetSelection[], size: number): BetSelection[][] => {
    if (size === 1) return arr.map(item => [item]);
    if (size === arr.length) return [arr];
    
    const combinations: BetSelection[][] = [];
    
    for (let i = 0; i <= arr.length - size; i++) {
      const head = arr[i];
      const tailCombinations = generateCombinations(arr.slice(i + 1), size - 1);
      tailCombinations.forEach(combination => {
        combinations.push([head, ...combination]);
      });
    }
    
    return combinations;
  };

  const updateSelection = (id: string, field: keyof BetSelection, value: string | number) => {
    setSelections(selections.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  const updateNumberOfSelections = (count: number) => {
    setNumberOfSelections(count);
    
    // Update selections array
    const newSelections: BetSelection[] = [];
    for (let i = 1; i <= count; i++) {
      const existing = selections.find(s => s.id === i.toString());
      newSelections.push({
        id: i.toString(),
        outcome: existing?.outcome || 'Winner',
        odds: existing?.odds || 2
      });
    }
    setSelections(newSelections);
  };

  // Check if current selections match bet type requirements
  const isSelectionCountValid = betType === 'Accumulator' 
    ? selections.length >= 4 && selections.length <= 12 && selections.length === numberOfSelections
    : selections.length === getRequiredSelections(betType);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">{betType} Bet Calculator</h1>
          <button className="flex items-center gap-2 px-3 py-1 bg-blue-700 hover:bg-blue-800 rounded text-sm transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white border border-gray-200 rounded-b-lg">
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Bet Configuration */}
            <div>
              {/* Bet Configuration */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 min-w-[120px]">Bet Type:</label>
                  <div className="relative flex-1">
                    <select
                      value={betType}
                      onChange={(e) => updateBetType(e.target.value as BetType)}
                      className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 text-sm focus:outline-none focus:ring-0 focus:border-0"
                    >
                      <option value="Single">Single</option>
                      <option value="Double">Double</option>
                      <option value="Treble">Treble</option>
                      <option value="Accumulator">Accumulator</option>
                    </select>
                  </div>
                  <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">?</span>
                  </div>
                </div>



                {needsNumberOfSelectionsInput(betType) && (
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700 min-w-[120px]">Number of Selections:</label>
                    <div className="relative flex-1">
                      <select
                        value={numberOfSelections}
                        onChange={(e) => updateNumberOfSelections(Number(e.target.value))}
                        className={`w-full px-3 py-2 border rounded bg-white text-gray-900 text-sm focus:outline-none focus:ring-0 focus:border-0 ${
                          isSelectionCountValid ? 'border-gray-300' : 'border-red-300 bg-red-50'
                        }`}
                      >
                        {betType === 'Accumulator' 
                          ? [4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                              <option key={num} value={num}>{num}</option>
                            ))
                          : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(num => (
                          <option key={num} value={num}>{num}</option>
                            ))
                        }
                      </select>
                    </div>
                    <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">?</span>
                    </div>
                  </div>
                )}

                {needsNumberOfSelectionsInput(betType) && !isSelectionCountValid && (
                  <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-sm text-yellow-800">
                    {betType === 'Accumulator' 
                      ? `⚠️ Accumulator requires between 4-12 selections. You have ${selections.length} selections but selected ${numberOfSelections}. Please adjust the number of selections to match.`
                      : `⚠️ ${betType} requires exactly ${getRequiredSelections(betType)} selections. 
                        ${selections.length < getRequiredSelections(betType) 
                      ? ` Please add ${getRequiredSelections(betType) - selections.length} more selection(s).`
                      : ` Please remove ${selections.length - getRequiredSelections(betType)} selection(s).`
                        }`
                    }
                  </div>
                )}


              </div>

              {/* Selections Table */}
              <div className="mb-2">
                <div className="grid grid-cols-3 gap-4 mb-2">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-gray-700">#</span>
                    <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">?</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-gray-700">Outcome</span>
                    <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">?</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-gray-700">Odds</span>
                    <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">?</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {selections.map((selection) => (
                    <div key={selection.id} className="grid grid-cols-3 gap-4">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-900">{selection.id}</span>
                      </div>
                      <div>
                        <input
                          type="text"
                          value={selection.outcome}
                          onChange={(e) => updateSelection(selection.id, 'outcome', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 text-sm focus:outline-none focus:ring-0 focus:border-0"
                          placeholder="Winner"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          value={selection.odds === 0 ? '' : selection.odds}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '') {
                              updateSelection(selection.id, 'odds', 0);
                            } else {
                              const numValue = parseFloat(value);
                              if (!isNaN(numValue)) {
                                updateSelection(selection.id, 'odds', numValue);
                              }
                            }
                          }}
                          step="0.01"
                          min="0"
                          onBlur={(e) => {
                            // No automatic correction, just validation
                            const value = parseFloat(e.target.value);
                            if (value > 0 && value < 1.01) {
                              // Keep the value but it will be highlighted in red
                              updateSelection(selection.id, 'odds', value);
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-0 focus:border-0 ${
                            selection.odds > 0 && (selection.odds < 1.01 || selection.odds > 500)
                              ? 'border-red-300 bg-red-50 text-red-900 focus:outline-none focus:ring-0 focus:border-0' 
                              : 'border-gray-300 bg-white text-gray-900'
                          }`}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Warning for odds outside valid range */}
              {selections.some(s => s.odds > 0 && (s.odds < 1.01 || s.odds > 500)) && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                  ⚠️ Odds must be between 1.01 and 500 for valid betting calculations. Values outside this range are highlighted in red.
                </div>
              )}
            </div>

            {/* Right Column - Summary */}
            <div>
              <div className="space-y-4 mb-6">


                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 min-w-[120px]">Stake:</label>
                  <div className="relative flex-1">
                    <input
                      type="number"
                      value={stake}
                      onChange={(e) => setStake(Number(e.target.value))}
                      min="0.01"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 text-sm focus:outline-none focus:ring-0 focus:border-0"
                    />
                  </div>
                  <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">?</span>
                  </div>
                </div>
              </div>


            </div>
          </div>
        </div>



        {/* Results Section - Bottom */}
              {calculation && (needsNumberOfSelectionsInput(betType) ? isSelectionCountValid : true) && (
          <div className="pt-0 pb-4">
            <div className="grid grid-cols-3 gap-3 mx-4">
                  <div className="bg-gray-100 p-3 rounded">
                    <div className="text-sm font-medium text-gray-700 mb-1">Total Outlay</div>
                    <div className="text-lg font-semibold text-gray-900">
                      £{calculation.totalOutlay.toFixed(2)}
                    </div>
                  </div>

                  <div className="bg-gray-100 p-3 rounded">
                    <div className="text-sm font-medium text-gray-700 mb-1">Total Return</div>
                    <div className="text-lg font-semibold text-gray-900">
                      £{calculation.totalReturn.toFixed(2)}
                    </div>
                  </div>

                  <div className="bg-gray-100 p-3 rounded">
                    <div className="text-sm font-medium text-gray-700 mb-1">Total Profit</div>
                    <div className={`text-lg font-semibold ${
                      calculation.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      £{calculation.totalProfit.toFixed(2)}
                </div>
                    </div>
                  </div>
                </div>
              )}

              {needsNumberOfSelectionsInput(betType) && !isSelectionCountValid && (
          <div className="pt-3">
                <div className="bg-red-50 border border-red-200 p-4 rounded text-sm text-red-800">
                  ⚠️ Please adjust the number of selections to match the {betType} requirements.
            </div>
          </div>
        )}

        
      </div>

      {/* Footer */}
      <div className="bg-blue-600 text-white px-6 py-4 rounded-lg mt-4">
        <button className="w-full py-2 px-4 bg-blue-700 hover:bg-blue-800 rounded text-white font-medium transition-colors">
          Save / Share This Bet Slip
        </button>
      </div>

              {/* Bet Types Guide */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Football Betting Guide</h2>
          
          {/* Bet Types Guide */}
          <div className="space-y-6">
            {/* Single Bet */}
            <div className={`border-2 rounded-xl shadow-sm transition-all duration-200 ${
              betType === 'Single' 
                ? 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-blue-50 shadow-md' 
                : 'border-gray-200 bg-white'
            }`}>
              <div className="px-6 py-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      betType === 'Single' ? 'bg-indigo-500' : 'bg-gray-300'
                    }`}></div>
                    <span className="text-lg font-semibold text-gray-900">Single Bet</span>
                    {betType === 'Single' && (
                      <span className="ml-3 text-xs bg-indigo-600 text-white px-3 py-1 rounded-full font-medium">
                        Active
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => window.location.href = '/bet-calculator/single'}
                    className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    Try This
                  </button>
                </div>
                <p className="text-gray-700 mb-4 leading-relaxed">The simplest and most straightforward bet type. You bet on one selection and if it wins, you get your stake multiplied by the odds.</p>
                <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Example Calculation
                  </h4>
                  <p className="text-sm text-gray-600 mb-3 font-medium">£10 on Manchester United to win at 2.50 odds</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center py-2 px-3 bg-green-50 rounded">
                      <span className="text-gray-700">If they win:</span>
                      <span className="font-semibold text-green-700">£25 (stake × odds)</span>
                    </div>
                    <div className="flex justify-between items-center py-2 px-3 bg-red-50 rounded">
                      <span className="text-gray-700">If they lose:</span>
                      <span className="font-semibold text-red-700">-£10 (lose stake)</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
                    Low Risk
                  </span>
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-1.5"></span>
                    Beginner Friendly
                  </span>
                </div>
              </div>
              </div>

                      {/* Double Bet */}
            <div className={`border-2 rounded-xl shadow-sm transition-all duration-200 ${
              betType === 'Double' 
                ? 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-blue-50 shadow-md' 
                : 'border-gray-200 bg-white'
            }`}>
              <div className="px-6 py-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      betType === 'Double' ? 'bg-indigo-500' : 'bg-gray-300'
                    }`}></div>
                    <span className="text-lg font-semibold text-gray-900">Double Bet</span>
                    {betType === 'Double' && (
                      <span className="ml-3 text-xs bg-indigo-600 text-white px-3 py-1 rounded-full font-medium">
                        Active
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => window.location.href = '/bet-calculator/double'}
                    className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    Try This
                  </button>
                </div>
                <p className="text-gray-700 mb-4 leading-relaxed">Two selections combined into one bet. BOTH selections must win for you to collect. The odds are multiplied together for potentially higher returns.</p>
                <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Example Calculation
                  </h4>
                  <p className="text-sm text-gray-600 mb-3 font-medium">Man United (2.50) + Arsenal (1.80)</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center py-2 px-3 bg-blue-50 rounded">
                      <span className="text-gray-700">Combined odds:</span>
                      <span className="font-semibold text-blue-700">2.50 × 1.80 = 4.50</span>
                    </div>
                    <div className="flex justify-between items-center py-2 px-3 bg-green-50 rounded">
                      <span className="text-gray-700">If both win:</span>
                      <span className="font-semibold text-green-700">£45 (stake × 4.50)</span>
                    </div>
                    <div className="flex justify-between items-center py-2 px-3 bg-red-50 rounded">
                      <span className="text-gray-700">If either loses:</span>
                      <span className="font-semibold text-red-700">-£10 (lose stake)</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1.5"></span>
                    Medium Risk
                  </span>
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-1.5"></span>
                    Popular Choice
                  </span>
                </div>
              </div>
              </div>

                      {/* Treble Bet */}
            <div className={`border-2 rounded-xl shadow-sm transition-all duration-200 ${
              betType === 'Treble' 
                ? 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-blue-50 shadow-md' 
                : 'border-gray-200 bg-white'
            }`}>
              <div className="px-6 py-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      betType === 'Treble' ? 'bg-indigo-500' : 'bg-gray-300'
                    }`}></div>
                    <span className="text-lg font-semibold text-gray-900">Treble Bet</span>
                    {betType === 'Treble' && (
                      <span className="ml-3 text-xs bg-indigo-600 text-white px-3 py-1 rounded-full font-medium">
                        Active
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => window.location.href = '/bet-calculator/treble'}
                    className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    Try This
                  </button>
                </div>
                <p className="text-gray-700 mb-4 leading-relaxed">Three selections combined into one bet. ALL THREE selections must win for you to collect. Higher risk but much higher potential returns.</p>
                <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Example Calculation
                  </h4>
                  <p className="text-sm text-gray-600 mb-3 font-medium">Man United (2.50) + Arsenal (1.80) + Liverpool (2.00)</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center py-2 px-3 bg-blue-50 rounded">
                      <span className="text-gray-700">Combined odds:</span>
                      <span className="font-semibold text-blue-700">2.50 × 1.80 × 2.00 = 9.00</span>
                    </div>
                    <div className="flex justify-between items-center py-2 px-3 bg-green-50 rounded">
                      <span className="text-gray-700">If all three win:</span>
                      <span className="font-semibold text-green-700">£90 (stake × 9.00)</span>
                    </div>
                    <div className="flex justify-between items-center py-2 px-3 bg-red-50 rounded">
                      <span className="text-gray-700">If any lose:</span>
                      <span className="font-semibold text-red-700">-£10 (lose stake)</span>
              </div>
              </div>
              </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-1.5"></span>
                    High Risk
                  </span>
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-1.5"></span>
                    High Reward
                  </span>
              </div>
              </div>
            </div>

            {/* Accumulator Bet */}
            <div className={`border-2 rounded-xl shadow-sm transition-all duration-200 ${
              betType === 'Accumulator' 
                ? 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-blue-50 shadow-md' 
                : 'border-gray-200 bg-white'
            }`}>
              <div className="px-6 py-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      betType === 'Accumulator' ? 'bg-indigo-500' : 'bg-gray-300'
                    }`}></div>
                    <span className="text-lg font-semibold text-gray-900">Accumulator Bet</span>
                    {betType === 'Accumulator' && (
                      <span className="ml-3 text-xs bg-indigo-600 text-white px-3 py-1 rounded-full font-medium">
                        Active
                      </span>
                    )}
          </div>
                  <button
                    onClick={() => window.location.href = '/bet-calculator/accumulator'}
                    className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    Try This
                  </button>
            </div>
                <p className="text-gray-700 mb-4 leading-relaxed">Multiple selections (4 or more) combined into one bet. ALL selections must win for you to collect. Very high risk but potentially massive returns.</p>
                <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Example Calculation
                  </h4>
                  <p className="text-sm text-gray-600 mb-3 font-medium">5 teams all to win at 2.00 odds each</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center py-2 px-3 bg-blue-50 rounded">
                      <span className="text-gray-700">Combined odds:</span>
                      <span className="font-semibold text-blue-700">2.00 × 2.00 × 2.00 × 2.00 × 2.00 = 32.00</span>
          </div>
                    <div className="flex justify-between items-center py-2 px-3 bg-green-50 rounded">
                      <span className="text-gray-700">If all 5 win:</span>
                      <span className="font-semibold text-green-700">£160 (stake × 32.00)</span>
              </div>
                    <div className="flex justify-between items-center py-2 px-3 bg-red-50 rounded">
                      <span className="text-gray-700">If any lose:</span>
                      <span className="font-semibold text-red-700">-£10 (lose stake)</span>
              </div>
              </div>
              </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-1.5"></span>
                    Very High Risk
                  </span>
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-1.5"></span>
                    Massive Potential
                  </span>
              </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
