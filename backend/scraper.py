import asyncio
import nodriver as uc
from nodriver import cdp
import time
import typing
import json
import random


# ResponseType, RequestMonitor classes are adapted from a github issue comment: https://github.com/ultrafunkamsterdam/undetected-chromedriver/issues/1832, modified to get image requests...
# Which was also modified from: https://github.com/ultrafunkamsterdam/undetected-chromedriver/issues/1832#issuecomment-2075243964, https://github.com/ultrafunkamsterdam/undetected-chromedriver/issues/1832#issuecomment-2092205033

class PayloadType(typing.TypedDict):
    url: str
    payload: str

async def scrape_html_fields(page: uc.Tab) -> dict:
    """Scrape sqft and home features from the HTML"""
    html_data = {
        'sqft': None,
        'home_features': []
    }

    try:
        # Get sqft from property details 
        property_details = await page.select_all('[data-testid="propertyDetails"] p')
        for detail in property_details:
            text = detail.text.strip()
            if 'ft²' in text and '$' not in text:  # Exclude "$ per ft²"
                # Extract just the number (e.g., "2,991 ft²" -> 2991)
                sqft_str = text.replace('ft²', '').replace(',', '').strip()
                try:
                    html_data['sqft'] = int(sqft_str)
                except ValueError:
                    pass
                break

        # Get home features 
        all_feature_paragraphs = await page.select_all('[data-testid="home-features-section"] li p[class*="Body_base"]')
        print(f'Found {len(all_feature_paragraphs)} feature paragraphs')

        for p_elem in all_feature_paragraphs:
            feature = p_elem.text.strip()
            if feature:  # Only add non-empty features
                html_data['home_features'].append(feature)

        print(f'Extracted {len(html_data["home_features"])} features')

    except Exception as e:
        print(f"Error scraping HTML fields: {e}")

    return html_data

def extract_apartment_data(payload_str: str, listing_url: str = None, html_data: dict = None) -> dict | None:
    """Extract apartment data from the JSON payload and HTML data"""
    try:
        data = json.loads(payload_str)

        # Calculate bathrooms
        full_bath = data.get('property_info', {}).get('full_bath_cnt', 0)
        half_bath = data.get('property_info', {}).get('half_bath_cnt', 0)
        bathrooms = full_bath + (half_bath * 0.5)

        # Construct address
        street_address = data.get('property_info', {}).get('street_address', '')
        zip_code = data.get('property_info', {}).get('zip_code_nb', '')
        address = f"{street_address} {zip_code}".strip()

        # Split image IDs
        media_ids = data.get('media', {}).get('media_id', '')
        image_ids = media_ids.split('|') if media_ids else []

        # Use HTML data if available, otherwise fall back to payload
        sqft = html_data.get('sqft') if html_data else data.get('property_info', {}).get('square_feet_amt')
        home_features = html_data.get('home_features', []) if html_data else []

        apartment = {
            'listing_url': listing_url,  # Use the actual URL we navigated to
            'rent': data.get('listing_info', {}).get('price_amt'),
            'sqft': sqft,
            'bedrooms': data.get('property_info', {}).get('bedroom_cnt'),
            'bathrooms': bathrooms,
            'neighborhood': data.get('property_info', {}).get('area_short_nm'),
            'borough': data.get('property_info', {}).get('borough_nm'),
            'address': address,
            'floor': None,  # not in payload
            'home_features': home_features,  # From HTML
            'amenities': data.get('listing_info', {}).get('amenities', []),
            'year_built': data.get('building_info', {}).get('year_built_amt'),
            'photo_count': data.get('listing_info', {}).get('photo_cnt'),
            'image_ids': image_ids,
            'listing_id': data.get('listing_info', {}).get('listing_id'),
            'property_id': data.get('property_info', {}).get('property_id')
        }

        return apartment

    except (json.JSONDecodeError, KeyError, TypeError) as e:
        print(f"Error parsing payload: {e}")
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
            print("Monitoring started - capturing request payloads")

    async def listen(self, page: uc.Tab):
        async def handler(evt: cdp.network.RequestWillBeSent):
            async with self.lock:
                # Only capture if monitoring is active
                if not self.monitoring_active:
                    return

                # Filter for StreetEasy analytics requests
                if "https://cs.zg-api.com/click/se_prod_web_nl/" in evt.request.url:
                    print(f'Captured request: {evt.request.url}')

                    # Get the request payload (post data)
                    payload = evt.request.post_data if evt.request.post_data else ""

                    self.requests.append({
                        'url': evt.request.url,
                        'payload': payload
                    })
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
                print(f'Warning: No requests captured after {initial_wait}s')
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
            print(f'Returning {len(self.requests)} captured payloads')
            return self.requests.copy()


async def scrape_listing(link_element, search_tab, driver) -> dict | None:
    """Scrape a single listing and return apartment data"""
    monitor = RequestMonitor()
    listing_tab = None

    try:
        link_url = link_element.attrs.get('href', 'unknown')
        print(f'\n{"="*60}')
        print(f'SCRAPING: {link_url}')
        print("="*60)

        print('[Step 1] Clicking link to open listing in new tab...')
        # Click the link - this opens in a NEW tab
        await link_element.click()

        # Wait for new tab to open
        await asyncio.sleep(4)

        # Get the new listing tab (last opened tab)
        listing_tab = driver.tabs[-1]

        print('[Step 2] Setting up request monitor...')
        await monitor.listen(listing_tab)

        print('[Step 3] Waiting for page to fully load...')
        await listing_tab.sleep(5)

        print('[Step 4] Looking for next button...')
        next_button = await listing_tab.select('button[data-testid="next-image-button"]')

        if not next_button:
            print('✗ Could not find next button')
            return None

        print('[Step 5] Found next button!')
        print('[Step 6] Starting request monitoring...')
        await monitor.start_monitoring()

        print('[Step 7] Clicking the button...')
        await next_button.click()

        print('[Step 8] Collecting captured payloads (will wait for requests)...')
        payloads = await monitor.receive()
        print(f'✓ Successfully captured {len(payloads)} request payloads')

        # Scrape HTML fields (sqft and home features)
        print('[Step 9] Scraping sqft and home features from HTML...')
        html_data = await scrape_html_fields(listing_tab)
        print(f'✓ Scraped sqft: {html_data.get("sqft")}, features: {len(html_data.get("home_features", []))}')

        # Extract apartment data from payloads
        apartment_data = None
        for i, payload_data in enumerate(payloads):
            extracted = extract_apartment_data(payload_data['payload'], link_url, html_data)
            if extracted and extracted.get('listing_id'):
                apartment_data = extracted
                break

        if apartment_data:
            print("✓ Successfully extracted apartment data!")
        else:
            print("✗ Could not extract apartment data from any payload")

        return apartment_data

    except Exception as e:
        print(f"✗ Error scraping listing: {e}")
        return None

    finally:
        # Always close the listing tab and return to search tab
        if listing_tab:
            try:
                print('[Step 10] Closing listing tab...')
                await listing_tab.close()
                await asyncio.sleep(1)
            except Exception as e:
                print(f'Warning: Could not close tab: {e}')


async def main():
    locations = ['manhattan']  
    max_listings_per_borough = 3  
    all_apartments = []

    driver = await uc.start(headless=False, sandbox=False)

    try:
        for borough in locations:
            print(f'\n\n{"#"*60}')
            print(f'BOROUGH: {borough.upper()}')
            print("#"*60)

            scraped_count = 0
            page = 1

            # Loop through pages until we hit our limit
            while scraped_count < max_listings_per_borough:
                # Navigate to borough listings page
                url = f"https://streeteasy.com/for-rent/{borough}?page={page}"
                print(f'\nNavigating to page {page}: {url}')
                tab = await driver.get(url)
                await tab.sleep(3)

                # Get listing links
                links = await tab.select_all('a[href*="/building/"][class*="ListingDescription-module__addressTextAction"]')
                print(f'Found {len(links)} listings on page {page}')

                # If no links found, we've reached the end
                if not links:
                    print(f'No more listings found for {borough}')
                    break

                # Track how many we attempt from this page
                attempts_on_page = 0

                # Scrape listings from this page
                for link in links:
                    if scraped_count >= max_listings_per_borough:
                        break

                    # Limit attempts per page to avoid infinite loops
                    if attempts_on_page >= len(links):
                        break

                    attempts_on_page += 1

                    # Check that link has href
                    if not link.attrs.get('href'):
                        continue

                    # Random delay before clicking (makes first click less instant)
                    pre_click_delay = random.uniform(5, 9)
                    print(f'\nAttempt #{attempts_on_page} on this page')
                    print(f'Waiting {pre_click_delay:.1f}s before clicking link...')
                    await asyncio.sleep(pre_click_delay)

                    apartment_data = await scrape_listing(link, tab, driver)

                    # Tab is closed automatically in scrape_listing, search tab still active

                    if apartment_data:
                        all_apartments.append(apartment_data)
                        scraped_count += 1
                        print(f'\n✓ Progress: {scraped_count}/{max_listings_per_borough} listings scraped from {borough}')

                    # Delay between listings to avoid rate limiting
                    # Random delay between 5-12 seconds to be safer
                    delay = random.uniform(5, 12)
                    print(f'Waiting {delay:.1f}s before next listing...')
                    await asyncio.sleep(delay)

                # Move to next page
                page += 1

                # Add longer delay between pages
                if scraped_count < max_listings_per_borough:
                    page_delay = random.uniform(10, 20)
                    print(f'\nWaiting {page_delay:.1f}s before loading next page...')
                    await asyncio.sleep(page_delay)

        # Print summary
        print(f'\n\n{"="*60}')
        print(f'SCRAPING COMPLETE')
        print("="*60)
        print(f'Total apartments scraped: {len(all_apartments)}')

        # Save to JSON file
        output_file = 'scraped_apartments.json'
        with open(output_file, 'w') as f:
            json.dump(all_apartments, f, indent=2)
        print(f'\n✓ Data saved to {output_file}')

        print(f'\nAll apartment data:')
        print(json.dumps(all_apartments, indent=2))

    except Exception as e:
        print(f"Error in main: {e}")

    finally:
        print("\nStopping driver...")
        driver.stop()

if __name__ == '__main__':
    uc.loop().run_until_complete(main())

    
    
