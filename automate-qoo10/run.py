#!.venv/bin/python3

import asyncio
import aiofiles
from pyppeteer import launch

async def get_credentials():
    async with aiofiles.open('credentials.txt', mode='r') as f:
        credentials = await f.readlines()

    return credentials

async def do_daily(credentials):
    cookie = dict()
    cookie['name'] = 'GMKT.FRONT.SG'
    cookie['url'] = 'https://.qoo10.sg'

    browser = await launch()
    page = await browser.newPage()

    for cred in credentials:
        cookie['value'] = cred.strip()
        await page.setCookie(cookie)
        await page.goto('https://www.qoo10.sg/gmkt.inc/Event/qchance.aspx')

        output = await page.evaluate('''() => {
            window.frames[0].Attendance.Apply()
            window.frames[0].frames[0].RouletteQ.Apply()

            return {
                name: document.querySelector('a.name').innerHTML,
            }
        }''')

        print(output)
    
    await browser.close()

async def main():
    credentials = await get_credentials()
    await do_daily(credentials)

asyncio.get_event_loop().run_until_complete(main())

