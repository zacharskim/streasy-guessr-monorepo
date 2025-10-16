"""Import scraped apartment data from JSON into SQLite database."""
import sqlite3
import json
import os
from pathlib import Path

# Paths
DB_DIR = Path(__file__).parent
DB_PATH = DB_DIR / "apartments.db"
DATA_PATH = DB_DIR.parent / "data" / "scraped_apartments.json"


def import_apartments():
    """Load apartments from JSON and insert into database."""
    # Load JSON data
    with open(DATA_PATH, 'r') as f:
        apartments = json.load(f)

    print(f"Loaded {len(apartments)} apartments from JSON")

    # Connect to database
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Insert apartments
    inserted = 0
    skipped = 0

    for apt in apartments:
        try:
            cursor.execute("""
                INSERT INTO apartments (
                    listing_url, rent, sqft, bedrooms, bathrooms,
                    neighborhood, borough, address, floor,
                    home_features, amenities, year_built,
                    photo_count, image_ids
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                apt['listing_url'],
                apt['rent'],
                apt.get('sqft'),
                apt['bedrooms'],
                apt['bathrooms'],
                apt['neighborhood'],
                apt['borough'],
                apt.get('address'),
                apt.get('floor'),
                json.dumps(apt.get('home_features', [])),
                json.dumps(apt.get('amenities', [])),
                apt.get('year_built'),
                apt['photo_count'],
                json.dumps(apt['image_ids'])
            ))
            inserted += 1
        except sqlite3.IntegrityError:
            # Duplicate listing_url
            skipped += 1
            continue

    conn.commit()
    conn.close()

    print(f"✓ Imported {inserted} apartments")
    if skipped > 0:
        print(f"  Skipped {skipped} duplicates")


if __name__ == "__main__":
    import_apartments()
