#!/bin/bash

# Export environment variables from the file to the current session
if [ -f /app/.env ]; then
  export $(cat /app/.env | grep -v '^#' | xargs)
fi

sleep 10
# Change to app directory and start the application
cd /app && exec bun run pulsar/index.ts