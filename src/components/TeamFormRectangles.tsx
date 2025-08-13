"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getTeamForm } from '@/lib/database-adapter';

export default function TeamFormRectangles({ teamId, matchStartTime }: { teamId: number, matchStartTime: string }) {
  const [formResults, setFormResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchTeamForm = async () => {
      try {
        console.log('Fetching team form for teamId:', teamId, 'before date:', matchStartTime, 'type:', typeof matchStartTime);
        const formData = await getTeamForm(teamId, matchStartTime);
        console.log('Team form data received:', formData);
        setFormResults(formData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching team form:', {
          teamId,
          matchStartTime,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : 'No stack trace'
        });
        // On error, show grey circles (empty results)
        setFormResults([]);
        setLoading(false);
      }
    };

    fetchTeamForm();
  }, [teamId, matchStartTime]);

  const handleMouseEnter = (index: number) => {
    setHoveredIndex(index);
    tooltipTimeoutRef.current = setTimeout(() => {
      setShowTooltip(true);
    }, 100); // 0.1 seconds
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    setShowTooltip(false);
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
  };

  const handleClick = (form: any) => {
    if (form?.matchUrl) {
      console.log('Navigating to:', form.matchUrl);
      router.push(form.matchUrl);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center mt-2 space-x-1">
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className="w-5 h-4 bg-gray-300 dark:bg-gray-600 rounded-sm animate-pulse"
          />
        ))}
      </div>
    );
  }

  // Show 5 rectangles (filled or grey) - most recent on the right
  console.log('Form results length:', formResults.length);
  console.log('Form results:', formResults);
  
  const displayResults = [...Array(5)].map((_, index) => {
    // Reverse the order so most recent is on the right
    const reversedIndex = 4 - index;
    const result = formResults[reversedIndex] || null;
    console.log(`Rectangle ${index} (reversedIndex ${reversedIndex}):`, result);
    return result;
  });

  return (
    <div className="flex justify-center mt-2 space-x-1 relative">
      {displayResults.map((form, index) => {
        let bgColor = 'bg-gray-400 dark:bg-gray-500'; // Default grey for no data
        
        if (form?.result) {
          if (form.result === 'win') {
            bgColor = 'bg-green-500 dark:bg-green-600';
          } else if (form.result === 'draw') {
            bgColor = 'bg-orange-500 dark:bg-orange-600';
          } else if (form.result === 'loss') {
            bgColor = 'bg-red-500 dark:bg-red-600';
          }
        }

        return (
          <div
            key={index}
            className={`w-5 h-4 ${bgColor} rounded-sm transition-colors duration-200 cursor-pointer relative ${
              form?.matchUrl ? 'hover:scale-110' : ''
            }`}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(form)}
          >
            {/* Custom tooltip */}
            {hoveredIndex === index && showTooltip && form && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 dark:bg-gray-900 text-white text-xs rounded whitespace-nowrap z-10">
                vs {form.opponent}
                {form.matchUrl && (
                  <div className="text-blue-300 text-xs mt-1">Click to view match</div>
                )}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800 dark:border-t-gray-900"></div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
} 