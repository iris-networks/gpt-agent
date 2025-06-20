#!/bin/sh

# Ensure config directory exists
mkdir -p /config
chown -R abc:abc /config

# Create a .Xauthority file for nodeuser if it doesn't exist
if [ ! -f /home/nodeuser/.Xauthority ]; then
  touch /home/nodeuser/.Xauthority
  chown nodeuser:nodeuser /home/nodeuser/.Xauthority
fi

# Set environment for processes
export PATH=/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin:$PATH

# Log startup information
echo "Starting services..."
echo "KasmVNC will be available at http://localhost:${CUSTOM_PORT:-6901}"
echo "Node.js API will be available at http://localhost:${NODE_PORT:-3000}"

# Set permissions for custom script directories
if [ -d /custom-cont-init.d ]; then
  chmod -R 755 /custom-cont-init.d
  echo "Running custom initialization scripts..."

  # Run all custom initialization scripts
  for script in /custom-cont-init.d/*.sh; do
    if [ -f "$script" ] && [ -x "$script" ]; then
      echo "Running custom init script: $script"
      "$script"
    fi
  done
fi

# Make sure custom services directory is properly set up
if [ -d /custom-services.d ]; then
  chmod -R 755 /custom-services.d
  echo "Custom services directory ready"
fi

# Start the linuxserver/webtop default entrypoint (which starts KasmVNC)
# This needs to be the last command and not backgrounded
exec /init