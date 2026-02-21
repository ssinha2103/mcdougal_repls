"""
Geocoding service - ZIP to lat/lng using local CSV
"""
from pathlib import Path
from typing import Optional, Tuple
import csv

# Cache ZIP data in memory
_zip_cache = {}


def load_zip_data():
    """Load Ohio ZIP code data into memory cache"""
    global _zip_cache
    
    if _zip_cache:
        return  # Already loaded
    
    zip_file = Path("data/zips_ohio.csv")
    if not zip_file.exists():
        print(f"Warning: {zip_file} not found")
        return
    
    with open(zip_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            zip_code = row['zip'].strip()
            _zip_cache[zip_code] = {
                'lat': float(row['lat']),
                'lng': float(row['lng']),
                'city': row['city'],
                'county': row['county']
            }
    
    print(f"✓ Loaded {len(_zip_cache)} Ohio ZIP codes")


def geocode_zip(zip_code: str) -> Optional[Tuple[float, float, str, str]]:
    """
    Convert ZIP code to (lat, lng, city, county)
    Returns None if ZIP not found
    """
    if not _zip_cache:
        load_zip_data()
    
    zip_clean = zip_code.strip()
    data = _zip_cache.get(zip_clean)
    
    if data:
        return (data['lat'], data['lng'], data['city'], data['county'])
    
    return None
