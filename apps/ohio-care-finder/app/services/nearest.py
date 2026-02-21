"""
Nearest hospital finder with filters
"""
from typing import List, Dict, Any
from sqlmodel import Session, select
from app.models import Hospital
from app.services.routing import haversine_distance, get_travel_info


NICU_LEVELS = {
    "None": 0,
    "II": 2,
    "III": 3,
    "IV": 4
}


def filter_hospitals_by_need(hospitals: List[Hospital], need: str) -> List[Hospital]:
    """
    Filter hospitals by service need
    need can be: 'ld', 'nicu2', 'nicu3', 'nicu4'
    """
    filtered = []
    
    for hospital in hospitals:
        # For L&D need
        if need == 'ld':
            if hospital.has_ld:
                filtered.append(hospital)
        
        # For NICU needs
        elif need.startswith('nicu'):
            level_str = need.replace('nicu', '')  # "2", "3", or "4"
            required_level = int(level_str)
            hospital_level = NICU_LEVELS.get(hospital.nicu_level, 0)
            
            if hospital_level >= required_level:
                filtered.append(hospital)
        
        # No filter
        else:
            filtered.append(hospital)
    
    return filtered


async def get_nearest_hospitals(
    session: Session,
    lat: float,
    lng: float,
    need: str = 'ld',
    limit: int = 5
) -> List[Dict[str, Any]]:
    """
    Find nearest hospitals matching the need criteria
    
    Args:
        session: Database session
        lat: Origin latitude
        lng: Origin longitude
        need: Service need ('ld', 'nicu2', 'nicu3', 'nicu4', or 'any')
        limit: Maximum number of results
    
    Returns:
        List of hospital dicts with distance and ETA information
    """
    # Get all hospitals
    statement = select(Hospital)
    hospitals = session.exec(statement).all()
    
    # Filter by need
    if need != 'any':
        hospitals = filter_hospitals_by_need(list(hospitals), need)
    
    # Calculate distances and get travel info
    results = []
    
    for hospital in hospitals:
        distance_km = haversine_distance(lat, lng, hospital.lat, hospital.lng)
        
        # Get travel time (will use ORS if available, otherwise estimate)
        travel_info = await get_travel_info(lat, lng, hospital.lat, hospital.lng)
        
        results.append({
            "id": hospital.id,
            "name": hospital.name,
            "system": hospital.system,
            "address": hospital.address,
            "city": hospital.city,
            "county": hospital.county,
            "zip": hospital.zip,
            "lat": hospital.lat,
            "lng": hospital.lng,
            "has_ld": hospital.has_ld,
            "nicu_level": hospital.nicu_level,
            "website": hospital.website,
            "distance_km": travel_info["distance_km"],
            "eta_minutes": travel_info["eta_minutes"],
            "is_estimated": travel_info["is_estimated"]
        })
    
    # Sort by distance
    results.sort(key=lambda x: x["distance_km"])
    
    # Return top N
    return results[:limit]


def get_nearest_higher_nicu(
    session: Session,
    current_hospital: Hospital,
    origin_lat: float,
    origin_lng: float
) -> Dict[str, Any]:
    """
    Find nearest hospital with higher NICU level
    Used for suggestion on hospital detail pages
    """
    current_level = NICU_LEVELS.get(current_hospital.nicu_level, 0)
    
    # If already at highest level, return None
    if current_level >= 4:
        return None
    
    # Get all hospitals with higher NICU level
    statement = select(Hospital)
    all_hospitals = session.exec(statement).all()
    
    higher_level_hospitals = [
        h for h in all_hospitals
        if NICU_LEVELS.get(h.nicu_level, 0) > current_level
    ]
    
    if not higher_level_hospitals:
        return None
    
    # Find nearest
    nearest = None
    min_distance = float('inf')
    
    for hospital in higher_level_hospitals:
        distance = haversine_distance(origin_lat, origin_lng, hospital.lat, hospital.lng)
        if distance < min_distance:
            min_distance = distance
            nearest = hospital
    
    if nearest:
        return {
            "id": nearest.id,
            "name": nearest.name,
            "nicu_level": nearest.nicu_level,
            "distance_km": round(min_distance, 1),
            "city": nearest.city
        }
    
    return None
