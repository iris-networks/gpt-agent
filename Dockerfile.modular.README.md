# Modular Dockerfile

`Dockerfile.modular` is a single-file version of the modularized Docker setup that combines all stages in one file with clear section separation.

## Purpose

This file:

- Provides the same functionality as the separate Dockerfiles
- Organizes the build process into clearly marked sections
- Offers a simpler alternative for those who prefer a single file
- Makes it easy to understand the complete build process in one view

## Key Sections

1. **Builder Stage**: Compiles the Node.js application
2. **Final Stage**: Sets up the runtime environment
3. **System Dependencies**: Installs all required system packages
4. **WhiteSur Theme**: Installs and configures the modern GTK theme
5. **Chrome Installation**: Sets up Google Chrome browser
6. **Node.js Installation**: Installs Node.js and pnpm
7. **noVNC Setup**: Configures the browser-based VNC client
8. **User Setup**: Creates isolated user accounts
9. **VNC Configuration**: Sets up the VNC server
10. **Startup Script**: Coordinates all services
11. **Application Setup**: Copies and configures the built application

## Building

To build using this file:

```bash
docker build -t zenobia-app:latest -f Dockerfile.modular .
```

## Running

To run the application:

```bash
docker run -p 5901:5901 -p 6901:6901 -p 3000:3000 zenobia-app:latest
```

## Accessing the Application

- VNC: Connect to port 5901 with a VNC client
- noVNC: Open http://localhost:6901/vnc.html in a web browser
- API: Access http://localhost:3000/api
- API Documentation: Visit http://localhost:3000/api/docs

## Comparison with Modular Approach

### Advantages

- **Simplicity**: Single file to manage
- **Clarity**: Clear section headers make it easy to navigate
- **No Context Switching**: All build steps in one place

### Disadvantages

- **Less Modularity**: Changes affect the whole file
- **Longer Build Time**: Can't easily cache or parallel-build specific components
- **More Complex Diffs**: File changes are harder to review

## When to Use

Use this single-file approach when:

- You prefer working with a single file
- You want to understand the complete build process
- You don't need the advanced caching benefits of true multi-stage builds
- You're sharing the Dockerfile with someone who might be confused by multiple files