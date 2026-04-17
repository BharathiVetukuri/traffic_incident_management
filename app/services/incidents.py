import uuid

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.incident import Incident, IncidentStatus, SeverityLevel
from app.schemas.incident import IncidentCreate, IncidentUpdate
from app.services.incident_service import IncidentService


class DatabaseConflictError(Exception):
    """Raised when a DB constraint conflict occurs."""


class DatabaseOperationError(Exception):
    """Raised when a generic DB operation fails."""


async def create_incident(db: AsyncSession, incident_in: IncidentCreate) -> Incident:
    nearby_count = incident_in.nearby_incident_count or 0
    priority_score = IncidentService.calculate_priority(incident_in.severity, nearby_count)

    incident = Incident(
        type=incident_in.type,
        severity=incident_in.severity,
        latitude=incident_in.latitude,
        longitude=incident_in.longitude,
        status=incident_in.status,
        priority_score=priority_score,
    )

    try:
        db.add(incident)
        await db.commit()
        await db.refresh(incident)
        return incident
    except IntegrityError as exc:
        await db.rollback()
        raise DatabaseConflictError("Incident create operation conflicted with DB constraints.") from exc
    except SQLAlchemyError as exc:
        await db.rollback()
        raise DatabaseOperationError("Failed to create incident due to a database error.") from exc


async def list_incidents(
    db: AsyncSession,
    severity: SeverityLevel | None = None,
    status: IncidentStatus | None = None,
) -> list[Incident]:
    query = select(Incident).order_by(Incident.created_at.desc())

    if severity is not None:
        query = query.where(Incident.severity == severity)

    if status is not None:
        query = query.where(Incident.status == status)

    try:
        result = await db.execute(query)
        return list(result.scalars().all())
    except SQLAlchemyError as exc:
        await db.rollback()
        raise DatabaseOperationError("Failed to list incidents due to a database error.") from exc


async def update_incident(
    db: AsyncSession,
    incident_id: uuid.UUID,
    incident_in: IncidentUpdate,
) -> Incident | None:
    try:
        result = await db.execute(select(Incident).where(Incident.id == incident_id))
        incident = result.scalar_one_or_none()

        if incident is None:
            return None

        if incident_in.severity is not None:
            incident.severity = incident_in.severity

        if incident_in.status is not None:
            incident.status = incident_in.status

        should_recalculate = incident_in.severity is not None or incident_in.nearby_incident_count is not None
        if should_recalculate:
            effective_severity = incident.severity
            nearby_count = incident_in.nearby_incident_count or 0
            incident.priority_score = IncidentService.calculate_priority(effective_severity, nearby_count)

        await db.commit()
        await db.refresh(incident)
        return incident
    except IntegrityError as exc:
        await db.rollback()
        raise DatabaseConflictError("Incident update conflicted with DB constraints.") from exc
    except SQLAlchemyError as exc:
        await db.rollback()
        raise DatabaseOperationError("Failed to update incident due to a database error.") from exc
