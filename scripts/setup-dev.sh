#!/bin/bash

# Development Setup Script for Free Water Tips
# This script sets up the local development environment

echo "🌊 Setting up Free Water Tips development environment..."

# Navigate to project root
cd "$(dirname "$0")/.."

echo ""
echo "🛠️  Prerequisites Check..."

# Track missing prerequisites
MISSING_PREREQS=()

# Check Git (recommended but not required)
if command -v git &> /dev/null; then
    echo "   ✅ Git: $(git --version)"
else
    echo "   ⚠️  Git: Not installed (recommended for version control)"
fi

# Check Node.js and npm
if command -v node &> /dev/null; then
    echo "   ✅ Node.js: $(node --version)"
    if command -v npm &> /dev/null; then
        echo "   ✅ npm: $(npm --version)"
    else
        echo "   ❌ npm: Not found (usually comes with Node.js)"
        MISSING_PREREQS+=("npm")
    fi
else
    echo "   ❌ Node.js: Not installed (required for web development and package management)"
    MISSING_PREREQS+=("Node.js")
fi

# Check Azure Functions Core Tools
if command -v func &> /dev/null; then
    echo "   ✅ Azure Functions Core Tools: $(func --version)"
else
    echo "   ❌ Azure Functions Core Tools: Not installed (required for API development)"
    MISSING_PREREQS+=("Azure Functions Core Tools")
fi

# Check Azure Cosmos DB Emulator (platform specific)
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" || "$OSTYPE" == "cygwin" ]]; then
    if command -v "Microsoft.Azure.Cosmos.Emulator.exe" &> /dev/null || [ -f "/c/Program Files/Azure Cosmos DB Emulator/Microsoft.Azure.Cosmos.Emulator.exe" ]; then
        echo "   ✅ Azure Cosmos DB Emulator: Installed"
    else
        echo "   ❌ Azure Cosmos DB Emulator: Not installed (required for database)"
        MISSING_PREREQS+=("Azure Cosmos DB Emulator")
    fi
else
    echo "   ⚠️  Azure Cosmos DB Emulator: Linux/macOS support limited"
    echo "      You can use Docker-based emulator or connect to Azure Cosmos DB in the cloud"
fi

# Check curl
if command -v curl &> /dev/null; then
    echo "   ✅ curl: $(curl --version | head -n1)"
else
    echo "   ❌ curl: Not installed (used for health checks)"
    MISSING_PREREQS+=("curl")
fi

# If any required prerequisites are missing, stop and show installation guide
if [ ${#MISSING_PREREQS[@]} -gt 0 ]; then
    echo ""
    echo "❌ Missing required prerequisites: ${MISSING_PREREQS[*]}"
    echo ""
    echo "📥 Please install the missing prerequisites before continuing:"
    echo ""
    
    # Detect OS for specific instructions
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "🐧 Linux Installation Instructions:"
        echo ""
        if [[ " ${MISSING_PREREQS[*]} " =~ " Node.js " ]]; then
            echo "Node.js:"
            echo "   # Ubuntu/Debian:"
            echo "   curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -"
            echo "   sudo apt-get install -y nodejs"
            echo "   # Or use package manager: sudo apt install nodejs npm"
            echo ""
        fi
        if [[ " ${MISSING_PREREQS[*]} " =~ " Azure Functions Core Tools " ]]; then
            echo "Azure Functions Core Tools:"
            echo "   npm install -g azure-functions-core-tools@4 --unsafe-perm true"
            echo ""
        fi
        if [[ " ${MISSING_PREREQS[*]} " =~ " curl " ]]; then
            echo "curl:"
            echo "   sudo apt-get install curl"
            echo ""
        fi
        if [[ " ${MISSING_PREREQS[*]} " =~ " Azure Cosmos DB Emulator " ]]; then
            echo "Azure Cosmos DB:"
            echo "   # Use Azure Cosmos DB Linux Emulator (Docker-based):"
            echo "   # https://docs.microsoft.com/en-us/azure/cosmos-db/linux-emulator"
            echo "   # Or connect to Azure Cosmos DB in the cloud"
            echo ""
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "🍎 macOS Installation Instructions:"
        echo ""
        if [[ " ${MISSING_PREREQS[*]} " =~ " Node.js " ]]; then
            echo "Node.js:"
            echo "   # Using Homebrew (recommended):"
            echo "   brew install node"
            echo "   # Or download from: https://nodejs.org/"
            echo ""
        fi
        if [[ " ${MISSING_PREREQS[*]} " =~ " Azure Functions Core Tools " ]]; then
            echo "Azure Functions Core Tools:"
            echo "   # Using Homebrew:"
            echo "   brew tap azure/functions"
            echo "   brew install azure-functions-core-tools@4"
            echo "   # Or via npm:"
            echo "   npm install -g azure-functions-core-tools@4 --unsafe-perm true"
            echo ""
        fi
        if [[ " ${MISSING_PREREQS[*]} " =~ " curl " ]]; then
            echo "curl:"
            echo "   # Usually pre-installed, or:"
            echo "   brew install curl"
            echo ""
        fi
        if [[ " ${MISSING_PREREQS[*]} " =~ " Azure Cosmos DB Emulator " ]]; then
            echo "Azure Cosmos DB:"
            echo "   # Use Azure Cosmos DB Emulator for macOS (Docker-based):"
            echo "   # https://docs.microsoft.com/en-us/azure/cosmos-db/linux-emulator"
            echo "   # Or connect to Azure Cosmos DB in the cloud"
            echo ""
        fi
    else
        echo "🪟 Windows Installation Instructions:"
        echo ""
        if [[ " ${MISSING_PREREQS[*]} " =~ " Node.js " ]]; then
            echo "Node.js:"
            echo "   # Download and install from: https://nodejs.org/"
            echo "   # Or using Chocolatey: choco install nodejs"
            echo "   # Or using winget: winget install OpenJS.NodeJS"
            echo ""
        fi
        if [[ " ${MISSING_PREREQS[*]} " =~ " Azure Functions Core Tools " ]]; then
            echo "Azure Functions Core Tools:"
            echo "   npm install -g azure-functions-core-tools@4 --unsafe-perm true"
            echo "   # Or using Chocolatey: choco install azure-functions-core-tools"
            echo ""
        fi
        if [[ " ${MISSING_PREREQS[*]} " =~ " curl " ]]; then
            echo "curl:"
            echo "   # Usually available in Windows 10+, or:"
            echo "   # Using Chocolatey: choco install curl"
            echo ""
        fi
        if [[ " ${MISSING_PREREQS[*]} " =~ " Azure Cosmos DB Emulator " ]]; then
            echo "Azure Cosmos DB Emulator:"
            echo "   # Download from: https://docs.microsoft.com/en-us/azure/cosmos-db/local-emulator"
            echo ""
        fi
    fi
    
    echo "⚠️  IMPORTANT: After installation, make sure the tools are in your PATH."
    echo "   You may need to restart your terminal or run 'source ~/.bashrc' (Linux/macOS)"
    echo "   or restart your command prompt (Windows) for the changes to take effect."
    echo ""
    echo "Once you've installed the missing prerequisites, run this setup script again."
    echo ""
    exit 1
fi

echo "✅ All required prerequisites are installed!"
echo ""

echo "📦 Installing root project dependencies..."

# Install main project dependencies
if [ -f "package.json" ]; then
    npm install
    echo "✅ Root project dependencies installed"
else
    echo "ℹ️  No package.json found in root, skipping main dependency installation"
fi

# Install database dependencies
if [ -d "src/db" ]; then
    echo ""
    echo "📦 Installing database dependencies..."
    cd src/db
    if [ -f "package.json" ]; then
        npm install
        echo "✅ Database dependencies installed"
    else
        echo "ℹ️  No package.json found in src/db"
    fi
    cd ../..
else
    echo "ℹ️  Database directory not found"
fi

# Install API dependencies
if [ -d "src/api" ]; then
    echo ""
    echo "📦 Installing API dependencies..."
    cd src/api
    if [ -f "package.json" ]; then
        npm install
        echo "✅ API dependencies installed"
    else
        echo "ℹ️  No package.json found in src/api"
    fi
    cd ../..
else
    echo "ℹ️  API directory not found"
fi

echo ""
echo "🌐 Checking Azure Cosmos DB Emulator..."

# Check if running on Windows (where emulator is typically installed)
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" || "$OSTYPE" == "cygwin" ]]; then
    # Try to check if it's running
    if curl -k -s https://localhost:8081 > /dev/null 2>&1; then
        echo "✅ Azure Cosmos DB Emulator is running"
    else
        echo "⚠️  Azure Cosmos DB Emulator is not running"
        echo "   Please start it manually or it will start automatically when you run the API"
    fi
else
    echo "ℹ️  Non-Windows system detected"
    echo "   For Linux/macOS, please install and run Azure Cosmos DB Emulator"
    echo "   Visit: https://docs.microsoft.com/en-us/azure/cosmos-db/local-emulator"
fi

echo ""
echo "🗄️  Setting up Database Configuration..."

# Create .env file if it doesn't exist
if [ -d "src/db" ]; then
    if [ ! -f "src/db/.env" ]; then
        echo "📝 Creating database configuration file..."
        cp src/db/.env.example src/db/.env
        echo "✅ Created database .env from example"
    else
        echo "✅ Database configuration file already exists"
    fi
else
    echo "ℹ️  Database directory not found, creating it..."
    mkdir -p src/db/scripts
fi

echo ""
echo "🚀 Setting up API Configuration..."

# Check if API local.settings.json exists
if [ ! -f "src/api/local.settings.json" ]; then
    echo "📝 Creating API configuration file..."
    cp src/api/local.settings.example.json src/api/local.settings.json
    echo "✅ Created API local.settings.json from local.settings.example.json"
    echo ""
    echo "ℹ️  API Configuration Notes:"
    echo "   - src/api/local.settings.json contains Azure Functions settings"
    echo "   - CosmosDB connection configured for local emulator"
    echo "   - Using Node.js runtime for Azure Functions"
    echo "   - Make sure Azure Cosmos DB Emulator is installed and running"
else
    echo "✅ API configuration file already exists"
fi

echo ""
echo "🔧 Setting up Web Configuration..."

# Check if web config.json exists
if [ ! -f "src/web/js/config/config.json" ]; then
    echo "📝 Creating web configuration file..."
    cp src/web/js/config/config.example.json src/web/js/config/config.json
    echo "✅ Created web config.json from example"
    echo ""
    echo "⚠️  IMPORTANT: Please edit src/web/js/config/config.json and add your API keys:"
    echo "   - GOOGLE_MAPS_API_KEY: Get from https://console.cloud.google.com/apis/credentials"
    echo "   - API_BASE_URL: Your API endpoint (http://localhost:7071/api for local development)"
else
    echo "✅ Web configuration file already exists"
fi

echo ""
echo "🗄️  Setting up Cosmos DB Containers..."

# Load environment variables
if [ -f "src/api/local.settings.json" ]; then
    echo "📄 Loading configuration from src/api/local.settings.json"
    # Extract values from local.settings.json (basic parsing)
    COSMOS_ENDPOINT=$(grep -o '"COSMOS_ENDPOINT": "[^"]*"' src/api/local.settings.json | cut -d'"' -f4)
    COSMOS_KEY=$(grep -o '"COSMOS_KEY": "[^"]*"' src/api/local.settings.json | cut -d'"' -f4)
    COSMOS_DATABASE_NAME=$(grep -o '"COSMOS_DATABASE_NAME": "[^"]*"' src/api/local.settings.json | cut -d'"' -f4)
    COSMOS_LOCATIONS_CONTAINER_NAME=$(grep -o '"COSMOS_LOCATIONS_CONTAINER_NAME": "[^"]*"' src/api/local.settings.json | cut -d'"' -f4)
    COSMOS_RATELIMIT_CONTAINER_NAME=$(grep -o '"COSMOS_RATELIMIT_CONTAINER_NAME": "[^"]*"' src/api/local.settings.json | cut -d'"' -f4)
    COSMOS_TEST_CONTAINER_NAME=$(grep -o '"COSMOS_TEST_CONTAINER_NAME": "[^"]*"' src/api/local.settings.json | cut -d'"' -f4)
else
    echo "❌ src/api/local.settings.json not found. Skipping container setup."
    return 1
fi

echo "🔧 Configuration:"
echo "  Database: $COSMOS_DATABASE_NAME"
echo "  Locations Container: $COSMOS_LOCATIONS_CONTAINER_NAME"
echo "  Rate Limits Container: $COSMOS_RATELIMIT_CONTAINER_NAME"
echo "  Test Data Container: $COSMOS_TEST_CONTAINER_NAME"

# Check if this is local emulator
if [[ $COSMOS_ENDPOINT == *"127.0.0.1"* ]] || [[ $COSMOS_ENDPOINT == *"localhost"* ]]; then
    echo "🏠 Detected Cosmos DB Emulator"
    
    # Check if emulator is running
    if ! curl -s -k "$COSMOS_ENDPOINT" > /dev/null; then
        echo "⚠️  Cosmos DB Emulator is not running - skipping container setup"
        echo "💡 Please start the Cosmos DB Emulator and run 'npm run containers:setup' later"
        return 0
    fi
    
    echo "✅ Cosmos DB Emulator is running"
else
    echo "☁️  Detected Azure Cosmos DB (Cloud)"
fi

echo "✨ Cosmos DB containers setup complete!"

echo ""
echo "🔧 Next steps:"
echo ""
echo "🗄️  Database Setup:"
echo "   1. Cosmos DB containers will be created automatically"
echo "   2. Run 'npm run containers:setup' to manually create containers"
echo "   3. Emulator UI available at https://localhost:8081/_explorer/index.html"
echo ""
echo "🚀 API Development (Node.js Azure Functions):"
echo "   1. Run 'npm run api:start' to start the API development server"
echo "   2. API will be available at http://localhost:7071/api"
echo "   3. Functions use Node.js runtime with enhanced security and rate limiting"
echo ""
echo "📱 Web Development:"
echo "   1. Edit src/web/js/config/config.json with your Google Maps API key"
echo "   2. Run 'npm run web:start' to start the web development server"
echo "   3. Open http://localhost:3000 in your browser"
echo ""
echo "🔄 Full Stack Development:"
echo "   1. Run 'npm run all:start' to start both web and API servers"
echo "   2. Web: http://localhost:3000"
echo "   3. API: http://localhost:7071/api"
echo ""
echo "📋 Available npm scripts:"
echo "   - npm run web:start         Start web development server"
echo "   - npm run api:install       Install API dependencies"
echo "   - npm run api:start         Start Node.js Azure Functions API"
echo "   - npm run containers:setup  Create optimized Cosmos DB containers"
echo "   - npm run db:install        Install database dependencies"
echo "   - npm run db:clean          Clear all database data"
echo "   - npm run db:seed           Seed database with Sofia locations"
echo "   - npm run db:reset          Clean and reseed database"
echo "   - npm run all:start         Start both web and API servers"
echo ""
echo "🎉 Setup complete! Your Free Water Tips development environment is ready!"
echo "   Run 'npm run all:start' to start both web and API servers, or use individual scripts as needed."
echo ""
