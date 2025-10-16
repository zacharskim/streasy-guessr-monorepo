#!/bin/bash
# Run the FastAPI development server

cd "$(dirname "$0")"

echo "Starting Streasy Guessr API server..."
echo "API docs will be available at: http://localhost:8000/docs"
echo ""

venv/bin/uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
