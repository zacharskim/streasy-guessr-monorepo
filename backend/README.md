# Streasy Guessr Backend

FastAPI backend for the Streasy Guessr game.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Initialize database:
```bash
python3 db/init_db.py
python3 db/import_data.py
```

3. Run the API server:
```bash
./run.sh
# or
uvicorn api.main:app --reload
```

