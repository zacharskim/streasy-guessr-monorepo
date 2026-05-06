-- Apartments table
CREATE TABLE IF NOT EXISTS apartments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    listing_url TEXT NOT NULL UNIQUE,
    rent INTEGER NOT NULL,
    sqft INTEGER,
    bedrooms INTEGER NOT NULL,
    bathrooms REAL NOT NULL,
    neighborhood TEXT NOT NULL,
    borough TEXT NOT NULL,
    address TEXT,
    floor INTEGER,
    home_features TEXT, -- JSON array stored as text
    amenities TEXT, -- JSON array stored as text
    year_built INTEGER,
    photo_count INTEGER NOT NULL,
    image_ids TEXT NOT NULL, -- JSON array stored as text
    listing_id INTEGER,
    property_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leaderboard table
CREATE TABLE IF NOT EXISTS leaderboard (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_name TEXT NOT NULL,
    total_score REAL NOT NULL,
    rounds_played INTEGER NOT NULL DEFAULT 5,
    average_score REAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for leaderboard queries (top scores)
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard(total_score ASC);
