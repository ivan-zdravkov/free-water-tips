# Configuration Guide

This guide explains how configuration files are organized across the Free Water Tips project.

## Configuration File Naming Convention

We follow a **consistent naming convention** across all layers of the application:

### Pattern: `{filename}.example.{ext}` → `{filename}.{ext}`

- **Template files**: Include `.example` in the filename (committed to git)
- **Runtime files**: Remove `.example` from the filename (ignored by git)

## Configuration Files by Layer

### 🌐 Web Application (`/src/web/`)

| Template (Committed) | Runtime (Ignored) | Purpose |
|---------------------|------------------|---------|
| `config.example.json` | `config.json` | Google Maps API key, API endpoints |

**Location**: `src/web/js/config/`

### 🚀 API Layer (`/src/api/`)

| Template (Committed) | Runtime (Ignored) | Purpose |
|---------------------|------------------|---------|
| `local.settings.example.json` | `local.settings.json` | Azure Functions configuration, Cosmos DB connection |

**Location**: `src/api/`

### 🗄️ Database Layer (`/src/db/`)

| Template (Committed) | Runtime (Ignored) | Purpose |
|---------------------|------------------|---------|
| `.env.example` | `.env` | Cosmos DB connection settings |

**Location**: `src/db/`

## Setup Process

The setup script (`scripts/setup-dev.sh`) automatically creates runtime configuration files from templates:

```bash
# Automatically creates:
src/web/js/config/config.json         # from config.example.json
src/api/local.settings.json           # from local.settings.example.json  
src/db/.env                           # from .env.example
```

## Git Configuration

All runtime configuration files are ignored by git (see `.gitignore`):

```gitignore
# Local configuration files
src/web/js/config/config.json
src/api/local.settings.json
src/db/.env
```

## Editing Configuration

### For Development:
1. Run `scripts/setup-dev.sh` to create initial configuration files
2. Edit the runtime files (not the `.example` files)
3. Add your API keys and local settings

### For New Template Changes:
1. Edit the `.example` files
2. Commit the template changes
3. Other developers will get updates when they run setup script

## Why This Convention?

- **Consistency**: Same pattern across web, API, and database layers
- **Security**: Runtime files with secrets are never committed
- **Collaboration**: Template files show required configuration structure
- **Automation**: Setup script can reliably create all needed files

## Configuration Values

### Development (Local)
- **Cosmos DB**: Uses local emulator (https://127.0.0.1:8081)
- **API**: Runs on http://localhost:7071/api
- **Web**: Runs on http://localhost:3000

### Production
Configuration values are managed through Azure App Service application settings and environment variables.
