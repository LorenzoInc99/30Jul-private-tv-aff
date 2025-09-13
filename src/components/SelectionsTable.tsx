'use client';

import { BetSelection } from './hooks/useBetCalculation';

interface SelectionsTableProps {
  selections: BetSelection[];
  onSelectionUpdate: (id: string, field: keyof BetSelection, value: string | number) => void;
}

export default function SelectionsTable({ selections, onSelectionUpdate }: SelectionsTableProps) {
  const isValidOdds = (odds: number): boolean => {
    return odds > 0 && odds >= 1.01 && odds <= 500;
  };

  return (
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
                onChange={(e) => onSelectionUpdate(selection.id, 'outcome', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Winner"
                aria-label={`Outcome for selection ${selection.id}`}
              />
            </div>
            <div>
              <input
                type="number"
                value={selection.odds === 0 ? '' : selection.odds}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    onSelectionUpdate(selection.id, 'odds', 0);
                  } else {
                    const numValue = parseFloat(value);
                    if (!isNaN(numValue)) {
                      onSelectionUpdate(selection.id, 'odds', numValue);
                    }
                  }
                }}
                step="0.01"
                min="0"
                onBlur={(e) => {
                  const value = parseFloat(e.target.value);
                  if (value > 0 && value < 1.01) {
                    onSelectionUpdate(selection.id, 'odds', value);
                  }
                }}
                className={`w-full px-3 py-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  selection.odds > 0 && !isValidOdds(selection.odds)
                    ? 'border-red-300 bg-red-50 text-red-900 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
                placeholder="0"
                aria-label={`Odds for selection ${selection.id}`}
                aria-invalid={selection.odds > 0 && !isValidOdds(selection.odds)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Warning for odds outside valid range */}
      {selections.some(s => s.odds > 0 && !isValidOdds(s.odds)) && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
          ⚠️ Odds must be between 1.01 and 500 for valid betting calculations. Values outside this range are highlighted in red.
        </div>
      )}
    </div>
  );
}
