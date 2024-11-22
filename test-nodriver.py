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
            await page2.sleep(1)

            #this works! just need to collect the pics now and clean up the code...

    except Exception as e:
        print(f"Failed to get the number ig... {e}")
    

    print('we did it')
    driver.stop()


    





if __name__ == '__main__':
    uc.loop().run_until_complete(main())


