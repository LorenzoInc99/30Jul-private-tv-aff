"use client";
import { getBestOddsFromTransformed } from '@/lib/database-adapter';

interface MatchOddsDisplayProps {
  odds: any[];
  matchStatus: string;
}

export default function MatchOddsDisplay({ odds, matchStatus }: MatchOddsDisplayProps) {
  // Don't show odds for finished matches
  if (matchStatus === 'Finished' || matchStatus === 'Full Time' || matchStatus === 'After Extra Time' || matchStatus === 'After Penalties') {
    return null;
  }

  if (!odds || odds.length === 0) {
    return (
      <div className="flex gap-1 justify-center">
        <div className="flex flex-col items-center justify-center text-center w-full px-2 py-1.5 rounded-md border border-gray-100 dark:border-gray-800 bg-gray-200 dark:bg-gray-900 min-w-[58px] min-h-[36px]">
          <span className="font-bold text-xs text-gray-400 dark:text-gray-500">-</span>
          <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight w-full">N/A</span>
        </div>
        <div className="flex flex-col items-center justify-center text-center w-full px-2 py-1.5 rounded-md border border-gray-100 dark:border-gray-800 bg-gray-200 dark:bg-gray-900 min-w-[58px] min-h-[36px]">
          <span className="font-bold text-xs text-gray-400 dark:text-gray-500">-</span>
          <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight w-full">N/A</span>
        </div>
        <div className="flex flex-col items-center justify-center text-center w-full px-2 py-1.5 rounded-md border border-gray-100 dark:border-gray-800 bg-gray-200 dark:bg-gray-900 min-w-[58px] min-h-[36px]">
          <span className="font-bold text-xs text-gray-400 dark:text-gray-500">-</span>
          <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight w-full">N/A</span>
        </div>
      </div>
    );
  }

  const bestOdds = getBestOddsFromTransformed(odds);
  const oddsTypes = [
    { key: 'home', label: '1', data: bestOdds.home },
    { key: 'draw', label: 'X', data: bestOdds.draw },
    { key: 'away', label: '2', data: bestOdds.away }
  ];

  return (
    <div className="flex gap-1 justify-center">
      {oddsTypes.map(({ key, label, data }) => {
        return data.value !== null ? (
          <a
            key={key}
            href={data.operator?.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center text-center w-full px-2 py-1.5 rounded-md border border-gray-100 dark:border-gray-800 bg-gray-200 dark:bg-gray-900 hover:bg-gray-300 dark:hover:bg-gray-800 hover:scale-105 hover:drop-shadow-sm transition-all duration-100 ease-in-out min-w-[58px] min-h-[36px]"
            aria-label={`Best odds for ${label} by ${data.operator?.name || 'Unknown'}`}
          >
            <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400">{parseFloat(data.value as any).toFixed(2)}</span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight text-ellipsis overflow-hidden whitespace-nowrap w-full">{data.operator?.name || 'Unknown'}</span>
          </a>
        ) : (
          <div key={key} className="flex flex-col items-center justify-center text-center w-full px-2 py-1.5 rounded-md border border-gray-100 dark:border-gray-800 bg-gray-200 dark:bg-gray-900 min-w-[58px] min-h-[36px]" aria-label="No odds available">
            <span className="font-bold text-xs text-gray-400 dark:text-gray-500">-</span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight w-full">N/A</span>
          </div>
        );
      })}
    </div>
  );
}
