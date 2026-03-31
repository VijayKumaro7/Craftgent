"""AgentStats model — XP and level tracking per user per agent."""
import uuid
from sqlalchemy import String, Integer, Float, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base


class AgentStats(Base):
    __tablename__ = "agent_stats"
    __table_args__ = (
        UniqueConstraint("user_id", "agent_name", name="uq_user_agent"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    agent_name: Mapped[str] = mapped_column(String(16), nullable=False)

    xp:            Mapped[int]   = mapped_column(Integer, default=0,   nullable=False)
    level:         Mapped[int]   = mapped_column(Integer, default=1,   nullable=False)
    message_count: Mapped[int]   = mapped_column(Integer, default=0,   nullable=False)
    hp:            Mapped[int]   = mapped_column(Integer, default=100, nullable=False)
    mp:            Mapped[int]   = mapped_column(Integer, default=100, nullable=False)

    # XP thresholds: level = floor(xp / XP_PER_LEVEL) + 1, capped at MAX_LEVEL
    XP_PER_LEVEL = 200
    MAX_LEVEL    = 50

    def add_xp(self, amount: int) -> None:
        self.xp           += amount
        self.message_count += 1
        self.level = min(self.xp // self.XP_PER_LEVEL + 1, self.MAX_LEVEL)
        # MP drains slightly per message, recovers slowly
        self.mp = max(10, self.mp - 2)

    @property
    def xp_in_level(self) -> int:
        """XP earned within the current level (0 to XP_PER_LEVEL)."""
        return self.xp % self.XP_PER_LEVEL

    @property
    def xp_percent(self) -> int:
        """Progress to next level as 0–100."""
        return int((self.xp_in_level / self.XP_PER_LEVEL) * 100)
