"""
Page routes (HTML templates)
"""
from fastapi import APIRouter, Depends, Request, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from sqlmodel import Session, select

from app.db import get_session
from app.models import Hospital, Closure, Source
from app.services.nearest import get_nearest_higher_nicu

router = APIRouter(tags=["pages"])
templates = Jinja2Templates(directory="templates")


@router.get("/", response_class=HTMLResponse)
async def home(request: Request):
    """Home page with map"""
    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context={
            "request": request,
            "title": "Ohio Maternity Care Access Map (2025) | L&D & NICU Levels",
        },
    )


@router.get("/hospital/{hospital_id}", response_class=HTMLResponse)
async def hospital_detail(
    request: Request,
    hospital_id: int,
    session: Session = Depends(get_session)
):
    """Hospital detail page"""
    hospital = session.get(Hospital, hospital_id)
    
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
    
    # Get closures for this hospital
    statement = select(Closure).where(Closure.hospital_id == hospital_id).order_by(Closure.closure_date.desc())
    closures = session.exec(statement).all()
    
    # Get sources for this hospital
    statement = select(Source).where(Source.hospital_id == hospital_id)
    sources = session.exec(statement).all()
    
    # Get nearest higher-level NICU suggestion
    higher_nicu = get_nearest_higher_nicu(session, hospital, hospital.lat, hospital.lng)
    
    return templates.TemplateResponse(
        request=request,
        name="hospital.html",
        context={
            "request": request,
            "hospital": hospital,
            "closures": closures,
            "sources": sources,
            "higher_nicu": higher_nicu,
            "title": f"{hospital.name} - Ohio Maternity Access Map",
        },
    )


@router.get("/methodology", response_class=HTMLResponse)
async def methodology(request: Request):
    """Methodology and citation page"""
    return templates.TemplateResponse(
        request=request,
        name="methodology.html",
        context={
            "request": request,
            "title": "Methodology - Ohio Maternity Access Map",
        },
    )


@router.get("/about", response_class=HTMLResponse)
async def about(request: Request):
    """About and disclaimers page"""
    return templates.TemplateResponse(
        request=request,
        name="about.html",
        context={
            "request": request,
            "title": "About - Ohio Maternity Access Map",
        },
    )
