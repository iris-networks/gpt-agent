#!/bin/bash

# MCP Server service script for Playwright automation
echo "**** starting MCP Server service ****"

# Set environment for the MCP server process
export PATH=/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin:$PATH

# Determine user data directory based on containerized environment
if [ "${IS_CONTAINERIZED}" = "true" ]; then
    USER_DATA_DIR="/config/.iris/user-data"
else
    USER_DATA_DIR="~/.iris/user-data"
fi

# Create user data directory if it doesn't exist
mkdir -p "$USER_DATA_DIR"
chown -R nodeuser:nodeuser "$USER_DATA_DIR"

# Start the MCP server as nodeuser with user data directory
su nodeuser -c "cd /home/nodeuser/app && npx @playwright/mcp@latest --port 8931 --user-data-dir '$USER_DATA_DIR'"

# Keep the script running
exec tail -f /dev/null

##