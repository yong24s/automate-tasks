#!.venv/bin/python3

import asyncio
import aiofiles
import platform
import os
from pyppeteer import launch
from pyppeteer import errors

async def get_credentials():
    async with aiofiles.open('credentials.txt', mode='r') as f:
        credentials = await f.readlines()

    return credentials

async def do_daily(credential):
    cookie = dict()
    cookie['name'] = 'GMKT.FRONT.SG'
    cookie['url'] = 'https://.qoo10.sg'
    cookie['value'] = credential.strip()

    opts = {'headless': True}
    if platform.machine() == 'armv7l':
        opts['executablePath'] = '/usr/bin/chromium-browser'

    browser = await launch(opts)
    page = await browser.newPage()
    page.setDefaultNavigationTimeout(60 * 1000)

    await page.setCookie(cookie)
    await page.goto('https://www.qoo10.sg/gmkt.inc/Event/Qchance.aspx#reward')

    try:
        output = await page.evaluate('''() => {
            window.frames[0].Attendance.Apply()
            window.frames[0].Qticket.ChangeQticket()
            window.frames[0].frames[0].RouletteQ.Apply()
            window.frames[0].frames[0].RouletteQ.Apply()

            return {
                name: document.querySelector('a.name').innerHTML
            }
        }''')
    
        print(output)
        
    except errors.ElementHandleError:
        notify(credential[:8] + "... has expired.")
    finally:
        await browser.close()

def notify(mesg):
    if os.path.exists('telegram.conf'):
        os.system('/usr/bin/printf \"{}\" | /usr/bin/telegram-send --format markdown --config telegram.conf --stdin'.format(mesg))

async def main():
    credentials = await get_credentials()

    for credential in credentials:
        while (True):
            try:
                await do_daily(credential)
                break
            except errors.NetworkError:
                await asyncio.sleep(3)

asyncio.get_event_loop().run_until_complete(main())
