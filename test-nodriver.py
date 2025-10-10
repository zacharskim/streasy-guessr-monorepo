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
                if (evt.response.url.endswith('.webp') or evt.response.url.endswith('.jpg')) and not evt.response.url.endswith('80_40.webp') and not evt.response.url.endswith('80_40.jpg'): # UPDATE THIS LINE
                    print(evt.response.url, 'cmooon man...')
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
    links = await tab.select_all('a.listingCard-globalLink')
    link = links[0]
    print(link.attrs['href']) #url...
    print(link.attrs['data-map-points']) #string with two ints seperatated by a comma '40.73789978,-73.97299957'
    await tab.sleep(3)
    
    try:

        tab = await driver.get('about:blank', new_tab=True) 


       

        listing_tab = await tab.get(link.attrs['href'], new_tab=False)
        await listing_tab.sleep(3)

        print('starting to listen...')
        text = await listing_tab.select_all('div.Flickity-count.jsFlickityCount')
        #sometimes we don't find the text from the button,,, should we re-try or catch 
        #this error in a better way?
        num_pics_arr = re.findall(r'\d+', text[0].text_all)
        if len(num_pics_arr) > 0:
            num_of_pics = int(num_pics_arr[1])
            print(num_of_pics,'huh')

        
        await monitor.listen(tab) #moved down here so we purposely don't get the noisy initial misc images + first one
        #scrape the first one below...


        os.makedirs('listing_images', exist_ok=True)
        visible_images = await listing_tab.select_all('img.Flickity-image.jsFlickityImage.flickity-lazyloaded')
        # print('visible imgs', visible_images)
        img_zero_url = ''
        for img in visible_images:
            img_zero_url = img.attrs.src #some how need to keep this one? idk...
            await listing_tab.sleep(3)

        response = requests.get(img_zero_url, stream=True)
        if response.status_code == 200:
            with open('listing_images/image_0.webp', 'wb') as file:
                for chunk in response.iter_content(1024):
                    file.write(chunk)
            print(f"Image saved to image_0")
        else:
            print(f"Failed to retrieve the image. Status code: {response.status_code}")

        
        button = await listing_tab.select_all('button.flickity-button.flickity-prev-next-button.next')
        
        for i in range(1, num_of_pics):
            await button[0].click()
            randomInt = random.randint(1, 3)
            await listing_tab.sleep(randomInt)
            # print('receiving...')
            print('just recieved the network requests for one button click...', i)

        
        pics = await monitor.receive(listing_tab)

        # Print URL and response body

        os.makedirs('listing_images', exist_ok=True)
        #this works more or less,,, stops making requests twice, grabs correct sized imgs, but misses the first one??
        # #and last one sometimes (the floorplan doesn't have a 800_400 in the img string...)
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
                filename = f"image_{i + 1}{file_extension}"
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

    print("Stopping without errors?")
    driver.stop()

if __name__ == '__main__':
    uc.loop().run_until_complete(main())

#eventually, this script should run daily or so for each borough (well maybe not statent island) with 
#restrictions on prices as well...then update our db,,, i think like 200-300 apartments is solid? maybe only like 100 though...

#ok goal for this working session: get it working so that it grabs first pic, and the floor plan if needed??