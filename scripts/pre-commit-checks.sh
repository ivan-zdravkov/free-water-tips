#!/bin/bash

# Pre-commit quality checks script
# Run this before submitting a pull request to catch issues early

echo "🔍 Running pre-commit quality checks..."

# Initialize counters
ERRORS=0
WARNINGS=0

# Function to report results
report_result() {
    if [ $1 -eq 0 ]; then
        echo "✅ $2"
    else
        echo "❌ $2"
        ERRORS=$((ERRORS + 1))
    fi
}

# Check if we're in the right directory
if [ ! -f "README.md" ] || [ ! -d ".github" ]; then
    echo "❌ Please run this script from the repository root directory"
    exit 1
fi

echo ""
echo "📝 Checking code formatting..."

# .NET Code formatting
if [ -d "src/api" ]; then
    cd src/api
    dotnet format --verify-no-changes
    report_result $? ".NET code formatting"
    cd ../..
fi

echo ""
echo "🧪 Running tests..."

# .NET Tests
if [ -d "src/api" ]; then
    cd src/api
    dotnet test --verbosity quiet
    report_result $? ".NET tests"
    cd ../..
fi

echo ""
echo "🔍 Checking for debug statements..."

# Check for debug statements in web files
if [ -d "src/web" ]; then
    DEBUG_COUNT=$(grep -r "console\.log\|debugger\|alert(" src/web/ --include="*.js" --include="*.html" | wc -l)
    if [ $DEBUG_COUNT -gt 0 ]; then
        echo "❌ Found $DEBUG_COUNT debug statements:"
        grep -r "console\.log\|debugger\|alert(" src/web/ --include="*.js" --include="*.html"
        ERRORS=$((ERRORS + 1))
    else
        echo "✅ No debug statements found"
    fi
fi

echo ""
echo "📄 Checking JavaScript syntax..."

# Check JavaScript syntax
if [ -d "src/web" ]; then
    JS_ERRORS=0
    for file in $(find src/web -name "*.js"); do
        if ! node -c "$file" 2>/dev/null; then
            JS_ERRORS=$((JS_ERRORS + 1))
        fi
    done
    report_result $JS_ERRORS "JavaScript syntax check"
fi

echo ""
echo "📚 Checking documentation..."

# Check for TODO/FIXME comments
TODO_COUNT=$(grep -r "TODO\|FIXME" src/ docs/ --exclude-dir=node_modules 2>/dev/null | wc -l)
if [ $TODO_COUNT -gt 5 ]; then
    echo "⚠️  Found $TODO_COUNT TODO/FIXME comments (consider addressing some)"
    WARNINGS=$((WARNINGS + 1))
else
    echo "✅ TODO/FIXME count reasonable ($TODO_COUNT)"
fi

echo ""
echo "🔐 Basic security checks..."

# Check for potential secrets
SECRET_PATTERNS=("password\s*=" "api[_-]?key\s*=" "secret\s*=" "token\s*=")
SECRET_FOUND=0

for pattern in "${SECRET_PATTERNS[@]}"; do
    if grep -r "$pattern" . --exclude-dir=.git --exclude="*.md" --exclude="pre-commit-checks.sh" >/dev/null 2>&1; then
        SECRET_FOUND=1
    fi
done

if [ $SECRET_FOUND -eq 1 ]; then
    echo "❌ Potential secrets found in code"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ No obvious secrets found"
fi

echo ""
echo "📊 Summary:"
echo "   Errors: $ERRORS"
echo "   Warnings: $WARNINGS"

if [ $ERRORS -eq 0 ]; then
    echo ""
    echo "🎉 All checks passed! Your code is ready for a pull request."
    echo ""
    echo "Next steps:"
    echo "1. git add ."
    echo "2. git commit -m 'your descriptive message'"
    echo "3. git push origin your-branch-name"
    echo "4. Create pull request on GitHub"
    exit 0
else
    echo ""
    echo "❌ Please fix the above errors before submitting your pull request."
    exit 1
fi
