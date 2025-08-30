'use client';

import { useState, useEffect } from 'react';

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

type BetType = 'Single' | 'Double' | 'Treble' | 'Accumulator' | 'Patent' | 'Yankee' | 'Lucky 15' | 'Lucky 31' | 'Lucky 63';

interface BetCalculatorProps {
  defaultBetType?: BetType;
}

export default function BetCalculator({ defaultBetType = 'Single' }: BetCalculatorProps) {
  const [betType, setBetType] = useState<BetType>(defaultBetType);
  const [eachWay, setEachWay] = useState<'Yes' | 'No'>('No');
  const [numberOfSelections, setNumberOfSelections] = useState<number>(1);
  const [showRule4, setShowRule4] = useState<'Yes' | 'No'>('No');
  const [stakeType, setStakeType] = useState<'Stake Per Bet' | 'Total Stake'>('Stake Per Bet');
  const [stake, setStake] = useState<number>(10);
  const [selections, setSelections] = useState<BetSelection[]>([
    { id: '1', outcome: 'Winner', odds: 2 }
  ]);
  const [calculation, setCalculation] = useState<BetCalculation | null>(null);

  // Get required selections for each bet type
  const getRequiredSelections = (type: BetType): number => {
    switch (type) {
      case 'Single': return 1;
      case 'Double': return 2;
      case 'Treble': return 3;
      case 'Accumulator': return 4;
      case 'Patent': return 3;
      case 'Yankee': return 4;
      case 'Lucky 15': return 4;
      case 'Lucky 31': return 5;
      case 'Lucky 63': return 6;
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
      case 'Patent': return 7; // 3 singles + 3 doubles + 1 treble
      case 'Yankee': return 11; // 6 doubles + 4 trebles + 1 fourfold
      case 'Lucky 15': return 15; // 4 singles + 6 doubles + 4 trebles + 1 fourfold
      case 'Lucky 31': return 31; // 5 singles + 10 doubles + 10 trebles + 5 fourfolds + 1 fivefold
      case 'Lucky 63': return 63; // 6 singles + 15 doubles + 20 trebles + 15 fourfolds + 6 fivefolds + 1 sixfold
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

    // Navigate to specific bet type page if not on main calculator page
    const currentPath = window.location.pathname;
    if (currentPath !== '/bet-calculator') {
      const betTypePath = newBetType.toLowerCase().replace(' ', '');
      const targetPath = `/bet-calculator/${betTypePath}`;
      if (currentPath !== targetPath) {
        window.location.href = targetPath;
      }
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
    calculateBet();
  }, [selections, stake, betType, eachWay, stakeType]);

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

  const calculateBet = () => {
    if (selections.length === 0) {
      setCalculation(null);
      return;
    }

    let totalOutlay = 0;
    let totalReturn = 0;
    const numberOfBets = getNumberOfBets(betType);

    // Calculate based on bet type
    if (['Single', 'Double', 'Treble', 'Accumulator'].includes(betType)) {
      // Simple accumulator calculation
      const combinedOdds = selections.reduce((acc, selection) => acc * selection.odds, 1);
      totalOutlay = stake;
      totalReturn = stake * combinedOdds;
    } else {
      // Complex bet types (Patent, Yankee, Lucky bets)
      let totalReturnForAllBets = 0;
      
      if (betType === 'Patent') {
        // 3 singles + 3 doubles + 1 treble
        // Singles
        selections.forEach(selection => {
          totalReturnForAllBets += stake * selection.odds;
        });
        
        // Doubles
        const doubles = generateCombinations(selections, 2);
        doubles.forEach(double => {
          const combinedOdds = double.reduce((acc, selection) => acc * selection.odds, 1);
          totalReturnForAllBets += stake * combinedOdds;
        });
        
        // Treble
        const combinedOdds = selections.reduce((acc, selection) => acc * selection.odds, 1);
        totalReturnForAllBets += stake * combinedOdds;
      } else if (betType === 'Yankee') {
        // 6 doubles + 4 trebles + 1 fourfold
        // Doubles
        const doubles = generateCombinations(selections, 2);
        doubles.forEach(double => {
          const combinedOdds = double.reduce((acc, selection) => acc * selection.odds, 1);
          totalReturnForAllBets += stake * combinedOdds;
        });
        
        // Trebles
        const trebles = generateCombinations(selections, 3);
        trebles.forEach(treble => {
          const combinedOdds = treble.reduce((acc, selection) => acc * selection.odds, 1);
          totalReturnForAllBets += stake * combinedOdds;
        });
        
        // Fourfold
        const combinedOdds = selections.reduce((acc, selection) => acc * selection.odds, 1);
        totalReturnForAllBets += stake * combinedOdds;
      } else if (betType === 'Lucky 15') {
        // 4 singles + 6 doubles + 4 trebles + 1 fourfold
        // Singles
        selections.forEach(selection => {
          totalReturnForAllBets += stake * selection.odds;
        });
        
        // Doubles
        const doubles = generateCombinations(selections, 2);
        doubles.forEach(double => {
          const combinedOdds = double.reduce((acc, selection) => acc * selection.odds, 1);
          totalReturnForAllBets += stake * combinedOdds;
        });
        
        // Trebles
        const trebles = generateCombinations(selections, 3);
        trebles.forEach(treble => {
          const combinedOdds = treble.reduce((acc, selection) => acc * selection.odds, 1);
          totalReturnForAllBets += stake * combinedOdds;
        });
        
        // Fourfold
        const combinedOdds = selections.reduce((acc, selection) => acc * selection.odds, 1);
        totalReturnForAllBets += stake * combinedOdds;
      } else if (betType === 'Lucky 31') {
        // 5 singles + 10 doubles + 10 trebles + 5 fourfolds + 1 fivefold
        // Singles
        selections.forEach(selection => {
          totalReturnForAllBets += stake * selection.odds;
        });
        
        // Doubles
        const doubles = generateCombinations(selections, 2);
        doubles.forEach(double => {
          const combinedOdds = double.reduce((acc, selection) => acc * selection.odds, 1);
          totalReturnForAllBets += stake * combinedOdds;
        });
        
        // Trebles
        const trebles = generateCombinations(selections, 3);
        trebles.forEach(treble => {
          const combinedOdds = treble.reduce((acc, selection) => acc * selection.odds, 1);
          totalReturnForAllBets += stake * combinedOdds;
        });
        
        // Fourfolds
        const fourfolds = generateCombinations(selections, 4);
        fourfolds.forEach(fourfold => {
          const combinedOdds = fourfold.reduce((acc, selection) => acc * selection.odds, 1);
          totalReturnForAllBets += stake * combinedOdds;
        });
        
        // Fivefold
        const combinedOdds = selections.reduce((acc, selection) => acc * selection.odds, 1);
        totalReturnForAllBets += stake * combinedOdds;
      } else if (betType === 'Lucky 63') {
        // 6 singles + 15 doubles + 20 trebles + 15 fourfolds + 6 fivefolds + 1 sixfold
        // Singles
        selections.forEach(selection => {
          totalReturnForAllBets += stake * selection.odds;
        });
        
        // Doubles
        const doubles = generateCombinations(selections, 2);
        doubles.forEach(double => {
          const combinedOdds = double.reduce((acc, selection) => acc * selection.odds, 1);
          totalReturnForAllBets += stake * combinedOdds;
        });
        
        // Trebles
        const trebles = generateCombinations(selections, 3);
        trebles.forEach(treble => {
          const combinedOdds = treble.reduce((acc, selection) => acc * selection.odds, 1);
          totalReturnForAllBets += stake * combinedOdds;
        });
        
        // Fourfolds
        const fourfolds = generateCombinations(selections, 4);
        fourfolds.forEach(fourfold => {
          const combinedOdds = fourfold.reduce((acc, selection) => acc * selection.odds, 1);
          totalReturnForAllBets += stake * combinedOdds;
        });
        
        // Fivefolds
        const fivefolds = generateCombinations(selections, 5);
        fivefolds.forEach(fivefold => {
          const combinedOdds = fivefold.reduce((acc, selection) => acc * selection.odds, 1);
          totalReturnForAllBets += stake * combinedOdds;
        });
        
        // Sixfold
        const combinedOdds = selections.reduce((acc, selection) => acc * selection.odds, 1);
        totalReturnForAllBets += stake * combinedOdds;
      }
      
      totalOutlay = stake * numberOfBets;
      totalReturn = totalReturnForAllBets;
    }

    // Handle stake per bet vs total stake
    if (stakeType === 'Total Stake') {
      const stakePerBet = stake / numberOfBets;
      totalOutlay = stake;
      totalReturn = totalReturn * (stakePerBet / stake);
    }

    const totalProfit = totalReturn - totalOutlay;
    const combinedOdds = totalReturn / totalOutlay;

    setCalculation({
      totalOutlay,
      totalReturn,
      totalProfit,
      combinedOdds
    });
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
  const isSelectionCountValid = selections.length === getRequiredSelections(betType);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Football Bet Calculator</h1>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Single">✓ Single</option>
                      <option value="Double">Double</option>
                      <option value="Treble">Treble</option>
                      <option value="Accumulator">Accumulator</option>
                      <option value="Patent">Patent</option>
                      <option value="Yankee">Yankee</option>
                      <option value="Lucky 15">Lucky 15</option>
                      <option value="Lucky 31">Lucky 31</option>
                      <option value="Lucky 63">Lucky 63</option>
                    </select>
                  </div>
                  <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">?</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 min-w-[120px]">Each Way?:</label>
                  <div className="relative flex-1">
                    <select
                      value={eachWay}
                      onChange={(e) => setEachWay(e.target.value as 'Yes' | 'No')}
                      className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
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
                        className={`w-full px-3 py-2 border rounded bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          isSelectionCountValid ? 'border-gray-300' : 'border-red-300 bg-red-50'
                        }`}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">?</span>
                    </div>
                  </div>
                )}

                {needsNumberOfSelectionsInput(betType) && !isSelectionCountValid && (
                  <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-sm text-yellow-800">
                    ⚠️ {betType} requires exactly {getRequiredSelections(betType)} selections. 
                    {selections.length < getRequiredSelections(betType) 
                      ? ` Please add ${getRequiredSelections(betType) - selections.length} more selection(s).`
                      : ` Please remove ${selections.length - getRequiredSelections(betType)} selection(s).`
                    }
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 min-w-[120px]">Show Rule 4?:</label>
                  <div className="relative flex-1">
                    <select
                      value={showRule4}
                      onChange={(e) => setShowRule4(e.target.value as 'Yes' | 'No')}
                      className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                  <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">?</span>
                  </div>
                </div>
              </div>

              {/* Selections Table */}
              <div className="mb-6">
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
                          className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Winner"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          value={selection.odds}
                          onChange={(e) => updateSelection(selection.id, 'odds', Number(e.target.value))}
                          min="1.01"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Summary */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary (Updated Automatically)</h2>
              
              {/* Bet Type Info */}
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h3 className="font-semibold text-blue-900 mb-2">{betType} Bet</h3>
                <p className="text-sm text-blue-800">
                  {betType === 'Single' && 'One bet on one selection'}
                  {betType === 'Double' && 'One bet combining two selections - BOTH must win'}
                  {betType === 'Treble' && 'One bet combining three selections - ALL must win'}
                  {betType === 'Accumulator' && 'One bet combining multiple selections - ALL must win'}
                  {betType === 'Patent' && '7 bets on 3 selections (3 singles + 3 doubles + 1 treble)'}
                  {betType === 'Yankee' && '11 bets on 4 selections (6 doubles + 4 trebles + 1 fourfold)'}
                  {betType === 'Lucky 15' && '15 bets on 4 selections (4 singles + 6 doubles + 4 trebles + 1 fourfold)'}
                  {betType === 'Lucky 31' && '31 bets on 5 selections (5 singles + 10 doubles + 10 trebles + 5 fourfolds + 1 fivefold)'}
                  {betType === 'Lucky 63' && '63 bets on 6 selections (6 singles + 15 doubles + 20 trebles + 15 fourfolds + 6 fivefolds + 1 sixfold)'}
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Required selections: {getRequiredSelections(betType)} | Total bets: {getNumberOfBets(betType)}
                </p>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 min-w-[120px]">Stake Type:</label>
                  <div className="relative flex-1">
                    <select
                      value={stakeType}
                      onChange={(e) => setStakeType(e.target.value as 'Stake Per Bet' | 'Total Stake')}
                      className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Stake Per Bet">Stake Per Bet</option>
                      <option value="Total Stake">Total Stake</option>
                    </select>
                  </div>
                  <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">?</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 min-w-[120px]">Stake:</label>
                  <div className="relative flex-1">
                    <input
                      type="number"
                      value={stake}
                      onChange={(e) => setStake(Number(e.target.value))}
                      min="0.01"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">?</span>
                  </div>
                </div>
              </div>

              {/* Results */}
              {calculation && (needsNumberOfSelectionsInput(betType) ? isSelectionCountValid : true) && (
                <div className="space-y-3">
                  <div className="bg-gray-100 p-3 rounded">
                    <div className="text-sm font-medium text-gray-700 mb-1">Total Outlay</div>
                    <div className="text-lg font-semibold text-gray-900">
                      £{calculation.totalOutlay.toFixed(2)}
                      {stakeType === 'Stake Per Bet' && getNumberOfBets(betType) > 1 && (
                        <span className="text-sm text-gray-600 ml-2">
                          ({getNumberOfBets(betType)} bets of £{stake.toFixed(2)})
                        </span>
                      )}
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
              )}

              {needsNumberOfSelectionsInput(betType) && !isSelectionCountValid && (
                <div className="bg-red-50 border border-red-200 p-4 rounded text-sm text-red-800">
                  ⚠️ Please adjust the number of selections to match the {betType} requirements.
                </div>
              )}

              <div className="mt-6 text-sm text-blue-600">
                Get the bonus code for bet365.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-blue-600 text-white px-6 py-4 rounded-lg mt-4">
        <button className="w-full py-2 px-4 bg-blue-700 hover:bg-blue-800 rounded text-white font-medium transition-colors">
          Save / Share This Bet Slip
        </button>
      </div>

      {/* Explanations Section */}
      <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Football Betting Guide</h2>
        
        <div className="space-y-8">
          {/* Bet Types Section */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Popular Football Bet Types</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Single */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Single</h4>
                <p className="text-sm text-gray-600 mb-2">One bet on one selection</p>
                <p className="text-xs text-gray-500">
                  <strong>Example:</strong> £10 on Manchester United to win at 2.50 odds<br/>
                  <strong>If they win:</strong> You get £25 (stake × odds)<br/>
                  <strong>If they lose:</strong> You lose your £10 stake
                </p>
              </div>

              {/* Double */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Double</h4>
                <p className="text-sm text-gray-600 mb-2">One bet combining two selections - BOTH must win</p>
                <p className="text-xs text-gray-500">
                  <strong>Example:</strong> Man United (2.50) + Arsenal (1.80)<br/>
                  <strong>Combined odds:</strong> 2.50 × 1.80 = 4.50<br/>
                  <strong>If both win:</strong> You get £45 (stake × 4.50)<br/>
                  <strong>If either loses:</strong> You lose your stake
                </p>
              </div>

              {/* Treble */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Treble</h4>
                <p className="text-sm text-gray-600 mb-2">One bet combining three selections - ALL must win</p>
                <p className="text-xs text-gray-500">
                  <strong>Example:</strong> Man United (2.50) + Arsenal (1.80) + Liverpool (2.00)<br/>
                  <strong>Combined odds:</strong> 2.50 × 1.80 × 2.00 = 9.00<br/>
                  <strong>If all three win:</strong> You get £90 (stake × 9.00)<br/>
                  <strong>If any lose:</strong> You lose your stake
                </p>
              </div>

              {/* Accumulator */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Accumulator</h4>
                <p className="text-sm text-gray-600 mb-2">Multiple selections (4+) - ALL must win</p>
                <p className="text-xs text-gray-500">
                  <strong>Example:</strong> 5 teams all to win<br/>
                  <strong>Risk:</strong> Very high - if one team draws or loses, you lose everything<br/>
                  <strong>Reward:</strong> Very high potential returns<br/>
                  <strong>Popular:</strong> Weekend football accumulator bets
                </p>
              </div>

              {/* Patent */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Patent</h4>
                <p className="text-sm text-gray-600 mb-2">7 bets on 3 selections (3 singles + 3 doubles + 1 treble)</p>
                <p className="text-xs text-gray-500">
                  <strong>Insurance:</strong> You can still win even if not all selections win<br/>
                  <strong>If 1 team wins:</strong> You win on 1 single<br/>
                  <strong>If 2 teams win:</strong> You win on 2 singles + 1 double<br/>
                  <strong>If all 3 win:</strong> You win on all 7 bets
                </p>
              </div>

              {/* Yankee */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Yankee</h4>
                <p className="text-sm text-gray-600 mb-2">11 bets on 4 selections (6 doubles + 4 trebles + 1 fourfold)</p>
                <p className="text-xs text-gray-500">
                  <strong>If 2 teams win:</strong> You win on 1 double<br/>
                  <strong>If 3 teams win:</strong> You win on 3 doubles + 1 treble<br/>
                  <strong>If all 4 win:</strong> You win on all 11 bets
                </p>
              </div>

              {/* Lucky 15 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Lucky 15</h4>
                <p className="text-sm text-gray-600 mb-2">15 bets on 4 selections (4 singles + 6 doubles + 4 trebles + 1 fourfold)</p>
                <p className="text-xs text-gray-500">
                  <strong>Most popular:</strong> Very popular in football betting<br/>
                  <strong>Insurance:</strong> Great insurance - you can win even if only 1 team wins<br/>
                  <strong>Bonus:</strong> Many bookmakers offer bonuses if all 4 win<br/>
                  <strong>Example:</strong> 4 Premier League teams to win
                </p>
              </div>

              {/* Lucky 31 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Lucky 31</h4>
                <p className="text-sm text-gray-600 mb-2">31 bets on 5 selections (5 singles + 10 doubles + 10 trebles + 5 fourfolds + 1 fivefold)</p>
                <p className="text-xs text-gray-500">
                  <strong>More insurance:</strong> Even more coverage than Lucky 15<br/>
                  <strong>Higher stakes:</strong> More expensive but better chance of winning<br/>
                  <strong>Popular:</strong> For confident bettors who want maximum insurance
                </p>
              </div>

              {/* Lucky 63 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Lucky 63</h4>
                <p className="text-sm text-gray-600 mb-2">63 bets on 6 selections (6 singles + 15 doubles + 20 trebles + 15 fourfolds + 6 fivefolds + 1 sixfold)</p>
                <p className="text-xs text-gray-500">
                  <strong>Maximum insurance:</strong> Best chance of winning something<br/>
                  <strong>High stakes:</strong> Expensive but very safe<br/>
                  <strong>For experts:</strong> Best for experienced bettors with high confidence
                </p>
              </div>

            </div>
          </div>

          {/* Football Betting Tips */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Football Betting Tips</h3>
            <div className="bg-blue-50 p-4 rounded-lg">
              <ul className="space-y-2 text-sm text-gray-700">
                <li><strong>Start Simple:</strong> Begin with singles and doubles before trying complex bets</li>
                <li><strong>Accumulator Risk:</strong> Remember - one draw or loss means you lose everything in accumulators</li>
                <li><strong>Lucky Bets:</strong> Provide insurance - you can still win even if some selections lose</li>
                <li><strong>Weekend Football:</strong> Accumulators are very popular for Saturday/Sunday matches</li>
                <li><strong>Research:</strong> Always research teams, form, and head-to-head records</li>
                <li><strong>Bankroll Management:</strong> Never bet more than you can afford to lose</li>
                <li><strong>Odds Comparison:</strong> Shop around for the best odds from different bookmakers</li>
                <li><strong>Keep Records:</strong> Track your bets to understand your performance</li>
              </ul>
            </div>
          </div>

          {/* Common Football Betting Markets */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Common Football Betting Markets</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Match Result</h4>
                <p className="text-sm text-gray-600">Home Win, Draw, Away Win</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Both Teams to Score</h4>
                <p className="text-sm text-gray-600">Yes or No</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Over/Under Goals</h4>
                <p className="text-sm text-gray-600">Total goals in the match</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Correct Score</h4>
                <p className="text-sm text-gray-600">Exact final score</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">First Goalscorer</h4>
                <p className="text-sm text-gray-600">Who scores first</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Half Time/Full Time</h4>
                <p className="text-sm text-gray-600">Result at half time and full time</p>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">Important Disclaimer</h4>
            <p className="text-sm text-yellow-700">
              This calculator is for educational purposes only. Gambling can be addictive and may result in financial loss. 
              Please gamble responsibly and only bet what you can afford to lose. If you need help with gambling, 
              please contact gambling support services in your area.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
