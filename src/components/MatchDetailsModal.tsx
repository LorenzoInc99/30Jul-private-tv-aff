import { useEffect, useState } from 'react';
import MatchDetails from './MatchDetails';

interface MatchDetailsModalProps {
  matchId: string;
  onClose: () => void;
}

export default function MatchDetailsModal({ matchId, onClose }: MatchDetailsModalProps) {
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/match/${matchId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch match details');
        return res.json();
      })
      .then(data => {
        setMatch(data.match);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [matchId]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!matchId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full mx-2 p-0 overflow-y-auto max-h-[90vh]">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl font-bold focus:outline-none"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        {loading && (
          <div className="p-8 text-center text-lg">Loading...</div>
        )}
        {error && (
          <div className="p-8 text-center text-red-500">{error}</div>
        )}
        {match && <MatchDetails match={match} />}
      </div>
      {/* Click outside to close */}
      <div className="fixed inset-0 z-40" onClick={onClose} />
    </div>
  );
} 