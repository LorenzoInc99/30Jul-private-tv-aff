import requests
import datetime

# Your API token
API_TOKEN = "9RRfkWhjMRyWiIpf5Z7VOIARU8JsTZuXvvhZ26pU6G05Ntl5WueQhd5fptVY"

def test_serie_a_broader_range():
    """Test Serie A fixtures in a broader date range."""
    print("=== TESTING SERIE A IN BROADER DATE RANGE ===")
    
    # Test multiple date ranges
    date_ranges = [
        ("2025-08-01", "2025-08-31", "August 2025"),
        ("2025-09-01", "2025-09-30", "September 2025"),
        ("2025-10-01", "2025-10-31", "October 2025"),
        ("2025-07-01", "2025-12-31", "July-December 2025"),
        ("2024-08-01", "2024-08-31", "August 2024 (last year)"),
    ]
    
    for start_date_str, end_date_str, description in date_ranges:
        print(f"\n--- Testing {description} ({start_date_str} to {end_date_str}) ---")
        
        url = f"https://api.sportmonks.com/v3/football/fixtures/between/{start_date_str}/{end_date_str}"
        
        params = {
            "api_token": API_TOKEN,
            "include": "league",
            "per_page": 50,
            "order": "starting_at:asc"
        }
        
        try:
            response = requests.get(url, params=params)
            print(f"API status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                
                if "data" in data and data["data"] is not None:
                    fixtures = data["data"]
                    if isinstance(fixtures, list):
                        print(f"Found {len(fixtures)} total fixtures")
                        
                        # Look for Serie A fixtures
                        serie_a_fixtures = []
                        for fixture in fixtures:
                            league_data = fixture.get("league", {})
                            if league_data and league_data.get("id") == 384:
                                serie_a_fixtures.append(fixture)
                        
                        print(f"Found {len(serie_a_fixtures)} Serie A fixtures")
                        
                        if serie_a_fixtures:
                            print("Serie A fixtures found:")
                            for fixture in serie_a_fixtures[:3]:  # Show first 3
                                name = fixture.get("name")
                                starting_at = fixture.get("starting_at")
                                print(f"  - {name} | {starting_at}")
                        else:
                            print("❌ No Serie A fixtures in this range")
                    else:
                        print("Single fixture response")
                else:
                    print("No fixtures data in response")
            else:
                print(f"❌ API failed: {response.text}")
                
        except Exception as e:
            print(f"❌ Error: {e}")
        
        # Rate limiting
        import time
        time.sleep(0.5)

def test_serie_a_seasons():
    """Test if Serie A has any seasons/fixtures at all."""
    print(f"\n=== TESTING SERIE A SEASONS ===")
    
    # Test Serie A seasons
    url = "https://api.sportmonks.com/v3/football/leagues/384/seasons"
    params = {"api_token": API_TOKEN}
    
    try:
        response = requests.get(url, params=params)
        print(f"Serie A seasons API status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            if "data" in data and data["data"] is not None:
                seasons = data["data"]
                if isinstance(seasons, list):
                    print(f"Found {len(seasons)} Serie A seasons")
                    
                    for season in seasons[:5]:  # Show first 5
                        season_id = season.get("id")
                        name = season.get("name")
                        year = season.get("year")
                        print(f"  Season {season_id}: {name} (Year: {year})")
                        
                        # Test fixtures for this season
                        if season_id:
                            test_season_fixtures(season_id, name)
                else:
                    print("Single season response")
            else:
                print("No seasons data in response")
        else:
            print(f"❌ Seasons API failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Error checking seasons: {e}")

def test_season_fixtures(season_id, season_name):
    """Test fixtures for a specific season."""
    print(f"  Testing fixtures for {season_name} (ID: {season_id})...")
    
    url = f"https://api.sportmonks.com/v3/football/seasons/{season_id}/fixtures"
    params = {
        "api_token": API_TOKEN,
        "include": "participants;scores",
        "per_page": 20
    }
    
    try:
        response = requests.get(url, params=params)
        print(f"    Season fixtures API status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            if "data" in data and data["data"] is not None:
                fixtures = data["data"]
                if isinstance(fixtures, list):
                    print(f"    Found {len(fixtures)} fixtures in this season")
                    
                    if fixtures:
                        print("    Sample fixtures:")
                        for fixture in fixtures[:3]:  # Show first 3
                            name = fixture.get("name")
                            starting_at = fixture.get("starting_at")
                            print(f"      - {name} | {starting_at}")
                else:
                    print("    Single fixture response")
            else:
                print("    No fixtures data in response")
        else:
            print(f"    ❌ Season fixtures API failed: {response.text}")
            
    except Exception as e:
        print(f"    ❌ Error: {e}")

if __name__ == "__main__":
    test_serie_a_broader_range()
    test_serie_a_seasons() 