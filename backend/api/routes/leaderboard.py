"""Leaderboard API routes."""

from fastapi import APIRouter, Query
from pydantic import BaseModel

from api.database import get_db

router = APIRouter()


class LeaderboardEntry(BaseModel):
    player_name: str
    total_score: float
    rounds_played: int = 5


@router.post("/leaderboard")
def submit_score(entry: LeaderboardEntry):
    conn = get_db()
    cursor = conn.cursor()

    average_score = entry.total_score / entry.rounds_played if entry.rounds_played > 0 else 0

    cursor.execute(
        "INSERT INTO leaderboard (player_name, total_score, rounds_played, average_score) VALUES (?, ?, ?, ?)",
        (entry.player_name, entry.total_score, entry.rounds_played, round(average_score, 2)),
    )

    entry_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return {
        "id": entry_id,
        "player_name": entry.player_name,
        "total_score": entry.total_score,
        "rounds_played": entry.rounds_played,
        "average_score": round(average_score, 2),
    }


@router.get("/leaderboard")
def get_leaderboard(
    limit: int = Query(100, ge=1, le=500),
):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT id, player_name, total_score, rounds_played, average_score, created_at FROM leaderboard ORDER BY total_score ASC, created_at ASC LIMIT ?",
        (limit,),
    )
    rows = cursor.fetchall()
    conn.close()

    entries = [
        {
            "rank": idx,
            "id": row["id"],
            "player_name": row["player_name"],
            "total_score": row["total_score"],
            "rounds_played": row["rounds_played"],
            "average_score": round(row["average_score"], 2) if row["average_score"] else 0,
            "created_at": row["created_at"] + "Z" if row["created_at"] else None,
        }
        for idx, row in enumerate(rows, start=1)
    ]

    return {"leaderboard": entries, "total_entries": len(entries)}


@router.get("/leaderboard/stats")
def get_leaderboard_stats():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) as total FROM leaderboard")
    total = cursor.fetchone()["total"]

    cursor.execute("SELECT MIN(total_score) as best FROM leaderboard")
    best = cursor.fetchone()["best"] or 0

    cursor.execute("SELECT AVG(total_score) as avg FROM leaderboard")
    avg = cursor.fetchone()["avg"] or 0

    conn.close()

    return {
        "total_entries": total,
        "highest_score": best,
        "average_score": round(avg, 2),
    }
