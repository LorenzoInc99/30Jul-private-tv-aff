'use client';

import { BetCalculation } from './hooks/useBetCalculation';

interface CalculationResultsProps {
  calculation: BetCalculation | null;
  needsNumberOfSelectionsInput: boolean;
  isSelectionCountValid: boolean;
}

export default function CalculationResults({ 
  calculation, 
  needsNumberOfSelectionsInput, 
  isSelectionCountValid
}: CalculationResultsProps) {
  if (!calculation || (needsNumberOfSelectionsInput && !isSelectionCountValid)) {
    return null;
  }

  return (
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
  );
}
