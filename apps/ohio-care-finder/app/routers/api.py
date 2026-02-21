"""
API routes for data access
"""
from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import StreamingResponse
from sqlmodel import Session, select
from typing import Optional
from datetime import date as date_type
import io
import csv

from app.db import get_session
from app.models import Hospital, Closure
from app.services.geocode import geocode_zip
from app.services.nearest import get_nearest_hospitals

router = APIRouter(prefix="/api", tags=["api"])


@router.get("/search")
async def search_hospitals(
    zip: str = Query(..., description="Ohio ZIP code"),
    need: str = Query(default="ld", description="Service need: ld, nicu2, nicu3, nicu4, any"),
    limit: int = Query(default=5, ge=1, le=20),
    session: Session = Depends(get_session)
):
    """
    Search for nearest hospitals by ZIP code and service need
    """
    # Geocode ZIP
    geo_result = geocode_zip(zip)
    
    if not geo_result:
        raise HTTPException(status_code=404, detail=f"ZIP code {zip} not found in Ohio")
    
    lat, lng, city, county = geo_result
    
    # Find nearest hospitals
    results = await get_nearest_hospitals(session, lat, lng, need, limit)
    
    return {
        "zip": zip,
        "city": city,
        "county": county,
        "lat": lat,
        "lng": lng,
        "need": need,
        "results": results
    }


@router.get("/closures")
def get_closures(
    since: Optional[str] = Query(default="2022-01-01", description="Start date (YYYY-MM-DD)"),
    session: Session = Depends(get_session)
):
    """
    Get all service closures since specified date
    """
    # Parse date
    try:
        since_date = date_type.fromisoformat(since)
    except ValueError:
        since_date = date_type(2022, 1, 1)
    
    # Query closures with hospital info
    statement = select(Closure).where(Closure.closure_date >= since_date).order_by(Closure.closure_date.desc())
    closures = session.exec(statement).all()
    
    results = []
    for closure in closures:
        # Get hospital info
        hospital = session.get(Hospital, closure.hospital_id)
        
        results.append({
            "id": closure.id,
            "hospital_id": closure.hospital_id,
            "hospital_name": hospital.name if hospital else "Unknown",
            "hospital_city": hospital.city if hospital else "",
            "hospital_county": hospital.county if hospital else "",
            "closure_date": closure.closure_date.isoformat(),
            "service": closure.service,
            "notes": closure.notes,
            "source_url": closure.source_url
        })
    
    return {"closures": results}


@router.get("/hospitals")
def get_all_hospitals(session: Session = Depends(get_session)):
    """
    Get all hospitals as GeoJSON for map display
    """
    statement = select(Hospital)
    hospitals = session.exec(statement).all()
    
    features = []
    for hospital in hospitals:
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [hospital.lng, hospital.lat]
            },
            "properties": {
                "id": hospital.id,
                "name": hospital.name,
                "system": hospital.system,
                "address": hospital.address,
                "city": hospital.city,
                "county": hospital.county,
                "zip": hospital.zip,
                "has_ld": hospital.has_ld,
                "nicu_level": hospital.nicu_level,
                "website": hospital.website
            }
        })
    
    return {
        "type": "FeatureCollection",
        "features": features
    }


@router.get("/download/{table}")
def download_csv(
    table: str,
    session: Session = Depends(get_session)
):
    """
    Download data as CSV
    table: 'hospitals' or 'closures'
    """
    if table == "hospitals":
        statement = select(Hospital)
        hospitals = session.exec(statement).all()
        
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=[
            'id', 'name', 'system', 'address', 'city', 'county', 'state', 'zip',
            'lat', 'lng', 'has_ld', 'nicu_level', 'website', 'last_verified'
        ])
        writer.writeheader()
        
        for h in hospitals:
            writer.writerow({
                'id': h.id,
                'name': h.name,
                'system': h.system,
                'address': h.address,
                'city': h.city,
                'county': h.county,
                'state': h.state,
                'zip': h.zip,
                'lat': h.lat,
                'lng': h.lng,
                'has_ld': h.has_ld,
                'nicu_level': h.nicu_level,
                'website': h.website,
                'last_verified': h.last_verified.isoformat() if h.last_verified else ''
            })
        
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=ohio_hospitals.csv"}
        )
    
    elif table == "closures":
        statement = select(Closure)
        closures = session.exec(statement).all()
        
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=[
            'id', 'hospital_id', 'hospital_name', 'closure_date', 'service', 'notes', 'source_url'
        ])
        writer.writeheader()
        
        for c in closures:
            hospital = session.get(Hospital, c.hospital_id)
            writer.writerow({
                'id': c.id,
                'hospital_id': c.hospital_id,
                'hospital_name': hospital.name if hospital else '',
                'closure_date': c.closure_date.isoformat(),
                'service': c.service,
                'notes': c.notes,
                'source_url': c.source_url
            })
        
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=ohio_closures.csv"}
        )
    
    else:
        raise HTTPException(status_code=404, detail="Table not found")
