#!/bin/bash
# File Growth Monitoring Script
# Run this script to check monitored files

echo "📊 File Growth Monitoring Check"
echo "================================"
echo ""

check_file() {
    local file=$1
    local threshold=$2
    local lines=$(wc -l < "$file" 2>/dev/null || echo "0")
    
    if [ "$lines" -gt 400 ]; then
        echo "🔴 $file: $lines lines (EXCEEDS LIMIT - Refactor immediately!)"
    elif [ "$lines" -gt 350 ]; then
        echo "🟠 $file: $lines lines (Approaching limit - Prepare refactoring)"
    elif [ "$lines" -gt 300 ]; then
        echo "🟡 $file: $lines lines (Monitor closely)"
    else
        echo "✅ $file: $lines lines (OK)"
    fi
}

echo "Monitored Files:"
echo "----------------"
check_file "src/pages/Dashboard.tsx" 350
check_file "src/pages/Users.tsx" 350
check_file "src/services/chat.service.ts" 350

echo ""
echo "Check complete. See MONITORING_PLAN.md for details."
