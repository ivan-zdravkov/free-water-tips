import { WebDriver } from 'selenium-webdriver';
import { createChromeWebDriver } from './webdriver';
import { Environment } from './Environment';
import { Page, PageConstructor } from '../pages/Page';
import { Logger } from './Logger';

export abstract class TestBase<T extends Page> {
  public suiteName: string;
  protected page!: T;
  protected logger!: Logger;
  private driver!: WebDriver;
  private baseUrl: string;

  constructor(suiteName: string, private PageClass: PageConstructor<T>) {
    this.suiteName = suiteName;
    this.baseUrl = Environment.baseUrl;
  }

  abstract tests(): { [testName: string]: (logger: Logger) => Promise<void> };

  async setup(logger: Logger): Promise<void> {
    this.logger = logger;

    this.logger.log(`Setting test up...`);

    try {
      this.logger.log('Setting WebDriver up ...', 1);
      this.driver = await createChromeWebDriver();
      this.logger.log('WebDriver setup complete.', 1);
    } catch (error) {
      this.logger.error(`Error setting up WebDriver: ${error}.`, 1);
      throw error;
    }

    try {
      this.logger.log('Initializing page object...', 1);
      this.page = new this.PageClass(this.driver, this.logger);
      this.logger.log('Page object initialized.', 1);
    } catch (error) {
      this.logger.error(`Error initializing page object: ${error}`, 1);
      throw error;
    }

    this.logger.success(`Setup complete.`);
  }

  async teardown(): Promise<void> {
    this.logger.log(`Tearing down test...`);

    if (this.driver) {
      try {
        this.logger.log('Tearing down WebDriver...', 1);
        await this.driver.quit();
        this.logger.log('WebDriver torn down.', 1);
      } catch (error) {
        this.logger.error(`Error tearing down WebDriver: ${error}`, 1);
        throw error;
      }
    } else {
      this.logger.warn('No WebDriver instance found to tear down.');
    }

    this.logger.success(`Teardown complete.`);
  }

  async navigateTo(path: string): Promise<void> {
    const url = `${this.baseUrl}/${path}`;

    this.logger.log(`Navigating to URL: ${url}...`, 1);
    await this.driver.get(url);
    this.logger.log(`Navigation complete.`, 1);
  }
}
