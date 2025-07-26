#!/bin/bash

# Example service script that will run after VNC has started
echo "**** starting Node.js application service ****"

# Function to wait for a port to be open
wait_for_port() {
  local host="$1"
  local port="$2"
  local timeout=30
  echo "Waiting for $host:$port to be open..."
  for i in $(seq 1 $timeout); do
    nc -z "$host" "$port" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
      echo "$host:$port is open!"
      return 0
    fi
    sleep 1
  done
  echo "Error: $host:$port did not open within $timeout seconds."
  return 1
}

# Wait for MCP Browser Server to start (port 8080)
wait_for_port localhost 8080 || exit 1



# Set environment for the Node.js process
export PATH=/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin:$PATH

# Start the Node.js server
cd /app && NODE_PORT=${NODE_PORT:-3000} PATH=$PATH npm run start:prod

# Keep the script running
exec tail -f /dev/null
##
