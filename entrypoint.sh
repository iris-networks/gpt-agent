#!/bin/bash
set -e

# Set VNC password
echo "Setting VNC password..."
# Use VNC_PW from environment or default 'password'
PASS=${VNC_PW:-password}
mkdir -p "/home/abc/.vnc"
echo "$PASS" | vncpasswd -f > "/home/abc/.vnc/passwd"
chmod 600 "/home/abc/.vnc/passwd"
chown -R abc:abc "/home/abc/.vnc"

# Set default VNC resolution if not provided
export VNC_RESOLUTION=${VNC_RESOLUTION:-1280x800}
echo "Using VNC Resolution: ${VNC_RESOLUTION}"

# Fix permissions just in case (supervisor runs as root initially)
chown -R abc:abc /home/abc
# Set up Xauthority
touch /home/abc/.Xauthority
chown abc:abc /home/abc/.Xauthority
# Create a basic X environment to ensure proper display setup
mkdir -p /tmp/.X11-unix
chmod 1777 /tmp/.X11-unix

echo "Starting supervisor..."
# Execute the CMD (supervisord)
exec "$@"