# SIMPLIFIED COUNTRIES DATA FETCH
# ===============================
# This script fetches countries and handles existing table structure

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

print("=== SIMPLIFIED COUNTRIES DATA FETCH ===")
print("Configuration Loaded!")

def get_db_connection():
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
    print("=== FETCHING ALL COUNTRIES ===")
    
    url = "https://api.sportmonks.com/v3/football/leagues"
    
    params = {
        "api_token": api_token,
        "include": "country",
        "per_page": 100,
        "order": "name:asc"
    }
    
    all_countries = {}
    page = 1
    has_more = True
    max_pages = 50
    
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
                
                for league in leagues:
                    if "country" in league and league["country"]:
                        country = league["country"]
                        country_id = country["id"]
                        
                        if country_id not in all_countries:
                            all_countries[country_id] = {
                                "id": country["id"],
                                "name": country["name"],
                                "image_path": country.get("image_path")
                            }
                            print(f"    Added country: {country['name']} (ID: {country_id})")
            
            if "pagination" in data and data["pagination"] is not None:
                has_more = data["pagination"].get("has_more", False)
                page += 1
            else:
                has_more = False
                
        except Exception as e:
            print(f"  ERROR: Error fetching page {page}: {e}")
            break
        
        time.sleep(0.1)
    
    print(f"Total unique countries found: {len(all_countries)}")
    return list(all_countries.values())

def populate_countries_data(countries_data, conn):
    if not conn or not countries_data:
        return
    
    cur = conn.cursor()
    print("Populating Countries Data...")
    
    # Simple insert/update with only basic fields
    insert_query = """
    INSERT INTO public.countries (id, name, image_path)
    VALUES (%(id)s, %(name)s, %(image_path)s)
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        image_path = EXCLUDED.image_path;
    """
    
    try:
        cur.executemany(insert_query, countries_data)
        conn.commit()
        print(f"Successfully inserted/updated {len(countries_data)} countries.")
    except Exception as e:
        conn.rollback()
        print(f"Error inserting countries: {e}")
    finally:
        cur.close()

def verify_countries_data(conn):
    if not conn:
        return
    
    cur = conn.cursor()
    print("=== VERIFYING COUNTRIES DATA ===")
    
    try:
        cur.execute("SELECT COUNT(*) FROM public.countries;")
        total_count = cur.fetchone()[0]
        print(f"Total countries in database: {total_count}")
        
        cur.execute("""
            SELECT id, name, image_path 
            FROM public.countries 
            ORDER BY name 
            LIMIT 10;
        """)
        sample_countries = cur.fetchall()
        
        print("Sample countries in database:")
        for country in sample_countries:
            country_id, name, image_path = country
            print(f"  {country_id}: {name} - Flag: {image_path}")
        
        cur.execute("SELECT COUNT(*) FROM public.countries WHERE image_path IS NOT NULL;")
        countries_with_flags = cur.fetchone()[0]
        print(f"Countries with flags: {countries_with_flags}")
        
    except Exception as e:
        print(f"Error verifying countries data: {e}")
    finally:
        cur.close()

def run_countries_fetch():
    print("=== STARTING COUNTRIES DATA FETCH ===")
    
    test_conn = get_db_connection()
    if not test_conn:
        print("Database connection test: FAILED")
        return
    
    test_conn.close()
    print("Database connection test: SUCCESS")
    
    countries_data = fetch_all_countries(API_TOKEN)
    
    if not countries_data:
        print("No countries found. Exiting.")
        return
    
    conn = get_db_connection()
    if conn:
        try:
            print("=== SAVING COUNTRIES TO DATABASE ===")
            populate_countries_data(countries_data, conn)
            verify_countries_data(conn)
            
            print("=== COUNTRIES DATA FETCH COMPLETED ===")
            print(f"Total countries processed: {len(countries_data)}")
            
        finally:
            conn.close()
            print("Database connection closed.")
    else:
        print("Failed to connect to database for saving data.")

if __name__ == "__main__":
    run_countries_fetch() 