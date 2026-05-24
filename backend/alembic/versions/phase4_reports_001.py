"""Add reports table for report generation and export

Revision ID: phase4_reports_001
Revises: phase4_msg_idx_001
Create Date: 2026-05-24
"""
from alembic import op
import sqlalchemy as sa

revision    = 'phase4_reports_001'
down_revision = 'phase4_msg_idx_001'
branch_labels = None
depends_on    = None


def upgrade() -> None:
    op.create_table(
        'reports',
        sa.Column('id', sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('session_id', sa.dialects.postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('chat_sessions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', sa.dialects.postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(256), nullable=False),
        sa.Column('format', sa.String(32), nullable=False),  # 'pdf' or 'docx'
        sa.Column('file_path', sa.String(512), nullable=True),
        sa.Column('file_size', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('generated_at', sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.func.now()),
    )
    op.create_index('ix_reports_session_id', 'reports', ['session_id'])
    op.create_index('ix_reports_user_id', 'reports', ['user_id'])
    op.create_index('ix_reports_generated_at', 'reports', ['generated_at'])


def downgrade() -> None:
    op.drop_table('reports')
