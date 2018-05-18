const puppeteer = require('puppeteer');
// import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', // Comment this out to use Chromium which is installed at the same time as Puppeteer
    args: ['--window-size=1200,1200']
  });
  console.log(await browser.version());
  const page = await browser.newPage();
  await page.setViewport({width: 1200, height: 1200});
  await page.goto('http://local.pcms.sky.com/editor/');
  await page.screenshot({path: 'screenshot/example.png'});

  await page.type('[type="email"]', 'root@pcms.uk', { delay: 0 });
  await page.type('[type="password"]', 'admin', { delay: 0 });
  await page.click('[type="submit"]');
  await page.waitForSelector('.dashboard', {visible: true});
  await page.click('[aria-label="Edit quicklink"]');
  await page.screenshot({path: 'screenshot/login-succeed.png'});

  // await browser.close();
})();