

#plan is to make a script that uses some sort of way to scrape some images from street easy and download thme or something idk..

#sooo uhh storage wise feel like i can just do that locally? idk...would probably cost a lot to host them online somewhere...so my site can 
#just recived them from my local some how ?? idk look into this...

#should run the scraping script like daily or every other day maybe? idk...doesn't need to scrape everything but like a good collection of 
#places from each borough more or less....

#collect address, price, all images related to the apartment, any more locaiton stuff?? idk ...
# Chromium, Firefox, or WebKit

import re
from playwright.sync_api import Page, expect 

# chromium.launch(headless=False, slow_mo=100)

def test_has_title(page: Page):
    page.goto("https://playwright.dev/")

    # Expect a title "to contain" a substring.
    expect(page).to_have_title(re.compile("Playwright"))

def test_get_started_link(page: Page):
    page.goto("https://playwright.dev/")

    # Click the get started link.
    page.get_by_role("link", name="Get started").click()

    # Expects page to have a heading with the name of Installation.
    expect(page.get_by_role("heading", name="Installation")).to_be_visible()

    
    