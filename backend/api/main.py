"""FastAPI application for Streasy Guessr backend."""
import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from api.routes import apartments, leaderboard

load_dotenv()

app = FastAPI(
    title="Streasy Guessr API",
    description="Backend API for the Streasy Guessr game",
    version="0.1.0"
)

# CORS middleware for Next.js frontend
allowed_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:8000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(apartments.router, prefix="/api", tags=["apartments"])
app.include_router(leaderboard.router, prefix="/api", tags=["leaderboard"])

# Serve static images
IMAGES_DIR = Path(__file__).parent.parent / "images"
app.mount("/images", StaticFiles(directory=str(IMAGES_DIR)), name="images")


@app.get("/")
def root():
    """Health check endpoint."""
    return {"status": "ok", "message": "Streasy Guessr API"}


@app.get("/health")
def health():
    """Health check endpoint."""
    return {"status": "healthy"}
