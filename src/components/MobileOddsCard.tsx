"use client";
import React from 'react';

interface MobileOddsCardProps {
  odds: {
    home_win_odds?: number;
    draw_odds?: number;
    away_win_odds?: number;
    home_win_affiliate_url?: string;
    draw_affiliate_url?: string;
    away_win_affiliate_url?: string;
  };
  marketType?: string;
}

export default function MobileOddsCard({ odds, marketType = "Full-time" }: MobileOddsCardProps) {
  // Always show the component, even if no odds data
  const hasOdds = odds && (odds.home_win_odds || odds.draw_odds || odds.away_win_odds);

  const handleOddsClick = (url: string | undefined) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="w-full px-4 mb-3 mt-4">
      <div 
        className="rounded-lg p-1.5 border"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          borderColor: 'rgba(71, 85, 105, 0.3)',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
          WebkitBoxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-start mb-1 pl-2">
          <span className="text-mobile-xs font-semibold text-slate-200">
            Best odds found for this match
          </span>
        </div>
        
        {/* Odds Display */}
        <div className="grid grid-cols-3 gap-1.5">
          {/* Home Win (1) */}
          <button
            onClick={() => handleOddsClick(odds?.home_win_affiliate_url)}
            className="group rounded-md p-1 text-center border transition-all duration-200 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
              borderColor: 'rgba(71, 85, 105, 0.3)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              WebkitBoxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            }}
            onTouchStart={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #475569 0%, #334155 100%)';
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #334155 0%, #1e293b 100%)';
            }}
          >
            <div className="text-[8px] text-slate-400 mb-0.5 font-medium">1</div>
            <div className="text-mobile-xs font-bold text-white flex items-center justify-center gap-0.5 group-hover:text-green-400 transition-colors">
              {hasOdds && odds?.home_win_odds ? odds.home_win_odds.toFixed(2) : 'N/A'}
              {hasOdds && odds?.home_win_odds && (
                <svg className="w-2 h-2 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </button>

          {/* Draw (X) */}
          <button
            onClick={() => handleOddsClick(odds?.draw_affiliate_url)}
            className="group rounded-md p-1 text-center border transition-all duration-200 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
              borderColor: 'rgba(59, 130, 246, 0.3)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              WebkitBoxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            }}
            onTouchStart={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)';
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)';
            }}
          >
            <div className="text-[8px] text-blue-300 mb-0.5 font-medium">X</div>
            <div className="text-mobile-xs font-bold text-white group-hover:text-blue-200 transition-colors">
              {hasOdds && odds?.draw_odds ? odds.draw_odds.toFixed(2) : 'N/A'}
            </div>
          </button>

          {/* Away Win (2) */}
          <button
            onClick={() => handleOddsClick(odds?.away_win_affiliate_url)}
            className="group rounded-md p-1 text-center border transition-all duration-200 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
              borderColor: 'rgba(71, 85, 105, 0.3)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              WebkitBoxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            }}
            onTouchStart={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #475569 0%, #334155 100%)';
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #334155 0%, #1e293b 100%)';
            }}
          >
            <div className="text-[8px] text-slate-400 mb-0.5 font-medium">2</div>
            <div className="text-mobile-xs font-bold text-white group-hover:text-green-400 transition-colors">
              {hasOdds && odds?.away_win_odds ? odds.away_win_odds.toFixed(2) : 'N/A'}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
