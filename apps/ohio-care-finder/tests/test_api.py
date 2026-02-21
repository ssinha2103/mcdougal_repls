"""
Tests for Ohio Maternity Access Map API
"""
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, create_engine, SQLModel
from sqlmodel.pool import StaticPool

from app.main import app
from app.db import get_session
from app.models import Hospital, Closure


# Test database setup
@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine(
        "sqlite://", 
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session):
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


def test_health_check(client: TestClient):
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_get_hospitals(session: Session, client: TestClient):
    """Test getting all hospitals as GeoJSON"""
    # Add test hospital
    hospital = Hospital(
        id=1,
        name="Test Hospital",
        system="Test System",
        address="123 Test St",
        city="TestCity",
        county="TestCounty",
        state="OH",
        zip="12345",
        lat=40.0,
        lng=-83.0,
        has_ld=True,
        nicu_level="III"
    )
    session.add(hospital)
    session.commit()
    
    response = client.get("/api/hospitals")
    assert response.status_code == 200
    
    data = response.json()
    assert data["type"] == "FeatureCollection"
    assert len(data["features"]) == 1
    assert data["features"][0]["properties"]["name"] == "Test Hospital"


def test_get_closures(session: Session, client: TestClient):
    """Test getting closures"""
    # Add test hospital and closure
    hospital = Hospital(
        id=1,
        name="Test Hospital",
        system="Test System",
        address="123 Test St",
        city="TestCity",
        county="TestCounty",
        state="OH",
        zip="12345",
        lat=40.0,
        lng=-83.0,
        has_ld=False,
        nicu_level="None"
    )
    session.add(hospital)
    session.commit()
    
    from datetime import date
    closure = Closure(
        id=1,
        hospital_id=1,
        closure_date=date(2023, 1, 15),
        service="L&D",
        notes="Test closure"
    )
    session.add(closure)
    session.commit()
    
    response = client.get("/api/closures")
    assert response.status_code == 200
    
    data = response.json()
    assert len(data["closures"]) == 1
    assert data["closures"][0]["service"] == "L&D"
    assert data["closures"][0]["hospital_name"] == "Test Hospital"


def test_download_hospitals_csv(session: Session, client: TestClient):
    """Test CSV download for hospitals"""
    hospital = Hospital(
        id=1,
        name="Test Hospital",
        system="Test System",
        address="123 Test St",
        city="TestCity",
        county="TestCounty",
        state="OH",
        zip="12345",
        lat=40.0,
        lng=-83.0,
        has_ld=True,
        nicu_level="II"
    )
    session.add(hospital)
    session.commit()
    
    response = client.get("/api/download/hospitals")
    assert response.status_code == 200
    assert response.headers["content-type"] == "text/csv; charset=utf-8"
    assert "Test Hospital" in response.text


def test_download_closures_csv(session: Session, client: TestClient):
    """Test CSV download for closures"""
    hospital = Hospital(
        id=1,
        name="Test Hospital",
        system="Test System",
        address="123 Test St",
        city="TestCity",
        county="TestCounty",
        state="OH",
        zip="12345",
        lat=40.0,
        lng=-83.0,
        has_ld=False,
        nicu_level="None"
    )
    session.add(hospital)
    session.commit()
    
    from datetime import date
    closure = Closure(
        id=1,
        hospital_id=1,
        closure_date=date(2023, 5, 1),
        service="NICU",
        notes="Test closure"
    )
    session.add(closure)
    session.commit()
    
    response = client.get("/api/download/closures")
    assert response.status_code == 200
    assert response.headers["content-type"] == "text/csv; charset=utf-8"
    assert "NICU" in response.text


def test_home_page(client: TestClient):
    """Test home page renders"""
    response = client.get("/")
    assert response.status_code == 200
    assert "Ohio Maternity" in response.text


def test_methodology_page(client: TestClient):
    """Test methodology page renders"""
    response = client.get("/methodology")
    assert response.status_code == 200
    assert "Methodology" in response.text


def test_about_page(client: TestClient):
    """Test about page renders"""
    response = client.get("/about")
    assert response.status_code == 200
    assert "About" in response.text


def test_hospital_detail_page(session: Session, client: TestClient):
    """Test hospital detail page"""
    hospital = Hospital(
        id=1,
        name="Detail Test Hospital",
        system="Test System",
        address="456 Detail St",
        city="DetailCity",
        county="DetailCounty",
        state="OH",
        zip="54321",
        lat=41.0,
        lng=-82.0,
        has_ld=True,
        nicu_level="IV"
    )
    session.add(hospital)
    session.commit()
    
    response = client.get("/hospital/1")
    assert response.status_code == 200
    assert "Detail Test Hospital" in response.text


def test_hospital_not_found(client: TestClient):
    """Test 404 for non-existent hospital"""
    response = client.get("/hospital/9999")
    assert response.status_code == 404
