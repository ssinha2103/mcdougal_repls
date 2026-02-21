"""
Routing and travel time estimation service
OpenRouteService integration with haversine fallback
"""
import os
import httpx
from typing import Optional
import math


def haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """
    Calculate great-circle distance between two points in kilometers
    Using haversine formula
    """
    R = 6371  # Earth radius in kilometers
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lng = math.radians(lng2 - lng1)
    
    a = math.sin(delta_lat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lng/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    return R * c


def estimate_eta_minutes(distance_km: float) -> int:
    """
    Estimate travel time from distance
    Assumes average speed of 72 km/h (45 mph) for mixed driving
    """
    speed_kmh = 72
    hours = distance_km / speed_kmh
    return int(hours * 60)


async def ors_eta_minutes(
    origin_lat: float,
    origin_lng: float,
    dest_lat: float,
    dest_lng: float,
    api_key: Optional[str] = None
) -> Optional[int]:
    """
    Get actual driving time from OpenRouteService API
    Returns None if API fails or key not provided
    """
    if not api_key:
        return None
    
    url = "https://api.openrouteservice.org/v2/directions/driving-car"
    
    headers = {
        "Authorization": api_key,
        "Content-Type": "application/json"
    }
    
    body = {
        "coordinates": [[origin_lng, origin_lat], [dest_lng, dest_lat]]
    }
    
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.post(url, json=body, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                # Duration is in seconds, convert to minutes
                duration_seconds = data['routes'][0]['summary']['duration']
                return int(duration_seconds / 60)
            else:
                print(f"ORS API error: {response.status_code}")
                return None
    
    except Exception as e:
        print(f"ORS API request failed: {e}")
        return None


async def get_travel_info(
    origin_lat: float,
    origin_lng: float,
    dest_lat: float,
    dest_lng: float
) -> dict:
    """
    Get travel information (distance and time)
    Tries ORS API first, falls back to haversine estimation
    
    Returns dict with:
    - distance_km: float
    - eta_minutes: int
    - is_estimated: bool (True if using fallback)
    """
    distance_km = haversine_distance(origin_lat, origin_lng, dest_lat, dest_lng)
    
    # Try ORS API if key is available
    api_key = os.getenv("OPENROUTESERVICE_API_KEY")
    ors_time = await ors_eta_minutes(origin_lat, origin_lng, dest_lat, dest_lng, api_key)
    
    if ors_time is not None:
        return {
            "distance_km": round(distance_km, 1),
            "eta_minutes": ors_time,
            "is_estimated": False
        }
    
    # Fallback to distance-based estimation
    return {
        "distance_km": round(distance_km, 1),
        "eta_minutes": estimate_eta_minutes(distance_km),
        "is_estimated": True
    }
