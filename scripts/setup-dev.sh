#!/bin/bash

# Development Setup Script for Free Water Tips
# This script sets up the local development environment

echo "🌊 Setting up Free Water Tips development environment..."

# Navigate to project root
cd "$(dirname "$0")/.."

echo "📦 Installing main project dependencies..."
if [ -f "package.json" ]; then
    npm install
    echo "✅ Main dependencies installed"
else
    echo "ℹ️  No package.json found in root, skipping main dependency installation"
fi

echo ""
echo "🔧 Setting up Web Application..."

# Check if web config.json exists
if [ ! -f "src/web/js/config/config.json" ]; then
    echo "📝 Creating web configuration file..."
    cp src/web/js/config/config.example.json src/web/js/config/config.json
    echo "✅ Created web config.json from example"
    echo ""
    echo "⚠️  IMPORTANT: Please edit src/web/js/config/config.json and add your API keys:"
    echo "   - GOOGLE_MAPS_API_KEY: Get from https://console.cloud.google.com/apis/credentials"
    echo "   - API_BASE_URL: Your API endpoint (http://localhost:7071/api for local development)"
    echo ""
else
    echo "✅ Web configuration file already exists"
fi

echo ""
echo "🚀 Setting up .NET Azure Functions API..."

# Check for .NET SDK
if command -v dotnet &> /dev/null; then
    DOTNET_VERSION=$(dotnet --version)
    echo "✅ .NET SDK found: $DOTNET_VERSION"
    
    # Restore .NET packages
    if [ -f "src/api/FreeWaterTips.Api.csproj" ]; then
        echo "📦 Restoring .NET packages..."
        cd src/api
        dotnet restore
        echo "✅ .NET packages restored"
        cd ../..
    else
        echo "ℹ️  No .NET project found, skipping package restore"
    fi
else
    echo "❌ .NET SDK not found!"
    echo "   Please install .NET 8 SDK from: https://dotnet.microsoft.com/download/dotnet/8.0"
    echo ""
fi

# Check for Azure Functions Core Tools
if command -v func &> /dev/null; then
    FUNC_VERSION=$(func --version)
    echo "✅ Azure Functions Core Tools found: $FUNC_VERSION"
else
    echo "❌ Azure Functions Core Tools not found!"
    echo "   Please install Azure Functions Core Tools:"
    echo "   npm install -g azure-functions-core-tools@4 --unsafe-perm true"
    echo "   Or visit: https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local"
    echo ""
fi

# Check if API local.settings.json exists
if [ ! -f "src/api/local.settings.json" ]; then
    echo "📝 Creating API configuration file..."
    cp src/api/local.settings.example.json src/api/local.settings.json
    echo "✅ Created API local.settings.json from example"
    echo ""
    echo "ℹ️  API Configuration Notes:"
    echo "   - src/api/local.settings.json contains Azure Functions settings"
    echo "   - For local development, the default settings should work"
    echo "   - Add your database connection string when implementing data layer"
    echo ""
else
    echo "✅ API configuration file already exists"
fi

echo ""
echo "🔧 Next steps:"
echo ""
echo "📱 Web Development:"
echo "   1. Edit src/web/js/config/config.json with your Google Maps API key"
echo "   2. Run 'npm start' or 'npm run dev' to start the web development server"
echo "   3. Open http://localhost:3000 in your browser"
echo ""
echo "🚀 API Development (.NET):"
echo "   1. Ensure .NET 8 SDK is installed"
echo "   2. Ensure Azure Functions Core Tools v4 is installed"
echo "   3. Run 'npm run api:dev' to start the API development server"
echo "   4. API will be available at http://localhost:7071/api"
echo ""
echo "🔄 Full Stack Development:"
echo "   1. Run 'npm run dev:full' to start both web and API servers"
echo "   2. Web: http://localhost:3000"
echo "   3. API: http://localhost:7071/api"
echo ""
echo "📋 Available npm scripts:"
echo "   - npm start               Start web server"
echo "   - npm run dev             Start web dev server with live reload"
echo "   - npm run api:restore     Restore .NET packages"
echo "   - npm run api:build       Build .NET API"
echo "   - npm run api:start       Start API server"
echo "   - npm run api:dev         Start API dev server with CORS"
echo "   - npm run dev:full        Start both web and API servers"
echo ""
echo "🛠️  Prerequisites Check:"
if command -v dotnet &> /dev/null; then
    echo "   ✅ .NET SDK: $(dotnet --version)"
else
    echo "   ❌ .NET SDK: Not installed (required)"
fi

if command -v func &> /dev/null; then
    echo "   ✅ Azure Functions Core Tools: $(func --version)"
else
    echo "   ❌ Azure Functions Core Tools: Not installed (required for API development)"
fi

if command -v node &> /dev/null; then
    echo "   ✅ Node.js: $(node --version)"
else
    echo "   ❌ Node.js: Not installed (required for web development)"
fi
echo ""
