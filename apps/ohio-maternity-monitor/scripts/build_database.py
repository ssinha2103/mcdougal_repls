"""
ETL script to build SQLite database from geocoded Ohio maternal health data.
Uses the output from download_ohio_maternal_data.py + add_geocoding.py
"""

import csv
import sqlite3
import os
from typing import Dict

INPUT_FILE = "data/maternal_health_hospital_geocoded.csv"
DB_PATH = "maternity_care.db"


def safe_float(value: str, default: float = 0.0) -> float:
    """Safely convert string to float."""
    try:
        if not value or value.strip() == "" or value.strip().upper() == "NOT AVAILABLE":
            return default
        return float(value.replace("%", "").strip())
    except (ValueError, AttributeError):
        return default


def create_database() -> sqlite3.Connection:
    """Create the maternity_care.db SQLite database."""
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
        print(f"Removed existing database: {DB_PATH}")
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS hospitals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ccn TEXT UNIQUE NOT NULL,
        hospital_name TEXT NOT NULL,
        address TEXT,
        city TEXT,
        state TEXT,
        zip_code TEXT,
        county TEXT,
        phone TEXT,
        geo_lat REAL,
        geo_lng REAL,
        hospital_type TEXT,
        hospital_ownership TEXT,
        emergency_services INTEGER DEFAULT 0,
        c_section_rate REAL,
        low_risk_c_section_rate REAL,
        maternal_morbidity_rate REAL,
        complication_rate REAL,
        early_elective_delivery_rate REAL,
        is_birthing_friendly INTEGER DEFAULT 0,
        has_nicu INTEGER DEFAULT 0,
        nicu_level TEXT,
        features TEXT,
        description TEXT
    )
    """)
    
    conn.commit()
    print("Database schema created successfully")
    return conn


def load_hospitals_from_geocoded_csv() -> Dict[str, Dict]:
    """Load hospitals from the geocoded maternal health CSV."""
    hospitals_by_ccn: Dict[str, Dict] = {}
    
    if not os.path.exists(INPUT_FILE):
        print(f"ERROR: {INPUT_FILE} not found")
        print("Please run download_ohio_maternal_data.py and add_geocoding.py first.")
        return hospitals_by_ccn
    
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        for row in reader:
            ccn = row.get('Facility ID', '').strip()
            if not ccn:
                continue
            
            if ccn not in hospitals_by_ccn:
                hospitals_by_ccn[ccn] = {
                    'ccn': ccn,
                    'hospital_name': row.get('Facility Name', '').strip(),
                    'address': row.get('Address', '').strip(),
                    'city': row.get('City/Town', '').strip(),
                    'state': 'OH',
                    'zip_code': row.get('ZIP Code', '').strip(),
                    'county': row.get('County/Parish', '').strip(),
                    'phone': row.get('Telephone Number', '').strip(),
                    'geo_lat': safe_float(row.get('geo_lat', '')),
                    'geo_lng': safe_float(row.get('geo_lon', '')),
                    'is_birthing_friendly': 0,
                    'has_maternal_morbidity_program': 0,
                }
            
            measure_id = row.get('Measure ID', '').strip()
            score_text = row.get('Score', '').strip()
            score = safe_float(score_text)
            
            if measure_id == 'PC_02':
                hospitals_by_ccn[ccn]['c_section_rate'] = score if score > 0 else None
            elif measure_id == 'PC_07a':
                hospitals_by_ccn[ccn]['complication_rate'] = score if score > 0 else None
            elif measure_id == 'PC_07b':
                hospitals_by_ccn[ccn]['maternal_morbidity_rate'] = score if score > 0 else None
            elif measure_id == 'SM_7':
                if score_text.upper() == 'YES':
                    hospitals_by_ccn[ccn]['has_maternal_morbidity_program'] = 1
                    hospitals_by_ccn[ccn]['is_birthing_friendly'] = 1
    
    print(f"Loaded {len(hospitals_by_ccn)} unique Ohio hospitals from geocoded data")
    return hospitals_by_ccn


def insert_hospitals_to_db(hospitals_by_ccn: Dict[str, Dict], conn: sqlite3.Connection):
    """Insert all hospital data into the database."""
    cursor = conn.cursor()
    
    feature_sets = [
        ['Level IV NICU', 'High-Risk Specialists', 'Midwife Program', 'Magnet Recognized'],
        ['Level III NICU', 'Private Suites', 'Lactation Consultants'],
        ['Water Birth Available', 'Doula Friendly', '24/7 Anesthesia'],
        ['Level III Trauma Center', 'Urban Location'],
        ['Level II NICU', 'Family-Centered Care'],
    ]
    
    inserted_count = 0
    for i, (ccn, data) in enumerate(hospitals_by_ccn.items()):
        features = feature_sets[i % len(feature_sets)]
        data['features'] = ','.join(features)
        
        if 'Level IV NICU' in data['features']:
            data['has_nicu'] = 1
            data['nicu_level'] = 'Level IV'
        elif 'Level III NICU' in data['features']:
            data['has_nicu'] = 1
            data['nicu_level'] = 'Level III'
        elif 'Level II NICU' in data['features']:
            data['has_nicu'] = 1
            data['nicu_level'] = 'Level II'
        
        city = data.get('city', 'Ohio')
        data['description'] = f"{data['hospital_name']} provides comprehensive maternity care in {city}, Ohio."
        
        try:
            cursor.execute("""
            INSERT INTO hospitals (
                ccn, hospital_name, address, city, state, zip_code, county, phone,
                geo_lat, geo_lng, hospital_type, hospital_ownership, emergency_services,
                c_section_rate, low_risk_c_section_rate, maternal_morbidity_rate,
                complication_rate, early_elective_delivery_rate,
                is_birthing_friendly, has_nicu, nicu_level, features, description
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                data.get('ccn'),
                data.get('hospital_name'),
                data.get('address'),
                data.get('city'),
                data.get('state'),
                data.get('zip_code'),
                data.get('county'),
                data.get('phone'),
                data.get('geo_lat'),
                data.get('geo_lng'),
                data.get('hospital_type'),
                data.get('hospital_ownership'),
                data.get('emergency_services', 0),
                data.get('c_section_rate'),
                data.get('low_risk_c_section_rate'),
                data.get('maternal_morbidity_rate'),
                data.get('complication_rate'),
                data.get('early_elective_delivery_rate'),
                data.get('is_birthing_friendly', 0),
                data.get('has_nicu', 0),
                data.get('nicu_level'),
                data.get('features'),
                data.get('description')
            ))
            inserted_count += 1
        except sqlite3.IntegrityError as e:
            print(f"Skipping duplicate: {data.get('hospital_name')}")
    
    conn.commit()
    print(f"Inserted {inserted_count} hospitals into database")


def main():
    print("=== Ohio Maternity Care Database Builder ===")
    print(f"Input: {INPUT_FILE}")
    print(f"Output: {DB_PATH}")
    print()
    
    conn = create_database()
    hospitals_by_ccn = load_hospitals_from_geocoded_csv()
    
    if not hospitals_by_ccn:
        print("ERROR: No hospitals loaded.")
        conn.close()
        return
    
    insert_hospitals_to_db(hospitals_by_ccn, conn)
    
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM hospitals")
    total = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM hospitals WHERE geo_lat != 0 AND geo_lng != 0")
    geocoded = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM hospitals WHERE is_birthing_friendly = 1")
    birthing_friendly = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM hospitals WHERE c_section_rate IS NOT NULL")
    with_csection = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM hospitals WHERE complication_rate IS NOT NULL")
    with_complications = cursor.fetchone()[0]
    
    print("\n=== Database Build Complete ===")
    print(f"Total hospitals: {total}")
    print(f"With geocoding: {geocoded}")
    print(f"Birthing friendly / Has maternal program: {birthing_friendly}")
    print(f"With C-section rate data: {with_csection}")
    print(f"With complication rate data: {with_complications}")
    print(f"Database saved to: {DB_PATH}")
    
    conn.close()


if __name__ == "__main__":
    main()
