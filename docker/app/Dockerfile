# syntax=docker/dockerfile:1.4
ARG BASE_IMAGE=zenobia-base:latest
ARG BUILDER_IMAGE=zenobia-builder:latest

FROM ${BUILDER_IMAGE} as builder
# No need to add anything here, all build steps are in the builder image

FROM ${BASE_IMAGE}

# Create two separate users: one for VNC and one for Node.js
RUN groupadd -g 1000 vncgroup && \
    useradd -m -s /bin/bash -u 1000 -g 1000 vncuser && \
    groupadd -g 1001 nodegroup && \
    useradd -m -s /bin/bash -u 1001 -g 1001 nodeuser

# Set up VNC for vncuser
USER vncuser
RUN mkdir -p /home/vncuser/.vnc && \
    mkdir -p /home/vncuser/Desktop && \
    mkdir -p /home/vncuser/.config/xfce4 && \
    mkdir -p /home/vncuser/.config/xfce4/xfconf/xfce-perchannel-xml && \
    echo "${VNC_PASSWORD}" | /usr/bin/vncpasswd -f > /home/vncuser/.vnc/passwd && \
    chmod 600 /home/vncuser/.vnc/passwd

# Create a simple xstartup file
RUN echo '#!/bin/bash\nexport XKL_XMODMAP_DISABLE=1\nexport XDG_SESSION_TYPE=x11\nexport XDG_CURRENT_DESKTOP=XFCE\nexport XDG_CONFIG_DIRS=/etc/xdg\nunset SESSION_MANAGER\nunset DBUS_SESSION_BUS_ADDRESS\nexec dbus-launch --exit-with-x11 startxfce4' > /home/vncuser/.vnc/xstartup && \
    chmod +x /home/vncuser/.vnc/xstartup && \
    touch /home/vncuser/.Xauthority && \
    chown 1000:1000 /home/vncuser/.Xauthority && \
    chmod 600 /home/vncuser/.Xauthority

# No extra configuration needed

# Switch back to root to copy and run the Chromium shortcut script
USER root

# Add desktop shortcuts for Chromium
COPY chromium_desktop.sh /tmp/
RUN chmod +x /tmp/chromium_desktop.sh && \
    /tmp/chromium_desktop.sh && \
    rm /tmp/chromium_desktop.sh

# Copy start script
COPY <<-'EOT' /start.sh
#!/bin/bash
set -e

# Start VNC server as vncuser
sudo -u vncuser /usr/bin/vncserver :1 -geometry ${VNC_RESOLUTION} -depth ${VNC_COL_DEPTH} -localhost no

# Start noVNC as vncuser (for correct permissions)
sudo -u vncuser /opt/novnc/utils/websockify/run --web=/opt/novnc ${NOVNC_PORT} 0.0.0.0:${VNC_PORT} &

# Start D-Bus system daemon if not running
if [ ! -e /var/run/dbus/system_bus_socket ]; then
  mkdir -p /var/run/dbus
  dbus-daemon --system --fork
fi

# Make sure .Xauthority is accessible
cp /home/vncuser/.Xauthority /home/vncuser/.Xauthority.copy
sudo -u vncuser mv /home/vncuser/.Xauthority.copy /home/vncuser/.Xauthority
chmod 600 /home/vncuser/.Xauthority
chown vncuser:vncgroup /home/vncuser/.Xauthority

# Start Node.js server as nodeuser with DISPLAY variable (in background, logs to file)
# We also need to share X authentication from vncuser to nodeuser
cp /home/vncuser/.Xauthority /home/nodeuser/.Xauthority
chown nodeuser:nodegroup /home/nodeuser/.Xauthority
sudo -u nodeuser bash -c 'export DISPLAY=:1 && cd /app && NODE_ENV=production pnpm run start:prod &'

# Display access URLs
echo "========================================================================"
echo "VNC server started on port ${VNC_PORT}"
echo "noVNC interface available at http://0.0.0.0:${NOVNC_PORT}/vnc.html"
echo "NestJS API available at http://0.0.0.0:3000/api"
echo "API documentation available at http://0.0.0.0:3000/api/docs"
echo "========================================================================"

# Show running processes for verification
ps aux

# Keep the container running
tail -f /dev/null
EOT

RUN chmod +x /start.sh

# Configure sudo to allow running commands as specific users without password
RUN echo "root ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers && \
    echo "vncuser ALL=(vncuser) NOPASSWD: ALL" >> /etc/sudoers && \
    echo "nodeuser ALL=(nodeuser) NOPASSWD: ALL" >> /etc/sudoers

# Copy the Node.js app
WORKDIR /app
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/pnpm-lock.yaml /app/pnpm-lock.yaml
COPY --from=builder /app/.env /app/.env

# Set strict permissions to ensure vncuser cannot access Node.js files
RUN chown -R nodeuser:nodegroup /app && \
    chmod -R 750 /app && \
    setfacl -R -m u:vncuser:--- /app || echo "ACL support not available, using basic permissions" && \
    chmod 755 /app && \
    chown -R nodeuser:nodegroup /home/nodeuser && \
    chmod 700 /home/nodeuser

# Expose VNC, noVNC, and Node.js ports
EXPOSE 5901 6901 3000

# Set the entry point
CMD ["/start.sh"]