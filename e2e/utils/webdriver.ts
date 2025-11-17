import { Builder, WebDriver, Browser } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';

export interface WebDriverConfig {
  headless: boolean;
  timeout: number;
}

export async function createChromeWebDriver(
  config: WebDriverConfig = { headless: true, timeout: 10000 }
): Promise<WebDriver> {
  const chromeOptions = new chrome.Options();

  if (config.headless) {
    chromeOptions.addArguments('--headless=new');
  }
  chromeOptions.addArguments('--no-sandbox');
  chromeOptions.addArguments('--disable-dev-shm-usage');
  chromeOptions.addArguments('--disable-gpu');
  chromeOptions.addArguments('--window-size=1920,1080');

  const driver = await new Builder()
    .forBrowser(Browser.CHROME)
    .setChromeOptions(chromeOptions)
    .build();

  await driver.manage().setTimeouts({ implicit: config.timeout });

  return driver;
}
