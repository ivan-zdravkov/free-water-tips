#!/bin/bash

# Development Setup Script for Free Water Tips
# This script sets up the local development environment

echo "🌊 Setting up Free Water Tips development environment..."

# Check if config.json exists
if [ ! -f "../src/web/js/config/config.json" ]; then
    echo "📝 Creating local configuration file..."
    cp ../src/web/js/config/config.example.json ../src/web/js/config/config.json
    echo "✅ Created config.json from example"
    echo ""
    echo "⚠️  IMPORTANT: Please edit src/web/js/config/config.json and add your API keys:"
    echo "   - GOOGLE_MAPS_API_KEY: Get from https://console.cloud.google.com/apis/credentials"
    echo "   - API_BASE_URL: Your API endpoint (optional for local development)"
    echo ""
else
    echo "✅ Configuration file already exists"
fi

# Install dependencies if package.json exists
if [ -f "package.json" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
else
    echo "ℹ️  No package.json found, skipping dependency installation"
fi

echo ""
echo "🔧 Next steps:"
echo "   1. Edit ../src/web/js/config/config.json with your Google Maps API and backend API keys"
echo "   2. Run 'npm start' or 'npm run dev' to start the development or live reload server"
echo "   3. Open http://localhost:3000 in your browser"
echo ""
