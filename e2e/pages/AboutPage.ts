import { By, until, WebDriver, WebElement } from 'selenium-webdriver';
import { Page } from './Page';
import { Logger } from '../utils/Logger';

export class AboutPage implements Page {
  readonly name: string = 'About Page';

  constructor(private driver: WebDriver, private logger: Logger) {}

  async waitForPageLoad(timeout: number = 10000, indent: number = 1): Promise<void> {
    this.logger.log(`Waiting for page to load...`, indent);

    await this.driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(), 'About')]")),
      timeout,
      `${this.name} did not load.`
    );

    this.logger.log(`Page loaded.`, indent);
  }

  async getOurMissionSection(): Promise<WebElement> {
    this.logger.log('Getting "Our Mission" section...');
    return await this.driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(), 'Our Mission')]")),
      10000,
      this.logger.format('Could not find "Our Mission" section.', 0, 'red')
    );
  }

  async getMissionContent(): Promise<WebElement> {
    this.logger.log('Getting mission content...');
    return await this.driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(), 'fundamental human right')]")),
      10000,
      this.logger.format('Could not find mission content.', 0, 'red')
    );
  }

  async verifyOurMissionSectionExists(): Promise<void> {
    this.logger.log('Verifying "Our Mission" section exists...');
    const section = await this.getOurMissionSection();
    if (!section) {
      throw new Error('"Our Mission" section does not exist');
    }
    this.logger.log('"Our Mission" section exists.');
  }

  async verifyMissionContentExists(): Promise<void> {
    this.logger.log('Verifying mission content exists...');
    const content = await this.getMissionContent();
    if (!content) {
      throw new Error('Mission content does not exist');
    }
    throw new Error('Fake');
  }

  private async isOurMissionVisible(): Promise<boolean> {
    const element = await this.getOurMissionSection();
    return await element.isDisplayed();
  }

  private async isMissionContentVisible(): Promise<boolean> {
    const element = await this.getMissionContent();
    return await element.isDisplayed();
  }
}
