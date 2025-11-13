# Contributing to Free Water Tips

Thank you for your interest in contributing to [Free Water Tips](https://freewater.tips/)! This guide will help you get started with contributing to our open-source project that helps people find free drinking water sources worldwide.

## Table of Contents

- [Getting Started](#getting-started)
- [Ways to Contribute](#ways-to-contribute)
  - [Adding Water Sources](#adding-water-sources)
  - [Suggesting Features](#suggesting-features)
  - [Reporting Bugs](#reporting-bugs)
  - [Contributing Code](#contributing-code)
  - [Translating](#translating)
- [Project Architecture](#project-architecture)
- [Development Setup](#development-setup)
  - [Quick Setup (Recommended)](#quick-setup-recommended)
  - [Manual Setup (Alternative)](#manual-setup-alternative)
  - [Development Commands](#development-commands)
  - [Configuration](#configuration)
- [Code Contributions](#code-contributions)
- [Pull Request Process](#pull-request-process)
- [Community Guidelines](#community-guidelines)
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

Share ideas for new features or improvements.

1. **Check existing issues** to see if it's already been suggested
2. **Use the feature request template** when creating a new issue
3. **Provide context** about why this feature would be valuable
4. **Consider implementation complexity** and user impact

### 🐛 Report Bugs

Help us improve by reporting issues you encounter. See [Reporting Bugs](/docs/reporting-bugs.md) for details.

### 💻 Contributing Code

Contribute to the web app, mobile apps, or backend services, improve documentation or guides. See [Development Setup](#development-setup) to get started.

### 🌍 Translating

Help make the platform accessible in different languages (coming soon).

## Project Architecture

**Free Water Tips** is a full-stack Progressive Web App (PWA) with a serverless backend:

### Frontend

- **Framework**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/)
- **Platform**: Progressive Web App (PWA) with TypeScript
- **Web Hosting**: [GitHub Pages](https://pages.github.com/) or any static hosting
- **Future Plans**: Native mobile apps for iOS and Android may be considered based on community demand

### Backend

- **API**: [Azure Functions](https://learn.microsoft.com/en-us/azure/azure-functions/) (Node.js 22) with HTTP triggers
- **Database**: [Azure Cosmos DB](https://azure.microsoft.com/en-us/products/cosmos-db) with JSON documents and geo location data
- **Deployment**: [GitHub Actions](https://github.com/features/actions) to [Azure](https://azure.microsoft.com/en-us/products/functions)

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
- Cosmos DB Emulator (via Docker)
- Expo & React Native dependencies
- Project dependencies

The script provides clear installation instructions for any missing dependencies based on your operating system.

### 2. Configure local settings

Copy the template file to create your local settings:

```bash
cp FreeWaterTips.API/local.settings.json.template FreeWaterTips.API/local.settings.json
```

The default configuration uses the Cosmos DB Emulator running on `https://localhost:8081`. Adjust the settings if needed for your environment.

### 3. Install project dependencies

```bash
# Install React Native dependencies
cd FreeWaterTips.ReactNative
npm install
cd ..

# Install Azure Functions dependencies
cd FreeWaterTips.API
npm install
cd ..
```

### 4. Start development servers

You can use VS Code tasks to start the development environment:

- **Start Backend + Frontend**: Runs Azure Functions and React Native PWA

Or start services manually:

```bash
# Start Azure Functions
cd FreeWaterTips.API
npm start

# In another terminal, start React Native Web
cd FreeWaterTips.ReactNative
npm run web
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
   - Open PR on GitHub
   - Follow the PR template
   - Wait for automated checks and review

### Code Formatting

This project uses automated code formatters for consistent style across all file types.

**Setup**

- Install recommended VS Code extensions when prompted (Prettier, ESLint)
- Format on save is enabled automatically via `.vscode/settings.json`

**Configuration Files**

- `.prettierrc.json` - Prettier settings (TS/JS/JSON/YAML/HTML/CSS)
- `.vscode/settings.json` - Format on save config

Run `./health.sh` to verify formatters are properly configured.

### Code Quality

- **Languages**: Follow TypeScript best practices for both frontend and backend
- **Style**: Use consistent formatting and meaningful names
- **Testing**: Add tests for new functionality
- **Documentation**: Update docs for significant changes

## Pull Request Process

### Pre-submission Checklist

The full PR checklist is automatically added to every pull request via our [PR Template](.github/pull_request_template.md).

### Automated Quality Checks

- GitHub Actions automatically run comprehensive quality checks on every PR
- All status checks must pass before merging is allowed
- See [PR Quality Checks](.github/workflows/pr-quality-checks.yml) workflow for details. To be added...

### Review Process

- At least one code review required from [code owners](.github/CODEOWNERS)
- Automated CI/CD checks must pass
- Feature branch environment testing completed (when available)

### Merge Requirements

- All conversations resolved
- CI/CD pipeline successful
- Branch up-to-date with master

### Steps to Submit a PR

1. **Update documentation** if needed
2. **Test your changes** thoroughly
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

- **GitHub Issues**: For bug reports and feature requests - [Create an issue](https://github.com/ivan-zdravkov/free-water-tips/issues/new)
- **GitHub Discussions**: For general questions and community chat - [Join discussions](https://github.com/ivan-zdravkov/free-water-tips/discussions)
- **Contact**: Reach out to [Ivan Zdravkov](https://github.com/ivan-zdravkov) for questions

## License

By contributing, you agree that your contributions will be licensed under the GPL-3.0 License.

---

**Ready to contribute? Start by setting up your development environment and exploring the codebase. Every contribution, no matter how small, helps make clean drinking water more accessible to everyone!**
