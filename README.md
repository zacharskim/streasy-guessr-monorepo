# Streasy Guessr

**Think You Know NYC Apartments? Prove It!**

Streasy Guessr is the ultimate challenge for real estate aficionados, city explorers, and trivia fans alike. Guess the neighborhood, price, and more of iconic NYC apartments. How close can you get?

## Project Structure

This is a monorepo containing both the frontend and backend for Streasy Guessr:

```
streasy-guessr-monorepo/
├── frontend/          # Next.js web application
└── backend/           # Python web scraper for StreetEasy listings
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

## Features

- **Guess the Neighborhood**: Can you tell a West Village loft from a Queens studio?
- **Price Challenge**: Spot the six-figure steals and the sky-high penthouses
- **Extra Twists**: Match features like square footage, building era, or rental status

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Python, nodriver (browser automation)

## Development

This project is structured as a monorepo for easier development and deployment. Both frontend and backend can be worked on independently while maintaining a single git repository.

## License

MIT
