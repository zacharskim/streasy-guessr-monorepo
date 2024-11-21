from playwright.async_api import async_playwright
from random import randint, uniform
import asyncio
from fake_useragent import UserAgent


async def fetch_links_and_coords(page):
    """Extract all hrefs and coords from the main page."""
    links_data = []
    links = await page.locator('a.listingCard-globalLink').all()
    for link in links:
        href = await link.get_attribute('href')
        coords = await link.get_attribute('data-map-points')
        if href and coords:  # Ensure both attributes exist
            links_data.append({"href": href, "coords": coords})
    return links_data


async def monitor_network_requests(page):
    """Attach listeners to monitor network requests."""
    requests = []

    def log_request(request):
        requests.append({
            "url": request.url,
            "method": request.method,
            "headers": request.headers
        })

    page.on("request", log_request)
    return requests


async def visit_and_collect_data(browser, links_data):
    """Visit each link and collect network requests."""
    for link in links_data:
        href = link["href"]
        coords = link["coords"]
        print(f"Visiting {href} with coords {coords}...")

        context = await browser.new_context(user_agent= random_headers())

        page = await browser.new_page()

        # Monitor network requests
        network_requests = await monitor_network_requests(page)

        try:
            await page.goto(href)
            text = await page.locator('div.Flickity-count').text_content()
            print(text)
            # Wait for the page to load (optional)
            await page.wait_for_load_state("networkidle")
        except Exception as e:
            print(f"Failed to visit {href}: {e}")
        finally:
            await page.close()

        # Print or process captured requests
        print(f"Captured {len(network_requests)} requests for {href}:")
        for req in network_requests:
            print(req["url"])

        # Add a delay between visits to avoid overloading the server
        await asyncio.sleep(10)

        
async def random_scroll(page):
    """Simulate random scrolling on the page."""
    for _ in range(randint(3, 5)):  # Random number of scrolls (e.g., 3 to 7 times)
        scroll_distance = randint(200, 800)  # Random distance in pixels
        await page.evaluate(f"window.scrollBy(0, {scroll_distance});")  # Scroll down
        # print(f"Scrolled by {scroll_distance} pixels.")

        await asyncio.sleep(uniform(0.5, 2))  # Random delay between scrolls

    # Optionally, scroll back to the top
    await page.evaluate("window.scrollTo(0, 0);")
    print("Scrolled back to top.")

def random_headers():
    ua = UserAgent()
    random_user_agent = ua.random
    default_user_agent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
    user_agent = random_user_agent or default_user_agent
    return user_agent



async def main():
    url = "https://streeteasy.com/for-rent/manhattan/"

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False, slow_mo=100)
        context = await browser.new_context(user_agent= random_headers())
        page = await browser.new_page()
        print(random_headers())

        # Navigate to the main page and extract links
        await page.goto(url)
        await asyncio.sleep(3)
        await random_scroll(page)
        links_data = await fetch_links_and_coords(page)
        await browser.close()
        print(links_data) 

        await asyncio.sleep(7)

        # Visit each link and collect data
        browser_new = await p.chromium.launch(headless=False, slow_mo=100)
        context = await browser_new.new_context(user_agent= random_headers())
        await visit_and_collect_data(browser_new, links_data)


if __name__ == "__main__":
    asyncio.run(main())


