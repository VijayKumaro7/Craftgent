#!/usr/bin/env python
"""
Run database migrations using alembic.
"""
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

from alembic.config import Config
from alembic.command import upgrade

def main():
    config = Config("alembic.ini")
    upgrade(config, "head")
    print("✓ Migration completed successfully")

if __name__ == "__main__":
    main()
