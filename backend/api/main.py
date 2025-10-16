"""FastAPI application for Streasy Guessr backend."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from api.routes import apartments

app = FastAPI(
    title="Streasy Guessr API",
    description="Backend API for the Streasy Guessr game",
    version="0.1.0"
)

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(apartments.router, prefix="/api", tags=["apartments"])

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
