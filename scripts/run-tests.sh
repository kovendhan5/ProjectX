#!/bin/bash
# Run all tests with coverage reporting

set -e

echo "🧪 Running ProjectX Test Suite"
echo "================================"
echo ""

# Check if we're in the project root
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must run from project root directory"
    exit 1
fi

# Set test environment
export NODE_ENV=test

# Function to run tests for a workspace
run_workspace_tests() {
    local workspace=$1
    local name=$2
    
    echo "📦 Testing $name..."
    
    if [ -d "$workspace" ]; then
        cd "$workspace"
        
        if [ -f "package.json" ] && grep -q "\"test\"" package.json; then
            npm test -- --coverage --maxWorkers=50%
            echo "✅ $name tests completed"
        else
            echo "⚠️  No tests configured for $name"
        fi
        
        cd - > /dev/null
    else
        echo "⚠️  $workspace not found"
    fi
    
    echo ""
}

# Run tests for each service
echo "🔧 Backend Services"
echo "-------------------"
run_workspace_tests "services/api" "API Service"
run_workspace_tests "services/blockchain" "Blockchain Service"

echo "🎨 Frontend Applications"
echo "------------------------"
run_workspace_tests "clients/pharmacy-portal" "Pharmacy Portal"
run_workspace_tests "clients/regulator-portal" "Regulator Portal"

# Generate combined coverage report
echo "📊 Generating Combined Coverage Report"
echo "---------------------------------------"

if command -v nyc &> /dev/null; then
    echo "Merging coverage reports..."
    # This would require nyc to be installed globally or as a dev dependency
    # nyc merge coverage .nyc_output/coverage.json
    # nyc report --reporter=html --reporter=text
else
    echo "💡 Tip: Install nyc globally for combined coverage reports"
    echo "   npm install -g nyc"
fi

echo ""
echo "✨ Test suite completed!"
echo ""
echo "📁 Coverage reports available in:"
echo "   - services/api/coverage/"
echo "   - services/blockchain/coverage/"
echo ""
echo "🌐 View HTML reports:"
echo "   open services/api/coverage/lcov-report/index.html"
