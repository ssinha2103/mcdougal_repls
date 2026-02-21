"""
Database seeding from CSV files
"""
from pathlib import Path
from sqlmodel import Session
from app.models import Hospital, Closure, Source
from app.utils.csv_io import read_csv, parse_bool, parse_float, parse_int, parse_date
from app.db import engine


def seed_hospitals(session: Session, csv_path: str):
    """Seed hospitals from CSV file"""
    rows = read_csv(csv_path)
    count = 0
    
    for row in rows:
        hospital = Hospital(
            id=parse_int(row['id']),
            name=row['name'],
            system=row['system'],
            address=row['address'],
            city=row['city'],
            county=row['county'],
            state=row.get('state', 'OH'),
            zip=row['zip'],
            lat=parse_float(row['lat']),
            lng=parse_float(row['lng']),
            has_ld=parse_bool(row['has_ld']),
            nicu_level=row['nicu_level'],
            website=row.get('website'),
            last_verified=parse_date(row.get('last_verified'))
        )
        session.add(hospital)
        count += 1
    
    session.commit()
    print(f"✓ Seeded {count} hospitals")


def seed_closures(session: Session, csv_path: str):
    """Seed closures from CSV file"""
    rows = read_csv(csv_path)
    count = 0
    
    for row in rows:
        closure = Closure(
            id=parse_int(row['id']),
            hospital_id=parse_int(row['hospital_id']),
            closure_date=parse_date(row['closure_date']),
            service=row['service'],
            notes=row.get('notes'),
            source_url=row.get('source_url')
        )
        session.add(closure)
        count += 1
    
    session.commit()
    print(f"✓ Seeded {count} closures")


def seed_db_if_empty():
    """Seed database from CSV files if empty"""
    from app.db import db_is_empty
    
    if not db_is_empty():
        print("Database already contains data, skipping seed")
        return
    
    print("Seeding database from CSV files...")
    data_dir = Path("data")
    
    with Session(engine) as session:
        # Seed hospitals
        hospitals_csv = data_dir / "hospitals.seed.csv"
        if hospitals_csv.exists():
            seed_hospitals(session, str(hospitals_csv))
        else:
            print(f"Warning: {hospitals_csv} not found")
        
        # Seed closures
        closures_csv = data_dir / "closures.seed.csv"
        if closures_csv.exists():
            seed_closures(session, str(closures_csv))
        else:
            print(f"Warning: {closures_csv} not found")
    
    print("✓ Database seeding complete")
