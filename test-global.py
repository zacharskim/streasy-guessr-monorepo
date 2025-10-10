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
from dotenv import load_dotenv




async def main():
    email_str =  os.getenv('EMAIL')
    password_str =  os.getenv('PASSWORD')

    driver = await uc.start(headless=False)

    tab = await driver.get("https://globalpoker.com/")
    # time.sleep(3)
    await tab.sleep(1.2)
    a_tags = await tab.select_all('a')
    for tag in a_tags:
        if tag.text == 'Log in':
            print(tag)
            await tab.get(tag.attrs['href'], new_tab=False)
            await tab.sleep(5)
            element = await tab.select_all('a')
            print('sheeesh', element[2])
            await element[2].click()
            await tab.sleep(5)
            email = await tab.select("input[type=email]")
            await email.send_keys(email_str)
            next_btn = await tab.find(text="next", best_match=True)
            await next_btn.mouse_click()
            await tab.sleep(5)
            password = await tab.select("input[type=password]")
            await password.send_keys(password_str)
            next_btn = await tab.find(text="next", best_match=True)
            await next_btn.mouse_click()

            await tab.sleep(6)
            
            # eh = await tab.find('Continue as Matt')
            # print(eh, 'cmoon')

            await tab.sleep(60)
            #ok so we can log in

            
            #need to clikc 'continue as matt' button,,, then click over to tournaments and register...
            #
            
            #but from here,,, we need to select our game by like regiserting ...
            
            #...we also need to uhh figure out how to play the game???
            
            #sheesh tbh...
            
        
            

    # print('eh?', filtered_a_tags)

    # await tab.click('text="Log in"');

 
 #<a class="styles_button__wZ6Rg styles_body-3__SsHZC styles_brand-1__yqkgM" href="https://play.globalpoker.com/login?platform=globalpoker.com">Log in</a>
 
 
if __name__ == '__main__':

    load_dotenv()
    uc.loop().run_until_complete(main())



