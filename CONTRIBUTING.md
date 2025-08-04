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

**Free Water Tips** is a full-stack web application with a serverless backend:

### Frontend
- **Web**: Vanilla JavaScript SPA with [Google Maps](https://developers.google.com/maps) integration
- **Mobile**: [.NET MAUI](https://dotnet.microsoft.com/en-us/apps/maui) with WebView (planned)
- **Hosting**: [GitHub Pages](https://pages.github.com/) (static hosting)

### Backend  
- **API**: [Azure Functions](https://learn.microsoft.com/en-us/azure/azure-functions/) (C#) with HTTP triggers
- **Database**: [Azure Cosmos DB](https://azure.microsoft.com/en-us/products/cosmos-db) with JSON documents
- **Deployment**: Azure serverless architecture

### Development Stack
- **Languages**: JavaScript, C#
- **Frameworks**: Vanilla JS, [Azure Functions](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local)
- **Database**: [Azure Cosmos DB](https://docs.microsoft.com/en-us/azure/cosmos-db/local-emulator) (local emulator for development)
- **CI/CD**: [GitHub Actions](https://github.com/features/actions)
- **Tools**: [VS Code](https://code.visualstudio.com/), [Azure Functions Core Tools](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local)


## Development Setup

### Quick Setup (Recommended)

**🚀 Use our automated setup script - this is the officially supported way to set up your development environment:**

```bash
# Clone the repository
git clone https://github.com/your-username/free-water-tips.git
cd free-water-tips

# Run the setup script (checks prerequisites and sets up everything)
npm run setup # or './scripts/setup-dev.sh' directly if Node.js is not already installed
```

The setup script will:
- ✅ Check all prerequisites and guide you through installation if needed
- ✅ Install all dependencies
- ✅ Create configuration files from templates
- ✅ Set up development environment for all layers
- ✅ Provide next steps and available commands

### Manual Setup (Alternative)

If you prefer not to use the setup script, here are the manual steps:

**Prerequisites:**
- [Node.js](https://nodejs.org/) (latest LTS)
- [Azure Functions Core Tools v4](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local#install-the-azure-functions-core-tools)
- [Azure Cosmos DB Emulator](https://docs.microsoft.com/en-us/azure/cosmos-db/local-emulator) (Windows) or [Docker version](https://docs.microsoft.com/en-us/azure/cosmos-db/linux-emulator) (Linux/macOS)
- [Git](https://git-scm.com/downloads)

**Steps:**
1. Install dependencies: `npm install` (root), `npm install` (src/db), `dotnet restore` (src/api)
2. Copy configuration templates:
   - [`src/web/js/config/config.example.json`](src/web/js/config/config.example.json) → `config.json`
   - [`src/api/local.settings.example.json`](src/api/local.settings.example.json) → `local.settings.json`
   - [`src/db/.env.example`](src/db/.env.example) → `.env`
3. Add your API keys ([Google Maps API key](https://console.cloud.google.com/apis/credentials) required)
4. Start [Azure Cosmos DB Emulator](https://docs.microsoft.com/en-us/azure/cosmos-db/local-emulator)
5. Run database seeding: `npm run db:seed:locations`

**💡 Tip: The setup script handles all edge cases and platform differences. Manual setup may require troubleshooting.**

### Development Commands

```bash
# Start full-stack development (recommended)
npm run all:start

# Individual components
npm run web:start         # Web app (http://localhost:3000)
npm run api:start         # API server (http://localhost:7071)
npm run db:seed:locations # Populate database with sample data

# Database management
npm run db:clean          # Clear all data
npm run db:reset          # Clean and reseed
```

### Configuration

Configuration files follow a consistent `.example` → runtime pattern:
- [`config.example.json`](src/web/js/config/config.example.json) → `config.json` (web)
- [`local.settings.example.json`](src/api/local.settings.example.json) → `local.settings.json` (API)  
- [`.env.example`](src/db/.env.example) → `.env` (database)

See [Configuration Guide](docs/configuration-guide.md) for details.

## Code Contributions

Before contributing code, make sure you've completed the [Development Setup](#development-setup) section above.

We follow the [GitHub Flow](https://docs.github.com/en/get-started/using-github/github-flow) branching strategy:

### Development Workflow

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/free-water-tips.git
   cd free-water-tips
   git remote add upstream https://github.com/ivan-zdravkov/free-water-tips.git
   ```

2. **Setup Development Environment**
   ```bash
   npm run setup # or './scripts/setup-dev.sh' directly if Node.js is not already installed
   ```

3. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make Changes and Test**
   ```bash
   npm run all:start       # Start development servers
   # Make your changes, test thoroughly
   ```

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

### Code Quality

- **Languages**: Follow C# and JavaScript best practices
- **Style**: Use consistent formatting and meaningful names  
- **Testing**: Add tests for new functionality
- **Documentation**: Update docs for significant changes

Use the setup script to ensure your environment matches the project standards.

## Pull Request Process

### Pre-submission Checklist
The full PR checklist is automatically added to every pull request via our [PR Template](.github/pull_request_template.md).

### Automated Quality Checks
- GitHub Actions automatically run comprehensive quality checks on every PR
- All status checks must pass before merging is allowed
- See [PR Quality Checks](.github/workflows/pr-quality-checks.yml) workflow for details

### Review Process
- At least one code review required from [code owners](.github/CODEOWNERS)
- Automated CI/CD checks must pass
- Feature branch environment testing completed (when available)

### Merge Requirements
- All conversations resolved
- CI/CD pipeline successful
- Branch up-to-date with main
- [Branch protection](.github/BRANCH_PROTECTION_SETUP.md) rules enforced

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
- **Configuration Guide**: See [Configuration Guide](docs/configuration-guide.md) for setup details
- **Contact**: Reach out to [Ivan Zdravkov](https://github.com/ivan-zdravkov) for questions

## License

By contributing, you agree that your contributions will be licensed under the GPL-3.0 License.

---

**Ready to contribute? Start by setting up your development environment and exploring the codebase. Every contribution, no matter how small, helps make clean drinking water more accessible to everyone!**
