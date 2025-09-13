'use client';

import { useState } from 'react';
import { Lock, Mail, X, Check, AlertCircle } from 'lucide-react';

interface BlurredOddsProps {
  homeOdds: string;
  drawOdds: string;
  awayOdds: string;
  homeTeam: string;
  awayTeam: string;
  bookmaker: string;
  onEmailSubmit: (email: string) => Promise<void>;
}

export default function BlurredOdds({
  homeOdds,
  drawOdds,
  awayOdds,
  homeTeam,
  awayTeam,
  bookmaker,
  onEmailSubmit
}: BlurredOddsProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleLockClick = () => {
    setShowModal(true);
    setError('');
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setError('');
    
    try {
      await onEmailSubmit(email);
      setIsUnlocked(true);
      setShowModal(false);
      
      // Store in localStorage for persistence
      localStorage.setItem('oddsUnlocked', 'true');
      localStorage.setItem('userEmail', email);
      
    } catch (error) {
      setError('Failed to submit email. Please try again.');
      console.error('Error submitting email:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isUnlocked) {
    return (
      <div className="flex items-center space-x-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <Check className="h-4 w-4 text-green-600" />
        <div className="flex-1">
          <div className="text-sm font-medium text-green-800">Odds Unlocked!</div>
          <div className="text-xs text-green-600">You now have access to all odds</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Blurred Odds Display */}
      <div className="relative">
        <div className="flex items-center justify-between gap-1 min-w-[120px] blur-sm">
          <div className="flex flex-col items-center justify-center text-center w-full px-2.5 py-1.5 rounded-md border border-gray-100 dark:border-gray-800 bg-gray-200 dark:bg-gray-900 min-w-[64px] min-h-[36px]">
            <span className="font-bold text-s text-indigo-600 dark:text-indigo-400">{homeOdds}</span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">{homeTeam}</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center w-full px-2.5 py-1.5 rounded-md border border-gray-100 dark:border-gray-800 bg-gray-200 dark:bg-gray-900 min-w-[64px] min-h-[36px]">
            <span className="font-bold text-s text-gray-600">{drawOdds}</span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">Draw</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center w-full px-2.5 py-1.5 rounded-md border border-gray-100 dark:border-gray-800 bg-gray-200 dark:bg-gray-900 min-w-[64px] min-h-[36px]">
            <span className="font-bold text-s text-red-600">{awayOdds}</span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">{awayTeam}</span>
          </div>
        </div>
        
        {/* Lock Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 rounded-lg">
          <button
            onClick={handleLockClick}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Lock className="h-4 w-4" />
            <span className="text-sm font-medium">Unlock Odds</span>
          </button>
        </div>
      </div>

      {/* Email Collection Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Unlock Live Odds</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Get instant access to live odds
                </label>
                <div className="flex space-x-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-0"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    <Mail className="h-4 w-4" />
                    <span>{isSubmitting ? 'Unlocking...' : 'Unlock'}</span>
                  </button>
                </div>
              </div>
              
              {error && (
                <div className="flex items-center space-x-2 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}
              
              <div className="text-xs text-gray-500">
                <p>✓ Get live odds updates</p>
                <p>✓ Best betting value alerts</p>
                <p>✓ No spam, unsubscribe anytime</p>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
