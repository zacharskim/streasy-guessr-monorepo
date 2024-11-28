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
        self.imgs_to_save = []

    async def listen(self, page: uc.Tab):
        async def handler(evt: cdp.network.ResponseReceived):
            async with self.lock:
                if evt.response.url.endswith('800_400.webp'):
                    print(evt.response.url, 'oh' )
                    self.imgs_to_save.append(evt.response.url)
                if evt.response.encoded_data_length > 0 and evt.type_ is cdp.network.ResourceType.IMAGE:
                    self.requests.append([evt.response.url, evt.request_id])
                    self.last_request = time.time()

        page.add_handler(cdp.network.ResponseReceived, handler)

    async def receive(self, page: uc.Tab):
        #need to walk through this function more i feel...
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
                    #need to edit this to make sure to only get 800 400 pics
                    #also need to ensure that we wait enough time for them to load...or filter correctly for them...
                    # print(request, 'all the requests??')
                    # print(res, 'the res?')
                    if request[0].endswith('800_400.webp'): 
                        print('appending...', request[0])
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
        
        all_image_res = []
        print('"listing page" => clicking through pics')
        for i in range(1, num_of_pics):
            await button[0].click()
            randomInt = random.randint(3, 5)
            await listing_tab.sleep(randomInt)
            # pics = await monitor.receive(listing_tab)
            # all_image_res += pics
            print('just recieved the network requests for one button click...', i)

        # Print URL and response body
        # for response in image_responses:
        #     print(f"URL: {response['url']}")
        #     print('Response Body:')
        #     print(response['body'] if not response['is_base64'] else 'Base64 encoded data')

        os.makedirs('listing_images', exist_ok=True)
        
        print(monitor.imgs_to_save)
        
        for i, url in enumerate(monitor.imgs_to_save):
            try:
                # Determine the file extension (default to .webp if not present in URL)
                file_extension = os.path.splitext(url)[-1]
                if not file_extension:
                    file_extension = '.webp'
        
                filename = f"image_{i + 1}{file_extension}"
                file_path = os.path.join('listing_images', filename)

                # Fetch the image content from the URL
                response = requests.get(url, stream=True)
                response.raise_for_status()  # Raise an exception for HTTP errors

                # Save the image content to the file
                with open(file_path, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        f.write(chunk)

                print(f"Saved image to {file_path}")

            except Exception as e:
                print(f"Failed to save image from URL {url}: {e}")
                # url = response['url']
                # body = response['body']
                # is_base64 = response['is_base64']
                # print(url, 'print some info', is_base64)

                # Determine the file extension (default to .webp if not present in URL)
                # file_extension = os.path.splitext(url)[-1] or '.webp'
                # filename = f"image_{i + 1}{file_extension}"
                # file_path = os.path.join('listing_images', filename)

                # if is_base64:
                # # Decode Base64 data and save as image
                #     image_data = base64.b64decode(body)
                #     with open(file_path, 'wb') as f:
                #         f.write(image_data)
                #     print(f"Saved base64 image to {file_path}")
        
    except Exception as e:
        print(f"Well, something went wrong....{e}")

    print("Stopping without errors?")
    driver.stop()

if __name__ == '__main__':
    uc.loop().run_until_complete(main())

#eventually, this script should run daily or so for each borough (well maybe not statent island) with 
#restrictions on prices as well...then update our db,,, i think like 200-300 apartments is solid? maybe only like 100 though...