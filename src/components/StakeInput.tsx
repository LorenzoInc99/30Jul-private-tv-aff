'use client';

interface StakeInputProps {
  stake: number;
  onStakeChange: (stake: number) => void;
}

export default function StakeInput({ stake, onStakeChange }: StakeInputProps) {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700 min-w-[120px]">Stake:</label>
        <div className="relative flex-1">
          <input
            type="number"
            value={stake}
            onChange={(e) => onStakeChange(Number(e.target.value))}
            min="0.01"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Bet stake amount"
          />
        </div>
        <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">?</span>
        </div>
      </div>
    </div>
  );
}
