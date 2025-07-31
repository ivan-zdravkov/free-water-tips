# Contributing to Free Water Tips

Thank you for your interest in contributing to Free Water Tips! This guide will help you get started with contributing to our open-source project.

## Getting Started

Free Water Tips is a community-driven platform that helps people find free drinking water sources worldwide. We welcome contributions from developers, designers, content creators, and anyone passionate about improving access to clean water.

## Ways to Contribute

### 🐛 Report Bugs
Help us improve by reporting issues you encounter.

### 💡 Suggest Features
Share ideas for new features or improvements.

### 💻 Code Contributions
Contribute to the web app, mobile apps, or backend services.

### 📍 Add Water Sources
Help expand our database by adding new water source locations.

### 📚 Documentation
Improve our documentation, guides, and help content.

### 🌍 Translations
Help make the platform accessible in different languages.

## Reporting Bugs

We appreciate detailed bug reports as they help us improve the platform for everyone. Please follow these guidelines when reporting bugs:

### Before Reporting

1. **Check existing issues**: Search our [GitHub Issues](https://github.com/ivan-zdravkov/free-water-tips/issues) to see if the bug has already been reported.
2. **Try to reproduce**: Make sure you can consistently reproduce the issue.
3. **Check different browsers/devices**: Test if the issue occurs across different platforms.

### Bug Report Template

When creating a bug report, please include:

#### **Bug Description**
A clear and concise description of what the bug is.

#### **Steps to Reproduce**
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

#### **Expected Behavior**
A clear description of what you expected to happen.

#### **Actual Behavior**
A clear description of what actually happened.

#### **Screenshots/Videos**
If applicable, add screenshots or screen recordings to help explain your problem.

#### **Environment Information**
- **Platform**: Web App / Android App / iOS App
- **Browser**: Chrome, Firefox, Safari, etc. (including version)
- **Device**: Desktop, Mobile, Tablet
- **Operating System**: Windows 10, macOS Big Sur, iOS 14, Android 11, etc.
- **Screen Resolution**: If relevant for UI issues

#### **Additional Context**
- Any error messages displayed
- Console logs (for web app issues)
- Network connectivity status
- Any recent changes to your setup

### Priority Levels

When reporting bugs, consider the impact:

- **🔴 Critical**: Security vulnerabilities, data loss, app crashes
- **🟠 High**: Major features broken, significant UX issues
- **🟡 Medium**: Minor features broken, cosmetic issues with workarounds
- **🟢 Low**: Minor cosmetic issues, nice-to-have improvements

### Example Bug Report

```markdown
**Bug Description**
The "Find Nearest" button doesn't work when location services are disabled.

**Steps to Reproduce**
1. Open Free Water Tips web app
2. Disable location services in browser settings
3. Click "Find Nearest" button
4. No error message appears, button becomes unresponsive

**Expected Behavior**
Should show an error message asking user to enable location services or manually enter their location.

**Actual Behavior**
Button becomes unresponsive with no feedback to the user.

**Environment**
- Platform: Web App
- Browser: Chrome 119.0.6045.105
- Device: Desktop
- OS: Windows 11

**Screenshots**
[Attach screenshot showing unresponsive button]
```

## Suggesting Features

We welcome feature suggestions! Please:

1. **Check existing issues** to see if it's already been suggested
2. **Use the feature request template** when creating a new issue
3. **Provide context** about why this feature would be valuable
4. **Consider implementation complexity** and user impact

## Code Contributions

Check the [Technical Guide](/docs/technical-guide.md) for architecture and technical details about the project.

### Development Setup

#### Prerequisites
- [.NET 8.0 SDK](https://dotnet.microsoft.com/download) or later
- [Azure Functions Core Tools](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local)
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
- [Git](https://git-scm.com/downloads)
- [Visual Studio Code](https://code.visualstudio.com/)
- [Node.js](https://nodejs.org/) (for local web development server)

#### Clone Repository
   ```bash
   # Fork the repository on GitHub first, then:
   git clone https://github.com/your-username/free-water-tips.git
   cd free-water-tips
   git remote add upstream https://github.com/ivan-zdravkov/free-water-tips.git
   ```

#### Quick Setup (Recommended)

**Prerequisites:**
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0) for API development
- [Azure Functions Core Tools v4](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local) for local API testing
- [Node.js](https://nodejs.org/) for web development and build tools

For a faster setup process, you can use our automated setup script:

```bash
npm run setup
```

This script will:
- Install all dependencies (Node.js packages and .NET packages)
- Create configuration files from templates (config.json for /web and local.settings.json for api)
- Set up both web and .NET API development environments
- Check prerequisites (.NET SDK, Azure Functions Core Tools, Node.js)
- Guide you through API key setup

#### Application Start

**Full Stack Development (Recommended):**
```bash
# Start both web and API servers
npm run all:start
```

**Individual Components:**

1. **Web Development**
   ```bash
   # Start web dev server at http://localhost:3000
   npm run web:start
   ```

2. **API Development (.NET Azure Functions)**
   ```bash
   # Restore .NET packages
   npm run api:restore
   
   # Start API dev server at http://localhost:7071
   npm run api:start
   ```

3. **Mobile Development**
   ```bash
   TBD
   ```

#### Visual Studio Code Recommended Extensions
- [C# Dev Kit](https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.csdevkit)
- [Azure Functions](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurefunctions)
- [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) for API testing

#### Available npm Scripts
```bash
# Web Development
npm start               # Start web server
npm run web:start       # Start web dev server with live reload

# .NET API Development  
npm run api:restore     # Restore .NET packages
npm run api:build       # Build .NET API
npm run api:start       # Start API server
npm run api:start       # Start API server with CORS

# Full Stack Development
npm run all:start       # Start both web and API servers

# Setup and Maintenance
npm run setup           # Run development setup script
```

### Contributing Workflow

We follow the [GitHub Flow](https://docs.github.com/en/get-started/using-github/github-flow) branching strategy:

#### 1. Create Feature Branch
```bash
# Create and switch to a new feature branch
git checkout -b feature/your-feature-name
```

#### 2. Development Process
- Write your code following the project's coding standards
- Add tests for new functionality
- Update documentation as needed
- Ensure all tests pass locally

#### 3. Commit Changes
```bash
# Stage your changes
git add .

# Commit with descriptive message
git commit -m "feat: add location search functionality"
```

#### 4. Push and Create Pull Request
```bash
# Push to your fork
git push origin feature/your-feature-name

# Create pull request on GitHub
```

### Code Quality Standards

#### Coding and Style Guidelines
- Follow [C# Coding Conventions](https://docs.microsoft.com/en-us/dotnet/csharp/fundamentals/coding-style/coding-conventions)
- Follow [JavaScript Coding Guidelines](https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Code_style_guide/JavaScript) with modern ES6+ syntax
- Use [Semantic HTLM](https://developer.mozilla.org/en-US/curriculum/core/semantic-html/)
- Use meaningful variable and method names
- Write self-documenting code with clear comments for complex logic
- Follow SOLID principles and clean architecture patterns

### Testing Requirements
- Unit tests for business logic (minimum 80% coverage)
- Integration tests for API endpoints
- End-to-end tests for critical user flows
- Performance tests for scalability validation

### Useful Development Commands

```bash
# Backend (.NET) Commands
dotnet test                             # Run all tests
dotnet format --verify-no-changes       # Check code formatting

# Frontend Commands  
node -c script.js                       # Check JavaScript syntax

# Git Commands
git checkout -b feature/branch-name     # Create feature branch
git add . && git commit -m "message"    # Stage and commit changes
git push origin feature/branch-name     # Push feature branch

# Quality Checks (run before submitting PR)
./scripts/pre-commit-checks.sh          # Run all quality checks locally
```

## Adding Water Sources

You can contribute by adding new water source locations:

1. **Use the Contribute page** on the web or mobile apps
2. **Provide accurate information**: Name, address, description, etc.
3. **Include helpful details**: Operating hours, accessibility info
4. **Verify location**: Ensure GPS coordinates are correct
5. **Add photos**: If possible, include photos of the water source

## Pull Request Process

### Pre-submission Checklist
The full PR checklist is automatically added to every pull request via our [PR Template](.github/pull_request_template.md).*

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

- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For general questions and community chat
- **Technical Guide**: Check the [Technical Guide](docs/technical-guide.md) for architecture and technical details
- **Contact**: Reach out to [Ivan Zdravkov](https://github.com/ivan-zdravkov) for architectural guidance or sensitive issues

## Recognition

Contributors will be recognized in:
- GitHub contributors list
- Project README
- App credits section (for significant contributions)

## License

By contributing, you agree that your contributions will be licensed under the GPL-3.0 License.

---

**Ready to contribute? Start by setting up your development environment and exploring the codebase. Every contribution, no matter how small, helps make clean drinking water more accessible to everyone!**
