'use strict';

const puppeteer = require('puppeteer-core');
const os = require('os');

const fs = require('fs')
const { exec } = require('child_process');

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

const login = async (page, token) => {
    await page.goto('https://myaia.aia.com.sg/en/my-aia/login.html');
    
    const el_input_username = '.form-input input[name="username"][placeholder="Enter your username"]';
    await page.type(el_input_username, token.username);

    const el_input_password = '.form-input input[name="password"][placeholder="Enter password"]';
    await page.type(el_input_password, token.password);
    
    const el_button_login = '.login-content button';
    await page.click(el_button_login);

    return `Logged in: ${token.username}\n`;
}

const get_device_page_details = async (page) => {
    const el_vitality_button = 'div.vitality.vitality-tab.choose-dashboard'
    await page.click(el_vitality_button)
    await page.waitFor(3000)   
    
    await page.evaluate(() => document.querySelector('a[href="/en/vitality/fitness-devices.html"]').click())
    await page.waitFor(10000)

    const fitbit_last_synced = await page.evaluate(() => {
        const el = document.querySelector('h6[data-cardname="Fitbit Device"] + p');
        return el ? el.innerText : 'error';
    })

    const last_synced = await page.evaluate(() => {
        const el = document.querySelector('ul.recent_points > :first-child');
        return el ? el.innerText.replace(/(\r\n|\n|\r)/gm, ' ') : 'error';
    })

    return `Fitbit last synced: ${fitbit_last_synced}\nLast synced rewarded: ${last_synced}\n`;
}

const notify = async (mesg) => {
    if (!fs.existsSync('telegram.conf')) {
        return;
    }

    exec(`/usr/bin/printf \"${mesg}\" | /usr/bin/telegram-send --format markdown --config telegram.conf --stdin`)
}

(async () => {
  const browser = await puppeteer.launch({
      headless: false,
      executablePath: await getExecPath()
  });

  const context = await browser.createIncognitoBrowserContext();

  for (const token of secrets) {
    // const page = await browser.newPage();
    const page = await context.newPage();
    await page.setDefaultNavigationTimeout(60 * 1000 * 5)
    // await page.setViewport({ width: 1366, height: 768});

    try {       
        let output = await login(page, token)
        await page.waitFor(5000)   
        output += await get_device_page_details(page)

        console.log(output)
        notify(output)
    } catch (error) {
        console.log(error)
    }

    await page.close();
  }

  await context.close();
  await browser.close();
})();
