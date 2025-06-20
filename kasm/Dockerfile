FROM lscr.io/linuxserver/webtop:latest

# Environment variables
ENV DISPLAY=:1 \
    PUID=1000 \
    PGID=1000 \
    TZ=Etc/UTC \
    DEBIAN_FRONTEND=noninteractive

# Install additional packages
RUN apk update && apk add --no-cache \
    nodejs \
    npm \
    xauth \
    imagemagick \
    scrot \
    sudo

# Create nodeuser with same display access
RUN adduser -D -u 1002 -s /bin/sh nodeuser \
    && addgroup nodeuser wheel \
    && echo "nodeuser ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers \
    && mkdir -p /home/nodeuser/app \
    && chown -R nodeuser:nodeuser /home/nodeuser

# Configure X11 to allow nodeuser access
RUN mkdir -p /home/nodeuser/.vnc \
    && ln -s /home/abc/.vnc/passwd /home/nodeuser/.vnc/passwd \
    && chown -R nodeuser:nodeuser /home/nodeuser/.vnc

# Setup node environment
WORKDIR /home/nodeuser/app
COPY ./node-app/ /home/nodeuser/app/
RUN chown -R nodeuser:nodeuser /home/nodeuser/app \
    && chmod -R 700 /home/nodeuser/app \
    # Set permissions to make sure kasm user can't access these files
    && chmod 700 /home/nodeuser

# Configure npm to use a different cache directory owned by nodeuser
ENV NPM_CONFIG_CACHE=/home/nodeuser/.npm

# Switch to nodeuser to install node dependencies
USER nodeuser
RUN mkdir -p /home/nodeuser/.npm && npm install
USER root

# Create startup script to ensure services run correctly
COPY ./scripts/startup.sh /startup.sh
RUN chmod +x /startup.sh

ENTRYPOINT ["/startup.sh"]