#!/bin/bash

# Start the application as root
cd /app

# Apply additional access restrictions to source code directories
chmod 700 /app/dist
chmod 700 /app/node_modules

# Start the application and then switch to headless user
exec su -c "NODE_ENV=production node dist/main/main.js" headless