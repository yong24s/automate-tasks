'use strict';

const puppeteer = require('puppeteer-core');
const os = require('os');

const fs = require('fs');
const { exec } = require('child_process');

const secrets = require('./secrets');

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
    
    const el_input_username = '.form-input input[name="username"][placeholder="Enter username"]';
    await page.type(el_input_username, token.username);

    const el_input_password = '.form-input input[name="password"][placeholder="Enter password"]';
    await page.type(el_input_password, token.password);
    
    const el_button_login = '.login-content button';
    await page.click(el_button_login);

    return `Logged in: ${token.username}\n`;
}

const get_device_page_details = async (page) => {
    await page.waitForNavigation({waitUntil: 'domcontentloaded'});
    await page.evaluate(() => {
        window.location.href = '/en/vitality/fitness-devices.html#';
    });

    await page.waitForNavigation({waitUntil: 'networkidle0'});

    const el_fitbit_last_synced = 'h6[data-cardname="Fitbit Device"] + p';
    await page.waitForSelector(el_fitbit_last_synced, {visible: true, timeout: 0});

    const el_last_synced = 'ul.recent_points > :first-child';
    await page.waitForSelector(el_last_synced, {visible: true, timeout: 0});

    const fitbit_last_synced = await page.evaluate((el_fitbit_last_synced) => {
        const el = document.querySelector(el_fitbit_last_synced);
        return el ? el.innerText : 'error';
    }, el_fitbit_last_synced);

    const last_synced = await page.evaluate((el_last_synced) => {
        const el = document.querySelector(el_last_synced);
        return el ? el.innerText.replace(/(\r\n|\n|\r)/gm, ' ') : 'error';
    }, el_last_synced);

    return `Fitbit last synced: ${fitbit_last_synced}\nLast synced rewarded: ${last_synced}\n\n`;
}

const notify = async (mesg) => {
    if (!fs.existsSync('telegram.conf')) {
        return;
    }

    exec(`/usr/bin/printf \"${mesg}\" | /usr/bin/telegram-send --format markdown --config telegram.conf --stdin`);
}

(async () => {
  let output = '';
  const browser = await puppeteer.launch({
      headless: true,
      executablePath: await getExecPath()
  });

  for (const token of secrets) {
    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage();
    await page.setDefaultNavigationTimeout(60 * 1000 * 5);

    try {       
        let tmp = await login(page, token);
        tmp += await get_device_page_details(page);

        output += tmp
        console.log(tmp);
    } catch (error) {
        output += '[!] exception\n\n';
        console.log(error);
    }

    await page.close();
    await context.close();
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  await browser.close();

  notify(output);
  console.log(output);
})();

