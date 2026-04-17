import uuid
from datetime import datetime

from pydantic import Field, model_validator

from app.models.incident import IncidentStatus, SeverityLevel
from app.schemas.base import BaseSchema


class IncidentCreate(BaseSchema):
    type: str = Field(..., min_length=1, max_length=255)
    severity: SeverityLevel
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    status: IncidentStatus = IncidentStatus.OPEN
    nearby_incident_count: int | None = Field(default=None, ge=0)


class IncidentUpdate(BaseSchema):
    severity: SeverityLevel | None = None
    status: IncidentStatus | None = None
    nearby_incident_count: int | None = Field(default=None, ge=0)

    @model_validator(mode="after")
    def validate_at_least_one_field(self) -> "IncidentUpdate":
        if self.severity is None and self.status is None and self.nearby_incident_count is None:
            raise ValueError("At least one of 'severity', 'status', or 'nearby_incident_count' must be provided.")
        return self


class IncidentRead(BaseSchema):
    id: uuid.UUID
    type: str
    severity: SeverityLevel
    latitude: float
    longitude: float
    status: IncidentStatus
    priority_score: float
    created_at: datetime
    updated_at: datetime
