"use client";
import React from 'react';
import Image from 'next/image';

interface MobileTvCardProps {
  broadcaster: {
    id: number;
    name: string;
    logo_url?: string;
    affiliate_url?: string;
    isFree?: boolean;
    isPopular?: boolean;
    isPaid?: boolean;
    isHd?: boolean;
  };
  clickCount?: number;
  onBroadcasterClick: (broadcasterId: number, matchId: string) => void;
  matchId: string;
}

export default function MobileTvCard({ 
  broadcaster, 
  clickCount = 0, 
  onBroadcasterClick, 
  matchId 
}: MobileTvCardProps) {
  
  const handleClick = () => {
    onBroadcasterClick(broadcaster.id, matchId);
    if (broadcaster.affiliate_url) {
      window.open(broadcaster.affiliate_url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div 
      className="w-52 h-64 sm:w-56 sm:h-72 rounded-xl p-3 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        borderColor: 'rgba(71, 85, 105, 0.4)',
        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5), 0 8px 16px -4px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        WebkitBoxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5), 0 8px 16px -4px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        transform: 'translateY(-2px)',
      }}
      onClick={handleClick}
    >
      {/* Row 1: TV Channel Logo */}
      <div className="flex items-center justify-center mb-3">
        <div className="w-full h-16 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center">
          {broadcaster.logo_url ? (
            <Image
              src={broadcaster.logo_url}
              alt={`${broadcaster.name} logo`}
              width={120}
              height={48}
              className="object-contain w-full h-full"
              style={{ borderRadius: '8px' }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
              {broadcaster.name}
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Badges/Tags */}
      <div className="flex flex-wrap gap-1 mb-4">
        {broadcaster.isFree && (
          <span className="px-2 py-1 text-xs font-medium bg-green-500/20 text-green-400 rounded-md border border-green-500/30">
            Free
          </span>
        )}
        {broadcaster.isPopular && (
          <span className="px-2 py-1 text-xs font-medium bg-orange-500/20 text-orange-400 rounded-md border border-orange-500/30">
            Popular
          </span>
        )}
        {broadcaster.isPaid && (
          <span className="px-2 py-1 text-xs font-medium bg-blue-500/20 text-blue-400 rounded-md border border-blue-500/30">
            Paid
          </span>
        )}
        {broadcaster.isHd && (
          <span className="px-2 py-1 text-xs font-medium bg-purple-500/20 text-purple-400 rounded-md border border-purple-500/30">
            HD
          </span>
        )}
      </div>

      {/* Row 3: CTA Button */}
      <button 
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base rounded-lg transition-colors duration-200"
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
      >
        Watch Now
      </button>
    </div>
  );
}
