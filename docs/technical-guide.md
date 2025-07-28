# Technical Guide

This document provides a comprehensive overview of the Free Water Tips project's technical architecture, technology choices, and development practices.

## Project Structure

*TBD*

## Technology Stack & Methodology Choices

### Frontends

- **Web Application**: [Single Page Application (SPA)](https://dev.to/moseeh_52/building-modern-spas-with-vanilla-javascript-a-beginners-guide-9a3) with vanilla JavaScript.
  - **Why**: Perfect for [Google Maps](https://developers.google.com/maps) integration, simple deployment to GitHub Pages.
  - **Benefits**: Fast development, static hosting, optimal for map-based interfaces.
  - **Hosting**: [GitHub Pages](https://pages.github.com/) for free static hosting.

- **Mobile Applications**: [.NET MAUI](https://dotnet.microsoft.com/en-us/apps/maui) with embedded WebView.
  - **Why**: Reuse existing web code while providing native app store presence.
  - **Benefits**: Single codebase for web content, native device integration, app store distribution.
  - **Implementation**: MAUI WebView loads the same HTML/CSS/JavaScript as the web version.

### MVP Backend Architecture

- **API Services**: [Azure Functions (C#)](https://learn.microsoft.com/en-us/azure/azure-functions/create-first-function-vs-code-csharp) with HTTP triggers.
  - **Why**: Serverless, pay-per-execution, perfect for CRUD operations and intermittent traffic.
  - **Benefits**: No infrastructure management, auto-scaling, cost-effective for MVP stage.
  - **Deployment**: Azure Functions with consumption plan.

- **Database**: [Azure Cosmos DB](https://azure.microsoft.com/en-us/products/cosmos-db).
  - **Why**: Simplified scalability, flexible schema for location data, reduced complexity compared to relational databases, serverless billing option, Azure Function integration.
  - **Benefits**: Horizontal scaling, JSON-native storage, geographical data support.
  
### Future Backend Migration Path
If traffic or functionality requirements outgrow the serverless architecture, the path forward would be rewriting the HTTP endpoints in a more robust framework.

- **API Services**: [ASP.NET Core Web API](https://dotnet.microsoft.com/en-us/apps/aspnet/apis).
  - **Why**: High performance, cross-platform, excellent Azure integration.
  - **Benefits**: Built-in dependency injection, middleware pipeline, robust security features.

- **Container Orchestration**: [Azure Kubernetes Service (AKS)](https://azure.microsoft.com/en-us/products/kubernetes-service).
  - **Why**: Managed Kubernetes service with Azure integration.
  - **Benefits**: Auto-scaling, service discovery, rolling deployments, infrastructure abstraction.

### Development & Deployment
- **Version Control**: GitHub with [GitHub Flow](https://docs.github.com/en/get-started/using-github/github-flow).
  - **Why**: Simple branching strategy, continuous integration friendly.
  - **Benefits**: Feature branch testing, pull request reviews, automated deployments.

- **CI/CD**: [GitHub Actions](https://github.com/features/actions).
  - **Why**: Native GitHub integration, extensive marketplace.
  - **Benefits**: Infrastructure as Code, automated testing, environment provisioning.

## Development Setup Guide

### Prerequisites
- [.NET 8.0 SDK](https://dotnet.microsoft.com/download) or later
- [Azure Functions Core Tools](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local)
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
- [Git](https://git-scm.com/downloads)
- [Visual Studio Code](https://code.visualstudio.com/)
- [Node.js](https://nodejs.org/) (for local web development server)

### Local Development Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/ivan-zdravkov/free-water-tips.git
   cd free-water-tips
   ```

2. **Web Development**
   ```bash
   # Navigate to web folder
   cd src/web
   
   # Start local development server
   npx live-server --port=3000
   
   # Web app available at: http://localhost:3000
   ```

3. **API Development (Azure Functions)**
   ```bash
   # Navigate to API folder
   cd src/api
   
   # Install dependencies
   dotnet restore
   
   # Start Functions runtime
   func start
   
   # API available at: http://localhost:7071
   ```

4. **Mobile Development**
   ```bash
   # Navigate to mobile folder
   cd src/mobile
   
   # Restore and run MAUI app
   dotnet restore
   dotnet build
   
   # Run on specific platform
   dotnet build -t:Run -f net8.0-android
   ```

### IDE Configuration

#### Visual Studio Code
Install recommended extensions:
- [C# Dev Kit](https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.csdevkit)
- [Azure Functions](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurefunctions)

## Contributor's Guide

### Contributing Workflow

We follow the [GitHub Flow](https://docs.github.com/en/get-started/using-github/github-flow) branching strategy:

1. **Fork and Clone**
   ```bash
   # Fork the repository on GitHub
   git clone https://github.com/YOUR-USERNAME/free-water-tips.git
   cd free-water-tips
   git remote add upstream https://github.com/ivan-zdravkov/free-water-tips.git
   ```

2. **Create Feature Branch**
   ```bash
   # Create and switch to a new feature branch
   git checkout -b feature/your-feature-name
   ```

3. **Development**
   - Write your code following the project's coding standards.
   - Add tests for new functionality.
   - Update documentation as needed.
   - Ensure all tests pass locally.

4. **Commit Changes**
   ```bash
   # Stage your changes
   git add .
   
   # Commit with descriptive message
   git commit -m "feat: add location search functionality"
   ```

5. **Push and Create Pull Request**
   ```bash
   # Push to your fork
   git push origin feature/your-feature-name
   
   # Create pull request on GitHub
   ```

### Feature Branch Infrastructure

Each feature branch automatically provisions a complete testing environment:
 
- **Automated Environment Provisioning**: GitHub Actions automatically deploys feature branches to isolated Azure environments.
- **End-to-End Testing**: Full stack testing with mock data in a production-like environment.
- **Environment Cleanup**: Automatic resource cleanup when the feature branch is merged or closed.

### Code Quality Standards

#### Coding Guidelines
- Follow [C# Coding Conventions](https://docs.microsoft.com/en-us/dotnet/csharp/fundamentals/coding-style/coding-conventions).
- Use meaningful variable and method names.
- Write self-documenting code with clear comments.
- Follow SOLID principles and clean architecture patterns.

#### Testing Requirements
- Unit tests for business logic (minimum 80% coverage).
- Integration tests for API endpoints.
- End-to-end tests for critical user flows.
- Performance tests for scalability validation.

#### Pull Request Process
1. **Pre-submission Checklist**:
   - [ ] All tests pass locally.
   - [ ] Code follows style guidelines.
   - [ ] Documentation is updated.
   - [ ] No merge conflicts with main branch.

2. **Review Process**:
   - At least one code review required.
   - Automated CI/CD checks must pass.
   - Feature branch environment testing completed.

3. **Merge Requirements**:
   - All conversations resolved.
   - CI/CD pipeline successful.
   - Branch up-to-date with main.

### Getting Help

- **Documentation**: Check this guide and inline code comments.
- **Issues**: Create a GitHub issue for bugs or feature requests.
- **Discussions**: Use GitHub Discussions for questions and ideas.
- **Contact**: Reach out to [Ivan Zdravkov](https://github.com/ivan-zdravkov) for architectural guidance.

### Useful Commands

```bash
# Run tests
dotnet test

# Check code formatting
dotnet format --verify-no-changes
```

---

**Ready to contribute? Start by setting up your development environment and exploring the codebase. Every contribution, no matter how small, helps make clean drinking water more accessible to everyone!**
