#!/bin/sh

# Ensure directories exist
mkdir -p /home/nodeuser/app
mkdir -p /home/nodeuser/.vnc

# Set correct permissions
chown -R nodeuser:nodeuser /home/nodeuser
chown -R abc:abc /config

# Ensure VNC setup is correct
if [ -f /home/abc/.vnc/passwd ]; then
  ln -sf /home/abc/.vnc/passwd /home/nodeuser/.vnc/passwd
  chown -h nodeuser:nodeuser /home/nodeuser/.vnc/passwd
fi

# Start the Node.js server as nodeuser
su nodeuser -c "cd /home/nodeuser/app && npm start" &

# Start the linuxserver/webtop default entrypoint (which is /init)
# This needs to be the last command and not backgrounded for s6-overlay to work
exec /init