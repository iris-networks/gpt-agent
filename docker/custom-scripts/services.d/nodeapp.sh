#!/bin/bash

# Example service script that will run after VNC has started
echo "**** starting Node.js application service ****"

# Set environment for the Node.js process
export PATH=/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin:$PATH

# Start the Node.js server as nodeuser
su nodeuser -c "cd /home/nodeuser/app && NODE_PORT=${NODE_PORT:-3000} PATH=$PATH npm run start:prod"

# Keep the script running
exec tail -f /dev/null

## change