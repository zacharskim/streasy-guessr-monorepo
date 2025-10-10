# Streasy Guessr

**Fun Guessing Game Based On NYC Apartment Pictures**

Welcome to Rent Golf, a web application where users guess the neighborhood or price of NYC apartments based on their pictures. Inspired by GeoGuessr, this game tests your knowledge of the city's real estate market.

## Project Structure

This is a monorepo containing both the frontend and backend for Rent Golf:

```
streasy-guessr-monorepo/
├── frontend/          # Next.js web application
└── backend/           # Python web scraper
```

## Getting Started

### Frontend (Next.js)

Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

See [frontend/README.md](frontend/README.md) for more details.

### Backend (Python Scraper)

Navigate to the backend directory and set up a virtual environment:

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt  # (if you have one)
```

Run the scraper scripts as needed.

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Python, nodriver (browser automation)
