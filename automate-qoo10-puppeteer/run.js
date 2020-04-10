'use strict';

const puppeteer = require('puppeteer-core');
const os = require('os');

const fs = require('fs')
const { exec } = require('child_process');

const { LoginError } = require('./errors/LoginError')
const secrets = require('./secrets')

const getExecPath = async () => {
    if (os.platform() === 'linux') {
        return '/usr/bin/chromium-browser';
    }

    if (os.platform() === 'win32') {
        return 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
    }

    throw new Error('Please specify a path to chrome in your platform.');
}

const getCookie = async (token) => {
    return {
        name: 'GMKT.FRONT.SG',
        url: 'https://.qoo10.sg',
        value: token,
    }
}

const getUsername = async (page) => {
    await page.goto('https://www.qoo10.sg/gmkt.inc/My/Default.aspx');

    const el = await page.evaluate(() => {
      return document.querySelector('#content > div > div.my_dft > div.my_dft_lnb > div.inf > div.name > a');
    })

    if (el === null) {
        console.log('Warning token has expired');
        throw new LoginError();
    }

    return el.innerText;
}

const notify = async (mesg) => {
    if (!fs.existsSync('telegram.conf')) {
        return;
    }

    exec(`/usr/bin/printf \"${mesg}\" | /usr/bin/telegram-send --format markdown --config telegram.conf --stdin`)
}

const do_qchance = async (page) => {
    await page.goto('https://www.qoo10.sg/gmkt.inc.event/COMM/Roulette/RouletteQ.aspx?frame_id=i_RouletteQ')

    await page.evaluate(() => {
        window.Attendance.Apply()
        window.Qticket.ChangeQticket()
        window.frames[0].RouletteQ.Apply()
        window.frames[0].RouletteQ.Apply()
    })
}

(async () => {
  const browser = await puppeteer.launch({
      headless: true,
      executablePath: await getExecPath()
  });

  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(60 * 1000 * 5)

  for (const token of secrets) {
      const cookie = await getCookie(token)
      await page.setCookie(cookie)

      try {
          const username = await getUsername(page)
          console.log(username)
          // await notify(username);

          await do_qchance(page)
      } catch (err) {
        console.log(err)

        if (err instanceof LoginError) {
            await notify(err.message);
        } 
      } finally {
      }
  }

  await page.close();
  await browser.close();
})();
