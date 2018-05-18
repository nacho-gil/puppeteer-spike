import puppeteer from 'puppeteer';
import { codeForSelectors } from 'html-dnd';


/**
 * Drag & Drop wrapper script to be evaluated in the context of the page
 * @param {String} selectorDraggable
 * @param {String} selectorDroppable
 * @return {Promise}
 */
async function dragAndDrop(selectorDraggable, selectorDroppable) {
  const scriptToEval = `(function () { ${codeForSelectors} })(\`${selectorDraggable}\`, \`${selectorDroppable}\`);`;
  // console.log(scriptToEval);

  return await page.evaluate(scriptToEval);
}


let page;
let browser;
let xPathElem;
const width = 1200;
const height = 1100;
const timeout = 120000;

beforeAll(async () => {
  browser = await puppeteer.launch({
    headless: false,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', // Comment this out to use Chromium which is installed at the same time as Puppeteer
    // slowMo: 10,
    args: [`--window-size=${width},${height + 115}`]
  });
  page = await browser.newPage();
  await page.setViewport({ width, height });
}, timeout);

afterAll(() => {
  // browser.close();
});

describe('Login', () => {
  it('should login', async () => {
    await page.goto('http://local.pcms.sky.com/editor/');
    // await page.screenshot({path: 'screenshot/login.png'});

    await page.type('[type="email"]', 'root@pcms.uk', { delay: 0 });
    await page.type('[type="password"]', 'admin', { delay: 0 });
    await page.click('[type="submit"]');
    await page.waitForSelector('.dashboard', {visible: true});
    // await page.screenshot({path: 'screenshot/login-succeed.png'});
  }, timeout);

  it('should create a static collection', async () => {
    // Select navigation
    await page.click('.nav__burger-icon');

    // waitForElementToBeClickable
    await page.waitForSelector('.md-open-menu-container.md-active.md-clickable');


    // xpath option to select by containing text
    xPathElem = await page.waitForXPath(`//button[contains(., 'EDITORIAL')]`);
    await xPathElem.click();

    // await page.evaluate(() => {
    //   const array = Array.from(document.querySelectorAll('.md-open-menu-container.md-active.md-clickable .nav__button'));
    //   array.filter(el => /EDITORIAL/.test(el.innerText))[0].click();
    // });

    // waitForElementToBeClickable
    await page.waitForSelector('.nav__level__collection-items', {visible: true});

    await page.evaluate(() => {
      const array = Array.from(document.querySelectorAll('.nav__level__collection-items .nav__button'));
      array.filter(el => /MOVIES/.test(el.innerText))[0].click();
    });

    await page.waitForSelector('.app__preloader', {hidden: true});
    // await page.waitForSelector('.atom-section-page__new-dropdown');
    await page.click('.atom-section-page__new-dropdown');
    await page.waitForSelector('.md-select-menu-container.md-active.md-clickable');
    // md-select-menu's have a .15s transition animation. TODO: make robust and work out how to wait for animation end
    await page.waitFor(150);

    // xpath and non xpath alternatives
    // elem = await page.$(`[ng-click="vm.onNewCollectionClicked('', 'static')"]`);
    xPathElem = await page.waitForXPath(`//md-option[contains(., 'New static collection')]`);
    await xPathElem.click();

    // Content selector
    await page.waitForSelector('.md-dialog-fullscreen:not(.md-transition-in-add)');
    await page.click('button[aria-label="Select"]');

    // Wait for static collection navigation
    await page.waitForSelector('.static-collection-curation');
    
    // English tab
    xPathElem = await page.waitForXPath(`//*[contains(., 'English') and contains(@class, "tabs__selector")]`);
    await xPathElem.click();
    await page.type('[name="en::Title"]', 'Testing Puppeteer');

    // Spanish tab
    xPathElem = await page.waitForXPath(`//*[contains(., 'Spanish') and contains(@class, "tabs__selector")]`);
    await xPathElem.click();
    await page.type('[name="es::Title"]', 'Testing Puppeteer');

    // Items tab
    xPathElem = await page.waitForXPath(`//*[contains(., 'Items') and contains(@class, "tabs__selector")]`);
    await xPathElem.click();

    // Collection Search
    await page.type('[type="search"]', '*');
    await page.keyboard.press('Enter');

    // wait for search results
    await page.waitForSelector('.search-result-split-view__collection-content--search li[draggable]');

    // await page.screenshot({path: 'screenshot/drag-drop-before.png'});

    // The below should work but drag and drop native events are not triggered correctly (incomplete) https://github.com/GoogleChrome/puppeteer/issues/1265
    // 
    // const dragElemBox = await (await page.$('.search-result-split-view__collection-content--search li[draggable]:first-child')).boundingBox();
    // const dropZoneBox = await (await page.$('.search-result-split-view__collection-content--curation [dnd-drop]')).boundingBox();
    // await page.mouse.move(dragElemBox.x + dragElemBox.width / 2, dragElemBox.y + dragElemBox.height / 2);
    // await page.mouse.down();
    // await page.mouse.move(dropZoneBox.x + dropZoneBox.width / 2, dropZoneBox.y + dropZoneBox.height / 2, {steps: 10});
    // await page.mouse.up();

    // syntetic drag and drop
    await dragAndDrop('.search-result-split-view__collection-content--search li[draggable]:first-child', '.search-result-split-view__collection-content--curation [dnd-drop]');
    await page.waitForSelector('.search-result-split-view__collection-content--curation li[draggable]');

    // await page.screenshot({path: 'screenshot/drag-drop-success.png'});

    // Save collection
    xPathElem = await page.waitForXPath(`//button[contains(., 'Save')]`);
    await xPathElem.click();

    await page.waitForSelector('.md-toast', {visible: true});
    await page.waitForSelector('.md-toast', {hidden: true});

    // await page.screenshot({path: 'screenshot/collection-success.png'});

    console.log('Testing console log end');

  }, timeout);
});