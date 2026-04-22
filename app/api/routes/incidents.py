import logging
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.incident import IncidentStatus, SeverityLevel
from app.schemas.incident import (
    IncidentCreate,
    IncidentDuplicateCheckRequest,
    IncidentDuplicateCheckResponse,
    IncidentRead,
    IncidentUpdate,
)
from app.services.incidents import (
    DatabaseConflictError,
    DatabaseOperationError,
    create_incident,
    detect_duplicate_incident,
    list_incidents,
    update_incident,
)


logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/", response_model=IncidentRead, status_code=status.HTTP_201_CREATED)
async def create_incident_route(
    payload: IncidentCreate,
    db: AsyncSession = Depends(get_db),
) -> IncidentRead:
    try:
        incident = await create_incident(db, payload)
        return IncidentRead.model_validate(incident)
    except DatabaseConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    except DatabaseOperationError as exc:
        logger.exception("Database error during incident create")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error.") from exc


@router.post("/check-duplicate", response_model=IncidentDuplicateCheckResponse)
async def check_duplicate_incident_route(
    payload: IncidentDuplicateCheckRequest,
    db: AsyncSession = Depends(get_db),
) -> IncidentDuplicateCheckResponse:
    try:
        is_duplicate = await detect_duplicate_incident(
            db=db,
            latitude=payload.latitude,
            longitude=payload.longitude,
            timestamp=payload.timestamp,
        )
        return IncidentDuplicateCheckResponse(is_duplicate=is_duplicate)
    except DatabaseOperationError as exc:
        logger.exception("Database error during duplicate incident check")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error.") from exc


@router.get("/", response_model=list[IncidentRead])
async def list_incidents_route(
    severity: SeverityLevel | None = Query(default=None),
    status: IncidentStatus | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
) -> list[IncidentRead]:
    try:
        incidents = await list_incidents(db, severity=severity, status=status)
        return [IncidentRead.model_validate(incident) for incident in incidents]
    except DatabaseOperationError as exc:
        logger.exception("Database error during incident list")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error.") from exc


@router.put("/{incident_id}", response_model=IncidentRead)
async def update_incident_route(
    incident_id: uuid.UUID,
    payload: IncidentUpdate,
    db: AsyncSession = Depends(get_db),
) -> IncidentRead:
    try:
        incident = await update_incident(db, incident_id=incident_id, incident_in=payload)
        if incident is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")
        return IncidentRead.model_validate(incident)
    except DatabaseConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    except DatabaseOperationError as exc:
        logger.exception("Database error during incident update")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error.") from exc
