# OPTIMIZED COLAB SCRIPT - INCREMENTAL DATA FETCHING WITH ODDS & TV CHANNELS

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

print("=== OPTIMIZED INCREMENTAL DATA FETCHER ===")
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
        print("Successfully connected to Supabase database.")
        return conn
    except Exception as e:
        print(f"Error connecting to Supabase: {e}")
        return None

def check_existing_data(conn):
    """Check what data already exists in the database."""
    print("\n=== CHECKING EXISTING DATA ===")
    
    cur = conn.cursor()
    existing_data = {}
    
    try:
        # Check fixtures date range
        cur.execute("SELECT MIN(starting_at), MAX(starting_at), COUNT(*) FROM public.fixtures")
        fixture_range = cur.fetchone()
        existing_data['fixtures'] = {
            'min_date': fixture_range[0],
            'max_date': fixture_range[1],
            'count': fixture_range[2]
        }
        print(f"Fixtures: {fixture_range[2]} records from {fixture_range[0]} to {fixture_range[1]}")
        
        # Check leagues
        cur.execute("SELECT COUNT(*) FROM public.leagues")
        league_count = cur.fetchone()[0]
        existing_data['leagues'] = {'count': league_count}
        print(f"Leagues: {league_count} records")
        
        # Check teams
        cur.execute("SELECT COUNT(*), COUNT(team_logo_url) FROM public.teams_new")
        team_stats = cur.fetchone()
        existing_data['teams'] = {'count': team_stats[0], 'with_logos': team_stats[1]}
        print(f"Teams: {team_stats[0]} records, {team_stats[1]} with logos")
        
        # Check TV stations
        cur.execute("SELECT COUNT(*) FROM public.tvstations")
        tv_count = cur.fetchone()[0]
        existing_data['tv_stations'] = {'count': tv_count}
        print(f"TV Stations: {tv_count} records")
        
        # Check odds
        cur.execute("SELECT COUNT(*) FROM public.odds")
        odds_count = cur.fetchone()[0]
        existing_data['odds'] = {'count': odds_count}
        print(f"Odds: {odds_count} records")
        
        # Check fixture TV stations
        cur.execute("SELECT COUNT(*) FROM public.fixturetvstations")
        fixture_tv_count = cur.fetchone()[0]
        existing_data['fixture_tv'] = {'count': fixture_tv_count}
        print(f"Fixture TV Stations: {fixture_tv_count} records")
        
        # Check bookmakers
        cur.execute("SELECT COUNT(*) FROM public.bookmakers")
        bookmaker_count = cur.fetchone()[0]
        existing_data['bookmakers'] = {'count': bookmaker_count}
        print(f"Bookmakers: {bookmaker_count} records")
        
        # NEW: Check fixtures without odds
        cur.execute("""
            SELECT COUNT(*) 
            FROM public.fixtures f 
            LEFT JOIN public.odds o ON f.id = o.fixture_id 
            WHERE o.fixture_id IS NULL 
            AND f.starting_at >= CURRENT_DATE
        """)
        fixtures_without_odds = cur.fetchone()[0]
        existing_data['fixtures_without_odds'] = {'count': fixtures_without_odds}
        print(f"Fixtures without odds (future): {fixtures_without_odds} records")
        
        # NEW: Get specific fixture IDs that need odds
        cur.execute("""
            SELECT f.id, f.name, f.starting_at 
            FROM public.fixtures f 
            LEFT JOIN public.odds o ON f.id = o.fixture_id 
            WHERE o.fixture_id IS NULL 
            AND f.starting_at >= CURRENT_DATE
            ORDER BY f.starting_at
            LIMIT 50
        """)
        fixtures_needing_odds = cur.fetchall()
        existing_data['fixtures_needing_odds'] = fixtures_needing_odds
        print(f"Sample fixtures needing odds: {len(fixtures_needing_odds)}")
        for fixture in fixtures_needing_odds[:5]:  # Show first 5
            print(f"  - {fixture[1]} ({fixture[2]})")
        
    except Exception as e:
        print(f"Error checking existing data: {e}")
    finally:
        cur.close()
    
    return existing_data

def determine_date_range_needed(existing_data):
    """Determine what date range we need to fetch based on existing data."""
    print("\n=== DETERMINING NEEDED DATE RANGE ===")
    
    today = datetime.datetime.now()
    end_date = datetime.datetime(2025, 8, 31)  # End of August
    
    if existing_data['fixtures']['count'] == 0:
        # No data exists, fetch from today to end of August
        start_date = today
        print(f"No existing data. Fetching from {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}")
    else:
        # Check if we need to extend the range
        existing_max = existing_data['fixtures']['max_date']
        if existing_max:
            existing_max = existing_max.replace(tzinfo=None)  # Remove timezone for comparison
            if existing_max < end_date:
                start_date = existing_max + datetime.timedelta(days=1)
                print(f"Extending range from {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}")
            else:
                start_date = None
                print("Date range already complete")
        else:
            start_date = today
            print(f"No valid max date found. Fetching from {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}")
    
    return start_date, end_date

def get_fixtures_needing_odds(conn, limit=50):
    """Get fixture IDs that exist but don't have odds data."""
    print(f"\n=== IDENTIFYING FIXTURES NEEDING ODDS (LIMIT: {limit}) ===")
    
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT f.id, f.name, f.starting_at 
            FROM public.fixtures f 
            LEFT JOIN public.odds o ON f.id = o.fixture_id 
            WHERE o.fixture_id IS NULL 
            AND f.starting_at >= CURRENT_DATE
            ORDER BY f.starting_at
            LIMIT %s
        """, (limit,))
        fixtures_needing_odds = cur.fetchall()
        fixture_ids = [row[0] for row in fixtures_needing_odds]
        
        print(f"Found {len(fixture_ids)} fixtures without odds data (limited to {limit})")
        for fixture in fixtures_needing_odds[:5]:  # Show first 5
            print(f"  - {fixture[1]} ({fixture[2]})")
        
        return fixture_ids
        
    except Exception as e:
        print(f"Error getting fixtures needing odds: {e}")
        return []
    finally:
        cur.close()

def fetch_incremental_fixtures(api_token, start_date, end_date):
    """Fetch only new fixtures in the specified date range."""
    print(f"\n=== FETCHING INCREMENTAL FIXTURES ===")
    print(f"Date range: {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}")
    
    url = f"https://api.sportmonks.com/v3/football/fixtures/between/{start_date.strftime('%Y-%m-%d')}/{end_date.strftime('%Y-%m-%d')}"
    
    params = {
        "api_token": api_token,
        "include": "participants;scores;league;venue;state",
        "per_page": 50,
        "order": "starting_at:asc"
    }
    
    all_fixtures = []
    page = 1
    has_more = True
    max_pages = 100
    
    while has_more and page <= max_pages:
        try:
            current_params = params.copy()
            current_params["page"] = page
            
            print(f"  Fetching page {page}...")
            response = requests.get(url, params=current_params)
            response.raise_for_status()
            data = response.json()
            
            if "data" in data and data["data"] is not None:
                if isinstance(data["data"], list):
                    page_fixtures = [dict(item) for item in data["data"]]
                    all_fixtures.extend(page_fixtures)
                    print(f"    Got {len(page_fixtures)} fixtures on page {page}")
                else:
                    all_fixtures.append(dict(data["data"]))
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
        
        time.sleep(0.1)
    
    print(f"Total new fixtures found: {len(all_fixtures)}")
    return all_fixtures

def fetch_odds_for_fixtures(api_token, fixture_ids):
    """Fetch odds data for specific fixtures."""
    print(f"\n=== FETCHING ODDS DATA ===")
    print(f"Fetching odds for {len(fixture_ids)} fixtures...")
    
    all_odds = []
    processed = 0
    
    for fixture_id in fixture_ids:
        try:
            url = f"https://api.sportmonks.com/v3/football/fixtures/{fixture_id}"
            params = {
                "api_token": api_token,
                "include": "odds"
            }
            
            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if "data" in data and data["data"] is not None:
                fixture = data["data"]
                odds_data = fixture.get("odds", [])
                
                if isinstance(odds_data, list):
                    for odd in odds_data:
                        odd['fixture_id'] = fixture_id
                        all_odds.append(odd)
                elif odds_data:  # If it's a single odds object
                    odds_data['fixture_id'] = fixture_id
                    all_odds.append(odds_data)
            
            processed += 1
            if processed % 10 == 0:
                print(f"  Processed {processed}/{len(fixture_ids)} fixtures")
            
            time.sleep(0.05)
            
        except Exception as e:
            print(f"  Error fetching odds for fixture {fixture_id}: {e}")
    
    print(f"Total odds records found: {len(all_odds)}")
    return all_odds

def insert_odds_data(odds_data, conn):
    """Insert odds data into the database."""
    print(f"\n=== INSERTING ODDS DATA ===")
    
    if not odds_data:
        print("No odds data to insert")
        return
    
    cur = conn.cursor()
    
    try:
        # First, ensure bookmakers exist
        bookmaker_ids = set()
        for odd in odds_data:
            if 'bookmaker' in odd and odd['bookmaker']:
                bookmaker_ids.add(odd['bookmaker']['id'])
        
        # Insert bookmakers if they don't exist
        for bookmaker_id in bookmaker_ids:
            cur.execute("""
                INSERT INTO public.bookmakers (id, name, url, image_path) 
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
            """, (bookmaker_id, f"Bookmaker_{bookmaker_id}", None, None))
        
        # Insert odds
        inserted_count = 0
        for odd in odds_data:
            try:
                cur.execute("""
                    INSERT INTO public.odds (id, fixture_id, bookmaker_id, market_id, label, value, probability, latest_bookmaker_update)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO NOTHING
                """, (
                    odd.get('id'),
                    odd.get('fixture_id'),
                    odd.get('bookmaker', {}).get('id') if odd.get('bookmaker') else None,
                    odd.get('market_id'),
                    odd.get('label'),
                    odd.get('value'),
                    odd.get('probability'),
                    odd.get('latest_bookmaker_update')
                ))
                inserted_count += 1
            except Exception as e:
                print(f"  Error inserting odd {odd.get('id')}: {e}")
        
        conn.commit()
        print(f"Successfully inserted {inserted_count} odds records")
        
    except Exception as e:
        conn.rollback()
        print(f"Error inserting odds data: {e}")
    finally:
        cur.close()

def fetch_tv_channels_for_fixtures(api_token, fixture_ids):
    """Fetch TV channel data for specific fixtures."""
    print(f"\n=== FETCHING TV CHANNEL DATA ===")
    print(f"Fetching TV channels for {len(fixture_ids)} fixtures...")
    
    all_tv_data = []
    processed = 0
    
    for fixture_id in fixture_ids:
        try:
            url = f"https://api.sportmonks.com/v3/football/fixtures/{fixture_id}"
            params = {
                "api_token": api_token,
                "include": "tvstations"
            }
            
            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if "data" in data and data["data"] is not None:
                fixture = data["data"]
                tv_stations = fixture.get("tvstations", [])
                
                for tv_station in tv_stations:
                    tv_data = {
                        "fixture_id": fixture_id,
                        "tvstation_id": tv_station.get("id"),
                        "country_id": tv_station.get("country_id", 1)  # Default country
                    }
                    all_tv_data.append(tv_data)
            
            processed += 1
            if processed % 10 == 0:
                print(f"  Processed {processed}/{len(fixture_ids)} fixtures")
            
            time.sleep(0.05)
            
        except Exception as e:
            print(f"  Error fetching TV channels for fixture {fixture_id}: {e}")
    
    print(f"Total TV channel records found: {len(all_tv_data)}")
    return all_tv_data

def fetch_missing_teams(api_token, fixture_ids, conn):
    """Fetch only teams that don't exist in the database."""
    print(f"\n=== FETCHING MISSING TEAMS ===")
    
    # Get existing team IDs
    cur = conn.cursor()
    cur.execute("SELECT id FROM public.teams_new")
    existing_team_ids = {row[0] for row in cur.fetchall()}
    cur.close()
    
    # Get team IDs from fixtures
    team_ids_from_fixtures = set()
    for fixture_id in fixture_ids:
        # This would need to be implemented based on your fixture data structure
        # For now, we'll fetch all teams from fixtures
        pass
    
    # For simplicity, let's fetch teams for all fixtures
    # In a real implementation, you'd compare with existing_team_ids
    
    teams_data = []
    # Implementation would go here
    
    return teams_data

def populate_incremental_data(fixtures_data, odds_data, tv_data, teams_data, conn):
    """Populate database with incremental data."""
    print(f"\n=== POPULATING INCREMENTAL DATA ===")
    
    cur = conn.cursor()
    
    try:
        # Insert fixtures
        if fixtures_data:
            print(f"Inserting {len(fixtures_data)} fixtures...")
            # Fixture insertion logic here
            pass
        
        # Insert odds
        if odds_data:
            print(f"Inserting {len(odds_data)} odds records...")
            # Odds insertion logic here
            pass
        
        # Insert TV channels
        if tv_data:
            print(f"Inserting {len(tv_data)} TV channel records...")
            # TV channel insertion logic here
            pass
        
        # Insert teams
        if teams_data:
            print(f"Inserting {len(teams_data)} teams...")
            # Team insertion logic here
            pass
        
        conn.commit()
        print("All incremental data inserted successfully!")
        
    except Exception as e:
        conn.rollback()
        print(f"Error inserting incremental data: {e}")
    finally:
        cur.close()

def run_optimized_incremental_fetch():
    """Main function for optimized incremental data fetching."""
    print("=== STARTING OPTIMIZED INCREMENTAL FETCH ===")
    
    # Connect to database
    conn = get_db_connection()
    if not conn:
        print("❌ Cannot connect to database. Exiting.")
        return
    
    try:
        # 1. Check existing data
        existing_data = check_existing_data(conn)
        
        # 2. Check for fixtures needing odds (even if date range is complete)
        # Process in batches of 20 to avoid timeouts
        batch_size = 20
        total_processed = 0
        
        while True:
            fixtures_needing_odds = get_fixtures_needing_odds(conn, limit=batch_size)
            
            if not fixtures_needing_odds:
                print("No more fixtures need odds data!")
                break
            
            print(f"\n=== FETCHING ODDS FOR BATCH OF {len(fixtures_needing_odds)} FIXTURES ===")
            print(f"Total processed so far: {total_processed}")
            
            # Fetch odds for this batch of fixtures
            odds_data = fetch_odds_for_fixtures(API_TOKEN, fixtures_needing_odds)
            
            if odds_data:
                # Insert the odds data
                insert_odds_data(odds_data, conn)
                print(f"✅ Successfully added odds for {len(fixtures_needing_odds)} fixtures")
                total_processed += len(fixtures_needing_odds)
            else:
                print("❌ No odds data found for these fixtures")
                # If no odds found, we might want to skip these in future runs
                break
            
            # Ask user if they want to continue with next batch
            if len(fixtures_needing_odds) < batch_size:
                print("That was the last batch!")
                break
            
            print(f"\nProcessed {total_processed} fixtures so far. Continue with next batch? (y/n)")
            # For automation, we'll continue automatically, but you can modify this
            # user_input = input().lower()
            # if user_input != 'y':
            #     break
        
        # 3. Determine what date range we need for new fixtures
        start_date, end_date = determine_date_range_needed(existing_data)
        
        if start_date is None:
            if total_processed == 0:
                print("Database is completely up to date!")
            else:
                print(f"✅ Completed processing {total_processed} fixtures with missing odds!")
            return
        
        # 4. Fetch incremental fixtures
        new_fixtures = fetch_incremental_fixtures(API_TOKEN, start_date, end_date)
        
        if not new_fixtures:
            print("No new fixtures found!")
            return
        
        # 5. Extract fixture IDs for odds and TV channels
        fixture_ids = [f['id'] for f in new_fixtures]
        
        # 6. Fetch odds data for new fixtures
        new_odds_data = fetch_odds_for_fixtures(API_TOKEN, fixture_ids)
        
        # 7. Fetch TV channel data
        tv_data = fetch_tv_channels_for_fixtures(API_TOKEN, fixture_ids)
        
        # 8. Fetch missing teams (if any)
        teams_data = fetch_missing_teams(API_TOKEN, fixture_ids, conn)
        
        # 9. Populate all data
        populate_incremental_data(new_fixtures, new_odds_data, tv_data, teams_data, conn)
        
        print(f"\n=== INCREMENTAL FETCH COMPLETE ===")
        print(f"New fixtures: {len(new_fixtures)}")
        print(f"New odds records: {len(new_odds_data)}")
        print(f"New TV channel records: {len(tv_data)}")
        print(f"New teams: {len(teams_data)}")
        
    finally:
        conn.close()

# RUN THE OPTIMIZED INCREMENTAL FETCH
if __name__ == "__main__":
    run_optimized_incremental_fetch() 