"""Apartment API routes."""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import random

from api.database import get_db, row_to_dict

router = APIRouter()


@router.get("/apartments/random")
def get_random_apartments(
    count: int = Query(
        5, ge=1, le=10, description="Number of random apartments to fetch"
    )
):
    """
    Get random apartments for a game round.

    Returns apartments WITHOUT rent price (that's the answer!).
    Frontend will use listing IDs to submit guesses.
    """
    conn = get_db()
    cursor = conn.cursor()

    # Get total count
    cursor.execute("SELECT COUNT(*) as total FROM apartments")
    total = cursor.fetchone()["total"]

    if total == 0:
        raise HTTPException(status_code=404, detail="No apartments in database")

    # Get random apartments
    # SQLite's RANDOM() is efficient for small-medium datasets
    cursor.execute(
        """
        SELECT * FROM apartments
        ORDER BY RANDOM()
        LIMIT ?
    """,
        (count,),
    )

    apartments = [row_to_dict(row) for row in cursor.fetchall()]
    conn.close()

    # Remove sensitive/unnecessary fields
    for apt in apartments:
        apt.pop("rent")  # Don't expose the answer
        apt.pop("image_ids", None)  # Redundant - frontend constructs URLs from id + photo_count

    return {"apartments": apartments, "count": len(apartments)}


@router.get("/apartments/{apartment_id}")
def get_apartment(apartment_id: int):
    """Get a specific apartment by ID (includes rent)."""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM apartments WHERE id = ?", (apartment_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Apartment not found")

    return row_to_dict(row)


@router.post("/apartments/validate-guess")
def validate_guess(guess: dict):
    """
    Validate a rent guess against the actual rent.

    Expected payload:
    {
        "apartment_id": 123,
        "guessed_rent": 3500
    }

    Returns:
    {
        "apartment_id": 123,
        "guessed_rent": 3500,
        "actual_rent": 3200,
        "difference": 300,
        "percentage_off": 9.375,
        "score": 90 (calculated based on accuracy)
    }
    """
    apartment_id = guess.get("apartment_id")
    guessed_rent = guess.get("guessed_rent")

    if not apartment_id or guessed_rent is None:
        raise HTTPException(
            status_code=400, detail="Missing apartment_id or guessed_rent"
        )

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT rent FROM apartments WHERE id = ?", (apartment_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Apartment not found")

    actual_rent = row["rent"]
    difference = abs(guessed_rent - actual_rent)
    percentage_off = (difference / actual_rent) * 100

    # Score calculation: 100 points max, lose points based on % error
    # Perfect guess = 100 points
    # 10% off = 90 points
    # 50% off = 50 points
    # 100%+ off = 0 points
    score = max(0, int(100 - percentage_off))

    return {
        "apartment_id": apartment_id,
        "guessed_rent": guessed_rent,
        "actual_rent": actual_rent,
        "difference": difference,
        "percentage_off": round(percentage_off, 2),
        "score": score,
    }


@router.get("/apartments")
def list_apartments(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    borough: Optional[str] = None,
    neighborhood: Optional[str] = None,
    min_bedrooms: Optional[int] = None,
    max_bedrooms: Optional[int] = None,
):
    """
    List apartments with optional filters.
    Useful for the catalog page.
    """
    conn = get_db()
    cursor = conn.cursor()

    # Build query with filters
    query = "SELECT * FROM apartments WHERE 1=1"
    params = []

    if borough:
        query += " AND borough = ?"
        params.append(borough)

    if neighborhood:
        query += " AND neighborhood = ?"
        params.append(neighborhood)

    if min_bedrooms is not None:
        query += " AND bedrooms >= ?"
        params.append(min_bedrooms)

    if max_bedrooms is not None:
        query += " AND bedrooms <= ?"
        params.append(max_bedrooms)

    query += " ORDER BY id LIMIT ? OFFSET ?"
    params.extend([limit, skip])

    cursor.execute(query, params)
    apartments = [row_to_dict(row) for row in cursor.fetchall()]

    # Get total count for pagination
    count_query = "SELECT COUNT(*) as total FROM apartments WHERE 1=1"
    count_params = []

    if borough:
        count_query += " AND borough = ?"
        count_params.append(borough)

    if neighborhood:
        count_query += " AND neighborhood = ?"
        count_params.append(neighborhood)

    if min_bedrooms is not None:
        count_query += " AND bedrooms >= ?"
        count_params.append(min_bedrooms)

    if max_bedrooms is not None:
        count_query += " AND bedrooms <= ?"
        count_params.append(max_bedrooms)

    cursor.execute(count_query, count_params)
    total = cursor.fetchone()["total"]
    conn.close()

    return {"apartments": apartments, "total": total, "skip": skip, "limit": limit}
