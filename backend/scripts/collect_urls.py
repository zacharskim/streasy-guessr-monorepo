import asyncio
import nodriver as uc
import json
import time
from pathlib import Path


async def collect_listing_urls(search_urls: list[str], max_pages: int, output_file: Path):
    """
    Collect listing URLs from StreetEasy search pages.
    Accepts arbitrary search URLs so you can target specific filters.
    """
    all_urls = []
    driver = await uc.start(headless=False, sandbox=False)

    try:
        for search_url in search_urls:
            print(f'\n{"#"*60}')
            print(f"COLLECTING URLs FROM: {search_url}")
            print("#" * 60)

            page_num = 1

            while page_num <= max_pages:
                sep = "&" if "?" in search_url else "?"
                url = f"{search_url}{sep}page={page_num}"
                print(f"\nPage {page_num}: {url}")

                try:
                    tab = await driver.get(url)
                    await tab.sleep(5)

                    retries = 0
                    links = []
                    while retries < 3:
                        links = await tab.select_all(
                            'a[href*="/building/"][class*="ListingDescription-module__addressTextAction"]'
                        )
                        if links:
                            break
                        print(f"  Waiting for listings to load... (attempt {retries + 1}/3)")
                        await asyncio.sleep(2)
                        retries += 1

                    print(f"  Found {len(links)} listings on page {page_num}")

                    if not links:
                        print(f"  No listings found - end of results for this search")
                        break

                    page_urls = []
                    for link in links:
                        try:
                            href = link.attrs.get("href", "")
                            if href and href.startswith("http"):
                                page_urls.append(href)
                        except Exception:
                            continue

                    new_urls = 0
                    for href in page_urls:
                        if href not in all_urls:
                            all_urls.append(href)
                            new_urls += 1

                    print(f"  Added {new_urls} new URLs (total: {len(all_urls)})")

                    # Save progress after each page
                    with open(output_file, "w") as f:
                        json.dump(
                            {
                                "collected_at": time.strftime("%Y-%m-%d %H:%M:%S"),
                                "total_count": len(all_urls),
                                "urls": all_urls,
                            },
                            f,
                            indent=2,
                        )

                    page_num += 1
                    await asyncio.sleep(2)

                except Exception as e:
                    print(f"  Error on page {page_num}: {e}")
                    print(f"  Continuing to next page...")
                    page_num += 1
                    await asyncio.sleep(3)
                    continue

        print(f'\n{"="*60}')
        print(f"COLLECTION COMPLETE — {len(all_urls)} total URLs")
        print("=" * 60)
        print(f"Saved to {output_file}")

    except Exception as e:
        print(f"Error: {e}")

    finally:
        print("\nStopping driver...")
        driver.stop()


if __name__ == "__main__":
    # Standalone defaults — edit these when running directly
    _BACKEND_DIR = Path(__file__).parent.parent
    _SEARCH_URLS = [
        "https://streeteasy.com/for-rent/manhattan",
        "https://streeteasy.com/for-rent/brooklyn",
        "https://streeteasy.com/for-rent/queens",
        "https://streeteasy.com/for-rent/bronx",
    ]
    _MAX_PAGES = 10
    _OUTPUT_FILE = _BACKEND_DIR / "data" / "listing_urls.json"

    uc.loop().run_until_complete(collect_listing_urls(_SEARCH_URLS, _MAX_PAGES, _OUTPUT_FILE))
