#!/bin/bash
# scripts/check-no-local-ui-components.sh
# Detects forbidden local UI component directories

set -e

echo "🔍 Checking for local UI components..."

# Check for forbidden local UI component directories
FORBIDDEN_PATHS=(
  "apps/*/src/components/ui"
  "apps/*/components/ui"
  "apps/**/components/ui"
)

VIOLATIONS=0

for pattern in "${FORBIDDEN_PATHS[@]}"; do
  # Use find with -path to check if directories exist
  FOUND=$(find . -path "*/$pattern" -type d 2>/dev/null || true)
  
  if [ ! -z "$FOUND" ]; then
    echo "❌ ERROR: Local UI components detected:"
    echo "$FOUND" | while read -r dir; do
      echo "   $dir"
    done
    echo ""
    echo "   Fix: Remove local UI components and import from @workspace/design-system"
    echo "   Example: import { Button } from '@workspace/design-system'"
    VIOLATIONS=$((VIOLATIONS + 1))
  fi
done

if [ $VIOLATIONS -gt 0 ]; then
  echo ""
  echo "❌ Validation failed: Local UI components found"
  exit 1
fi

echo "✅ No local UI components detected"
echo "✅ All components imported from @workspace/design-system"
exit 0
