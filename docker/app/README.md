# App Dockerfile

This Dockerfile creates the final application image by combining the base image with the built application from the builder stage.

## Purpose

The app image:

- Uses the `zenobia-base` image as its foundation
- Copies the built application from the `zenobia-builder` image
- Sets up user accounts with appropriate permissions
- Configures VNC and XFCE with the WhiteSur theme
- Provides the startup script and entry point

## Key Components

1. **Multi-User Setup**: Creates separate users for VNC and Node.js
2. **Security Isolation**: Ensures the VNC user cannot access Node.js files
3. **WhiteSur Theme Configuration**: Sets up XFCE to use the modern WhiteSur theme
4. **Startup Script**: Coordinates starting VNC, noVNC, and the Node.js application
5. **Permission Management**: Sets strict file permissions and ACLs

## Building

To build this image individually:

```bash
cd docker
docker build -t zenobia-app:latest -f app/Dockerfile ..
```

Or use docker-compose to build all components:

```bash
cd docker
docker-compose build app
```

## Running

To run the application:

```bash
docker run -p 5901:5901 -p 6901:6901 -p 3000:3000 zenobia-app:latest
```

Or with docker-compose:

```bash
cd docker
docker-compose up app
```

## Accessing the Application

- VNC: Connect to port 5901 with a VNC client
- noVNC: Open http://localhost:6901/vnc.html in a web browser
- API: Access http://localhost:3000/api
- API Documentation: Visit http://localhost:3000/api/docs

## Configuration

The app image inherits environment variables from the base image:

- `VNC_PASSWORD`: Password for VNC access (default: SecurePassword123)
- `VNC_RESOLUTION`: Screen resolution (default: 1280x800)
- `VNC_COL_DEPTH`: Color depth (default: 24)
- `VNC_PORT`: VNC server port (default: 5901)
- `NOVNC_PORT`: noVNC web interface port (default: 6901)