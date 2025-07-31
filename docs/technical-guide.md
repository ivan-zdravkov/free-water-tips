# Technical Guide

This document provides a comprehensive overview of the Free Water Tips project's technical architecture, technology choices, and development practices.

## Project Structure

```
free-water-tips/
├── src/
│   ├── [web/](../src/web/)        # Web SPA (HTML, CSS, JS)
│   ├── mobile/     # .NET MAUI mobile app
│   └── api/        # Azure Functions (C#)
├── [docs/](../docs/)           # Documentation
├── [scripts/](../scripts/)        # Automation and CI/CD scripts
├── .github/        # GitHub workflows, templates, CODEOWNERS
├── [README.md](../README.md)
└── ...
```

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

#### Quick Development Setup

```bash
# Clone and setup
git clone https://github.com/ivan-zdravkov/free-water-tips.git
cd free-water-tips

# Automated setup (recommended)
npm run setup

# Full stack development
npm run all:start

# Individual components:
# Web development
npm run web:start

# .NET API development
npm run api:start

# Mobile development (when available)
cd src/mobile && dotnet build -t:Run -f net8.0-android
```

**Prerequisites:**
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Azure Functions Core Tools v4](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local)
- [Node.js](https://nodejs.org/)

For complete setup instructions including prerequisites and IDE configuration, see the [Development Setup](../CONTRIBUTING.md#development-setup) section in our Contributing Guide.

## Contributing to the Project

For information about contributing to Free Water Tips, including:
- Development setup and prerequisites
- Contribution workflows and branching strategy
- Code quality standards and testing requirements
- Pull request process and review guidelines
- Bug reporting and feature request procedures

Please see our comprehensive [Contributing Guide](../CONTRIBUTING.md).
