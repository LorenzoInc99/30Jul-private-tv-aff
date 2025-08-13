import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import MatchPageClient from './MatchPageClient';
import { getMatchById } from '../../../lib/database-adapter';

export async function generateMetadata({ params }: { params: Promise<{ matchId: string }> }): Promise<Metadata> {
  const { matchId } = await params;
  const fullMatchId = matchId as string;
  const numericMatchId = fullMatchId ? fullMatchId.split('-')[0] : null;
  
  if (!numericMatchId) {
    return { title: 'Match Not Found' };
  }

  try {
    const match = await getMatchById(numericMatchId);

    const homeTeamName = match.home_team?.name || 'Unknown Team';
    const awayTeamName = match.away_team?.name || 'Unknown Team';
    const leagueName = match.Competitions?.name || 'Football';
    const matchDate = new Date(match.start_time);
    const dateString = matchDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    let statusText = '';
    if (match.status === 'Finished') {
      statusText = `This ${leagueName} match has concluded with a final score of ${match.home_score || 0}-${match.away_score || 0}.`;
    } else if (match.status === 'Live') {
      statusText = `Watch ${homeTeamName} vs ${awayTeamName} live now! Current score: ${match.home_score || 0}-${match.away_score || 0}.`;
    } else {
      statusText = `On ${dateString}, there is a ${leagueName} match between ${homeTeamName} and ${awayTeamName}.`;
    }

    const description = `${statusText} Find where to watch this game and get the best betting odds from licensed operators. Live TV schedule and match details.`;

    return {
      title: `${homeTeamName} vs ${awayTeamName} - ${dateString}`,
      description,
      keywords: `${homeTeamName}, ${awayTeamName}, ${leagueName}, football match, live streaming, betting odds, TV schedule, ${dateString}`,
      openGraph: {
        title: `${homeTeamName} vs ${awayTeamName} - ${dateString}`,
        description,
        type: 'website',
      },
      twitter: {
        title: `${homeTeamName} vs ${awayTeamName} - ${dateString}`,
        description,
      },
    };
  } catch (error) {
    return { title: 'Match Not Found' };
  }
}

export default async function MatchPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params;
  const fullMatchId = matchId as string;
  const numericMatchId = fullMatchId ? fullMatchId.split('-')[0] : null;
  
  if (!numericMatchId) {
    return notFound();
  }

  try {
    const match = await getMatchById(numericMatchId);
    return <MatchPageClient match={match} />;
  } catch (error) {
    return notFound();
  }
} 