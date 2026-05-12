"""Composite index for message history retrieval

Speeds up the LIMITed DESC scan that powers history loads
(ws_router._load_history, chat._load_message_history,
sessions_router.list_sessions). The existing single-column
ix_messages_session_id forces Postgres to sort all matched rows;
the composite index lets it walk the BTree backwards and stop at LIMIT.

Revision ID: phase4_msg_idx_001
Revises: phase3_stats_001
Create Date: 2026-05-12
"""
from alembic import op

revision      = 'phase4_msg_idx_001'
down_revision = 'phase3_stats_001'
branch_labels = None
depends_on    = None


def upgrade() -> None:
    op.create_index(
        'ix_messages_session_created',
        'messages',
        ['session_id', 'created_at', 'id'],
    )


def downgrade() -> None:
    op.drop_index('ix_messages_session_created', table_name='messages')
