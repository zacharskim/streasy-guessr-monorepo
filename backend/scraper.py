import asyncio
import nodriver as uc
from nodriver import cdp
import time
import re
import typing
import random
import os
import base64
import requests


# ResponseType, RequestMonitor classes are adapted from a github issue comment: https://github.com/ultrafunkamsterdam/undetected-chromedriver/issues/1832, modified to get image requests...
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
        self.imgs_to_save = []

    async def listen(self, page: uc.Tab):
        async def handler(evt: cdp.network.ResponseReceived):
            async with self.lock:
                # Filter for StreetEasy listing images (large size)
                if 'photos.zillowstatic.com/fp/' in evt.response.url and 'se_large_800_400' in evt.response.url:
                    print(f'Found image: {evt.response.url}')
                    self.requests.append([evt.response.url, evt.request_id])
                    self.last_request = time.time()
                    self.imgs_to_save.append(evt.response.url)

        page.add_handler(cdp.network.ResponseReceived, handler)

    async def receive(self, page: uc.Tab):
        responses: list[ResponseType] = []
        retries = 0
        max_retries = 5

        # Wait at least 2 seconds after the last IMGAGE  request to get some more
        while True:
            if self.last_request is None or retries > max_retries:
                break

            if time.time() - self.last_request <= 5:
                retries += 1
                await asyncio.sleep(5)
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
                    #also need to ensure that we wait enough time for them to load...or filter correctly for them...
                    if True: #this seems like a un-needed double check?? 
                        print('huh', request[0])
                        responses.append({
                            'url': request[0],
                            'body': res[0],  # Assuming res[0] is the response body
                            'is_base64': res[1]  # Assuming res[1] indicates if response is base64 encoded
                        })
                except Exception as e:
                    print('Error getting body', e)


        print('returning....')
        return responses


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

        tab = await driver.get('about:blank', new_tab=True)

        # Start listening for image requests BEFORE loading the page
        await monitor.listen(tab)

        # Navigate to listing page - images will load automatically
        listing_tab = await tab.get(link.attrs['href'], new_tab=False)
        print('Waiting for images to load...')

        # Wait for page to fully load (images load automatically, no clicking needed!)
        await listing_tab.sleep(5)

        # Collect all the images that were captured
        pics = await monitor.receive(listing_tab)
        print(f'Captured {len(pics)} images')

        # Save all captured images
        os.makedirs('listing_images', exist_ok=True)
        for i, response in enumerate(pics):
            try:
                print(f"URL: {response['url']}")
                print('Response Body:')
                print(response['body'] if not response['is_base64'] else 'Base64 encoded data')
                url = response['url']
                body = response['body']
                is_base64 = response['is_base64']
                print(url, 'print some info', is_base64)

                # Determine the file extension (default to .webp if not present in URL)
                file_extension = os.path.splitext(url)[-1] or '.webp'
                filename = f"image_{i}{file_extension}"
                file_path = os.path.join('listing_images', filename)

                if is_base64:
                    # # Decode Base64 data and save as image
                    image_data = base64.b64decode(body)
                    with open(file_path, 'wb') as f:
                        f.write(image_data)
                    print(f"Saved base64 image to {file_path}")

            except Exception as e:
                print(f"Failed to save image from URL {url}: {e}")
        
    except Exception as e:
        print(f"Well, something went wrong....{e}")

    print("Stopping without errors")
    driver.stop()

if __name__ == '__main__':
    uc.loop().run_until_complete(main())

    
    #https://photos.zillowstatic.com/fp/5d0d08341334d96a9cd6396694e395ad-full.webp
    #https://photos.zillowstatic.com/fp/9f3834b6dc14cbe0bf3b5343c7b0af1c-full.webp
    