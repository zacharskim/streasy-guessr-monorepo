import asyncio
import nodriver as uc
from nodriver import cdp
import json
import time
import random
import typing


class PayloadType(typing.TypedDict):
    url: str
    payload: str


async def scrape_html_fields(page: uc.Tab) -> dict:
    """Scrape sqft, home features, and image IDs from the HTML"""
    html_data = {"sqft": None, "home_features": [], "image_ids": []}

    try:
        # Get sqft from property details
        property_details = await page.select_all('[data-testid="propertyDetails"] p')
        for detail in property_details:
            text = detail.text.strip()
            if "ft²" in text and "$" not in text:  # Exclude "$ per ft²"
                # Extract just the number (e.g., "2,991 ft²" -> 2991)
                sqft_str = text.replace("ft²", "").replace(",", "").strip()
                try:
                    html_data["sqft"] = int(sqft_str)
                except ValueError:
                    pass
                break

        # Get home features
        all_feature_paragraphs = await page.select_all(
            '[data-testid="home-features-section"] li p[class*="Body_base"]'
        )
        print(f"    Found {len(all_feature_paragraphs)} feature paragraphs")

        for p_elem in all_feature_paragraphs:
            feature = p_elem.text.strip()
            if feature:  # Only add non-empty features
                html_data["home_features"].append(feature)

        print(f'    Extracted {len(html_data["home_features"])} features')

        # Get image IDs from carousel images
        # Look for images with src containing "photos.zillowstatic.com/fp/"
        image_elements = await page.select_all('img[src*="photos.zillowstatic.com/fp/"]')
        print(f"    Found {len(image_elements)} images in carousel")

        for img_elem in image_elements:
            src = img_elem.attrs.get('src', '')
            if '/fp/' in src:
                # Extract image ID from URL format: https://photos.zillowstatic.com/fp/[IMAGE_ID]-se_large_800_400.webp
                try:
                    image_id = src.split('/fp/')[1].split('-')[0]
                    if image_id and image_id not in html_data["image_ids"]:
                        html_data["image_ids"].append(image_id)
                except:
                    pass

        print(f'    Extracted {len(html_data["image_ids"])} image IDs from HTML')

    except Exception as e:
        print(f"    Error scraping HTML fields: {e}")

    return html_data


def extract_apartment_data(
    payload_str: str, listing_url: str = None, html_data: dict = None
) -> dict | None:
    """Extract apartment data from the JSON payload and HTML data"""
    try:
        data = json.loads(payload_str)
        print("data from json.loads etc", data)

        # Calculate bathrooms
        full_bath = data.get("property_info", {}).get("full_bath_cnt", 0)
        half_bath = data.get("property_info", {}).get("half_bath_cnt", 0)
        bathrooms = full_bath + (half_bath * 0.5)

        # Construct address
        street_address = data.get("property_info", {}).get("street_address", "")
        zip_code = data.get("property_info", {}).get("zip_code_nb", "")
        address = f"{street_address} {zip_code}".strip()

        # Split image IDs from analytics payload
        media_ids = data.get("media", {}).get("media_id", "")
        print("hello, the media_ids...should be below...")
        print(media_ids)
        image_ids = media_ids.split("|") if media_ids else []

        # Fallback to HTML image IDs if analytics didn't capture them
        if not image_ids and html_data:
            image_ids = html_data.get("image_ids", [])
            print(f"    Using {len(image_ids)} image IDs from HTML fallback")

        # Use HTML data if available, otherwise fall back to payload
        sqft = (
            html_data.get("sqft")
            if html_data
            else data.get("property_info", {}).get("square_feet_amt")
        )
        home_features = html_data.get("home_features", []) if html_data else []

        apartment = {
            "listing_url": listing_url,
            "rent": data.get("listing_info", {}).get("price_amt"),
            "sqft": sqft,
            "bedrooms": data.get("property_info", {}).get("bedroom_cnt"),
            "bathrooms": bathrooms,
            "neighborhood": data.get("property_info", {}).get("area_short_nm"),
            "borough": data.get("property_info", {}).get("borough_nm"),
            "address": address,
            "floor": None,  # not in payload
            "home_features": home_features,
            "amenities": data.get("listing_info", {}).get("amenities", []),
            "year_built": data.get("building_info", {}).get("year_built_amt"),
            "photo_count": data.get("listing_info", {}).get("photo_cnt"),
            "image_ids": image_ids,
            "listing_id": data.get("listing_info", {}).get("listing_id"),
            "property_id": data.get("property_info", {}).get("property_id"),
        }

        return apartment

    except (json.JSONDecodeError, KeyError, TypeError) as e:
        print(f"    Error parsing payload: {e}")
        return None


class RequestMonitor:
    def __init__(self):
        self.requests: list[PayloadType] = []
        self.last_request: float | None = None
        self.lock = asyncio.Lock()
        self.monitoring_active = False

    async def start_monitoring(self):
        """Call this after the button click to start capturing requests"""
        async with self.lock:
            self.monitoring_active = True
            print("    Monitoring started - capturing request payloads")

    async def listen(self, page: uc.Tab):
        async def handler(evt: cdp.network.RequestWillBeSent):
            async with self.lock:
                # Only capture if monitoring is active
                if not self.monitoring_active:
                    return

                # Filter for StreetEasy analytics requests
                if "https://cs.zg-api.com/click/se_prod_web_nl/" in evt.request.url:
                    print(f"    Captured request: {evt.request.url}")

                    # Get the request payload (post data)
                    payload = evt.request.post_data if evt.request.post_data else ""

                    self.requests.append({"url": evt.request.url, "payload": payload})
                    self.last_request = time.time()

        page.add_handler(cdp.network.RequestWillBeSent, handler)

    async def receive(self):
        """Returns all captured request payloads"""
        # Wait for first request to come in
        initial_wait = 0
        while self.last_request is None and initial_wait < 10:
            await asyncio.sleep(0.5)
            initial_wait += 0.5

        if self.last_request is None:
            async with self.lock:
                print(f"    Warning: No requests captured after {initial_wait}s")
                return self.requests.copy()

        # Now wait for requests to stop coming
        retries = 0
        max_retries = 5

        while True:
            if retries > max_retries:
                break

            if time.time() - self.last_request <= 2:
                retries += 1
                await asyncio.sleep(2)
                continue
            else:
                break

        async with self.lock:
            print(f"    Returning {len(self.requests)} captured payloads")
            return self.requests.copy()


async def scrape_listing(listing_url: str, tab: uc.Tab) -> dict | None:
    """
    Scrape a single listing by navigating directly to its URL
    No clicking from search pages - just go straight to the listing
    """
    monitor = RequestMonitor()

    try:
        print(f'\n{"="*60}')
        print(f"SCRAPING: {listing_url}")
        print("=" * 60)

        print("[Step 1] Navigating directly to listing URL...")
        await tab.get(listing_url)
        await tab.sleep(5)

        # Check the actual URL we landed on
        current_url = tab.target.url
        print(f"    Landed on URL: {current_url}")

        # Check for redirects or blocking
        if "streeteasy.com" not in current_url:
            print(f"BLOCKED: Redirected to unexpected domain: {current_url}")
            await tab.save_screenshot("unexpected_redirect.png")
            return None

        print("[Step 2] Setting up request monitor...")
        await monitor.listen(tab)

        print("[Step 3] Waiting longer for page and analytics to fully load...")
        await tab.sleep(8)  # Increased from 5 to 8 seconds

        print("[Step 4] Looking for next button...")
        next_button = await tab.select('button[data-testid="next-image-button"]')

        if not next_button:
            print("Could not find next button - checking page state...")
            # Save screenshot to debug why button wasn't found
            try:
                await tab.save_screenshot(f"no_button_{int(time.time())}.png")
                print(f"    Screenshot saved for debugging")
            except:
                pass

            # Check if page has expected content
            page_html = await tab.get_content()
            if "listing" not in page_html.lower():
                print("Page does not appear to be a listing page!")
            else:
                print("    Page looks like a listing but button not found")

            return None

        print("[Step 5] Found next button!")
        print("[Step 6] Starting request monitoring...")
        await monitor.start_monitoring()

        print("[Step 7] Clicking the button to trigger analytics...")
        await next_button.click()

        print("[Step 8] Collecting captured payloads (will wait for requests)...")
        payloads = await monitor.receive()
        print(f"Successfully captured {len(payloads)} request payloads")

        # Scrape HTML fields (sqft and home features)
        print("[Step 9] Scraping sqft and home features from HTML...")
        html_data = await scrape_html_fields(tab)
        print(
            f'Scraped sqft: {html_data.get("sqft")}, features: {len(html_data.get("home_features", []))}'
        )

        # Extract apartment data from payloads
        apartment_data = None
        for i, payload_data in enumerate(payloads):
            extracted = extract_apartment_data(
                payload_data["payload"], listing_url, html_data
            )
            if extracted and extracted.get("listing_id"):
                apartment_data = extracted
                break

        if apartment_data:
            print("Successfully extracted apartment data!")
        else:
            print("Could not extract apartment data from any payload")
            print(
                f"FAILURE REASON: No valid payload data captured (got {len(payloads)} payloads)"
            )

        return apartment_data

    except Exception as e:
        print(f"Error scraping listing: {e}")
        print(f"FAILURE REASON: Exception - {type(e).__name__}: {str(e)}")
        # Try to save screenshot on exception
        try:
            await tab.save_screenshot(f"exception_{int(time.time())}.png")
            print(f"    Exception screenshot saved")
        except:
            pass
        return None


async def collect_listing_data():
    """
    Phase 2: Visit each URL directly and scrape listing data
    This is slow and careful to avoid detection
    Creates a FRESH browser session for each listing
    """

    # Load URLs from file
    listing_urls_file = "./listing_urls.json"
    with open(listing_urls_file, "r") as f:
        data = json.load(f)

    all_urls = data["urls"]
    print(f'\n{"#"*60}')
    print(f"LOADED {len(all_urls)} URLs TO SCRAPE")
    print("#" * 60)

    # Shuffle URLs to make scraping pattern less predictable
    random.shuffle(all_urls)
    print("URLs shuffled for unpredictable scraping order")

    # Track progress
    scraped_apartments = []
    failed_urls = []

    # Load existing progress if file exists
    progress_file = "scraped_apartments.json"
    try:
        with open(progress_file, "r") as f:
            existing_data = json.load(f)
            if isinstance(existing_data, list):
                scraped_apartments = existing_data
                print(
                    f"Loaded {len(scraped_apartments)} previously scraped apartments"
                )

            # Skip URLs we've already scraped
            scraped_urls = {
                apt["listing_url"] for apt in scraped_apartments if "listing_url" in apt
            }
            all_urls = [url for url in all_urls if url not in scraped_urls]
            print(f"Skipping {len(scraped_urls)} already scraped URLs")
            print(f"  Remaining URLs to scrape: {len(all_urls)}")
    except FileNotFoundError:
        print("  No existing progress file found - starting fresh")

    # Process each listing with a fresh browser session
    for idx, url in enumerate(all_urls, 1):
        print(f'\n\n{"*"*60}')
        print(
            f"LISTING {idx}/{len(all_urls)} (Total scraped: {len(scraped_apartments)})"
        )
        print(f'{"*"*60}')

        # Random delay before starting new browser session
        delay = random.uniform(30, 90)
        print(f"Waiting {delay:.1f}s before starting new browser session...")
        await asyncio.sleep(delay)

        # Start fresh browser for this listing
        print("Starting new browser session...")
        driver = await uc.start(headless=False, sandbox=False)

        try:
            # Get the first tab
            tab = driver.tabs[0] if driver.tabs else await driver.get("about:blank")

            # Scrape the listing
            apartment_data = await scrape_listing(url, tab)

            if apartment_data:
                scraped_apartments.append(apartment_data)
                print(
                    f"\nSUCCESS! Total apartments scraped: {len(scraped_apartments)}"
                )

                # Save progress immediately after each success
                with open(progress_file, "w") as f:
                    json.dump(scraped_apartments, f, indent=2)
                print(f"Progress saved to {progress_file}")
            else:
                failed_urls.append(url)
                print(f"\nFAILED. Total failures: {len(failed_urls)}")

                # Save failed URLs
                with open("failed_urls.json", "w") as f:
                    json.dump(
                        {
                            "failed_at": time.strftime("%Y-%m-%d %H:%M:%S"),
                            "count": len(failed_urls),
                            "urls": failed_urls,
                        },
                        f,
                        indent=2,
                    )

        except Exception as e:
            print(f"\nError processing listing: {e}")
            failed_urls.append(url)

        finally:
            # Always close the browser after each listing
            print("Closing browser session...")
            try:
                driver.stop()
            except:
                pass

        # Optional: Take a longer break every 10 listings
        if idx % 10 == 0 and idx < len(all_urls):
            break_time = random.uniform(180, 300)  # 3-5 minute break
            print(f'\n{"~"*60}')
            print(f"PROGRESS CHECK: {idx}/{len(all_urls)} processed")
            print(
                f"   Successes: {len(scraped_apartments)} | Failures: {len(failed_urls)}"
            )
            print(f"   Taking a {break_time/60:.1f} minute break...")
            print(f'{"~"*60}')
            await asyncio.sleep(break_time)

    # Final summary
    print(f'\n\n{"="*60}')
    print(f"SCRAPING COMPLETE!")
    print("=" * 60)
    print(f"Total apartments scraped: {len(scraped_apartments)}")
    print(f"Total failures: {len(failed_urls)}")
    if (len(scraped_apartments) + len(failed_urls)) > 0:
        print(
            f"Success rate: {len(scraped_apartments)/(len(scraped_apartments)+len(failed_urls))*100:.1f}%"
        )


if __name__ == "__main__":
    uc.loop().run_until_complete(collect_listing_data())
