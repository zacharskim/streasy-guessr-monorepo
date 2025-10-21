"""Migration: Add listing_id and property_id columns to apartments table."""
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "apartments.db"


def migrate():
    """Add listing_id and property_id columns if they don't exist."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        # Check if listing_id column exists
        cursor.execute("PRAGMA table_info(apartments)")
        columns = [row[1] for row in cursor.fetchall()]

        if "listing_id" not in columns:
            print("Adding listing_id column...")
            cursor.execute("ALTER TABLE apartments ADD COLUMN listing_id INTEGER")
            conn.commit()
            print("✓ Added listing_id column")

        if "property_id" not in columns:
            print("Adding property_id column...")
            cursor.execute("ALTER TABLE apartments ADD COLUMN property_id INTEGER")
            conn.commit()
            print("✓ Added property_id column")

        print("✓ Migration complete")

    except Exception as e:
        print(f"✗ Migration failed: {e}")
        conn.rollback()
    finally:
        conn.close()


if __name__ == "__main__":
    migrate()
