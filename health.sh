#!/usr/bin/env bash

# Free Water Tips - Development Environment Health Check
# This script checks if your development environment is ready to run all applications

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Icons
CHECK="✓"
CROSS="✗"
WARNING="⚠"

# Detect OS
OS="$(uname -s)"
case "${OS}" in
    Linux*)     MACHINE=Linux;;
    Darwin*)    MACHINE=Mac;;
    CYGWIN*)    MACHINE=Windows;;
    MINGW*)     MACHINE=Windows;;
    MSYS*)      MACHINE=Windows;;
    *)          MACHINE="UNKNOWN:${OS}"
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Free Water Tips - Development Environment Health Check"
echo "  Detected OS: ${MACHINE}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Track overall status
OVERALL_STATUS=0

# Function to print status
print_status() {
    local status=$1
    local name=$2
    local version=$3
    local instruction=$4
    
    if [ $status -eq 0 ]; then
        echo -e "${GREEN}${CHECK}${NC} ${name} ${BLUE}${version}${NC}"
    else
        echo -e "${RED}${CROSS}${NC} ${name} ${RED}not found${NC}"
        if [ -n "$instruction" ]; then
            echo -e "  ${YELLOW}→${NC} ${instruction}"
        fi
        OVERALL_STATUS=1
    fi
}

# Function to get installation instructions
get_install_instructions() {
    local tool=$1
    case "${MACHINE}" in
        Mac)
            case "${tool}" in
                git)
                    echo "Install: brew install git OR download from https://git-scm.com/downloads"
                    ;;
                node)
                    echo "Install: brew install node@22 OR download from https://nodejs.org/"
                    ;;
                dotnet)
                    echo "Install: brew install dotnet-sdk OR download from https://dotnet.microsoft.com/download/dotnet/10.0"
                    ;;
                watchman)
                    echo "Install: brew install watchman"
                    ;;
                cocoapods)
                    echo "Install: sudo gem install cocoapods OR brew install cocoapods"
                    ;;
                xcode)
                    echo "Install: Download from Mac App Store"
                    ;;
                azure-functions-core-tools)
                    echo "Install: brew tap azure/functions && brew install azure-functions-core-tools@4"
                    ;;
                cosmos-emulator)
                    echo "Install: Use Docker - docker pull mcr.microsoft.com/cosmosdb/linux/azure-cosmos-emulator"
                    echo "  OR visit: https://learn.microsoft.com/azure/cosmos-db/docker-emulator-linux"
                    ;;
            esac
            ;;
        Linux)
            case "${tool}" in
                git)
                    echo "Install: sudo apt-get install git (Debian/Ubuntu) OR sudo yum install git (RHEL/CentOS)"
                    ;;
                node)
                    echo "Install: curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt-get install -y nodejs"
                    ;;
                dotnet)
                    echo "Install: https://dotnet.microsoft.com/download/dotnet/10.0"
                    ;;
                watchman)
                    echo "Install: Follow instructions at https://facebook.github.io/watchman/docs/install.html"
                    ;;
                azure-functions-core-tools)
                    echo "Install: Follow instructions at https://learn.microsoft.com/azure/azure-functions/functions-run-local"
                    ;;
                cosmos-emulator)
                    echo "Install: docker pull mcr.microsoft.com/cosmosdb/linux/azure-cosmos-emulator"
                    echo "  Visit: https://learn.microsoft.com/azure/cosmos-db/docker-emulator-linux"
                    ;;
            esac
            ;;
        Windows)
            case "${tool}" in
                git)
                    echo "Install: Download from https://git-scm.com/downloads"
                    ;;
                node)
                    echo "Install: Download from https://nodejs.org/"
                    ;;
                dotnet)
                    echo "Install: Download from https://dotnet.microsoft.com/download/dotnet/10.0"
                    ;;
                watchman)
                    echo "Install: choco install watchman (using Chocolatey)"
                    ;;
                azure-functions-core-tools)
                    echo "Install: npm install -g azure-functions-core-tools@4 --unsafe-perm true"
                    echo "  OR: choco install azure-functions-core-tools"
                    ;;
                cosmos-emulator)
                    echo "Install: Download the native Azure Cosmos DB Emulator from:"
                    echo "  https://aka.ms/cosmosdb-emulator"
                    echo "  After installation, run 'CosmosDB.Emulator.exe' from:"
                    echo "  C:\\Program Files\\Azure Cosmos DB Emulator\\CosmosDB.Emulator.exe"
                    echo "  The emulator will be available at: https://localhost:8081"
                    ;;
            esac
            ;;
        *)
            echo "Please visit the official website for installation instructions"
            ;;
    esac
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Core Development Tools"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check Git
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version | cut -d' ' -f3)
    print_status 0 "Git" "v${GIT_VERSION}"
else
    print_status 1 "Git" "" "$(get_install_instructions git)"
fi

# Check Node.js (required version 22)
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    NODE_MAJOR=$(node --version | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -ge 22 ]; then
        print_status 0 "Node.js" "${NODE_VERSION}"
    else
        print_status 1 "Node.js" "${NODE_VERSION}" "Node.js v22 or higher is required. $(get_install_instructions node)"
    fi
else
    print_status 1 "Node.js" "" "$(get_install_instructions node)"
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_status 0 "npm" "v${NPM_VERSION}"
else
    print_status 1 "npm" "" "npm is usually installed with Node.js"
fi

# Check .NET SDK (required version 10.0)
if command -v dotnet &> /dev/null; then
    DOTNET_VERSION=$(dotnet --version)
    DOTNET_MAJOR=$(echo $DOTNET_VERSION | cut -d'.' -f1)
    if [ "$DOTNET_MAJOR" -ge 10 ]; then
        print_status 0 ".NET SDK" "v${DOTNET_VERSION}"
    else
        print_status 1 ".NET SDK" "v${DOTNET_VERSION}" ".NET SDK v10.0 or higher is required. $(get_install_instructions dotnet)"
    fi
else
    print_status 1 ".NET SDK" "" "$(get_install_instructions dotnet)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Azure Functions Tools"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check Azure Functions Core Tools
if command -v func &> /dev/null; then
    FUNC_VERSION=$(func --version)
    print_status 0 "Azure Functions Core Tools" "v${FUNC_VERSION}"
else
    print_status 1 "Azure Functions Core Tools" "" "$(get_install_instructions azure-functions-core-tools)"
fi

# Check Cosmos DB Emulator
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Database Tools"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "${MACHINE}" == "Windows" ]; then
    # Windows: Check for native Cosmos DB Emulator
    COSMOS_EMULATOR_PATH="/c/Program Files/Azure Cosmos DB Emulator/CosmosDB.Emulator.exe"
    
    if [ -f "$COSMOS_EMULATOR_PATH" ]; then
        print_status 0 "Cosmos DB Emulator" "(installed)"
        
        # Check if the emulator is running by testing the endpoint
        if curl -k -s -o /dev/null -w "%{http_code}" https://localhost:8081/_explorer/index.html 2>/dev/null | grep -q "200\|302"; then
            print_status 0 "Cosmos DB Emulator Status" "(running on https://localhost:8081)"
        else
            echo -e "${YELLOW}${WARNING}${NC} Cosmos DB Emulator ${YELLOW}not running${NC}"
            echo -e "  ${YELLOW}→${NC} Start the emulator from Start Menu or run:"
            echo -e "  ${YELLOW}→${NC} \"C:\\Program Files\\Azure Cosmos DB Emulator\\CosmosDB.Emulator.exe\""
            echo -e "  ${YELLOW}→${NC} Or run as administrator: PowerShell -Command \"Start-Process 'C:\\Program Files\\Azure Cosmos DB Emulator\\CosmosDB.Emulator.exe'\""
        fi
    else
        print_status 1 "Cosmos DB Emulator" "" "$(get_install_instructions cosmos-emulator)"
    fi
else
    # macOS/Linux: Check for Docker-based Cosmos DB Emulator
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | sed 's/,//')
        print_status 0 "Docker" "v${DOCKER_VERSION}"
        
        # Check if Cosmos emulator image exists
        if docker images | grep -q "azure-cosmos-emulator"; then
            print_status 0 "Cosmos DB Emulator Image" "(available)"
            
            # Check if Cosmos emulator is running
            if docker ps | grep -q "azure-cosmos-emulator"; then
                print_status 0 "Cosmos DB Emulator" "(running on https://localhost:8081)"
            else
                echo -e "${YELLOW}${WARNING}${NC} Cosmos DB Emulator ${YELLOW}not running${NC}"
                echo -e "  ${YELLOW}→${NC} Start with: docker run -p 8081:8081 -p 10250-10255:10250-10255 --name=cosmos-emulator -d mcr.microsoft.com/cosmosdb/linux/azure-cosmos-emulator"
                if [ "${MACHINE}" == "Mac" ]; then
                    echo -e "  ${YELLOW}→${NC} Or on macOS: docker run -p 8081:8081 -p 10250-10255:10250-10255 --memory 3g --cpus=2 --name=cosmos-emulator -e AZURE_COSMOS_EMULATOR_PARTITION_COUNT=10 -e AZURE_COSMOS_EMULATOR_ENABLE_DATA_PERSISTENCE=true -d mcr.microsoft.com/cosmosdb/linux/azure-cosmos-emulator"
                fi
            fi
        else
            print_status 1 "Cosmos DB Emulator Image" "" "$(get_install_instructions cosmos-emulator)"
        fi
    else
        print_status 1 "Docker" "" "Docker is required for Cosmos DB Emulator. Install from https://www.docker.com/products/docker-desktop"
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Expo & React Native Tools"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if expo is available (can be installed locally in project)
if command -v npx &> /dev/null; then
    if [ -f "FreeWaterTips.ReactNative/node_modules/.bin/expo" ]; then
        # Use timeout to prevent hanging
        EXPO_VERSION=$(timeout 5 npx expo --version 2>/dev/null || echo "installed")
        if [ $? -eq 124 ]; then
            print_status 0 "Expo CLI" "(installed locally)"
        else
            print_status 0 "Expo CLI" "v${EXPO_VERSION}"
        fi
    elif command -v expo &> /dev/null; then
        EXPO_VERSION=$(timeout 5 expo --version 2>/dev/null || echo "installed")
        print_status 0 "Expo CLI" "v${EXPO_VERSION}"
    else
        print_status 1 "Expo CLI" "" "Install: cd FreeWaterTips.ReactNative && npm install"
    fi
else
    print_status 1 "npx" "" "npx is required and comes with npm"
fi

# Check Watchman (recommended for React Native)
if command -v watchman &> /dev/null; then
    WATCHMAN_VERSION=$(watchman --version)
    print_status 0 "Watchman" "v${WATCHMAN_VERSION}"
else
    echo -e "${YELLOW}${WARNING}${NC} Watchman ${YELLOW}not found (optional but recommended)${NC}"
    echo -e "  ${YELLOW}→${NC} $(get_install_instructions watchman)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Platform-Specific Tools"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Web Development (always available if Node.js is installed)
echo -e "${GREEN}${CHECK}${NC} Web Development ${BLUE}(ready with Node.js)${NC}"

# Android Development
echo ""
echo "Android Development:"
if command -v adb &> /dev/null; then
    ADB_VERSION=$(adb --version | head -n1 | cut -d' ' -f5)
    print_status 0 "  Android Debug Bridge (adb)" "v${ADB_VERSION}"
else
    echo -e "${YELLOW}${WARNING}${NC}   Android SDK/adb ${YELLOW}not found${NC}"
    echo -e "  ${YELLOW}→${NC} For Android development, install Android Studio"
    echo -e "  ${YELLOW}→${NC} https://docs.expo.dev/workflow/android-studio-emulator/"
fi

if [ -n "$ANDROID_HOME" ] || [ -n "$ANDROID_SDK_ROOT" ]; then
    SDK_ROOT="${ANDROID_HOME:-$ANDROID_SDK_ROOT}"
    print_status 0 "  ANDROID_HOME" "${SDK_ROOT}"
else
    echo -e "${YELLOW}${WARNING}${NC}   ANDROID_HOME ${YELLOW}not set${NC}"
    echo -e "  ${YELLOW}→${NC} Set ANDROID_HOME environment variable"
    echo -e "  ${YELLOW}→${NC} https://docs.expo.dev/workflow/android-studio-emulator/"
fi

# iOS Development (macOS only)
echo ""
if [ "${MACHINE}" == "Mac" ]; then
    echo "iOS Development:"
    if command -v xcodebuild &> /dev/null; then
        XCODE_VERSION=$(xcodebuild -version | head -n1 | cut -d' ' -f2)
        print_status 0 "  Xcode" "v${XCODE_VERSION}"
    else
        print_status 1 "  Xcode" "" "$(get_install_instructions xcode)"
    fi
    
    if command -v pod &> /dev/null; then
        POD_VERSION=$(pod --version)
        print_status 0 "  CocoaPods" "v${POD_VERSION}"
    else
        print_status 1 "  CocoaPods" "" "$(get_install_instructions cocoapods)"
    fi
    
    # Check iOS Simulator
    if command -v xcrun &> /dev/null; then
        if xcrun simctl list devices | grep -q "Booted\|Shutdown"; then
            print_status 0 "  iOS Simulator" "(available)"
        else
            echo -e "${YELLOW}${WARNING}${NC}   iOS Simulator ${YELLOW}status unknown${NC}"
        fi
    fi
else
    echo "iOS Development: ${YELLOW}(macOS only)${NC}"
    echo -e "  ${YELLOW}→${NC} iOS development requires macOS with Xcode installed"
    echo -e "  ${YELLOW}→${NC} https://docs.expo.dev/workflow/ios-simulator/"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Project Dependencies"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if project dependencies are installed
if [ -f "FreeWaterTips.ReactNative/package.json" ]; then
    if [ -d "FreeWaterTips.ReactNative/node_modules" ]; then
        print_status 0 "React Native Dependencies" "(installed)"
    else
        print_status 1 "React Native Dependencies" "" "Run: cd FreeWaterTips.ReactNative && npm install"
    fi
fi

# Check if .NET packages are restored
if [ -d "FreeWaterTips.API.Azure.Functions/obj" ]; then
    print_status 0 ".NET Packages" "(restored)"
else
    print_status 1 ".NET Packages" "" "Run: cd FreeWaterTips.API.Azure.Functions && dotnet restore"
fi

# Check if local.settings.json exists
if [ -f "FreeWaterTips.API.Azure.Functions/local.settings.json" ]; then
    print_status 0 "Azure Functions local.settings.json" "(configured)"
else
    print_status 1 "Azure Functions local.settings.json" "" "Run: cp FreeWaterTips.API.Azure.Functions/local.settings.json.template FreeWaterTips.API.Azure.Functions/local.settings.json"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Documentation References"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 Expo Development Documentation:"
echo "   • Setup Guide: https://docs.expo.dev/get-started/installation/"
echo "   • Android Emulator: https://docs.expo.dev/workflow/android-studio-emulator/"
echo "   • iOS Simulator: https://docs.expo.dev/workflow/ios-simulator/"
echo "   • Web Development: https://docs.expo.dev/workflow/web/"
echo ""
echo "🔧 Azure Functions:"
echo "   • Local Development: https://learn.microsoft.com/azure/azure-functions/functions-run-local"
echo ""
echo "💾 Cosmos DB Emulator:"
if [ "${MACHINE}" == "Windows" ]; then
    echo "   • Windows Native Emulator: https://aka.ms/cosmosdb-emulator"
    echo "   • Installation Guide: https://learn.microsoft.com/azure/cosmos-db/emulator"
else
    echo "   • Docker Setup: https://learn.microsoft.com/azure/cosmos-db/docker-emulator-linux"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $OVERALL_STATUS -eq 0 ]; then
    echo -e "${GREEN}${CHECK} All required dependencies are installed!${NC}"
    echo -e "${GREEN}  Your development environment is ready!${NC}"
else
    echo -e "${RED}${CROSS} Some dependencies are missing.${NC}"
    echo -e "${YELLOW}  Please install the missing dependencies listed above.${NC}"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

exit $OVERALL_STATUS
