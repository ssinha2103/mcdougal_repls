"""
Script to add lat/long coordinates to the Ohio maternal health hospital data.
Uses free geocoding via Nominatim (OpenStreetMap) or falls back to Ohio city coordinates.
"""

import os
import csv
import time
import requests
from typing import Dict, Tuple, Optional

INPUT_FILE = "data/maternal_health_hospital.csv"
OUTPUT_FILE = "data/maternal_health_hospital_geocoded.csv"

OHIO_CITY_COORDS = {
    "COLUMBUS": (39.9612, -82.9988),
    "CLEVELAND": (41.4993, -81.6944),
    "CINCINNATI": (39.1031, -84.5120),
    "TOLEDO": (41.6528, -83.5379),
    "AKRON": (41.0814, -81.5190),
    "DAYTON": (39.7589, -84.1916),
    "YOUNGSTOWN": (41.0998, -80.6495),
    "CANTON": (40.7989, -81.3784),
    "LORAIN": (41.4528, -82.1824),
    "HAMILTON": (39.3995, -84.5613),
    "SPRINGFIELD": (39.9242, -83.8088),
    "KETTERING": (39.6895, -84.1688),
    "ELYRIA": (41.3684, -82.1076),
    "LAKEWOOD": (41.4819, -81.7982),
    "MANSFIELD": (40.7589, -82.5154),
    "NEWARK": (40.0581, -82.4013),
    "LIMA": (40.7425, -84.1052),
    "MARION": (40.5887, -83.1285),
    "ZANESVILLE": (39.9403, -82.0132),
    "PORTSMOUTH": (38.7318, -82.9977),
    "ASHLAND": (40.8687, -82.3182),
    "WESTERVILLE": (40.1262, -82.9291),
    "SIDNEY": (40.2845, -84.1555),
    "DOVER": (40.5206, -81.4740),
    "BOAZ": (34.2176, -86.1577),
    "FLORENCE": (39.0164, -84.6264),
    "FINDLAY": (41.0442, -83.6499),
    "ALLIANCE": (40.9153, -81.1062),
    "BARBERTON": (41.0128, -81.6051),
    "BEREA": (41.3661, -81.8543),
    "CAMBRIDGE": (40.0317, -81.5884),
    "CHILLICOTHE": (39.3331, -82.9824),
    "COSHOCTON": (40.2720, -81.8596),
    "DEFIANCE": (41.2845, -84.3558),
    "FREMONT": (41.3503, -83.1219),
    "GALION": (40.7336, -82.7888),
    "GREENVILLE": (40.1028, -84.6330),
    "MIDDLETOWN": (39.5150, -84.3983),
    "MOUNT VERNON": (40.3934, -82.4857),
    "NAPOLEON": (41.3923, -84.1263),
    "NORWALK": (41.2425, -82.6157),
    "SANDUSKY": (41.4489, -82.7079),
    "SHELBY": (40.8814, -82.6616),
    "STEUBENVILLE": (40.3698, -80.6340),
    "TIFFIN": (41.1145, -83.1780),
    "TROY": (40.0392, -84.2033),
    "VAN WERT": (40.8695, -84.5841),
    "WARREN": (41.2378, -80.8184),
    "WASHINGTON COURT HOUSE": (39.5367, -83.4388),
    "WILMINGTON": (39.4453, -83.8286),
    "WOOSTER": (40.8050, -81.9351),
    "XENIA": (39.6845, -83.9296),
}

geocode_cache: Dict[str, Tuple[float, float]] = {}


def geocode_address(address: str, city: str, state: str, zip_code: str) -> Optional[Tuple[float, float]]:
    """
    Geocode an address using Nominatim (OpenStreetMap).
    Returns (lat, lon) or None if geocoding fails.
    """
    cache_key = f"{address}|{city}|{state}|{zip_code}"
    if cache_key in geocode_cache:
        return geocode_cache[cache_key]
    
    full_address = f"{address}, {city}, {state} {zip_code}"
    
    try:
        url = "https://nominatim.openstreetmap.org/search"
        params = {
            "q": full_address,
            "format": "json",
            "limit": 1,
            "countrycodes": "us"
        }
        headers = {
            "User-Agent": "OhioMaternityCare/1.0 (ohio-maternity-finder)"
        }
        
        resp = requests.get(url, params=params, headers=headers, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        
        if data and len(data) > 0:
            lat = float(data[0]["lat"])
            lon = float(data[0]["lon"])
            geocode_cache[cache_key] = (lat, lon)
            return (lat, lon)
    except Exception as e:
        pass
    
    city_upper = city.strip().upper()
    if city_upper in OHIO_CITY_COORDS:
        coords = OHIO_CITY_COORDS[city_upper]
        geocode_cache[cache_key] = coords
        return coords
    
    return None


def add_geocoding_to_csv():
    """
    Read the maternal health CSV, add lat/lon columns, and save to a new file.
    """
    if not os.path.exists(INPUT_FILE):
        print(f"ERROR: Input file not found: {INPUT_FILE}")
        print("Please run download_ohio_maternal_data.py first.")
        return
    
    print(f"Reading {INPUT_FILE}...")
    
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        fieldnames = list(reader.fieldnames) + ["geo_lat", "geo_lon"]
        rows = list(reader)
    
    print(f"Found {len(rows)} rows")
    
    unique_hospitals: Dict[str, dict] = {}
    for row in rows:
        facility_id = row.get("Facility ID", "").strip()
        if facility_id and facility_id not in unique_hospitals:
            unique_hospitals[facility_id] = row
    
    print(f"Found {len(unique_hospitals)} unique hospitals to geocode")
    
    geocoded_coords: Dict[str, Tuple[float, float]] = {}
    
    for i, (facility_id, hospital) in enumerate(unique_hospitals.items()):
        address = hospital.get("Address", "").strip()
        city = hospital.get("City/Town", "").strip()
        state = hospital.get("State", "").strip()
        zip_code = hospital.get("ZIP Code", "").strip()
        name = hospital.get("Facility Name", "").strip()
        
        coords = geocode_address(address, city, state, zip_code)
        
        if coords:
            geocoded_coords[facility_id] = coords
            print(f"  [{i+1}/{len(unique_hospitals)}] {name}: {coords[0]:.5f}, {coords[1]:.5f}")
        else:
            print(f"  [{i+1}/{len(unique_hospitals)}] {name}: FAILED - using city center")
            city_upper = city.upper()
            if city_upper in OHIO_CITY_COORDS:
                geocoded_coords[facility_id] = OHIO_CITY_COORDS[city_upper]
        
        time.sleep(1.1)
    
    print(f"\nGeocoded {len(geocoded_coords)} hospitals")
    
    output_rows = []
    for row in rows:
        facility_id = row.get("Facility ID", "").strip()
        coords = geocoded_coords.get(facility_id, (None, None))
        row["geo_lat"] = coords[0] if coords[0] else ""
        row["geo_lon"] = coords[1] if coords[1] else ""
        output_rows.append(row)
    
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    
    with open(OUTPUT_FILE, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(output_rows)
    
    print(f"\nSaved geocoded data to {OUTPUT_FILE}")
    print(f"Total rows: {len(output_rows)}")
    
    with_coords = sum(1 for r in output_rows if r.get("geo_lat"))
    print(f"Rows with coordinates: {with_coords}")


def main():
    print("=== Adding geocoding to Ohio maternal health data ===")
    print()
    add_geocoding_to_csv()
    print("\nDone!")


if __name__ == "__main__":
    main()
