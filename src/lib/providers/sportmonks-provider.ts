import { SportsDataProvider, NormalizedMatch, NormalizedTeam, NormalizedLeague } from '../interfaces/sports-data-provider';
import { supabaseBrowser } from '../supabase';

export class SportMonksProvider implements SportsDataProvider {
  async getMatchesForDate(date: Date): Promise<NormalizedMatch[]> {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 1);

    const { data: fixtures, error } = await supabaseBrowser
      .from('fixtures')
      .select(`
        *,
        league:leagues(*),
        home_team:teams_new!fixtures_home_team_id_fkey1(*),
        away_team:teams_new!fixtures_away_team_id_fkey1(*),
        odds(id),
        fixturetvstations(tvstation:tvstations(*))
      `)
      .gte('starting_at', start.toISOString())
      .lt('starting_at', end.toISOString())
      .order('starting_at', { ascending: true });

    if (error) {
      throw error;
    }

    return (fixtures || []).map(fixture => this.normalizeMatch(fixture));
  }

  async getMatchById(id: string): Promise<NormalizedMatch | null> {
    const { data: fixture, error } = await supabaseBrowser
      .from('fixtures')
      .select(`
        *,
        league:leagues(*),
        home_team:teams_new!fixtures_home_team_id_fkey1(*),
        away_team:teams_new!fixtures_away_team_id_fkey1(*),
        odds(id),
        fixturetvstations(tvstation:tvstations(*))
      `)
      .eq('id', id)
      .single();

    if (error || !fixture) {
      return null;
    }

    return this.normalizeMatch(fixture);
  }

  async getTeamById(id: string): Promise<NormalizedTeam | null> {
    const { data: team, error } = await supabaseBrowser
      .from('teams_new')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !team) {
      return null;
    }

    return this.normalizeTeam(team);
  }

  async getLeagueById(id: string): Promise<NormalizedLeague | null> {
    const { data: league, error } = await supabaseBrowser
      .from('leagues')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !league) {
      return null;
    }

    return this.normalizeLeague(league);
  }

  private normalizeMatch(fixture: any): NormalizedMatch {
    return {
      id: fixture.id.toString(),
      title: fixture.name,
      startTime: fixture.starting_at,
      homeTeam: this.normalizeTeam(fixture.home_team),
      awayTeam: this.normalizeTeam(fixture.away_team),
      competition: this.normalizeLeague(fixture.league),
      status: this.getMatchStatus(fixture.state_id),
      scores: fixture.home_score ? {
        home: fixture.home_score,
        away: fixture.away_score
      } : undefined,
      hasOdds: fixture.odds && fixture.odds.length > 0,
      hasTvInfo: fixture.fixturetvstations && fixture.fixturetvstations.length > 0
    };
  }

  private normalizeTeam(team: any): NormalizedTeam {
    return {
      id: team.id.toString(),
      name: team.name,
      shortName: team.short_code,
      logoUrl: team.team_logo_url,
      country: team.country_id?.toString()
    };
  }

  private normalizeLeague(league: any): NormalizedLeague {
    return {
      id: league.id.toString(),
      name: league.name,
      logoUrl: league.league_logo
    };
  }

  private getMatchStatus(stateId: number): string {
    // Your existing status mapping logic
    const statusMap: { [key: number]: string } = {
      1: 'Scheduled',
      2: 'Live',
      3: 'Half Time',
      4: 'Full Time',
      5: 'Finished',
      6: 'Postponed',
      7: 'Cancelled',
      8: 'Abandoned'
    };
    return statusMap[stateId] || 'Unknown';
  }
}

