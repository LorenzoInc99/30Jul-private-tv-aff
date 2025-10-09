# TEST SCRIPT - FETCH ODDS FOR A FEW FIXTURES

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

def get_test_fixtures(conn, limit=5):
    """Get just a few fixture IDs that don't have odds data for testing."""
    print(f"\n=== GETTING {limit} TEST FIXTURES ===")
    
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
        fixtures = cur.fetchall()
        fixture_ids = [row[0] for row in fixtures]
        
        print(f"Found {len(fixture_ids)} test fixtures:")
        for fixture in fixtures:
            print(f"  - {fixture[1]} ({fixture[2]})")
        
        return fixture_ids
        
    except Exception as e:
        print(f"Error getting test fixtures: {e}")
        return []
    finally:
        cur.close()

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
            
            print(f"  Fetching odds for fixture {fixture_id}...")
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
                    print(f"    Found {len(odds_data)} odds records")
                elif odds_data:  # If it's a single odds object
                    odds_data['fixture_id'] = fixture_id
                    all_odds.append(odds_data)
                    print(f"    Found 1 odds record")
                else:
                    print(f"    No odds data found")
            else:
                print(f"    No odds data found")
            
            processed += 1
            time.sleep(0.1)  # Small delay between requests
            
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
            try:
                cur.execute("""
                    INSERT INTO public.bookmakers (id, name, url, image_path) 
                    VALUES (%s, %s, %s, %s)
                    ON CONFLICT (id) DO NOTHING
                """, (bookmaker_id, f"Bookmaker_{bookmaker_id}", None, None))
            except Exception as e:
                print(f"  Warning: Error inserting bookmaker {bookmaker_id}: {e}")
        
        # Insert odds one by one to avoid transaction issues
        inserted_count = 0
        for odd in odds_data:
            try:
                # Start a new transaction for each odd
                cur.execute("BEGIN")
                
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
                
                cur.execute("COMMIT")
                inserted_count += 1
                
            except Exception as e:
                cur.execute("ROLLBACK")
                print(f"  Error inserting odd {odd.get('id')}: {e}")
        
        print(f"Successfully inserted {inserted_count} odds records")
        
    except Exception as e:
        print(f"Error in odds insertion: {e}")
    finally:
        cur.close()

def run_test():
    """Test function to fetch odds for just a few fixtures."""
    print("=== TESTING ODDS FETCH ===")
    
    # Connect to database
    conn = get_db_connection()
    if not conn:
        print("❌ Cannot connect to database. Exiting.")
        return
    
    try:
        # Get test fixtures
        test_fixtures = get_test_fixtures(conn, limit=5)
        
        if not test_fixtures:
            print("No test fixtures found!")
            return
        
        # Fetch odds for test fixtures
        odds_data = fetch_odds_for_fixtures(API_TOKEN, test_fixtures)
        
        if odds_data:
            # Insert the odds data
            insert_odds_data(odds_data, conn)
            print(f"✅ Successfully added odds for {len(test_fixtures)} test fixtures")
        else:
            print("❌ No odds data found for test fixtures")
        
    finally:
        conn.close()

if __name__ == "__main__":
    run_test() 