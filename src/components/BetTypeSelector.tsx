'use client';

import { BetType, getRequiredSelections } from './hooks/useBetCalculation';

interface BetTypeSelectorProps {
  betType: BetType;
  onBetTypeChange: (newBetType: BetType) => void;
  numberOfSelections: number;
  onNumberOfSelectionsChange: (count: number) => void;
  needsNumberOfSelectionsInput: boolean;
  isSelectionCountValid: boolean;
}

export default function BetTypeSelector({
  betType,
  onBetTypeChange,
  numberOfSelections,
  onNumberOfSelectionsChange,
  needsNumberOfSelectionsInput,
  isSelectionCountValid
}: BetTypeSelectorProps) {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700 min-w-[120px]">Bet Type:</label>
        <div className="relative flex-1">
          <select
            value={betType}
            onChange={(e) => onBetTypeChange(e.target.value as BetType)}
            className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

      {needsNumberOfSelectionsInput && (
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 min-w-[120px]">Number of Selections:</label>
          <div className="relative flex-1">
            <select
              value={numberOfSelections}
              onChange={(e) => onNumberOfSelectionsChange(Number(e.target.value))}
              className={`w-full px-3 py-2 border rounded bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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

      {needsNumberOfSelectionsInput && !isSelectionCountValid && (
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-sm text-yellow-800">
          {betType === 'Accumulator' 
            ? `⚠️ Accumulator requires between 4-12 selections. You have ${numberOfSelections} selections but selected ${numberOfSelections}. Please adjust the number of selections to match.`
            : `⚠️ ${betType} requires exactly ${getRequiredSelections(betType)} selections. 
              ${numberOfSelections < getRequiredSelections(betType) 
            ? ` Please add ${getRequiredSelections(betType) - numberOfSelections} more selection(s).`
            : ` Please remove ${numberOfSelections - getRequiredSelections(betType)} selection(s).`
              }`
          }
        </div>
      )}
    </div>
  );
}
