import math

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

    @staticmethod
    def haversine_distance_meters(
        latitude_1: float,
        longitude_1: float,
        latitude_2: float,
        longitude_2: float,
    ) -> float:
        earth_radius_meters = 6_371_000

        lat_1 = math.radians(latitude_1)
        lon_1 = math.radians(longitude_1)
        lat_2 = math.radians(latitude_2)
        lon_2 = math.radians(longitude_2)

        delta_lat = lat_2 - lat_1
        delta_lon = lon_2 - lon_1

        a = (
            math.sin(delta_lat / 2) ** 2
            + math.cos(lat_1) * math.cos(lat_2) * math.sin(delta_lon / 2) ** 2
        )
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

        return earth_radius_meters * c
