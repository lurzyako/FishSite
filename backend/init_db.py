#!/usr/bin/env python3
from __future__ import annotations

import sqlite3
import sys
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
DEFAULT_DB_PATH = BASE_DIR / "fishsite.sqlite3"
SCHEMA_PATH = BASE_DIR / "schema.sql"
SEED_PATH = BASE_DIR / "seed.sql"


def run_sql_file(connection: sqlite3.Connection, path: Path) -> None:
    connection.executescript(path.read_text(encoding="utf-8"))


def init_db(db_path: Path) -> None:
    db_path.parent.mkdir(parents=True, exist_ok=True)

    with sqlite3.connect(db_path) as connection:
        connection.execute("PRAGMA foreign_keys = ON;")
        run_sql_file(connection, SCHEMA_PATH)
        run_sql_file(connection, SEED_PATH)
        connection.commit()


def main() -> int:
    db_path = Path(sys.argv[1]).expanduser().resolve() if len(sys.argv) > 1 else DEFAULT_DB_PATH
    init_db(db_path)
    print(f"Database initialized: {db_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
