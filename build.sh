#!/bin/bash

# Exit on error
set -e

echo "Building Pulsar application..."

# Install dependencies if needed
if [ "$1" == "--install" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Build the application
npm run build

echo "Build completed successfully!"
echo "You can run the application with: npm start"