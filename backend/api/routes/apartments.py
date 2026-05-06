"""Apartment API routes."""

from fastapi import APIRouter, HTTPException, Query

from api.database import get_db, row_to_dict

router = APIRouter()


@router.get("/apartments/random")
def get_random_apartments(
    count: int = Query(1, ge=1, le=10, description="Number of random apartments to fetch")
):
    """Get random apartments for a game round. Returns apartments WITHOUT rent price."""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) as total FROM apartments")
    total = cursor.fetchone()["total"]

    if total == 0:
        raise HTTPException(status_code=404, detail="No apartments in database")

    cursor.execute("SELECT * FROM apartments ORDER BY RANDOM() LIMIT ?", (count,))
    apartments = [row_to_dict(row) for row in cursor.fetchall()]
    conn.close()

    for apt in apartments:
        apt.pop("rent")
        apt.pop("image_ids", None)

    return {"apartments": apartments, "count": len(apartments)}


@router.post("/apartments/validate-guess")
def validate_guess(guess: dict):
    """Validate a rent guess against the actual rent."""
    apartment_id = guess.get("apartment_id")
    guessed_rent = guess.get("guessed_rent")

    if not apartment_id or guessed_rent is None:
        raise HTTPException(status_code=400, detail="Missing apartment_id or guessed_rent")

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
    score = round(percentage_off, 2)

    return {
        "apartment_id": apartment_id,
        "guessed_rent": guessed_rent,
        "actual_rent": actual_rent,
        "difference": difference,
        "percentage_off": round(percentage_off, 2),
        "score": score,
    }
