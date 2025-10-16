"""Database connection and utilities."""
import sqlite3
from pathlib import Path
from typing import Optional
import json

DB_PATH = Path(__file__).parent.parent / "db" / "apartments.db"


def get_db():
    """Get database connection."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # Access columns by name
    return conn


def row_to_dict(row: sqlite3.Row) -> dict:
    """Convert sqlite3.Row to dictionary with JSON parsing."""
    data = dict(row)

    # Parse JSON fields
    if 'home_features' in data and data['home_features']:
        data['home_features'] = json.loads(data['home_features'])
    if 'amenities' in data and data['amenities']:
        data['amenities'] = json.loads(data['amenities'])
    if 'image_ids' in data and data['image_ids']:
        data['image_ids'] = json.loads(data['image_ids'])

    return data
