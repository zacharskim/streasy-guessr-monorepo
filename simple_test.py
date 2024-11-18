from playwright.sync_api import sync_playwright
import time

def main():
    # Start Playwright
    with sync_playwright() as p:
        # Launch Chromium in headed mode
        browser = p.chromium.launch(headless=False, slow_mo=100)
        
        # Open a new page
        page = browser.new_page()
        
        # Navigate to a website
        page.goto("https://google.com")

        # try:
        #     page.locator("button:has-text('Accept all')").click()
        # except:
        #     pass  # Skip if no cookie popup appears
        

        # Perform a search
        # page.locator("input[name='q']").wait_for()
        page.locator("textarea[name='q']").fill("streeteasy")
            
        # (Optional) Submit the form by pressing 'Enter'
        page.locator("textarea[name='q']").press("Enter")
        
        
        # Wait for the results to load
        page.wait_for_selector("h3")  # Wait for search result headings to appear

        # Click the first search result
        page.locator("h3").first.click()
        
        # Take a screenshot of the resulting page
        page.screenshot(path="screenshot_from_streeteasy.png")
        print("Screenshot saved as screenshot_from_streeteasy.png")

        time.sleep(30)
        #huh this kinda works?? unclear tho spend some more time in the future...
        
        

if __name__ == "__main__":
    main()
