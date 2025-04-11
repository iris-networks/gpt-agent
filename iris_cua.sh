#!/bin/bash
# Export environment variables from the file to the current session
if [ -f /app/.env ]; then
  export $(cat /app/.env | grep -v '^#' | xargs)
fi

# Change to app directory and start the application
cd /app && exec node ./dist/index.js