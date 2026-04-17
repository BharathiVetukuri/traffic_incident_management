from app.models.incident import SeverityLevel


class IncidentService:
    @staticmethod
    def calculate_priority(severity: SeverityLevel | str, nearby_incident_count: int) -> int:
        severity_value = severity.value if isinstance(severity, SeverityLevel) else str(severity).upper()

        base_scores = {
            SeverityLevel.HIGH.value: 10,
            SeverityLevel.MEDIUM.value: 5,
            SeverityLevel.LOW.value: 1,
        }

        if severity_value not in base_scores:
            raise ValueError("Invalid severity. Use HIGH, MEDIUM, or LOW.")

        if nearby_incident_count < 0:
            raise ValueError("nearby_incident_count cannot be negative.")

        return base_scores[severity_value] + (2 * nearby_incident_count)
