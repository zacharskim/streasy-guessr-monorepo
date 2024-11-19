from playwright.async_api import async_playwright
import time
import asyncio

async def main():
    url = "https://streeteasy.com/for-rent/manhattan/"

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False, slow_mo=100)
        
        page = await browser.new_page()
        
        await page.goto(url)
        links = await page.locator('a.listingCard-globalLink').all()
        for link in links:
            # print(link)
            href = await link.get_attribute('href')
            print(href)
        time.sleep(7)

        
    
if __name__ == "__main__":
    asyncio.run(main())

