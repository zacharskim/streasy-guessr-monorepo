"""Leaderboard API routes."""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from pydantic import BaseModel

from api.database import get_db

router = APIRouter()


class LeaderboardEntry(BaseModel):
    """Model for submitting a leaderboard score."""
    player_name: str
    location: Optional[str] = None
    total_score: int
    rounds_played: int = 5


@router.post("/leaderboard")
def submit_score(entry: LeaderboardEntry):
    """
    Submit a score to the leaderboard.

    Expected payload:
    {
        "player_name": "John Doe",
        "location": "Brooklyn, NY",  // optional
        "total_score": 450,
        "rounds_played": 5
    }
    """
    conn = get_db()
    cursor = conn.cursor()

    # Calculate average score
    average_score = entry.total_score / entry.rounds_played if entry.rounds_played > 0 else 0

    cursor.execute("""
        INSERT INTO leaderboard (player_name, location, total_score, rounds_played, average_score)
        VALUES (?, ?, ?, ?, ?)
    """, (entry.player_name, entry.location, entry.total_score, entry.rounds_played, average_score))

    entry_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return {
        "id": entry_id,
        "player_name": entry.player_name,
        "location": entry.location,
        "total_score": entry.total_score,
        "rounds_played": entry.rounds_played,
        "average_score": round(average_score, 2),
        "message": "Score submitted successfully!"
    }


@router.get("/leaderboard")
def get_leaderboard(
    limit: int = Query(100, ge=1, le=500, description="Number of entries to return"),
    location: Optional[str] = None
):
    """
    Get top scores from the leaderboard.

    Returns entries sorted by total_score (highest first).
    Optionally filter by location.
    """
    conn = get_db()
    cursor = conn.cursor()

    query = """
        SELECT id, player_name, location, total_score, rounds_played, average_score, created_at
        FROM leaderboard
    """
    params = []

    if location:
        query += " WHERE location = ?"
        params.append(location)

    query += " ORDER BY total_score DESC, created_at ASC LIMIT ?"
    params.append(limit)

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    entries = []
    for idx, row in enumerate(rows, start=1):
        entries.append({
            "rank": idx,
            "id": row["id"],
            "player_name": row["player_name"],
            "location": row["location"],
            "total_score": row["total_score"],
            "rounds_played": row["rounds_played"],
            "average_score": round(row["average_score"], 2) if row["average_score"] else 0,
            "created_at": row["created_at"]
        })

    return {
        "leaderboard": entries,
        "total_entries": len(entries),
        "filtered_by_location": location
    }


@router.get("/leaderboard/stats")
def get_leaderboard_stats():
    """Get overall leaderboard statistics."""
    conn = get_db()
    cursor = conn.cursor()

    # Total entries
    cursor.execute("SELECT COUNT(*) as total FROM leaderboard")
    total = cursor.fetchone()["total"]

    # Highest score
    cursor.execute("SELECT MAX(total_score) as max_score FROM leaderboard")
    max_score = cursor.fetchone()["max_score"] or 0

    # Average score across all players
    cursor.execute("SELECT AVG(total_score) as avg_score FROM leaderboard")
    avg_score = cursor.fetchone()["avg_score"] or 0

    # Top locations (most submissions)
    cursor.execute("""
        SELECT location, COUNT(*) as count
        FROM leaderboard
        WHERE location IS NOT NULL
        GROUP BY location
        ORDER BY count DESC
        LIMIT 10
    """)
    top_locations = [{"location": row["location"], "count": row["count"]} for row in cursor.fetchall()]

    conn.close()

    return {
        "total_entries": total,
        "highest_score": max_score,
        "average_score": round(avg_score, 2),
        "top_locations": top_locations
    }
