from playwright.async_api import async_playwright
import time
import asyncio

async def main():
    # Start Playwright
    async with async_playwright() as p:
        # Launch Chromium in headed mode
        browser = await p.chromium.launch(headless=False, slow_mo=100)
        
        # Open a new page
        page = await browser.new_page()
        
        # Navigate to a website
        await page.goto("https://streeteasy.com/")

        # Perform a search
        # page.locator("input[name='q']").wait_for()
        # await page.locator("textarea[name='q']").fill("streeteasy")
            
        # (Optional) Submit the form by pressing 'Enter'
        # await page.locator("textarea[name='q']").press("Enter")
        # await page.click('g-raised-button:has-text("Not now")') 
        
        
        # Wait for the results to load
        # await page.wait_for_selector("h3")  # Wait for search result headings to appear

        # Click the first search result
        # await page.locator("h3").first.click()

        await page.get_by_text('Choose neighborhoods or boroughs').click();
        await page.type('#location-search', 'manhattan', delay=100)  # Human-like typing
        
        #was concerned about bot detection but think i don't need to do it all like manul step by step,,,
        #think i can just slowly use urls similar to those and be fine...
        #https://streeteasy.com/for-rent/manhattan/price:2000-4500
        # https://streeteasy.com/for-rent/bronx/price:2000-4500
        # https://streeteasy.com/for-rent/queens/price:2000-4500 - between 2000 and 4500 example....
        # https://streeteasy.com/for-rent/queens/price:-4500 - max of 4500 example 
        # https://streeteasy.com/for-rent/queens/price:4500- min of 4500 example
        # https://streeteasy.com/for-rent/queens/price:-4500?page=3 - example with page number...

        
 
        
        # await page.get_by_role("input").fill("example value")
        
        # Take a screenshot of the resulting page
        # page.screenshot(path="screenshot_from_streeteasy.png")
        print("Screenshot saved as screenshot_from_streeteasy.png")

        time.sleep(4)
        #huh this kinda works?? unclear tho spend some more time in the future...
        
        

if __name__ == "__main__":
    asyncio.run(main())
