"""Add agent_stats table for XP tracking

Revision ID: phase3_stats_001
Revises: phase2_auth_001
Create Date: 2026-03-30
"""
from alembic import op
import sqlalchemy as sa

revision    = 'phase3_stats_001'
down_revision = 'phase2_auth_001'
branch_labels = None
depends_on    = None


def upgrade() -> None:
    op.create_table(
        'agent_stats',
        sa.Column('id', sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', sa.dialects.postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('agent_name',    sa.String(16),  nullable=False),
        sa.Column('xp',            sa.Integer(),   nullable=False, server_default='0'),
        sa.Column('level',         sa.Integer(),   nullable=False, server_default='1'),
        sa.Column('message_count', sa.Integer(),   nullable=False, server_default='0'),
        sa.Column('hp',            sa.Integer(),   nullable=False, server_default='100'),
        sa.Column('mp',            sa.Integer(),   nullable=False, server_default='100'),
        sa.UniqueConstraint('user_id', 'agent_name', name='uq_user_agent'),
    )
    op.create_index('ix_agent_stats_user_id', 'agent_stats', ['user_id'])


def downgrade() -> None:
    op.drop_table('agent_stats')
