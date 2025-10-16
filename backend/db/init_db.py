"""Initialize the SQLite database with schema."""
import sqlite3
import os
from pathlib import Path

# Get the absolute path to the db directory
DB_DIR = Path(__file__).parent
DB_PATH = DB_DIR / "apartments.db"
SCHEMA_PATH = DB_DIR / "schema.sql"


def init_database():
    """Create database and tables from schema.sql."""
    # Read schema
    with open(SCHEMA_PATH, 'r') as f:
        schema = f.read()

    # Connect and execute schema
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.executescript(schema)
    conn.commit()
    conn.close()

    print(f"✓ Database initialized at {DB_PATH}")


if __name__ == "__main__":
    init_database()
