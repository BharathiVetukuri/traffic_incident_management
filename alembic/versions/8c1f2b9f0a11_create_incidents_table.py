"""create incidents table

Revision ID: 8c1f2b9f0a11
Revises: 
Create Date: 2026-04-15 13:05:00.000000

"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = "8c1f2b9f0a11"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    severity_level = postgresql.ENUM("LOW", "MEDIUM", "HIGH", name="severity_level", create_type=False)
    incident_status = postgresql.ENUM("OPEN", "IN_PROGRESS", "RESOLVED", name="incident_status", create_type=False)
    severity_level.create(op.get_bind(), checkfirst=True)
    incident_status.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "incidents",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("type", sa.String(length=255), nullable=False),
        sa.Column("severity", severity_level, nullable=False),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column("status", incident_status, nullable=False),
        sa.Column("priority_score", sa.Float(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("incidents")
    sa.Enum(name="incident_status").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="severity_level").drop(op.get_bind(), checkfirst=True)
