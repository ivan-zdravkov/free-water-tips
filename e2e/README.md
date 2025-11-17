# E2E Tests for Free Water Tips

This directory contains End-to-End (E2E) tests for the Free Water Tips application using Selenium WebDriver.

## Prerequisites

Before running the E2E tests, ensure you have the following installed:

- **Node.js 22+**
- **Chrome or Chromium browser** (for Selenium WebDriver)
- **ChromeDriver** (automatically managed by Selenium 4.6+)

## Setup

Install the E2E test dependencies:

```bash
cd e2e
npm install
```

## Running Tests

### Local Development

To run E2E tests against your local development server:

1. Start the backend and frontend servers:

   ```bash
   # From the project root
   cd FreeWaterTips.API
   npm start

   # In another terminal
   cd FreeWaterTips.ReactNative
   npm run web
   ```

2. Run the E2E tests:
   ```bash
   cd e2e
   npm run test:local
   ```

### Testing Environment

To run E2E tests against the testing environment (https://test.freewater.tips):

```bash
cd e2e
npm run test:testing
```

### Custom Base URL

You can specify a custom base URL by setting the `BASE_URL` environment variable:

```bash
BASE_URL=http://localhost:3000 npm test
```

## Test Structure

- **`tests/`** - Contains test files
  - `about.test.ts` - Tests for the About page, including the "Our Mission" section
- **`utils/`** - Contains utility functions
  - `webdriver.ts` - WebDriver configuration and helper functions

## Writing New Tests

To create a new test:

1. Create a new file in the `tests/` directory (e.g., `home.test.ts`)
2. Import the necessary utilities from `../utils/webdriver`
3. Write your test using Selenium WebDriver API
4. Add the test to the npm scripts in `package.json` if needed

Example:

```typescript
import { WebDriver, By, until } from 'selenium-webdriver';
import { createWebDriver, quitWebDriver, getBaseUrl } from '../utils/webdriver';

async function testHomePage(): Promise<void> {
  let driver: WebDriver | undefined;
  const baseUrl = getBaseUrl();

  try {
    driver = await createWebDriver({ headless: true });
    await driver.get(baseUrl);

    // Your test logic here

    console.log('✓ Test PASSED');
  } catch (error) {
    console.error('✗ Test FAILED:', error);
    throw error;
  } finally {
    if (driver) {
      await quitWebDriver(driver);
    }
  }
}

testHomePage()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
```

## CI/CD Integration

E2E tests are automatically run in the GitHub Actions workflow when deploying to the testing environment. The tests run after a successful deployment to https://test.freewater.tips.

See `.github/workflows/deploy.yml` for the CI/CD configuration.

## Debugging

If tests fail, you can run them in non-headless mode to see what's happening in the browser:

1. Modify `utils/webdriver.ts` to set `headless: false` by default, or
2. Update the test file to pass `{ headless: false }` to `createWebDriver()`

## Troubleshooting

### ChromeDriver Issues

If you encounter issues with ChromeDriver:

- Selenium 4.6+ includes automatic driver management
- Ensure Chrome/Chromium is installed on your system
- On Linux, you may need to install: `sudo apt-get install chromium-browser chromium-chromedriver`

### Timeout Issues

If tests time out:

- Increase the timeout value in `createWebDriver()` configuration
- Check that the application is running and accessible at the specified URL
- Ensure network connectivity to the test environment

### Element Not Found

If elements are not found:

- Verify the element exists on the page by inspecting in a browser
- Check if the page structure has changed
- Wait for dynamic content to load before searching for elements
