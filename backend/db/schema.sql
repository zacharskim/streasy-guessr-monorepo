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
