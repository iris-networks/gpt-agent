# Base Dockerfile

This Dockerfile creates the base image for the Zenobia application with all system dependencies.

## Purpose

The base image provides:

- Ubuntu 22.04 operating system
- XFCE desktop environment with WhiteSur GTK theme
- TigerVNC server for remote desktop access
- noVNC for browser-based VNC access
- Google Chrome browser
- Node.js 20.x and pnpm
- System utilities and dependencies

## Key Components

1. **WhiteSur GTK Theme**: A macOS-inspired GTK theme for a polished, modern UI
2. **VNC/noVNC**: Remote desktop functionality accessible via VNC clients or web browsers
3. **Google Chrome**: Full Chrome browser (not Chromium) for better compatibility
4. **Node.js 20.x**: Latest LTS version of Node.js with pnpm package manager

## Environment Variables

- `VNC_PASSWORD`: Password for VNC access (default: SecurePassword123)
- `VNC_RESOLUTION`: Screen resolution (default: 1280x800)
- `VNC_COL_DEPTH`: Color depth (default: 24)
- `VNC_PORT`: VNC server port (default: 5901)
- `NOVNC_PORT`: noVNC web interface port (default: 6901)

## Building

To build this image individually:

```bash
cd docker
docker build -t zenobia-base:latest ./base
```

Or use docker-compose to build all components:

```bash
cd docker
docker-compose build base
```

## Dependencies

This image is used as the foundation for the `zenobia-app` image, which adds the application layer on top of this base environment.