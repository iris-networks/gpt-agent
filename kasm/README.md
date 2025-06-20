# Webtop with Node.js and Screenshot Capabilities

This project extends the linuxserver/webtop container with a Node.js server running as a separate user (nodeuser). The Node.js server can take screenshots of the webtop desktop while maintaining isolation between users.

## Features

- Based on linuxserver/webtop image
- Creates a separate nodeuser with access to the same display (:1)
- Runs a Node.js server with screenshot capabilities
- Isolates file access between kasm user (abc) and nodeuser
- Modular architecture with clean separation of concerns

## Requirements

- Docker
- Docker Compose

## Setup and Usage

1. Clone this repository:
   ```
   git clone <repository-url>
   cd <repository-dir>
   ```

2. Build and start the container:
   ```
   docker-compose up -d
   ```

3. Access the services:
   - Webtop (VNC) interface: http://localhost:3000
   - Node.js API: http://localhost:8080

## API Endpoints

The Node.js server provides the following endpoints:

- `GET /health` - Check if the server is running
- `POST /screenshot` - Take a screenshot of the current desktop
- `GET /screenshots/:filename` - Retrieve a previously taken screenshot

## Security Features

- nodeuser cannot access files owned by kasm user (abc)
- kasm user cannot access files in the nodeuser home directory
- Both users can access the same display for screenshot functionality

## Directory Structure

```
.
├── Dockerfile
├── docker-compose.yml
├── scripts/
│   └── startup.sh
└── node-app/
    ├── package.json
    ├── server.js
    └── screenshots/
```

## Customization

You can customize the configuration by modifying the environment variables in the `docker-compose.yml` file:

- `PUID` and `PGID`: User and group IDs
- `TZ`: Time zone
- `KEYBOARD`: Keyboard layout
- `WEB_PORT`: Port for the Node.js server