"""
Database connection and initialization
"""
import os
from sqlmodel import SQLModel, create_engine, Session
from pathlib import Path

# Database file location
DB_FILE = "ohio_maternity.db"
DATABASE_URL = f"sqlite:///{DB_FILE}"

# Create engine
engine = create_engine(DATABASE_URL, echo=False, connect_args={"check_same_thread": False})


def create_db_and_tables():
    """Create all database tables"""
    SQLModel.metadata.create_all(engine)


def get_session():
    """Get database session"""
    with Session(engine) as session:
        yield session


def db_is_empty() -> bool:
    """Check if database is empty (no hospitals)"""
    from app.models import Hospital
    
    if not Path(DB_FILE).exists():
        return True
    
    with Session(engine) as session:
        count = session.query(Hospital).count()
        return count == 0
