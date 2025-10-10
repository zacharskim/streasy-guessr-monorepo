import requests
import json
from fake_useragent import UserAgent

def makeNewSesh():
    sesh = requests.Session()
    sesh.headers.update(get_headers())
    return sesh 
    

    
def get_headers():
    ua = UserAgent()
    random_user_agent = ua.random
    default_user_agent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
    user_agent = random_user_agent or default_user_agent

    return {
        'user-agent': user_agent,
        'accept-language': 'en-US,en;q=0.9',
        'referer': 'https://streeteasy.com/',
        'cache-control': 'no-cache',
        'content-type': 'application/json',
        'origin': 'https://streeteasy.com',
}
    
    
    
def fetch(sesh, url) -> list[dict[str, str]]:
    """Check the search URL for new listings."""
    # print(f'Running script with parameters:\n{json.dumps(parameters, indent=2)}\n')
    print(f'URL: {url}')
    r = sesh.get(url)
    if r.status_code == 200:
        print('well good response ig', r.content)
        # parser = Parser(r.content, db)
        listings =  ''

    if not listings:
        print(f'No new listings.\n')

    return listings



# if __name__ == "__main__":
#     sesh = makeNewSesh()
#     fetch(sesh, 'https://streeteasy.com/building/sven-29_59-northern-boulevard-long_island_city/67d?featured=1')
    

from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)  # Launch browser
    context = browser.new_context()

    # Intercept requests
    # def handle_request(route, request):
    #     print(f"Intercepted request to {request.url}")
    #     route.continue_()

    page = context.new_page()
    # page.route("**/*", handle_request)  # Intercept all requests
    page.goto("https://streeteasy.com/building/sven-29_59-northern-boulevard-long_island_city/67d?featured=1")
    

    browser.close()