import { TestBase } from './TestBase';
import { Page } from '../pages/Page';
import { Logger } from './Logger';

export class TestRunner {
  static async run<T extends Page>(TestClass: new () => TestBase<T>): Promise<void> {
    const instance: TestBase<T> = new TestClass();
    const suiteLogger: Logger = new Logger(instance.suiteName);

    try {
      const tests: { [testName: string]: (logger: Logger) => Promise<void> } = instance.tests();
      const failures: Array<{ name: string; error: Error }> = [];

      for (const test of Object.entries(tests).map(([name, func]) => ({ name, func }))) {
        const testLogger = new Logger(test.name);

        try {
          await test.func(testLogger);

          testLogger.success(`Test passed.`);
        } catch (e) {
          const error = e instanceof Error ? e : new Error(String(e));
          failures.push({ name: test.name, error });

          testLogger.error(`Test failed: ${error.message}.`);
        }
      }

      if (failures.length > 0) {
        suiteLogger.error(`${failures.length} test${failures.length > 1 ? 's' : ''} failed:`);

        failures.forEach(({ name }) => {
          suiteLogger.error(name, 1);
        });

        process.exit(1);
      }

      suiteLogger.success('All tests passed.');
      process.exit(0);
    } catch (error) {
      suiteLogger.error(
        `Unexpected error: ${error instanceof Error ? error.message : String(error)}`
      );
      process.exit(1);
    }
  }
}
