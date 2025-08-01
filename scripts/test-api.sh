#!/bin/bash

# Start API and Test Runner Script
echo "🚀 Starting Free Water Tips API and Tests"

# Check if API is already running
if curl -s http://localhost:7071/api/health > /dev/null 2>&1; then
    echo "✅ API is already running"
    echo "🧪 Running tests..."
    npm run test:api:simple
else
    echo "🔄 Starting API server..."
    
    # Start API in background
    cd src/api
    func start &
    API_PID=$!
    cd ../..
    
    echo "⏳ Waiting for API to be ready..."
    
    # Wait for API to be ready (max 30 seconds)
    for i in {1..30}; do
        if curl -s http://localhost:7071/api/health > /dev/null 2>&1; then
            echo "✅ API is ready!"
            break
        fi
        echo "   Attempt $i/30..."
        sleep 1
    done
    
    # Check if API is ready
    if curl -s http://localhost:7071/api/health > /dev/null 2>&1; then
        echo "🧪 Running tests..."
        npm run test:api:simple
        TEST_EXIT_CODE=$?
        
        echo "🛑 Stopping API server..."
        kill $API_PID 2>/dev/null || true
        
        exit $TEST_EXIT_CODE
    else
        echo "❌ API failed to start within 30 seconds"
        kill $API_PID 2>/dev/null || true
        exit 1
    fi
fi
