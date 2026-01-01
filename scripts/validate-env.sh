#!/bin/bash
# Environment Variables Validation Script
# Checks that all required environment variables are set

set -e

echo "🔍 Validating environment variables..."

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track validation status
HAS_ERRORS=0

# Function to check if variable is set
check_var() {
    local var_name=$1
    local var_value=${!var_name}
    local is_optional=$2
    
    if [ -z "$var_value" ]; then
        if [ "$is_optional" = "optional" ]; then
            echo -e "${YELLOW}⚠️  $var_name${NC} (optional, using default)"
        else
            echo -e "${RED}❌ $var_name${NC} is required but not set"
            HAS_ERRORS=1
        fi
    else
        echo -e "${GREEN}✓${NC} $var_name"
    fi
}

# Function to check file exists
check_file() {
    local file_path=$1
    if [ -f "$file_path" ]; then
        echo -e "${GREEN}✓${NC} $file_path exists"
    else
        echo -e "${RED}❌ $file_path${NC} not found"
        HAS_ERRORS=1
    fi
}

echo ""
echo "=== Checking Database Configuration ==="
check_var "DATABASE_URL"

echo ""
echo "=== Checking API Configuration ==="
check_var "API_PORT" "optional"
check_var "NODE_ENV" "optional"

echo ""
echo "=== Checking Blockchain Configuration ==="
check_var "BLOCKCHAIN_URL" "optional"

echo ""
echo "=== Checking Frontend URLs ==="
check_var "NEXT_PUBLIC_API_URL" "optional"

echo ""
echo "=== Checking Environment Files ==="
check_file ".env"

if [ -f "infrastructure/.env.production.example" ]; then
    if [ "$NODE_ENV" = "production" ]; then
        check_file "infrastructure/.env.production"
    fi
fi

echo ""
if [ $HAS_ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All required environment variables are configured!${NC}"
    exit 0
else
    echo -e "${RED}❌ Environment validation failed. Please set the missing variables.${NC}"
    echo ""
    echo "📖 For development, copy .env.example to .env:"
    echo "   cp .env.example .env"
    echo ""
    echo "📖 For production, copy infrastructure/.env.production.example:"
    echo "   cp infrastructure/.env.production.example infrastructure/.env.production"
    exit 1
fi
