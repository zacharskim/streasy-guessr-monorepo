-- Apartments table for Streasy Guessr
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for random selection queries
CREATE INDEX IF NOT EXISTS idx_apartments_id ON apartments(id);

-- Index for filtering by neighborhood/borough
CREATE INDEX IF NOT EXISTS idx_apartments_location ON apartments(neighborhood, borough);

-- Index for filtering by bedroom count
CREATE INDEX IF NOT EXISTS idx_apartments_bedrooms ON apartments(bedrooms);

-- Leaderboard table for high scores
CREATE TABLE IF NOT EXISTS leaderboard (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_name TEXT NOT NULL,
    location TEXT, -- City, State, or Country (optional)
    total_score INTEGER NOT NULL,
    rounds_played INTEGER NOT NULL DEFAULT 5,
    average_score REAL, -- Calculated: total_score / rounds_played
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for leaderboard queries (top scores)
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard(total_score DESC);

-- Index for filtering by location
CREATE INDEX IF NOT EXISTS idx_leaderboard_location ON leaderboard(location);
