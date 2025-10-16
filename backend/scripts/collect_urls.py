import asyncio
import nodriver as uc
import json
import time

async def collect_listing_urls():
    """
    Collect all listing URLs from StreetEasy search pages
    """
    locations = ['manhattan', 'brooklyn', 'queens', 'bronx']
    max_pages_per_borough = 10  # Adjust this to control how many pages to scrape
    all_urls = []

    driver = await uc.start(headless=False, sandbox=False)

    try:
        for borough in locations:
            print(f'\n{"#"*60}')
            print(f'COLLECTING URLs FROM: {borough.upper()}')
            print("#"*60)

            page_num = 1

            while page_num <= max_pages_per_borough:
                url = f"https://streeteasy.com/for-rent/{borough}?page={page_num}"
                print(f'\nPage {page_num}: {url}')

                try:
                    tab = await driver.get(url)

                    # Wait longer for page to fully load
                    await tab.sleep(5)

                    # Try to wait for listings to appear (with timeout)
                    retries = 0
                    links = []
                    while retries < 3:
                        links = await tab.select_all('a[href*="/building/"][class*="ListingDescription-module__addressTextAction"]')
                        if links:
                            break
                        print(f'  Waiting for listings to load... (attempt {retries + 1}/3)')
                        await asyncio.sleep(2)
                        retries += 1

                    print(f'  Found {len(links)} listings on page {page_num}')

                    if not links:
                        print(f'  No listings found - end of results for {borough}')
                        break

                    # Extract URLs immediately (before DOM changes)
                    page_urls = []
                    for link in links:
                        try:
                            href = link.attrs.get('href', '')
                            if href and href.startswith('http'):
                                page_urls.append(href)
                        except Exception as e:
                            # Skip this link if we can't get its href
                            continue

                    # Add to master list (avoid duplicates)
                    new_urls = 0
                    for href in page_urls:
                        if href not in all_urls:
                            all_urls.append(href)
                            new_urls += 1

                    print(f'  Added {new_urls} new URLs (total: {len(all_urls)})')

                    # Save progress after each page
                    with open('listing_urls.json', 'w') as f:
                        json.dump({
                            'collected_at': time.strftime('%Y-%m-%d %H:%M:%S'),
                            'total_count': len(all_urls),
                            'urls': all_urls
                        }, f, indent=2)

                    page_num += 1

                    # Small delay between pages
                    await asyncio.sleep(2)

                except Exception as e:
                    print(f'  Error on page {page_num}: {e}')
                    print(f'  Continuing to next page...')
                    page_num += 1
                    await asyncio.sleep(3)
                    # Don't break - try to continue to next page
                    continue

        print(f'\n{"="*60}')
        print(f'COLLECTION COMPLETE')
        print("="*60)
        print(f'Total URLs collected: {len(all_urls)}')

        # Save to JSON file
        output_file = 'listing_urls.json'
        with open(output_file, 'w') as f:
            json.dump({
                'collected_at': time.strftime('%Y-%m-%d %H:%M:%S'),
                'total_count': len(all_urls),
                'urls': all_urls
            }, f, indent=2)

        print(f'\n✓ URLs saved to {output_file}')
        print(f'\nFirst 5 URLs:')
        for i, url in enumerate(all_urls[:5], 1):
            print(f'  {i}. {url}')

    except Exception as e:
        print(f"Error in main: {e}")

    finally:
        print("\nStopping driver...")
        driver.stop()

if __name__ == '__main__':
    uc.loop().run_until_complete(collect_listing_urls())
