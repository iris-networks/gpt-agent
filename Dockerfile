FROM lscr.io/linuxserver/webtop:latest

RUN apk add --no-cache scrot curl

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash && \
    echo 'export PATH="/root/.bun/bin:$PATH"' >> /root/.bashrc

# Copy application files
COPY . /app
WORKDIR /app

# Install dependencies

RUN curl -fsSL https://bun.sh/install | bash
ENV BUN_INSTALL="/config/.bun"
ENV PATH="$BUN_INSTALL/bin:$PATH"
RUN chown -R $USERNAME:$USERNAME $BUN_INSTALL

# Create custom services directory
RUN mkdir -p /custom-services.d

# Add startup script for your application
RUN echo '#!/bin/bash\n\
/root/.bun/bin/bun run v1/src/index.ts\n' > /custom-services.d/iris_cua && \
    chmod +x /custom-services.d/iris_cua

# Expose ports if needed
EXPOSE 3000
