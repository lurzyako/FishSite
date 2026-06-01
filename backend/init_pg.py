from __future__ import annotations

try:
    from .app import ensure_database
except ImportError:
    from app import ensure_database


if __name__ == "__main__":
    ensure_database()
    print("PostgreSQL database is ready.")
