import asyncio
import nodriver as uc
import time


async def main():
    driver = await uc.start()

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
        page2 = await tab.get(link.attrs['href'], new_tab=True)
        await page2.sleep(3)
        text = await page2.select_all('div.Flickity-count.jsFlickityCount')
        print(text)
        button = await page2.select_all('button.flickity-button.flickity-prev-next-button.next')
        print('\n')
        print(button)
        
        print('"listing page" => click')
        for i in range(0, 2):
            print('clcking on button kinda?')
            await button[0].click()
            await page2.sleep(5)

        listenXHR(page2)
        
        
        

            #this works! just need to collect the pics now and clean up the code...

    except Exception as e:
        print(f"Failed to get the number ig... {e}")
    

    print('we did it')
    driver.stop()
    
def listenXHR(page):
    async def handler(evt):
        # get ajax requests
        print(evt)
        if evt.type_ is uc.cdp.network.ResourceType.IMAGE:
            print('hellooo?')
            
    time.sleep(3)
    page.add_handler(uc.cdp.network.ResponseReceived, handler)



async def receiveXHR(page, requests):
    responses = []
    retries = 0
    max_retries = 5

    # wait at least 2 second after the last xhr request to get some more
    while True:
        if last_xhr_request is None or retries > max_retries:
            break

        if time.time() - last_xhr_request <= 2:
            retries = retries + 1
            time.sleep(2)

            continue
        else:
            break

    await page # this is very important

    # loop through gathered requests and get its response body
    for request in requests:
        try:
            res = await page.send(cdp.network.get_response_body(request[1]))
            if res is None:
                continue

            responses.append({
                'url': request[0],
                'body': res[0],
                'is_base64': res[1]
            })
        except Exception as e:
            print("error get body", e)

    return responses    




# if __name__ == '__main__':
#     uc.loop().run_until_complete(main())


# Code from some github issue comment: https://github.com/ultrafunkamsterdam/undetected-chromedriver/issues/1832, modified to get image requests...
# need to determine how to tie this in with the code above etc...

# Modified from https://github.com/ultrafunkamsterdam/undetected-chromedriver/issues/1832#issuecomment-2075243964, https://github.com/ultrafunkamsterdam/undetected-chromedriver/issues/1832#issuecomment-2092205033
# Tested working with Python 3.12.5, Windows 11, nodriver 0.36.

import asyncio
import nodriver as uc
from nodriver import cdp
import time
import typing

class ResponseType(typing.TypedDict):
    url: str
    body: str
    is_base64: bool

class RequestMonitor:
    def __init__(self):
        # Typed this way, as I couldn't figure out how to do Typescript-like tuples.
        self.requests: list[list[str | cdp.network.RequestId]] = []
        self.last_request: float | None = None
        self.lock = asyncio.Lock()

    async def listen(self, page: uc.Tab):
        async def handler(evt: cdp.network.ResponseReceived):
            async with self.lock:
                if evt.response.encoded_data_length > 0 and evt.type_ is cdp.network.ResourceType.IMAGE:
                    #print(f'EVENT PERCEIVED BY BROWSER IS:- {evt.type_}') # If unsure about event or to check behaviour of browser
                    self.requests.append([evt.response.url, evt.request_id])
                    self.last_request = time.time()

        page.add_handler(cdp.network.ResponseReceived, handler)

    async def receive(self, page: uc.Tab):
        responses: list[ResponseType] = []
        retries = 0
        max_retries = 5

        # Wait at least 2 seconds after the last XHR request to get some more
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
                    responses.append({
                        'url': request[0],
                        'body': res[0],  # Assuming res[0] is the response body
                        'is_base64': res[1]  # Assuming res[1] indicates if response is base64 encoded
                    })
                except Exception as e:
                    print('Error getting body', e)

        return responses

async def crawl():
    browser = await uc.start(headless=False)
    monitor = RequestMonitor()

    tab = await browser.get('about:blank') #?? what's the point of this??

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

if __name__ == '__main__':
    uc.loop().run_until_complete(crawl())


