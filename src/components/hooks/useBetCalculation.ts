import { useMemo } from 'react';

export interface BetSelection {
  id: string;
  outcome: string;
  odds: number;
}

export interface BetCalculation {
  totalOutlay: number;
  totalReturn: number;
  totalProfit: number;
  combinedOdds: number;
}

export type BetType = 'Single' | 'Double' | 'Treble' | 'Accumulator';

export const useBetCalculation = (selections: BetSelection[], stake: number) => {
  const calculation = useMemo(() => {
    if (selections.length === 0) {
      return null;
    }

    // Calculate based on bet type - all are simple accumulator calculations
    const calculatedOdds = selections.reduce((acc, selection) => acc * selection.odds, 1);
    const totalOutlay = stake;
    const totalReturn = stake * calculatedOdds;
    const totalProfit = totalReturn - totalOutlay;
    const combinedOdds = totalReturn / totalOutlay;

    return {
      totalOutlay,
      totalReturn,
      totalProfit,
      combinedOdds
    };
  }, [selections, stake]);

  return calculation;
};

export const getRequiredSelections = (type: BetType): number => {
  switch (type) {
    case 'Single': return 1;
    case 'Double': return 2;
    case 'Treble': return 3;
    case 'Accumulator': return 4;
    default: return 1;
  }
};

export const needsNumberOfSelectionsInput = (type: BetType): boolean => {
  // Only Accumulator needs user input for number of selections
  return type === 'Accumulator';
};
