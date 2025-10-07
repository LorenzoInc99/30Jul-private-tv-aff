'use client';

import Link from 'next/link';
import TeamLogo from './TeamLogo';

interface MobileTeamHeaderCardProps {
  team: {
    name: string;
    team_logo_url?: string;
    id?: string;
  };
  teamCountry?: string;
}

export default function MobileTeamHeaderCard({ team, teamCountry }: MobileTeamHeaderCardProps) {
  console.log('MobileTeamHeaderCard rendered with team:', team.name);
  return (
    <div className="p-4">
      {/* Team Header Card with 3D Effect */}
      <div 
        className="relative rounded-xl p-4 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          borderColor: 'rgba(71, 85, 105, 0.4)',
          boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5), 0 8px 16px -4px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          WebkitBoxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5), 0 8px 16px -4px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          transform: 'translateY(-2px)',
        }}
      >

        {/* Team Info */}
        <div className="flex items-center pt-4 pb-4">
          {/* Team Logo */}
          <div className="flex-shrink-0 mr-4 flex items-center">
            <TeamLogo
              logoUrl={team.team_logo_url}
              teamName={team.name}
              size="lg"
              className="w-20 h-20"
            />
          </div>

          {/* Team Details */}
          <div className="flex-1 min-w-0 flex flex-col justify-center mt-4">
            <div 
              className="font-bold text-white truncate mb-1" 
              style={{ 
                fontSize: '16px !important', 
                lineHeight: '20px !important',
                letterSpacing: '0.025em !important',
                color: 'white !important',
                fontWeight: 'bold !important'
              }}
            >
              {team.name}
            </div>
            {teamCountry && (
              <p className="text-sm text-slate-300 truncate">
                {teamCountry}
              </p>
            )}
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-500/10 to-cyan-500/10 rounded-full translate-y-12 -translate-x-12"></div>
      </div>
    </div>
  );
}
