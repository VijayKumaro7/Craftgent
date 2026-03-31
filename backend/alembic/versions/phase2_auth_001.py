"""Add hashed_password to users table

Revision ID: phase2_auth_001
Revises:
Create Date: 2026-03-30
"""
from alembic import op
import sqlalchemy as sa

revision = 'phase2_auth_001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create all tables fresh (Phase 1 had no migration file)
    op.create_table(
        'users',
        sa.Column('id', sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('username', sa.String(64), nullable=False, unique=True),
        sa.Column('hashed_password', sa.String(256), nullable=False, server_default=''),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.func.now()),
    )
    op.create_table(
        'chat_sessions',
        sa.Column('id', sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', sa.dialects.postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('active_agent', sa.String(16), nullable=False, server_default='NEXUS'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.func.now()),
    )
    op.create_table(
        'messages',
        sa.Column('id', sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('session_id', sa.dialects.postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('chat_sessions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('role', sa.String(16), nullable=False),
        sa.Column('content', sa.Text, nullable=False),
        sa.Column('agent', sa.String(16), nullable=True),
        sa.Column('token_count', sa.Integer, nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.func.now()),
    )
    # Indexes for fast message history lookups
    op.create_index('ix_messages_session_id', 'messages', ['session_id'])
    op.create_index('ix_chat_sessions_user_id', 'chat_sessions', ['user_id'])


def downgrade() -> None:
    op.drop_table('messages')
    op.drop_table('chat_sessions')
    op.drop_table('users')
