# FIXED COLAB SCRIPT FOR COMPLETE DATA FETCH (50 DAYS AGO TO END OF AUGUST)

# Install necessary library (only run once per Colab session)
!pip install psycopg --quiet

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

# Initial European League IDs (will be updated based on what's actually available)
INITIAL_EUROPEAN_LEAGUE_IDS = [
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

def discover_available_leagues(api_token):
    """Discover what leagues are actually available in the date range."""
    print(f"\n=== DISCOVERING AVAILABLE LEAGUES ===")
    
    # Calculate date range - FIXED: Use consistent 50-day range
    today = datetime.datetime.now()
    start_date = today - datetime.timedelta(days=50)  # 50 days ago
    end_date = datetime.datetime(2025, 8, 31)  # End of August
    
    # Format dates as YYYY-MM-DD for the API
    start_date_str = start_date.strftime("%Y-%m-%d")
    end_date_str = end_date.strftime("%Y-%m-%d")
    
    print(f"Date range: {start_date_str} to {end_date_str}")
    
    # Use the date range endpoint to get all fixtures
    url = f"https://api.sportmonks.com/v3/football/fixtures/between/{start_date_str}/{end_date_str}"
    
    params = {
        "api_token": api_token,
        "include": "league",
        "per_page": 100,  # Get more per page to discover more leagues
        "order": "starting_at:asc"
    }
    
    discovered_leagues = set()
    league_names = {}
    total_fixtures = 0
    page = 1
    max_pages = 50  # INCREASED: Allow more pages for discovery
    
    while page <= max_pages:
        try:
            current_params = params.copy()
            current_params["page"] = page
            
            print(f"  Discovering leagues on page {page}...")
            response = requests.get(url, params=current_params)
            response.raise_for_status()
            data = response.json()
            
            if "data" in data and data["data"] is not None:
                fixtures = data["data"]
                if isinstance(fixtures, list):
                    page_fixtures = len(fixtures)
                    total_fixtures += page_fixtures
                    print(f"    Found {page_fixtures} fixtures on page {page}")
                    
                    # Extract league information
                    for fixture in fixtures:
                        league_data = fixture.get("league", {})
                        if league_data:
                            league_id = league_data.get("id")
                            league_name = league_data.get("name")
                            if league_id:
                                discovered_leagues.add(league_id)
                                if league_name:
                                    league_names[league_id] = league_name
                else:
                    # Single fixture
                    total_fixtures += 1
                    league_data = fixtures.get("league", {})
                    if league_data:
                        league_id = league_data.get("id")
                        league_name = league_data.get("name")
                        if league_id:
                            discovered_leagues.add(league_id)
                            if league_name:
                                league_names[league_id] = league_name
            
            # Check pagination
            if "pagination" in data and data["pagination"] is not None:
                has_more = data["pagination"].get("has_more", False)
                if not has_more:
                    break
                page += 1
            else:
                break
                
        except Exception as e:
            print(f"  Error discovering leagues on page {page}: {e}")
            break
        
        time.sleep(0.1)  # REDUCED: Less aggressive rate limiting
    
    print(f"\n=== LEAGUE DISCOVERY RESULTS ===")
    print(f"Total fixtures found: {total_fixtures}")
    print(f"Unique leagues discovered: {len(discovered_leagues)}")
    
    # Show discovered leagues
    print(f"\nDiscovered leagues:")
    for league_id in sorted(discovered_leagues):
        league_name = league_names.get(league_id, f"League {league_id}")
        is_in_initial = "✅" if league_id in INITIAL_EUROPEAN_LEAGUE_IDS else "❌"
        print(f"  {league_id}: {league_name} {is_in_initial}")
    
    return discovered_leagues, league_names

def fetch_all_fixtures_with_discovered_leagues(api_token, discovered_leagues):
    """Fetch all fixtures from discovered leagues in the date range."""
    print(f"\n=== FETCHING FIXTURES FROM DISCOVERED LEAGUES ===")
    
    # FIXED: Use the SAME date range as discovery
    today = datetime.datetime.now()
    start_date = today - datetime.timedelta(days=50)  # 50 days ago - FIXED!
    end_date = datetime.datetime(2025, 8, 31)  # End of August
    
    # Format dates as YYYY-MM-DD for the API
    start_date_str = start_date.strftime("%Y-%m-%d")
    end_date_str = end_date.strftime("%Y-%m-%d")
    
    print(f"Date range: {start_date_str} to {end_date_str}")
    print(f"Target leagues: {len(discovered_leagues)} discovered leagues")
    
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
        max_pages = 200  # INCREASED: Allow more pages for extended range
        
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
            
            time.sleep(0.1)  # REDUCED: Less aggressive rate limiting
        
        print(f"Total fixtures fetched: {len(fixtures_data)}")
        
        # Now filter by our discovered leagues
        target_fixtures = []
        for fixture in fixtures_data:
            league_id = fixture.get("league_id")
            if league_id in discovered_leagues:
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

def fetch_leagues_data_for_discovered(api_token, discovered_leagues):
    """Fetch league data for discovered leagues."""
    print(f"\n=== FETCHING LEAGUES DATA FOR DISCOVERED LEAGUES ===")
    
    leagues_data = []
    
    for league_id in discovered_leagues:
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
            
            time.sleep(0.05)  # REDUCED: Less aggressive rate limiting
            
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
            
            time.sleep(0.05)  # REDUCED: Less aggressive rate limiting
            
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
        
        time.sleep(0.05)  # REDUCED: Less aggressive rate limiting
    
    return tv_stations

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
            print(f"✅ Successfully inserted/updated {len(fixture_records)} fixtures with scores.")
        else:
            print("❌ No fixtures to insert!")
    except Exception as e:
        conn.rollback()
        print(f"❌ Error inserting/updating fixtures: {e}")
    finally:
        if cur:
            cur.close()

def run_updated_data_fetch():
    """Main function to discover leagues and fetch all data."""
    print("=== STARTING FIXED DATA FETCH (DISCOVER + FETCH) ===")
    
    # Test database connection first
    test_conn = get_db_connection()
    if not test_conn:
        print("❌ Database connection test: FAILED")
        return
    
    test_conn.close()
    print("✅ Database connection test: SUCCESS")
    
    # 1. Discover available leagues
    discovered_leagues, league_names = discover_available_leagues(API_TOKEN)
    
    if not discovered_leagues:
        print("❌ No leagues discovered. Exiting.")
        return
    
    # 2. Fetch all fixtures from discovered leagues
    all_fixtures = fetch_all_fixtures_with_discovered_leagues(API_TOKEN, discovered_leagues)
    
    if not all_fixtures:
        print("❌ No fixtures found. Exiting.")
        return
    
    # 3. Fetch supporting data
    print(f"\n=== FETCHING SUPPORTING DATA ===")
    leagues_data = fetch_leagues_data_for_discovered(API_TOKEN, discovered_leagues)
    tv_stations_data = fetch_tv_stations_data(API_TOKEN)
    
    # Skip teams for now (too slow)
    print("⚠️  Skipping teams data (too many API calls)")
    teams_data = []
    
    # 4. Save everything to database
    conn = get_db_connection()
    if conn:
        try:
            print(f"\n=== SAVING ALL DATA TO DATABASE ===")
            
            # Save fixtures FIRST (most important)
            print("🔄 Saving fixtures...")
            populate_fixtures_data_optimized(all_fixtures, conn)
            
            # Save leagues
            if leagues_data:
                print("🔄 Saving leagues...")
                populate_leagues_data(leagues_data, conn)
            
            # Save TV stations
            if tv_stations_data:
                print("🔄 Saving TV stations...")
                populate_tv_stations_data(tv_stations_data, conn)
            
            print(f"\n=== COMPLETE DATA FETCH FINISHED ===")
            print(f"✅ Total fixtures: {len(all_fixtures)}")
            print(f"✅ Total leagues: {len(leagues_data)}")
            print(f"✅ Total TV stations: {len(tv_stations_data)}")
            print(f"⚠️  Teams skipped for performance")
            
        finally:
            conn.close()
            print("Database connection closed.")
    else:
        print("❌ Failed to connect to database for saving data.")

def quick_verify_updated_data():
    """Quick verification of the updated data in the database."""
    print(f"\n=== QUICK VERIFICATION (FIXED DATA) ===")
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

# RUN THE FIXED DATA FETCH
if __name__ == "__main__":
    # Run the fixed data fetch
    run_updated_data_fetch()
    
    # Quick verification
    quick_verify_updated_data() 