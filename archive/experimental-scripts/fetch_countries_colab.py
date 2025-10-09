# FETCH COUNTRIES DATA FROM SPORTMONKS API
# ===========================================
# This script fetches all countries from the SportMonks API and populates the countries table
# Run this as a separate cell in your Colab notebook

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

print("=== COUNTRIES DATA FETCH ===")
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

def fetch_all_countries(api_token):
    """Fetch all countries from the SportMonks API."""
    print(f"\n=== FETCHING ALL COUNTRIES ===")
    
    url = "https://api.sportmonks.com/v3/football/leagues"
    
    params = {
        "api_token": api_token,
        "include": "country",
        "per_page": 100,  # Maximum allowed per page
        "order": "name:asc"
    }
    
    all_countries = {}
    page = 1
    has_more = True
    max_pages = 50  # Limit to prevent infinite loops
    
    while has_more and page <= max_pages:
        try:
            current_params = params.copy()
            current_params["page"] = page
            
            print(f"  Fetching countries from page {page}...")
            response = requests.get(url, params=current_params)
            response.raise_for_status()
            data = response.json()
            
            if "data" in data and data["data"] is not None:
                leagues = data["data"]
                print(f"    Got {len(leagues)} leagues on page {page}")
                
                # Extract unique countries from leagues
                for league in leagues:
                    if "country" in league and league["country"]:
                        country = league["country"]
                        country_id = country["id"]
                        
                        # Only add if not already in our collection
                        if country_id not in all_countries:
                            all_countries[country_id] = {
                                "id": country["id"],
                                "name": country["name"],
                                "official_name": country.get("official_name"),
                                "fifa_name": country.get("fifa_name"),
                                "iso2": country.get("iso2"),
                                "iso3": country.get("iso3"),
                                "continent_id": country.get("continent_id"),
                                "latitude": country.get("latitude"),
                                "longitude": country.get("longitude"),
                                "flag_url": country.get("image_path"),
                                "borders": country.get("borders", [])
                            }
                            print(f"    ✅ Added country: {country['name']} (ID: {country_id})")
            
            # Check pagination
            if "pagination" in data and data["pagination"] is not None:
                has_more = data["pagination"].get("has_more", False)
                page += 1
            else:
                has_more = False
                
        except Exception as e:
            print(f"  ERROR: Error fetching page {page}: {e}")
            break
        
        time.sleep(0.1)  # Rate limiting
    
    print(f"\n=== COUNTRIES FETCH SUMMARY ===")
    print(f"Total unique countries found: {len(all_countries)}")
    
    # Show sample countries
    print(f"\nSample countries:")
    for i, (country_id, country) in enumerate(list(all_countries.items())[:10]):
        print(f"  {country_id}: {country['name']} ({country['fifa_name']}) - Flag: {country['flag_url']}")
    
    if len(all_countries) > 10:
        print(f"  ... and {len(all_countries) - 10} more countries")
    
    return list(all_countries.values())

def populate_countries_data(countries_data, conn):
    """Populate countries table with country data."""
    if not conn or not countries_data:
        return
    
    cur = conn.cursor()
    print("Populating Countries Data...")
    
    # First, let's check what columns exist in the countries table
    check_columns_query = """
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'countries' AND table_schema = 'public'
    ORDER BY ordinal_position;
    """
    
    try:
        cur.execute(check_columns_query)
        existing_columns = cur.fetchall()
        print("Existing columns in countries table:")
        for col in existing_columns:
            print(f"  - {col[0]}: {col[1]}")
        
        # Check if we need to add missing columns
        existing_column_names = [col[0] for col in existing_columns]
        
        # Add missing columns if needed
        if 'official_name' not in existing_column_names:
            cur.execute("ALTER TABLE public.countries ADD COLUMN official_name VARCHAR(255);")
            print("Added official_name column")
        
        if 'fifa_name' not in existing_column_names:
            cur.execute("ALTER TABLE public.countries ADD COLUMN fifa_name VARCHAR(10);")
            print("Added fifa_name column")
        
        if 'iso2' not in existing_column_names:
            cur.execute("ALTER TABLE public.countries ADD COLUMN iso2 VARCHAR(2);")
            print("Added iso2 column")
        
        if 'iso3' not in existing_column_names:
            cur.execute("ALTER TABLE public.countries ADD COLUMN iso3 VARCHAR(3);")
            print("Added iso3 column")
        
        if 'continent_id' not in existing_column_names:
            cur.execute("ALTER TABLE public.countries ADD COLUMN continent_id INTEGER;")
            print("Added continent_id column")
        
        if 'latitude' not in existing_column_names:
            cur.execute("ALTER TABLE public.countries ADD COLUMN latitude DECIMAL(10, 8);")
            print("Added latitude column")
        
        if 'longitude' not in existing_column_names:
            cur.execute("ALTER TABLE public.countries ADD COLUMN longitude DECIMAL(11, 8);")
            print("Added longitude column")
        
        if 'flag_url' not in existing_column_names:
            cur.execute("ALTER TABLE public.countries ADD COLUMN flag_url TEXT;")
            print("Added flag_url column")
        
        if 'borders' not in existing_column_names:
            cur.execute("ALTER TABLE public.countries ADD COLUMN borders TEXT[];")
            print("Added borders column")
        
        conn.commit()
        print("Table structure updated successfully.")
        
    except Exception as e:
        print(f"Error checking/updating table structure: {e}")
        # If table doesn't exist, create it
        create_table_query = """
        CREATE TABLE IF NOT EXISTS public.countries (
            id INTEGER PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            official_name VARCHAR(255),
            fifa_name VARCHAR(10),
            iso2 VARCHAR(2),
            iso3 VARCHAR(3),
            continent_id INTEGER,
            latitude DECIMAL(10, 8),
            longitude DECIMAL(11, 8),
            flag_url TEXT,
            borders TEXT[],
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        """
    
    try:
        cur.execute(create_table_query)
        conn.commit()
        print("✅ Countries table created/verified successfully.")
    except Exception as e:
        conn.rollback()
        print(f"❌ Error creating countries table: {e}")
        return
    
    # Insert/update countries data
    insert_query = """
    INSERT INTO public.countries (
        id, name, official_name, fifa_name, iso2, iso3, 
        continent_id, latitude, longitude, flag_url, borders
    )
    VALUES (
        %(id)s, %(name)s, %(official_name)s, %(fifa_name)s, %(iso2)s, %(iso3)s,
        %(continent_id)s, %(latitude)s, %(longitude)s, %(flag_url)s, %(borders)s
    )
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        official_name = EXCLUDED.official_name,
        fifa_name = EXCLUDED.fifa_name,
        iso2 = EXCLUDED.iso2,
        iso3 = EXCLUDED.iso3,
        continent_id = EXCLUDED.continent_id,
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        flag_url = EXCLUDED.flag_url,
        borders = EXCLUDED.borders,
        updated_at = NOW();
    """
    
    try:
        cur.executemany(insert_query, countries_data)
        conn.commit()
        print(f"✅ Successfully inserted/updated {len(countries_data)} countries.")
    except Exception as e:
        conn.rollback()
        print(f"❌ Error inserting countries: {e}")
    finally:
        cur.close()

def verify_countries_data(conn):
    """Verify that countries data was inserted correctly."""
    if not conn:
        return
    
    cur = conn.cursor()
    print("\n=== VERIFYING COUNTRIES DATA ===")
    
    try:
        # Count total countries
        cur.execute("SELECT COUNT(*) FROM public.countries;")
        total_count = cur.fetchone()[0]
        print(f"Total countries in database: {total_count}")
        
        # Show sample countries with flags
        cur.execute("""
            SELECT id, name, fifa_name, flag_url 
            FROM public.countries 
            ORDER BY name 
            LIMIT 10;
        """)
        sample_countries = cur.fetchall()
        
        print(f"\nSample countries in database:")
        for country in sample_countries:
            country_id, name, fifa_name, flag_url = country
            print(f"  {country_id}: {name} ({fifa_name}) - Flag: {flag_url}")
        
        # Check for countries with flags
        cur.execute("SELECT COUNT(*) FROM public.countries WHERE flag_url IS NOT NULL;")
        countries_with_flags = cur.fetchone()[0]
        print(f"\nCountries with flags: {countries_with_flags}")
        
    except Exception as e:
        print(f"❌ Error verifying countries data: {e}")
    finally:
        cur.close()

def run_countries_fetch():
    """Main function to fetch and populate countries data."""
    print("=== STARTING COUNTRIES DATA FETCH ===")
    
    # Test database connection first
    test_conn = get_db_connection()
    if not test_conn:
        print("❌ Database connection test: FAILED")
        return
    
    test_conn.close()
    print("✅ Database connection test: SUCCESS")
    
    # Fetch all countries
    countries_data = fetch_all_countries(API_TOKEN)
    
    if not countries_data:
        print("❌ No countries found. Exiting.")
        return
    
    # Save to database
    conn = get_db_connection()
    if conn:
        try:
            print(f"\n=== SAVING COUNTRIES TO DATABASE ===")
            populate_countries_data(countries_data, conn)
            verify_countries_data(conn)
            
            print(f"\n=== COUNTRIES DATA FETCH COMPLETED ===")
            print(f"✅ Total countries processed: {len(countries_data)}")
            
        finally:
            conn.close()
            print("Database connection closed.")
    else:
        print("❌ Failed to connect to database for saving data.")

# RUN THE COUNTRIES DATA FETCH
if __name__ == "__main__":
    run_countries_fetch() 