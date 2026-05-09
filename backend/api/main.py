"""FastAPI application for Streasy Guessr backend."""
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pathlib import Path

from api.routes import apartments, leaderboard

load_dotenv()

app = FastAPI(
    title="Streasy Guessr API",
    description="Backend API for the Streasy Guessr game",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(apartments.router, prefix="/api", tags=["apartments"])
app.include_router(leaderboard.router, prefix="/api", tags=["leaderboard"])

# Serve static images with long-lived cache headers so Cloudflare caches them
IMAGES_DIR = Path(__file__).parent.parent / "images"

@app.get("/images/{filename}")
async def serve_image(filename: str):
    path = IMAGES_DIR / filename
    return FileResponse(
        path,
        headers={"Cache-Control": "public, max-age=31536000, immutable"},
    )
