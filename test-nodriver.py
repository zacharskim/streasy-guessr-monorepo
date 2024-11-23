import asyncio
import nodriver as uc
from nodriver import cdp
import time
import re
import typing
import random


# ResponseType, RequestMonitor classes are adapted from a github issue comment: https://github.com/ultrafunkamsterdam/undetected-chromedriver/issues/1832, modified to get image requests...
# need to determine how to tie this in with the code above etc...

# Which was also modified from: https://github.com/ultrafunkamsterdam/undetected-chromedriver/issues/1832#issuecomment-2075243964, https://github.com/ultrafunkamsterdam/undetected-chromedriver/issues/1832#issuecomment-2092205033

class ResponseType(typing.TypedDict):
    url: str
    body: str
    is_base64: bool

class RequestMonitor:
    def __init__(self):
        self.requests: list[list[str | cdp.network.RequestId]] = []
        self.last_request: float | None = None
        self.lock = asyncio.Lock()

    async def listen(self, page: uc.Tab):
        async def handler(evt: cdp.network.ResponseReceived):
            async with self.lock:
                if evt.response.encoded_data_length > 0 and evt.type_ is cdp.network.ResourceType.IMAGE:
                    self.requests.append([evt.response.url, evt.request_id])
                    self.last_request = time.time()

        page.add_handler(cdp.network.ResponseReceived, handler)

    async def receive(self, page: uc.Tab):
        responses: list[ResponseType] = []
        retries = 0
        max_retries = 5

        # Wait at least 2 seconds after the last IMGAGE  request to get some more
        while True:
            if self.last_request is None or retries > max_retries:
                break

            if time.time() - self.last_request <= 2:
                retries += 1
                await asyncio.sleep(2)
                continue
            else:
                break

        await page  # Waiting for page operation to complete.

        # Loop through gathered requests and get its response body
        async with self.lock:
            for request in self.requests:
                try:
                    if not isinstance(request[1], cdp.network.RequestId):
                        raise ValueError('Request ID is not of type RequestId')

                    res = await page.send(cdp.network.get_response_body(request[1]))
                    if res is None:
                        continue
                    
                    if request[0].endswith('.webp'):
                        responses.append({
                            'url': request[0],
                            'body': res[0],  # Assuming res[0] is the response body
                            'is_base64': res[1]  # Assuming res[1] indicates if response is base64 encoded
                        })
                except Exception as e:
                    print('Error getting body', e)

        return responses


async def main():
    driver = await uc.start(headless=False)
    monitor = RequestMonitor()

    tab = await driver.get("https://streeteasy.com/for-rent/manhattan")
    time.sleep(3)
    print('loaded streeteasy')
    links = await tab.select_all('a.listingCard-globalLink')
    link = links[0]
    print(link.attrs['href']) #url...
    print(link.attrs['data-map-points']) #string with two ints seperatated by a comma '40.73789978,-73.97299957'
    # hrefs = [link.get_attributes('href') for link in links if link.get_attributes('href')]
    await tab.sleep(3)
    
    try:

        tab = await driver.get('about:blank', new_tab=True) 

        await monitor.listen(tab)

        listing_tab = await tab.get(link.attrs['href'], new_tab=False)
        await listing_tab.sleep(3)
        text = await listing_tab.select_all('div.Flickity-count.jsFlickityCount')
        print(text)
        num_pics_arr = re.findall(r'\d+', text[0].text_all)
        if len(num_pics_arr) > 0:
            num_of_pics = int(num_pics_arr[1])

        
        button = await listing_tab.select_all('button.flickity-button.flickity-prev-next-button.next')
        print('\n')
        # print(button)
        
        print('"listing page" => clicking through pics')
        for i in range(1, num_of_pics):
            await button[0].click()
            randomInt = random.randint(2, 5)
            await listing_tab.sleep(randomInt)


        image_responses = await monitor.receive(listing_tab)

        # Print URL and response body
        for response in image_responses:
            print(f"URL: {response['url']}")
            print('Response Body:')
            print(response['body'] if not response['is_base64'] else 'Base64 encoded data')
        
    except Exception as e:
        print(f"Well, something went wrong....{e}")

    print("Stopping without errors?")
    driver.stop()

if __name__ == '__main__':
    uc.loop().run_until_complete(main())


async def crawl():
    browser = await uc.start(headless=False)
    monitor = RequestMonitor()

    tab = await browser.get('about:blank') 

    await monitor.listen(tab)
    
    # Change URL based on use case.
    tab = await browser.get('https://streeteasy.com/building/120-riverside-boulevard/ph1m')
    time.sleep(5)

    xhr_responses = await monitor.receive(tab)

    # Print URL and response body
    for response in xhr_responses:
        print(f"URL: {response['url']}")
        print('Response Body:')
        print(response['body'] if not response['is_base64'] else 'Base64 encoded data')

# if __name__ == '__main__':
#     uc.loop().run_until_complete(crawl())


# ahh ok so start listenig, go to url, sleep, use clas to recieve, then loop through response..

# for my case, i want to start listening to page2, then loop through those responses etc...
