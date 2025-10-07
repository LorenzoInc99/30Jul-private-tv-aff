'use client';

import TeamLogo from './TeamLogo';

interface DesktopTeamHeaderCardProps {
  team: {
    name: string;
    team_logo_url?: string;
    id?: string;
  };
  teamCountry?: string;
}

export default function DesktopTeamHeaderCard({ team, teamCountry }: DesktopTeamHeaderCardProps) {
  return (
    <div className="px-6 pt-6 pb-4">
      {/* Desktop Team Header Card with 3D Effect */}
      <div 
        className="relative rounded-2xl p-8 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          borderColor: 'rgba(71, 85, 105, 0.4)',
          boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5), 0 8px 16px -4px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          WebkitBoxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5), 0 8px 16px -4px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          transform: 'translateY(-2px)',
        }}
      >
        {/* Team Info */}
        <div className="flex items-center">
          {/* Team Logo */}
          <div className="flex-shrink-0 mr-6">
            <div className="w-24 h-24 rounded-full bg-white/10 p-3 flex items-center justify-center">
              <TeamLogo
                logoUrl={team.team_logo_url}
                teamName={team.name}
                size="xl"
                className="w-20 h-20"
              />
            </div>
          </div>

          {/* Team Details */}
          <div className="flex-1 min-w-0">
            <h1 className="text-4xl font-bold text-white mb-2">
              {team.name}
            </h1>
            {teamCountry && (
              <p className="text-xl text-slate-300">
                {teamCountry}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mt-6">
          <p className="text-base text-slate-300 leading-relaxed">
            Get the latest {team.name} fixtures and {team.name} matches schedule. Find where to watch {team.name} matches live on TV and discover where to watch {team.name} tonight. Get the best odds for {team.name} games from top bookmakers. Never miss a {team.name} fixture with our comprehensive match coverage.
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-24 translate-x-24"></div>
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-gradient-to-tr from-indigo-500/10 to-cyan-500/10 rounded-full translate-y-18 -translate-x-18"></div>
        <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-gradient-to-bl from-emerald-500/10 to-teal-500/10 rounded-full"></div>
      </div>
    </div>
  );
}
