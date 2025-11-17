import { TestBase } from '../utils/TestBase';
import { AboutPage } from '../pages/AboutPage';
import { Logger } from '../utils/Logger';
import { TestRunner } from '../utils/TestRunner';

class AboutPageTest extends TestBase<AboutPage> {
  constructor() {
    super('About Page', AboutPage);
  }

  tests(): { [testName: string]: (logger: Logger) => Promise<void> } {
    return {
      'About Page - Our Mission': (logger: Logger) => this.testOurMissionSection(logger),
      'About Page - Other': (logger: Logger) => this.testOtherSection(logger),
    };
  }

  async testOurMissionSection(logger: Logger): Promise<void> {
    await this.setup(logger);

    try {
      logger.log('Loading page...');
      await this.navigateTo('about');
      await this.page.waitForPageLoad();
      logger.success('Page loaded successfully.');

      await this.page.verifyOurMissionSectionExists();
      await this.page.verifyMissionContentExists();
    } finally {
      await this.teardown();
    }
  }

  async testOtherSection(logger: Logger): Promise<void> {
    await this.setup(logger);

    try {
      await this.navigateTo('about');
      await this.page.waitForPageLoad();

      await this.page.verifyOurMissionSectionExists();
      await this.page.verifyMissionContentExists();
    } finally {
      await this.teardown();
    }
  }
}

TestRunner.run(AboutPageTest);
