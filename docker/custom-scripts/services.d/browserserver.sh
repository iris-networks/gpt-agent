#!/bin/bash

# MCP Server service script for browser automation
echo "**** starting MCP Server service ****"

# Set environment for the MCP server process
export PATH=/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin:$PATH

# Set directories for containerized environment
USER_DATA_DIR="/config/browser/user-data"
OUTPUT_DIR="/config/browser/output"

# Create directories if they don't exist
mkdir -p "$USER_DATA_DIR"
mkdir -p "$OUTPUT_DIR"
chown -R abc:abc "$USER_DATA_DIR"
chown -R abc:abc "$OUTPUT_DIR"

# Start the MCP server as abc user with browser automation configuration
su abc -c "cd /config && DISPLAY=:1 npx @agent-infra/mcp-server-browser@latest --port 8931 --host 0.0.0.0 --user-data-dir '$USER_DATA_DIR' --output-dir '$OUTPUT_DIR' --executable-path /usr/bin/chromium"

# Keep the script running
exec tail -f /dev/null


# bunx @agent-infra/mcp-server-browser@latest --port 8931 --host 0.0.0.0