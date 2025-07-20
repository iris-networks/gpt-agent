#!/bin/bash

# MCP Browser Server service script
echo "**** starting MCP browser server ****"

# Set environment for the MCP server process
export PATH=/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin:/root/.local/share/pnpm:$PATH

# Start MCP server as abc user with correct port parameter
su abc -c "cd /config && mkdir -p Downloads browser && DISPLAY=:1 npx @agent-infra/mcp-server-browser --user-data-dir '/config/browser/user-data' --output-dir '/config/Downloads' --executable-path /usr/bin/chromium --port 8080"

# Keep the script running
exec tail -f /dev/null