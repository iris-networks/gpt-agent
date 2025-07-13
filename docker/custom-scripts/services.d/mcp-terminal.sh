#!/bin/bash

# MCP Terminal Server service script
echo "**** starting MCP Terminal Server ****"

# Set environment for the MCP terminal server process
export PATH=/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin:$PATH

# Create logs directory if it doesn't exist
mkdir -p /var/log/mcp-terminal
chown -R abc:abc /var/log/mcp-terminal

# Start the MCP terminal server as abc user
su abc -c "cd \$HOME && mcp-terminal-server --http --port 8080 > /var/log/mcp-terminal/mcp-terminal.log 2>&1 &"

# Keep the script running
exec tail -f /dev/null