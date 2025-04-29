#!/bin/bash
# Script to migrate from src/ to packages/ structure

set -e

# Create required directories
mkdir -p apps/iris
mkdir -p packages/agent-infra/{browser,logger,shared}
mkdir -p packages/ui-tars/{action-parser,sdk,shared,utio,operators/{browser-operator,nut-js}}

# Copy the files from src to packages
echo "Copying files from src to packages and apps..."

# Iris (app)
cp -r src/iris/* apps/iris/

# Agent infra
cp -r src/agent-infra/browser/* packages/agent-infra/browser/
cp -r src/agent-infra/logger/* packages/agent-infra/logger/
cp -r src/agent-infra/shared/* packages/agent-infra/shared/

# UI TARS
cp -r src/ui-tars/action-parser/* packages/ui-tars/action-parser/
cp -r src/ui-tars/sdk/* packages/ui-tars/sdk/
cp -r src/ui-tars/shared/* packages/ui-tars/shared/
cp -r src/ui-tars/utio/* packages/ui-tars/utio/
cp -r src/ui-tars/operators/browser-operator/* packages/ui-tars/operators/browser-operator/
cp -r src/ui-tars/operators/nut-js/* packages/ui-tars/operators/nut-js/

echo "Updating package.json files..."

# Function to update package.json files to use workspace dependencies
update_package_json() {
  local file=$1
  
  # Check if file exists
  if [ ! -f "$file" ]; then
    echo "Warning: $file does not exist, skipping"
    return
  fi
  
  # Update dependencies to use workspace syntax
  sed -i '' 's/"@ui-tars\/[^"]*": "[^"]*"/"@ui-tars\/\1": "workspace:*"/g' $file
  sed -i '' 's/"@agent-infra\/[^"]*": "[^"]*"/"@agent-infra\/\1": "workspace:*"/g' $file
  
  # Update package names to use scoped format
  # Example: "name": "agent-infra-logger" -> "name": "@agent-infra/logger"
  if grep -q '"name": "agent-infra-' $file; then
    pkg_name=$(grep '"name": "agent-infra-' $file | sed 's/.*"agent-infra-\([^"]*\)".*/\1/')
    sed -i '' 's/"name": "agent-infra-[^"]*"/"name": "@agent-infra\/'"$pkg_name"'"/g' $file
  fi
  
  if grep -q '"name": "ui-tars-' $file; then
    pkg_name=$(grep '"name": "ui-tars-' $file | sed 's/.*"ui-tars-\([^"]*\)".*/\1/')
    sed -i '' 's/"name": "ui-tars-[^"]*"/"name": "@ui-tars\/'"$pkg_name"'"/g' $file
  fi
}

# Update all package.json files
find packages -name "package.json" | while read file; do
  update_package_json $file
done

echo "Migration complete!"
echo "Next steps:"
echo "1. Run 'pnpm install' to update dependencies"
echo "2. Run 'pnpm build' to build all packages"
echo "3. Review and fix any import paths in the code"
echo "4. Test the application to ensure everything works"