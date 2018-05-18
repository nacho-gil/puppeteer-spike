module.exports = {
  launch: {
    headless: false,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', // Comment this out to use Chromium which is installed at the same time as Puppeteer
    args: ['--window-size=1200,1200']
  }
}