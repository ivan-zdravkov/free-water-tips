import { By, until, WebDriver, WebElement } from 'selenium-webdriver';
import { createChromeWebDriver } from '../utils/webdriver';
import { Environment } from '../utils/Environment';

describe('About Page', () => {
  let timeout: number;
  let baseUrl: string;
  let driver: WebDriver;

  let locateByXpath = async (xpath: string): Promise<WebElement> =>
    await driver.wait(until.elementLocated(By.xpath(xpath)), timeout);

  beforeAll(() => {
    const seconds = 10;

    timeout = seconds * 1000;
    baseUrl = Environment.baseUrl;
  });

  beforeEach(async () => {
    driver = await createChromeWebDriver();

    await driver.get(`${baseUrl}/about`);
    await locateByXpath(`//*[contains(text(), 'About')]`);
  });

  afterEach(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  afterAll(() => {});

  describe('Our Mission Section', () => {
    it('should display the "Our Mission" heading', async () => {
      const webElement = await locateByXpath(`//*[contains(text(), 'Our Mission')]`);

      expect(await webElement.isDisplayed()).toBe(true);
    });

    it('should display the mission content', async () => {
      const webElement = await locateByXpath(`//*[contains(text(), 'fundamental human right')]`);
      expect(await webElement.isDisplayed()).toBe(true);
    });
  });
});
