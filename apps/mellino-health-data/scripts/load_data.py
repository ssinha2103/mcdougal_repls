#!/usr/bin/env python3
"""
Load Ohio maternity hospital data from CSV into SQLite database.
Reads data/ohio_maternity_hospitals.csv and populates maternity_hospitals.db
"""

import csv
import sqlite3
from pathlib import Path

CSV_PATH = "data/ohio_maternity_hospitals.csv"
DB_PATH = "maternity_hospitals.db"

# Hospitals to filter out (not providing inpatient labor/delivery care)
FILTER_OUT_SM7 = "Not Applicable (our hospital does not provide inpatient labor/delivery care)"


def load_csv_data():
    """Read and parse the CSV file."""
    hospitals = []
    
    with open(CSV_PATH, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Filter out non-maternity hospitals
            sm_7 = row['SM_7'].strip() if row['SM_7'] else ""
            if sm_7 == FILTER_OUT_SM7:
                continue
            
            hospitals.append(row)
    
    return hospitals


def convert_birthing_friendly(sm_7_value):
    """Convert SM_7 value to is_birthing_friendly integer."""
    if not sm_7_value:
        return 0
    value = sm_7_value.strip()
    return 1 if value == "Yes" else 0


def convert_geo_value(geo_value):
    """Convert empty geo value to None (NULL)."""
    if not geo_value or geo_value.strip() == "":
        return None
    try:
        return float(geo_value)
    except (ValueError, TypeError):
        return None


def create_database(hospitals):
    """Create the database and populate it with hospital data."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Drop existing table if it exists
    cursor.execute("DROP TABLE IF EXISTS maternity_hospitals")
    
    # Create table with the required schema
    cursor.execute("""
        CREATE TABLE maternity_hospitals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            facility_id TEXT,
            facility_name TEXT,
            address TEXT,
            city TEXT,
            state TEXT,
            zip_code TEXT,
            county TEXT,
            phone TEXT,
            cesarean_rate TEXT,
            smm_rate TEXT,
            smm_rate_excl_transfusion TEXT,
            is_birthing_friendly INTEGER,
            geo_lat REAL,
            geo_lng REAL
        )
    """)
    
    # Insert hospital data
    for hospital in hospitals:
        cursor.execute("""
            INSERT INTO maternity_hospitals 
            (facility_id, facility_name, address, city, state, zip_code, county, phone,
             cesarean_rate, smm_rate, smm_rate_excl_transfusion, is_birthing_friendly,
             geo_lat, geo_lng)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            hospital['Facility ID'],
            hospital['Facility Name'],
            hospital['Address'],
            hospital['City/Town'],
            hospital['State'],
            hospital['ZIP Code'],
            hospital['County/Parish'],
            hospital['Telephone Number'],
            hospital['PC_02'],
            hospital['PC_07a'],
            hospital['PC_07b'],
            convert_birthing_friendly(hospital['SM_7']),
            convert_geo_value(hospital['geo_lat']),
            convert_geo_value(hospital['geo_lng'])
        ))
    
    conn.commit()
    conn.close()


def verify_database():
    """Verify the database was loaded correctly."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM maternity_hospitals")
    total_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM maternity_hospitals WHERE is_birthing_friendly = 1")
    birthing_friendly_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM maternity_hospitals WHERE geo_lat IS NOT NULL AND geo_lng IS NOT NULL")
    geocoded_count = cursor.fetchone()[0]
    
    conn.close()
    
    return {
        'total': total_count,
        'birthing_friendly': birthing_friendly_count,
        'geocoded': geocoded_count
    }


def main():
    print("=" * 60)
    print("Ohio Maternity Care Finder - Data Load")
    print("=" * 60)
    print()
    
    # Check if CSV exists
    if not Path(CSV_PATH).exists():
        print(f"ERROR: CSV file not found at {CSV_PATH}")
        return False
    
    print(f"Loading data from {CSV_PATH}...")
    hospitals = load_csv_data()
    print(f"  Loaded {len(hospitals)} maternity hospitals (filtered out non-maternity facilities)")
    print()
    
    print(f"Creating database at {DB_PATH}...")
    create_database(hospitals)
    print("  Database created successfully")
    print()
    
    print("Verifying data...")
    stats = verify_database()
    print(f"  Total hospitals: {stats['total']}")
    print(f"  Birthing-friendly hospitals: {stats['birthing_friendly']}")
    print(f"  Hospitals with coordinates: {stats['geocoded']}")
    print()
    
    print("=" * 60)
    print("Data load complete!")
    print("=" * 60)
    return True


if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
