"""
Database models for Ohio Maternity Access Map
"""
from datetime import date
from typing import Optional
from sqlmodel import Field, SQLModel, Relationship


class Hospital(SQLModel, table=True):
    """Hospital with L&D and NICU services"""
    __tablename__ = "hospitals"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    system: str  # Hospital system/network
    address: str
    city: str
    county: str = Field(index=True)
    state: str = Field(default="OH")
    zip: str
    lat: float
    lng: float
    has_ld: bool = Field(default=False, index=True)  # Has Labor & Delivery
    nicu_level: str = Field(default="None", index=True)  # None, II, III, IV
    website: Optional[str] = None
    last_verified: Optional[date] = None
    
    # Relationships
    closures: list["Closure"] = Relationship(back_populates="hospital")
    sources: list["Source"] = Relationship(back_populates="hospital")


class Closure(SQLModel, table=True):
    """Service closure record"""
    __tablename__ = "closures"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    hospital_id: int = Field(foreign_key="hospitals.id", index=True)
    closure_date: date = Field(index=True)
    service: str  # "L&D" or "NICU"
    notes: Optional[str] = None
    source_url: Optional[str] = None
    
    # Relationships
    hospital: Optional[Hospital] = Relationship(back_populates="closures")


class Source(SQLModel, table=True):
    """Data source reference"""
    __tablename__ = "sources"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    hospital_id: Optional[int] = Field(default=None, foreign_key="hospitals.id", index=True)
    label: str
    url: str
    verified_at: Optional[date] = None
    
    # Relationships
    hospital: Optional[Hospital] = Relationship(back_populates="sources")
