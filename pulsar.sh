#!/bin/bash

# Print environment information
echo "Starting Pulsar in $(pwd)"
echo "NODE_ENV: $NODE_ENV"

# Ensure dist directory exists and index.js is executable
if [ ! -f /app/dist/index.js ]; then
  echo "Error: dist/index.js not found! Rebuilding..."
  cd /app && npm run build
fi

# Ensure public directory exists
if [ ! -d /app/dist/public ]; then
  echo "Error: dist/public directory not found! Creating..."
  mkdir -p /app/dist/public
  cp -r /app/pulsar/public/* /app/dist/public/
fi

# Start the Node.js server
cd /app && NODE_ENV=production node dist/index.js