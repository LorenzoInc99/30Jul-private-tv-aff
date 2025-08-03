"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import TeamLogo from '@/components/TeamLogo';

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD') // Normalize unicode characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics (accents, umlauts, etc.)
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

interface Team {
  id: number | string;
  name: string;
  team_logo_url?: string;
  totalMatches?: number;
}

interface TeamsListClientProps {
  grouped: { competition: { id: string|number, name: string }, teams: Team[] }[];
}

export default function TeamsListClient({ grouped }: TeamsListClientProps) {
  // By default, all competitions are collapsed
  const [expanded, setExpanded] = useState<{ [id: string]: boolean }>(() => ({}));
  const [search, setSearch] = useState('');

  // Filter competitions and teams based on search
  const filtered = grouped
    .map(group => {
      // If search matches competition name, show all teams
      if (group.competition.name.toLowerCase().includes(search.toLowerCase())) {
        return group;
      }
      // Otherwise, filter teams
      const filteredTeams = group.teams.filter(team => team.name.toLowerCase().includes(search.toLowerCase()));
      if (filteredTeams.length > 0) {
        return { ...group, teams: filteredTeams };
      }
      return null;
    })
    .filter(Boolean);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
      <div className="max-w-5xl mx-auto mt-0 mb-0 bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 w-full">
        <div className="flex justify-center mb-6">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search for a team or competition..."
            className="w-full max-w-md px-4 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Search for a team or competition"
          />
        </div>
        {filtered.length === 0 ? (
          <div className="text-center text-gray-500 py-10">No teams or competitions found.</div>
        ) : (
          <div className="space-y-6">
            {filtered.filter((group): group is typeof group & object => !!group).map(group => {
              if (!group) return null;
              const uniqueTeams = Array.from(new Map(group.teams.map(team => [team.id, team])).values());
              const isOpen = expanded[group.competition.id] ?? false;
              return (
                <section key={group.competition.id} className="bg-white dark:bg-gray-800 rounded shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800">
                  <div
                    className="flex items-center justify-between cursor-pointer p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-base font-semibold border-b border-gray-200 dark:border-gray-700"
                    onClick={() => setExpanded(e => ({ ...e, [group.competition.id]: !isOpen }))}
                    aria-expanded={isOpen}
                  >
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{group.competition.name}</span>
                    <svg
                      className={`w-4 h-4 text-gray-600 dark:text-gray-300 transition-transform duration-300 transform ${isOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  <div className={`transition-all duration-300 ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}> 
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                      {uniqueTeams.map(team => (
                        <li key={`${group.competition.id}-${team.id}`} className="flex items-center space-x-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                          <TeamLogo 
                            logoUrl={team.team_logo_url} 
                            teamName={team.name} 
                            size="sm" 
                          />
                          <Link
                            href={`/team/${slugify(team.name)}`}
                            className="font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-base"
                          >
                            {team.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 