import os
import psycopg
from datetime import datetime, timedelta

# Database configuration
DB_HOST = os.getenv('DB_HOST', 'db.xxxxxxxxxxxxx.supabase.co')
DB_NAME = os.getenv('DB_NAME', 'postgres')
DB_USER = os.getenv('DB_USER', 'postgres')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'your_password_here')
DB_PORT = os.getenv('DB_PORT', '5432')

def get_db_connection():
    """Create a database connection."""
    try:
        conn = psycopg.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT
        )
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None

def check_fixtures_in_database():
    """Check what fixtures are actually in the database."""
    print("=== CHECKING FIXTURES IN DATABASE ===")
    
    conn = get_db_connection()
    if not conn:
        print("❌ Failed to connect to database")
        return
    
    try:
        cur = conn.cursor()
        
        # Count total fixtures
        cur.execute("SELECT COUNT(*) FROM public.fixtures")
        total_fixtures = cur.fetchone()[0]
        print(f"Total fixtures in database: {total_fixtures}")
        
        # Check date range
        cur.execute("SELECT MIN(starting_at), MAX(starting_at) FROM public.fixtures")
        date_range = cur.fetchone()
        print(f"Date range: {date_range[0]} to {date_range[1]}")
        
        # Check fixtures from the last 7 days
        seven_days_ago = datetime.now() - timedelta(days=7)
        cur.execute("""
            SELECT COUNT(*) FROM public.fixtures 
            WHERE starting_at >= %s
        """, (seven_days_ago,))
        recent_fixtures = cur.fetchone()[0]
        print(f"Fixtures from last 7 days: {recent_fixtures}")
        
        # Show the 10 most recent fixtures
        print(f"\n=== 10 MOST RECENT FIXTURES ===")
        cur.execute("""
            SELECT 
                id,
                name,
                starting_at,
                home_score,
                away_score,
                league_id
            FROM public.fixtures 
            ORDER BY starting_at DESC
            LIMIT 10
        """)
        
        recent_fixtures = cur.fetchall()
        for fixture in recent_fixtures:
            fixture_id, name, starting_at, home_score, away_score, league_id = fixture
            score_str = f"{home_score}-{away_score}" if home_score is not None and away_score is not None else "No score"
            print(f"ID: {fixture_id} | {name} | {starting_at} | Score: {score_str} | League: {league_id}")
        
        # Check if we have any fixtures from July 2025 onwards
        july_2025 = datetime(2025, 7, 1)
        cur.execute("""
            SELECT COUNT(*) FROM public.fixtures 
            WHERE starting_at >= %s
        """, (july_2025,))
        july_fixtures = cur.fetchone()[0]
        print(f"\nFixtures from July 2025 onwards: {july_fixtures}")
        
        if july_fixtures > 0:
            print(f"\n=== SAMPLE JULY 2025+ FIXTURES ===")
            cur.execute("""
                SELECT 
                    id,
                    name,
                    starting_at,
                    home_score,
                    away_score,
                    league_id
                FROM public.fixtures 
                WHERE starting_at >= %s
                ORDER BY starting_at DESC
                LIMIT 5
            """, (july_2025,))
            
            july_fixtures = cur.fetchall()
            for fixture in july_fixtures:
                fixture_id, name, starting_at, home_score, away_score, league_id = fixture
                score_str = f"{home_score}-{away_score}" if home_score is not None and away_score is not None else "No score"
                print(f"ID: {fixture_id} | {name} | {starting_at} | Score: {score_str} | League: {league_id}")
        
    except Exception as e:
        print(f"Error querying database: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    check_fixtures_in_database() 