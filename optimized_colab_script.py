# OPTIMIZED COLAB SCRIPT FOR COMPLETE DATA FETCH (2 DAYS AGO TO END OF AUGUST)

# Install necessary library (only run once per Colab session)
# !pip install psycopg --quiet

# Import Libraries
import requests
import json
import datetime
import psycopg
import time

# Configuration
API_TOKEN = "9RRfkWhjMRyWiIpf5Z7VOIARU8JsTZuXvvhZ26pU6G05Ntl5WueQhd5fptVY"

# Supabase Database Connection Details
SUPABASE_DB_HOST = "aws-0-eu-north-1.pooler.supabase.com"
SUPABASE_DB_PORT = 5432
SUPABASE_DB_USER = "postgres.mmcfzlliglvhfchiqliv"
SUPABASE_DB_PASSWORD = "NKNhlW1ZifLR2GyZ"
SUPABASE_DB_NAME = "postgres"

# Your Selected European League IDs
EUROPEAN_LEAGUE_IDS = [
    8, 9, 24, 27, 72, 82, 181, 208, 1371, 244, 271, 301, 384, 387, 390, 
    444, 453, 462, 486, 501, 564, 567, 570, 573, 591, 600, 609
]

print("Configuration Loaded!")

def get_db_connection():
    """Establishes and returns a connection to the Supabase PostgreSQL database."""
    try:
        conn = psycopg.connect(
            host=SUPABASE_DB_HOST,
            port=SUPABASE_DB_PORT,
            user=SUPABASE_DB_USER,
            password=SUPABASE_DB_PASSWORD,
            dbname=SUPABASE_DB_NAME,
            sslmode="require"
        )
        print("INFO: Successfully connected to Supabase database.")
        return conn
    except Exception as e:
        print(f"ERROR: Error connecting to Supabase: {e}")
        return None

def fetch_all_fixtures_extended_range(api_token):
    """Fetch all fixtures from 2 days ago to end of August."""
    print(f"\n=== FETCHING ALL FIXTURES (2 DAYS AGO TO END OF AUGUST) ===")
    
    # Calculate date range
    today = datetime.datetime.now()
    start_date = today - datetime.timedelta(days=2)  # 2 days ago
    end_date = datetime.datetime(2025, 8, 31)  # End of August 2025
    
    # Format dates as YYYY-MM-DD for the API
    start_date_str = start_date.strftime("%Y-%m-%d")
    end_date_str = end_date.strftime("%Y-%m-%d")
    
    print(f"Date range: {start_date_str} to {end_date_str}")
    print(f"Target leagues: {len(EUROPEAN_LEAGUE_IDS)} leagues")
    
    all_fixtures = []
    league_results = {}
    
    # Use the proper date range endpoint
    url = f"https://api.sportmonks.com/v3/football/fixtures/between/{start_date_str}/{end_date_str}"
    
    print(f"\n--- Using extended date range endpoint ---")
    print(f"URL: {url}")
    
    try:
        # Get all fixtures in the date range
        params = {
            "api_token": api_token,
            "include": "participants;scores;league;venue;state",
            "per_page": 50,  # Maximum allowed per page
            "order": "starting_at:asc"  # Chronological order
        }
        
        fixtures_data = []
        page = 1
        has_more = True
        max_pages = 100  # Increased limit for extended range
        
        while has_more and page <= max_pages:
            current_params = params.copy()
            current_params["page"] = page
            
            try:
                print(f"  Fetching page {page}...")
                response = requests.get(url, params=current_params)
                response.raise_for_status()
                data = response.json()
                
                if "data" in data and data["data"] is not None:
                    if isinstance(data["data"], list):
                        page_fixtures = [dict(item) for item in data["data"]]
                        fixtures_data.extend(page_fixtures)
                        print(f"    Got {len(page_fixtures)} fixtures on page {page}")
                    else:
                        fixtures_data.append(dict(data["data"]))
                        print(f"    Got 1 fixture on page {page}")
                
                # Check pagination
                if "pagination" in data and data["pagination"] is not None:
                    has_more = data["pagination"].get("has_more", False)
                    page += 1
                else:
                    has_more = False
                    
            except Exception as e:
                print(f"  ERROR: Error fetching page {page}: {e}")
                break
            
            time.sleep(0.2)  # Rate limiting
        
        print(f"Total fixtures fetched: {len(fixtures_data)}")
        
        # Now filter by our target leagues
        target_fixtures = []
        for fixture in fixtures_data:
            league_id = fixture.get("league_id")
            if league_id in EUROPEAN_LEAGUE_IDS:
                target_fixtures.append(fixture)
                if league_id not in league_results:
                    league_results[league_id] = 0
                league_results[league_id] += 1
        
        all_fixtures = target_fixtures
        
    except Exception as e:
        print(f"Error fetching fixtures: {e}")
        return []
    
    print(f"\n=== SUMMARY ===")
    print(f"Total fixtures found: {len(all_fixtures)}")
    print("Fixtures per league:")
    for league_id, count in league_results.items():
        if count > 0:
            print(f"  League {league_id}: {count} fixtures")
    
    return all_fixtures

def fetch_leagues_data(api_token):
    """Fetch league data for our target leagues."""
    print(f"\n=== FETCHING LEAGUES DATA ===")
    
    leagues_data = []
    
    for league_id in EUROPEAN_LEAGUE_IDS:
        try:
            url = f"https://api.sportmonks.com/v3/football/leagues/{league_id}"
            params = {
                "api_token": api_token,
                "include": "country"
            }
            
            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if "data" in data:
                league = data["data"]
                leagues_data.append({
                    "id": league.get("id"),
                    "name": league.get("name"),
                    "sport_id": league.get("sport_id"),
                    "country_id": league.get("country_id")
                })
                print(f"  League {league_id}: {league.get('name')}")
            
            time.sleep(0.1)
            
        except Exception as e:
            print(f"  Error fetching league {league_id}: {e}")
    
    return leagues_data

def fetch_teams_data(api_token, fixtures_data):
    """Fetch team data for all teams in our fixtures."""
    print(f"\n=== FETCHING TEAMS DATA ===")
    
    # Extract unique team IDs from fixtures
    team_ids = set()
    for fixture in fixtures_data:
        participants = fixture.get("participants", [])
        for participant in participants:
            team_ids.add(participant.get("id"))
    
    print(f"Found {len(team_ids)} unique teams")
    
    teams_data = []
    
    for team_id in team_ids:
        if team_id is None:
            continue
            
        try:
            url = f"https://api.sportmonks.com/v3/football/teams/{team_id}"
            params = {
                "api_token": api_token
            }
            
            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if "data" in data:
                team = data["data"]
                teams_data.append({
                    "id": team.get("id"),
                    "name": team.get("name"),
                    "short_code": team.get("short_code"),
                    "country_id": team.get("country_id"),
                    "venue_id": team.get("venue_id")
                })
            
            time.sleep(0.1)
            
        except Exception as e:
            print(f"  Error fetching team {team_id}: {e}")
    
    return teams_data

def fetch_tv_stations_data(api_token):
    """Fetch TV stations data."""
    print(f"\n=== FETCHING TV STATIONS DATA ===")
    
    url = "https://api.sportmonks.com/v3/football/tvstations"
    params = {
        "api_token": api_token,
        "per_page": 100
    }
    
    tv_stations = []
    page = 1
    has_more = True
    
    while has_more:
        try:
            current_params = params.copy()
            current_params["page"] = page
            
            response = requests.get(url, params=current_params)
            response.raise_for_status()
            data = response.json()
            
            if "data" in data and data["data"] is not None:
                if isinstance(data["data"], list):
                    page_stations = [dict(item) for item in data["data"]]
                    tv_stations.extend(page_stations)
                    print(f"  Got {len(page_stations)} TV stations on page {page}")
                else:
                    tv_stations.append(dict(data["data"]))
            
            # Check pagination
            if "pagination" in data and data["pagination"] is not None:
                has_more = data["pagination"].get("has_more", False)
                page += 1
            else:
                has_more = False
                
        except Exception as e:
            print(f"  Error fetching TV stations page {page}: {e}")
            break
        
        time.sleep(0.1)
    
    return tv_stations

def fetch_odds_data(api_token, fixtures_data):
    """Fetch odds data for fixtures that have odds."""
    print(f"\n=== FETCHING ODDS DATA ===")
    
    odds_data = []
    fixtures_with_odds = [f for f in fixtures_data if f.get("has_odds")]
    
    print(f"Found {len(fixtures_with_odds)} fixtures with odds")
    
    for fixture in fixtures_with_odds[:50]:  # Limit to first 50 for now
        fixture_id = fixture.get("id")
        
        try:
            url = f"https://api.sportmonks.com/v3/football/odds/fixtures/{fixture_id}"
            params = {
                "api_token": api_token,
                "include": "bookmaker"
            }
            
            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if "data" in data and data["data"] is not None:
                if isinstance(data["data"], list):
                    fixture_odds = [dict(item) for item in data["data"]]
                    odds_data.extend(fixture_odds)
                else:
                    odds_data.append(dict(data["data"]))
            
            time.sleep(0.1)
            
        except Exception as e:
            print(f"  Error fetching odds for fixture {fixture_id}: {e}")
    
    return odds_data

def populate_leagues_data(leagues_data, conn):
    """Populate leagues table."""
    if not conn or not leagues_data:
        return
    
    cur = conn.cursor()
    print("Populating Leagues Data...")
    
    insert_query = """
    INSERT INTO public.leagues (id, name, sport_id, country_id)
    VALUES (%(id)s, %(name)s, %(sport_id)s, %(country_id)s)
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        sport_id = EXCLUDED.sport_id,
        country_id = EXCLUDED.country_id;
    """
    
    try:
        cur.executemany(insert_query, leagues_data)
        conn.commit()
        print(f"Successfully inserted/updated {len(leagues_data)} leagues.")
    except Exception as e:
        conn.rollback()
        print(f"Error inserting leagues: {e}")
    finally:
        cur.close()

def populate_teams_data(teams_data, conn):
    """Populate teams_new table."""
    if not conn or not teams_data:
        return
    
    cur = conn.cursor()
    print("Populating Teams Data...")
    
    insert_query = """
    INSERT INTO public.teams_new (id, name, short_code, country_id, venue_id)
    VALUES (%(id)s, %(name)s, %(short_code)s, %(country_id)s, %(venue_id)s)
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        short_code = EXCLUDED.short_code,
        country_id = EXCLUDED.country_id,
        venue_id = EXCLUDED.venue_id;
    """
    
    try:
        cur.executemany(insert_query, teams_data)
        conn.commit()
        print(f"Successfully inserted/updated {len(teams_data)} teams.")
    except Exception as e:
        conn.rollback()
        print(f"Error inserting teams: {e}")
    finally:
        cur.close()

def populate_tv_stations_data(tv_stations_data, conn):
    """Populate tvstations table."""
    if not conn or not tv_stations_data:
        return
    
    cur = conn.cursor()
    print("Populating TV Stations Data...")
    
    insert_query = """
    INSERT INTO public.tvstations (id, name, url, image_path)
    VALUES (%(id)s, %(name)s, %(url)s, %(image_path)s)
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        url = EXCLUDED.url,
        image_path = EXCLUDED.image_path;
    """
    
    try:
        cur.executemany(insert_query, tv_stations_data)
        conn.commit()
        print(f"Successfully inserted/updated {len(tv_stations_data)} TV stations.")
    except Exception as e:
        conn.rollback()
        print(f"Error inserting TV stations: {e}")
    finally:
        cur.close()

def populate_odds_data(odds_data, conn):
    """Populate odds table."""
    if not conn or not odds_data:
        return
    
    cur = conn.cursor()
    print("Populating Odds Data...")
    
    insert_query = """
    INSERT INTO public.odds (id, fixture_id, bookmaker_id, market_id, label, value, probability, latest_bookmaker_update)
    VALUES (%(id)s, %(fixture_id)s, %(bookmaker_id)s, %(market_id)s, %(label)s, %(value)s, %(probability)s, %(latest_bookmaker_update)s)
    ON CONFLICT (id) DO UPDATE SET
        fixture_id = EXCLUDED.fixture_id,
        bookmaker_id = EXCLUDED.bookmaker_id,
        market_id = EXCLUDED.market_id,
        label = EXCLUDED.label,
        value = EXCLUDED.value,
        probability = EXCLUDED.probability,
        latest_bookmaker_update = EXCLUDED.latest_bookmaker_update;
    """
    
    try:
        cur.executemany(insert_query, odds_data)
        conn.commit()
        print(f"Successfully inserted/updated {len(odds_data)} odds.")
    except Exception as e:
        conn.rollback()
        print(f"Error inserting odds: {e}")
    finally:
        cur.close()

def extract_scores_from_fixture(fixture):
    """Correctly extracts home and away scores from SportMonks API response."""
    home_score = None
    away_score = None
    
    scores_data = fixture.get("scores", [])
    
    if not scores_data:
        return None, None
    
    # First, try to find CURRENT score (for live matches)
    current_scores = [s for s in scores_data if s.get("description") == "CURRENT"]
    
    if current_scores:
        for score_entry in current_scores:
            score_data = score_entry.get("score", {})
            participant = score_data.get("participant")
            goals = score_data.get("goals")
            
            if participant == "home" and goals is not None:
                home_score = int(goals)
            elif participant == "away" and goals is not None:
                away_score = int(goals)
    
    # If no CURRENT score or incomplete, try 2ND_HALF (full-time)
    if home_score is None or away_score is None:
        second_half_scores = [s for s in scores_data if s.get("description") == "2ND_HALF"]
        
        for score_entry in second_half_scores:
            score_data = score_entry.get("score", {})
            participant = score_data.get("participant")
            goals = score_data.get("goals")
            
            if participant == "home" and goals is not None:
                home_score = int(goals)
            elif participant == "away" and goals is not None:
                away_score = int(goals)
    
    # If still incomplete, try 1ST_HALF as fallback
    if home_score is None or away_score is None:
        first_half_scores = [s for s in scores_data if s.get("description") == "1ST_HALF"]
        
        for score_entry in first_half_scores:
            score_data = score_entry.get("score", {})
            participant = score_data.get("participant")
            goals = score_data.get("goals")
            
            if participant == "home" and goals is not None:
                home_score = int(goals)
            elif participant == "away" and goals is not None:
                away_score = int(goals)
    
    return home_score, away_score

def populate_fixtures_data_optimized(fixtures_data, conn):
    """Populates the 'fixtures' table with data from SportMonks API."""
    if conn is None:
        print("Database connection is not established. Cannot populate fixtures data.")
        return

    cur = conn.cursor()
    print("Populating Fixtures Data with Score Processing...")

    fixture_records = []
    processed_count = 0
    score_found_count = 0

    for fixture in fixtures_data:
        fixture_id = fixture.get("id")

        # Process Participants Data to get home and away team IDs
        home_team_id = None
        away_team_id = None
        participants = fixture.get("participants", [])
        for participant in participants:
            if participant.get("meta", {}).get("location") == "home":
                home_team_id = participant.get("id")
            elif participant.get("meta", {}).get("location") == "away":
                away_team_id = participant.get("id")

        # Process Scores Data
        home_score, away_score = extract_scores_from_fixture(fixture)
        
        if home_score is not None or away_score is not None:
            score_found_count += 1

        fixture_values = {
            "id": fixture_id,
            "league_id": fixture.get("league_id"),
            "season_id": fixture.get("season_id"),
            "round_id": fixture.get("round_id"),
            "venue_id": fixture.get("venue_id"),
            "home_team_id": home_team_id,
            "away_team_id": away_team_id,
            "name": fixture.get("name"),
            "starting_at": fixture.get("starting_at"),
            "starting_at_timestamp": fixture.get("starting_at_timestamp"),
            "has_odds": fixture.get("has_odds"),
            "has_premium_odds": fixture.get("has_premium_odds"),
            "state_id": fixture.get("state_id"),
            "home_score": home_score,
            "away_score": away_score
        }
        fixture_records.append(fixture_values)
        processed_count += 1

    print(f"INFO: Processed {processed_count} fixtures, found scores for {score_found_count} fixtures")

    # Insert into database
    insert_query = """
    INSERT INTO public.fixtures (
        id, league_id, season_id, round_id, venue_id, home_team_id, away_team_id,
        name, starting_at, starting_at_timestamp, has_odds, has_premium_odds,
        state_id, home_score, away_score
    ) VALUES (
        %(id)s, %(league_id)s, %(season_id)s, %(round_id)s, %(venue_id)s,
        %(home_team_id)s, %(away_team_id)s, %(name)s, %(starting_at)s,
        %(starting_at_timestamp)s, %(has_odds)s, %(has_premium_odds)s,
        %(state_id)s, %(home_score)s, %(away_score)s
    ) ON CONFLICT (id) DO UPDATE SET
        league_id = EXCLUDED.league_id,
        season_id = EXCLUDED.season_id,
        round_id = EXCLUDED.round_id,
        venue_id = EXCLUDED.venue_id,
        home_team_id = EXCLUDED.home_team_id,
        away_team_id = EXCLUDED.away_team_id,
        name = EXCLUDED.name,
        starting_at = EXCLUDED.starting_at,
        starting_at_timestamp = EXCLUDED.starting_at_timestamp,
        has_odds = EXCLUDED.has_odds,
        has_premium_odds = EXCLUDED.has_premium_odds,
        state_id = EXCLUDED.state_id,
        home_score = EXCLUDED.home_score,
        away_score = EXCLUDED.away_score;
    """
    
    try:
        if fixture_records:
            cur.executemany(insert_query, fixture_records)
            conn.commit()
            print(f"Successfully inserted/updated {len(fixture_records)} fixtures with scores.")
    except Exception as e:
        conn.rollback()
        print(f"Error inserting/updating fixtures: {e}")
    finally:
        if cur:
            cur.close()

def run_complete_data_fetch():
    """Main function to fetch and save all data from 2 days ago to end of August."""
    print("=== STARTING COMPLETE DATA FETCH (2 DAYS AGO TO END OF AUGUST) ===")
    
    # Test database connection first
    test_conn = get_db_connection()
    if not test_conn:
        print("Database connection test: FAILED")
        return
    
    test_conn.close()
    print("Database connection test: SUCCESS")
    
    # 1. Fetch all fixtures in the extended date range
    all_fixtures = fetch_all_fixtures_extended_range(API_TOKEN)
    
    if not all_fixtures:
        print("No fixtures found. Exiting.")
        return
    
    # 2. Save fixtures to database FIRST (most important)
    print(f"\n=== SAVING FIXTURES TO DATABASE ===")
    conn = get_db_connection()
    if conn:
        try:
            # Save fixtures immediately
            populate_fixtures_data_optimized(all_fixtures, conn)
            print(f"✅ Successfully saved {len(all_fixtures)} fixtures to database!")
            
            # Now fetch and save supporting data (optional)
            print(f"\n=== FETCHING SUPPORTING DATA (OPTIONAL) ===")
            
            # Fetch leagues (fast)
            leagues_data = fetch_leagues_data(API_TOKEN)
            if leagues_data:
                populate_leagues_data(leagues_data, conn)
            
            # Fetch TV stations (fast)
            tv_stations_data = fetch_tv_stations_data(API_TOKEN)
            if tv_stations_data:
                populate_tv_stations_data(tv_stations_data, conn)
            
            # Skip teams for now (too slow)
            print("⚠️  Skipping teams data (too many API calls)")
            
            # Skip odds for now (too slow)
            print("⚠️  Skipping odds data (too many API calls)")
            
            print(f"\n=== COMPLETE DATA FETCH FINISHED ===")
            print(f"✅ Total fixtures saved: {len(all_fixtures)}")
            print(f"✅ Total leagues: {len(leagues_data) if leagues_data else 0}")
            print(f"✅ Total TV stations: {len(tv_stations_data) if tv_stations_data else 0}")
            print(f"⚠️  Teams and odds skipped for performance")
            
        finally:
            conn.close()
            print("Database connection closed.")
    else:
        print("❌ Failed to connect to database for saving data.")

def quick_verify_extended_data():
    """Quick verification of the extended data in the database."""
    print(f"\n=== QUICK VERIFICATION (EXTENDED RANGE) ===")
    conn = get_db_connection()
    if not conn:
        return
    
    try:
        cur = conn.cursor()
        
        # Count total fixtures
        cur.execute("SELECT COUNT(*) FROM public.fixtures")
        total_fixtures = cur.fetchone()[0]
        print(f"Total fixtures in database: {total_fixtures}")
        
        # Count fixtures with scores
        cur.execute("SELECT COUNT(*) FROM public.fixtures WHERE home_score IS NOT NULL OR away_score IS NOT NULL")
        fixtures_with_scores = cur.fetchone()[0]
        print(f"Fixtures with scores: {fixtures_with_scores}")
        
        # Show date range
        cur.execute("SELECT MIN(starting_at), MAX(starting_at) FROM public.fixtures")
        date_range = cur.fetchone()
        print(f"Date range: {date_range[0]} to {date_range[1]}")
        
        # Show recent fixtures with scores
        print(f"\n=== RECENT FIXTURES WITH SCORES ===")
        cur.execute("""
            SELECT 
                f.name,
                f.starting_at,
                f.home_score,
                f.away_score,
                f.league_id
            FROM public.fixtures f
            WHERE (f.home_score IS NOT NULL OR f.away_score IS NOT NULL)
            ORDER BY f.starting_at DESC
            LIMIT 10;
        """)
        
        recent_samples = cur.fetchall()
        if recent_samples:
            for sample in recent_samples:
                score_display = f"{sample[2]}-{sample[3]}" if sample[2] is not None and sample[3] is not None else "No score"
                print(f"  {sample[0]} | {sample[1]} | League: {sample[4]} | Score: {score_display}")
        else:
            print("  No fixtures with scores found.")
            
    except Exception as e:
        print(f"Error during verification: {e}")
    finally:
        if conn:
            cur.close()
            conn.close()

# RUN THE COMPLETE DATA FETCH
if __name__ == "__main__":
    # Run the complete data fetch
    run_complete_data_fetch()
    
    # Quick verification
    quick_verify_extended_data() 