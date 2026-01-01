#!/bin/bash

# Health check script for production monitoring

set -e

API_URL="${API_URL:-http://localhost:3001}"
BLOCKCHAIN_URL="${BLOCKCHAIN_URL:-http://localhost:3003}"
PHARMACY_URL="${PHARMACY_URL:-http://localhost:3002}"
REGULATOR_URL="${REGULATOR_URL:-http://localhost:3004}"

check_service() {
    local name=$1
    local url=$2
    
    echo -n "Checking $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>&1)
    
    if [ "$response" = "200" ]; then
        echo "✅ OK"
        return 0
    else
        echo "❌ FAILED (HTTP $response)"
        return 1
    fi
}

echo "🏥 ProjectX Health Check"
echo "========================"
echo ""

failed=0

check_service "API Service" "$API_URL/health" || ((failed++))
check_service "Blockchain Service" "$BLOCKCHAIN_URL/health" || ((failed++))
check_service "Pharmacy Portal" "$PHARMACY_URL" || ((failed++))
check_service "Regulator Portal" "$REGULATOR_URL" || ((failed++))

echo ""
echo "========================"

if [ $failed -eq 0 ]; then
    echo "✅ All services are healthy"
    exit 0
else
    echo "❌ $failed service(s) failed health check"
    exit 1
fi
