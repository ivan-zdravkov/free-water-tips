# Contributing to Free Water Tips

Thank you for your interest in contributing to [Free Water Tips](https://freewater.tips/)! This guide will help you get started with contributing to our open-source project that helps people find free drinking water sources worldwide.

## Table of Contents

- [Getting Started](#getting-started)
- [Ways to Contribute](#ways-to-contribute)
  - [Add Water Sources](#-add-water-sources)
  - [Suggest Features](#-suggest-features)
  - [Report Bugs](#-report-bugs)
  - [Contributing Code](#-contributing-code)
  - [Translating](#-translating)
- [Project Architecture](#project-architecture)
  - [Frontend](#frontend)
  - [Backend](#backend)
  - [Development Stack](#development-stack)
- [Development Setup](#development-setup)
- [Code Contributions](#code-contributions)
  - [Development Workflow](#development-workflow)
  - [Code Formatting](#code-formatting)
  - [Code Quality](#code-quality)
- [E2E Testing](#e2e-testing)
  - [Running E2E Tests Locally](#running-e2e-tests-locally)
  - [Running E2E Tests Against Testing Environment](#running-e2e-tests-against-testing-environment)
  - [Debugging E2E Tests](#debugging-e2e-tests)
  - [Writing New E2E Tests](#writing-new-e2e-tests)
  - [E2E Tests in CI/CD](#e2e-tests-in-cicd)
- [Pull Request Process](#pull-request-process)
  - [Pre-submission Checklist](#pre-submission-checklist)
  - [Automated Quality Checks](#automated-quality-checks)
  - [Review Process](#review-process)
  - [Merge Requirements](#merge-requirements)
  - [Steps to Submit a PR](#steps-to-submit-a-pr)
- [Community Guidelines](#community-guidelines)
  - [Be Respectful](#be-respectful)
  - [Be Collaborative](#be-collaborative)
  - [Be Professional](#be-professional)
- [Getting Help](#getting-help)
- [License](#license)

## Getting Started

Free Water Tips is a community-driven platform that helps people find free drinking water sources worldwide. We welcome contributions from developers, designers, content creators, and anyone passionate about improving access to clean water.

## Ways to Contribute

### 📍 Add Water Sources

Help expand our database by adding new water source locations.

1. **Use the Contribute page** on the web or mobile apps
2. **Provide accurate information**: Name, address, description, etc.
3. **Include helpful details**: Operating hours, accessibility info
4. **Verify location**: Ensure GPS coordinates are correct
5. **Add photos**: If possible, include photos of the water source

### 💡 Suggest Features

Share ideas for new features or improvements. [Create a feature request](https://github.com/ivan-zdravkov/free-water-tips/issues/new?template=feature_request.md) using the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md).

### 🐛 Report Bugs

Help us improve by reporting issues you encounter. [Report a bug](https://github.com/ivan-zdravkov/free-water-tips/issues/new?template=bug_report.md) using the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md).

### 💻 Contributing Code

See [Development Setup](#development-setup) to get started.

### 🌍 Translating

Help make the platform accessible in different languages (coming soon).

## Project Architecture

**Free Water Tips** is a web and mobile React Native App with a serverless NodeJS Azure Functions backend:

### Frontend

- **Framework**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/)
- **Platform**: Progressive web app, native Android and iOS mobile apps
- **Web Hosting**: [GitHub Pages](https://pages.github.com/) or any static hosting
- **Future Plans**: Mobile apps for Android and iOS

### Backend

- **API**: [Azure Functions](https://learn.microsoft.com/en-us/azure/azure-functions/) (Node.js 22) with HTTP triggers
- **Database**: [Azure Cosmos DB](https://azure.microsoft.com/en-us/products/cosmos-db) with JSON documents and geo location data
- **Deployment**: [GitHub Actions](https://github.com/features/actions) to [Azure Functions](https://azure.microsoft.com/en-us/products/functions), [GitHub Pages](https://docs.github.com/en/pages/quickstart), [Google Play](https://developer.android.com/distribute/console) and [App Store](https://developer.apple.com/app-store-connect/)

### Development Stack

- **IDE**: [Visual Studio Code](https://code.visualstudio.com/)
- **Languages**: [TypeScript](https://www.typescriptlang.org/) for both frontend and backend
- **Local Database**: [Azure Cosmos DB Local Emulator](https://docs.microsoft.com/en-us/azure/cosmos-db/local-emulator)

## Development Setup

Before you start development, make sure your environment has all the required dependencies installed.

### 1. Run the health check script

```bash
./health.sh
```

This script will check for:

- Core development tools (Git, Node.js v22+)
- Azure Functions Core Tools
- Cosmos DB Emulator
- Expo, React Native and Azure Functions dependencies

The script provides clear installation instructions for any missing dependencies based on your operating system.

### 2. Configure local settings

Copy the template file to create your local settings:

```bash
cp FreeWaterTips.API/local.settings.json.template FreeWaterTips.API/local.settings.json
cp FreeWaterTips.ReactNative/.env.template FreeWaterTips.ReactNative/.env
cp e2e/.env.template e2e/.env
```

The default configuration uses the Cosmos DB Emulator running on `https://localhost:8081`. Adjust the settings if needed for your environment.

### 3. Install project dependencies

```bash
npm install --prefix FreeWaterTips.ReactNative
npm install --prefix FreeWaterTips.API
npm install --prefix e2e
```

### 4. Start development servers

You can use the Debug window or VS Code tasks to start the development environment:

- `Cmd+Shift+P → “Tasks: Run Task” → “Start Backend + Frontend"`: Runs Azure Functions and React Native PWA
- `Cmd+Shift+P → “Tasks: Run Task” → “Start Backend"`
- `Cmd+Shift+P → “Tasks: Run Task” → “Start Frontend"`

Or start services manually:

```bash
npm start --prefix FreeWaterTips.API
npm run web --prefix FreeWaterTips.ReactNative
```

## Code Contributions

We follow the [GitHub Flow](https://docs.github.com/en/get-started/using-github/github-flow) branching strategy.

### Development Workflow

1. **Fork and Clone**

   ```bash
   git clone https://github.com/your-username/free-water-tips.git
   cd free-water-tips
   git remote add upstream https://github.com/ivan-zdravkov/free-water-tips.git
   ```

2. **Setup Development Environment**
   See [Development Setup](#development-setup) section above.

3. **Create Feature Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make Changes and Test**
   Run the health check script to ensure your environment is properly configured:

   ```bash
   ./health.sh
   ```

   Test your changes locally before committing.

5. **Commit and Push**

   ```bash
   git add .
   git commit -m "feat: add your feature description"
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - Open a [Pull Request](https://github.com/ivan-zdravkov/free-water-tips/pulls) on GitHub
   - Follow the [Pull Request Template](.github/pull_request_template.md)
   - Wait for automated checks and review

### Code Formatting

This project uses automated code formatters for consistent style across all file types.

**Setup**

- Install recommended VS Code extensions when prompted
- Format on save is enabled automatically

**Configuration Files**

- [`.prettierrc.json`](.prettierrc.json) - Prettier formatting rules (TS/JS/JSON/YAML/HTML/CSS)
- [`.prettierignore`](.prettierignore) - Files excluded from Prettier formatting
- [`.editorconfig`](.editorconfig) - Cross-editor formatting settings
- [`.vscode/settings.json`](.vscode/settings.json) - VS Code format-on-save configuration
- [`.vscode/extensions.json`](.vscode/extensions.json) - Recommended VS Code extensions

Run `./health.sh` to verify formatters are properly configured.

### Code Quality

- **Languages**: Follow [TypeScript best practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html) for both frontend and backend
- **Style**: Use consistent formatting and meaningful names
- **Testing**: Add tests for new functionality
- **Documentation**: Update for significant changes

## E2E Testing

Free Water Tips uses [Jest](https://jestjs.io/) with [Selenium WebDriver](https://www.selenium.dev/documentation/webdriver/) for end-to-end testing to ensure the application works correctly from a user's perspective.

### Running E2E Tests Locally

#### Recommended

`Cmd+Shift+P → "Tasks: Run Task" → "E2E: Run Tests (Local)"`

Running this task will start the `Start Backend + Frontend` task and then run the tests against `http://localhost:8090/`

#### Manual

1. **Start the development environment in seperate terminals**:

```bash
npm start --prefix FreeWaterTips.API
```

```bash
npm run web --prefix FreeWaterTips.ReactNative
```

2. **Run E2E tests**:

```bash
npm run test:local --prefix e2e
```

### Running E2E Tests Against Testing Environment

To test against the deployed testing environment at https://test.freewater.tips:

`Cmd+Shift+P → "Tasks: Run Task" → "E2E: Run Tests (Testing)"`

or

```bash
npm run test:testing --prefix e2e
```

### Debugging E2E Tests

You can debug E2E tests using VS Code's debugger:

1. Open the Debug panel (Cmd+Shift+D)
2. Select "E2E Tests (Local)" or "E2E Tests (Testing)" from the dropdown
3. Set breakpoints in your test files
4. Press F5 to start debugging

### Writing New E2E Tests

Tests are located under [e2e/tests/](./e2e/tests/) and use [Jest Globals](https://jestjs.io/docs/api) structure with [Selenium WebDriver](https://www.selenium.dev/documentation/webdriver/) for browser automation. See the existing tests for for reference.

### E2E Tests in CI/CD

The E2E tests automatically run against https://test.freewater.tips during GitHub Actions' deployment after pushing to the `testing` branch and deploying to the testing environment. This ensures that the deployed application works correctly before promoting changes to production.

## Pull Request Process

### Pre-submission Checklist

The full PR checklist is automatically added to every pull request via our [PR Template](.github/pull_request_template.md).

### Automated Quality Checks

- GitHub Actions automatically validate styling, builds and tests
- All status checks must pass before merging is allowed

### Review Process

- At least one code review required from [code owners](.github/CODEOWNERS)
- Automated CI/CD checks must pass
- You can open a PR to the `testing` branch and request a deployment to the [test environment](https://test.freewater.tips)

### Merge Requirements

- All conversations resolved
- CI/CD pipeline successful
- Branch up-to-date with master

### Steps to Submit a PR

1. **Update documentation** if needed
2. **Test your changes** manually and with tests
3. **Follow the PR template**
4. **Request review** from maintainers
5. **Address feedback** promptly
6. **Keep PR focused** - one feature/fix per PR

## Community Guidelines

### Be Respectful

- Use inclusive language
- Be constructive in feedback
- Respect different perspectives
- Help newcomers feel welcome

### Be Collaborative

- Share knowledge and resources
- Give credit where due
- Work together towards common goals

### Be Professional

- Keep discussions focused and relevant
- Avoid spam or self-promotion
- Follow GitHub's community guidelines

## Getting Help

- **Bug Reports**: [Report a bug](https://github.com/ivan-zdravkov/free-water-tips/issues/new?template=bug_report.md) using the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md)
- **Feature Requests**: [Suggest a feature](https://github.com/ivan-zdravkov/free-water-tips/issues/new?template=feature_request.md) using the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md)
- **GitHub Discussions**: For general questions and community chat - [Join discussions](https://github.com/ivan-zdravkov/free-water-tips/discussions)
- **Contact**: Reach out to [Ivan Zdravkov](https://github.com/ivan-zdravkov) for questions

## License

By contributing, you agree that your contributions will be licensed under the GPL-3.0 License.

---

**Ready to contribute? Start by setting up your development environment and exploring the codebase. Every contribution, no matter how small, helps make clean drinking water more accessible to everyone!**
