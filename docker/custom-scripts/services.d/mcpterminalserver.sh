#!/bin/bash

# MCP Terminal Server service script
echo "**** starting MCP Terminal Server ****"

# Set environment for the MCP Terminal Server process
export PATH=/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH

# Start the MCP Terminal Server as user abc
su abc -c "/usr/local/bin/mcp-terminal-server --http --port 8080"

# Keep the script running
exec tail -f /dev/null