import asyncio
import nodriver as uc
from nodriver import cdp
import time
import typing
import json


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
        # Get sqft from property details - look for any p tag containing "ft²"
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

        # Get home features - use Body_base class to get only main feature text (excludes captions)
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


async def main():
    driver = await uc.start(headless=False)
    monitor = RequestMonitor()

    tab = await driver.get("https://streeteasy.com/for-rent/manhattan")
    time.sleep(3)
    # Updated selector for new StreetEasy HTML structure
    links = await tab.select_all('a[href*="/building/"][class*="ListingDescription-module__addressTextAction"]')

    link = links[0]
    print(f'Found {len(links)} listings')
    print(f'First listing URL: {link.attrs["href"]}')
    await tab.sleep(3)
    
    try:
        print('\n[Step 1] Opening new tab...')
        tab = await driver.get('about:blank', new_tab=True)

        print('[Step 2] Setting up request monitor...')
        await monitor.listen(tab)

        print(f'[Step 3] Navigating to listing: {link.attrs["href"]}')
        listing_tab = await tab.get(link.attrs['href'], new_tab=False)

        print('[Step 4] Waiting for page to fully load...')
        await listing_tab.sleep(5)

        print('[Step 5] Looking for next button...')
        next_button = await listing_tab.select('button[data-testid="next-image-button"]')

        if next_button:
            print('[Step 6] Found next button!')

            print('[Step 7] Starting request monitoring...')
            await monitor.start_monitoring()

            print('[Step 8] Clicking the button...')
            await next_button.click()

            print('[Step 9] Collecting captured payloads (will wait for requests)...')
            payloads = await monitor.receive()
            print(f'\n✓ Successfully captured {len(payloads)} request payloads\n')

            # Scrape HTML fields (sqft and home features)
            print('[Step 11] Scraping sqft and home features from HTML...')
            html_data = await scrape_html_fields(listing_tab)
            print(f'✓ Scraped sqft: {html_data.get("sqft")}, features: {len(html_data.get("home_features", []))}')

            # Extract apartment data from payloads
            apartment_data = None
            current_url = link.attrs['href']  # Get the URL we navigated to

            for i, payload_data in enumerate(payloads):
                print(f"\n--- Payload {i+1} ---")
                print(f"URL: {payload_data['url']}")

                # Try to extract apartment data, passing the listing URL and HTML data
                extracted = extract_apartment_data(payload_data['payload'], current_url, html_data)
                if extracted and extracted.get('listing_id'):
                    print("✓ Successfully extracted apartment data!")
                    apartment_data = extracted
                else:
                    print("✗ No apartment data found in this payload")
                print()

            # Print the final apartment data
            if apartment_data:
                print("\n" + "="*50)
                print("EXTRACTED APARTMENT DATA")
                print("="*50)
                print(json.dumps(apartment_data, indent=2))
            else:
                print("\n✗ Could not extract apartment data from any payload")
        else:
            print('✗ Could not find next button')
        
    except Exception as e:
        print(f"Well, something went wrong....{e}")

    print("Stopping without errors")
    driver.stop()

if __name__ == '__main__':
    uc.loop().run_until_complete(main())

    
    