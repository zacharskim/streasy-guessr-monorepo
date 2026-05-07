"""
Rent Golf scraping pipeline — runs all 4 steps in sequence.
Edit the CONFIG section below to control what gets scraped.
"""

import asyncio
import sys
from pathlib import Path

# ============================================================
# CONFIG — edit this section before each scrape run
# ============================================================

# StreetEasy search URLs to scrape listings from.
# Filters are combined with | (URL-encoded as %7C) in the path.
# Sorting is a query param: ?sort_by=price_asc, ?sort_by=price_desc, ?sort_by=se_score
#
# Filter syntax examples (paste into browser to verify before adding):
#   Beds:         beds:2         beds:0-1
#   Price:        price:1000-2000
#   Sqft:         sqft>=1000     sqft>=2000
#   Pre-war:      pre_war:yes
#   New dev:      new_developments:completed
#   Neighborhood: upper-east-side, astoria, ridgewood, etc.
#   Borough:      manhattan, brooklyn, queens, bronx
#
# Example targeted searches:
#   Cheap studios/1beds (outer borough)
#     "https://streeteasy.com/for-rent/bronx/beds:0-1%7Cprice:1000-2000"
#     "https://streeteasy.com/for-rent/queens/beds:0-1%7Cprice:1000-2000"
#
#   Expensive small (paying for location, not space)
#     "https://streeteasy.com/for-rent/manhattan/beds:0-1%7Cprice:4000-8000"
#
#   Large cheap (outer borough value)
#     "https://streeteasy.com/for-rent/queens/sqft%3E=1500%7Cprice:2000-3500"
#     "https://streeteasy.com/for-rent/brooklyn/sqft%3E=1500%7Cprice:2000-3500"
#
#   Large expensive (luxury)
#     "https://streeteasy.com/for-rent/manhattan/sqft%3E=2000%7Cbeds:3?sort_by=price_asc"
#     "https://streeteasy.com/for-rent/manhattan/sqft%3E=1500%7Cprice:8000-20000"
#
#   Pre-war high rent (old building premium)
#     "https://streeteasy.com/for-rent/manhattan/pre_war:yes%7Cprice:5000-10000"
#     "https://streeteasy.com/for-rent/brooklyn/pre_war:yes%7Cprice:3000-6000"
#
#   Pre-war + large (spacious old buildings)
#     "https://streeteasy.com/for-rent/manhattan/sqft%3E=2000%7Cpre_war:yes?sort_by=price_asc"
#     "https://streeteasy.com/for-rent/manhattan/sqft%3E=2000%7Cbeds:3%7Cpre_war:yes?sort_by=price_asc"
#
#   New developments + large
#     "https://streeteasy.com/for-rent/manhattan/sqft%3E=2000%7Cbeds:3%7Cnew_developments:completed?sort_by=price_asc"
#
#   Stack multiple filters freely with %7C (|)
#     "https://streeteasy.com/for-rent/manhattan/sqft%3E=2000%7Cbeds:3%7Cnew_developments:completed%7Cpre_war:yes?sort_by=price_asc"
#
#   Specific neighborhoods
#     "https://streeteasy.com/for-rent/upper-east-side"
#     "https://streeteasy.com/for-rent/astoria"
#     "https://streeteasy.com/for-rent/ridgewood"
SEARCH_URLS = [
    "https://streeteasy.com/for-rent/manhattan",
    "https://streeteasy.com/for-rent/brooklyn",
    "https://streeteasy.com/for-rent/queens",
    "https://streeteasy.com/for-rent/bronx",
]

# Max search result pages to scrape per URL (each page has ~20 listings)
MAX_PAGES_PER_SEARCH = 10

# Max images to download per listing
MAX_IMAGES_PER_LISTING = 5

# ============================================================
# PATHS — derived automatically, no need to edit
# ============================================================

BACKEND_DIR = Path(__file__).parent.parent
DATA_DIR = BACKEND_DIR / "data"
IMAGES_DIR = BACKEND_DIR / "images"
DB_PATH = BACKEND_DIR / "db" / "apartments.db"
LISTING_URLS_FILE = DATA_DIR / "listing_urls.json"
SCRAPED_DATA_FILE = DATA_DIR / "scraped_apartments.json"

# ============================================================
# PIPELINE
# ============================================================

sys.path.insert(0, str(BACKEND_DIR))
from scripts.collect_urls import collect_listing_urls
from scripts.collect_listing_data import collect_listing_data
from scripts.collect_imgs import main as collect_imgs
from db.import_data import import_apartments


async def run():
    DATA_DIR.mkdir(exist_ok=True)
    IMAGES_DIR.mkdir(exist_ok=True)

    print("\n" + "=" * 60)
    print("STEP 1: Collecting listing URLs")
    print("=" * 60)
    await collect_listing_urls(SEARCH_URLS, MAX_PAGES_PER_SEARCH, LISTING_URLS_FILE)

    print("\n" + "=" * 60)
    print("STEP 2: Scraping listing data")
    print("=" * 60)
    await collect_listing_data(
        listing_urls_file=str(LISTING_URLS_FILE),
        output_file=str(SCRAPED_DATA_FILE),
    )

    print("\n" + "=" * 60)
    print("STEP 3: Downloading images")
    print("=" * 60)
    await collect_imgs(
        data_file=SCRAPED_DATA_FILE,
        output_dir=IMAGES_DIR,
        max_images=MAX_IMAGES_PER_LISTING,
    )

    print("\n" + "=" * 60)
    print("STEP 4: Importing to database")
    print("=" * 60)
    import_apartments(data_path=SCRAPED_DATA_FILE, db_path=DB_PATH)

    print("\n" + "=" * 60)
    print("PIPELINE COMPLETE")
    print("=" * 60)


if __name__ == "__main__":
    import nodriver as uc
    uc.loop().run_until_complete(run())
