# Zenobia with VNC Support

This configuration integrates the Zenobia application with VNC support, making it accessible on port 6901.

## Quick Start

The simplest way to test the setup is to run:

```bash
./test-zenobia.sh
```

This script will:
1. Create necessary directories
2. Build and start the container with docker-compose
3. Display access information

## Access Points

When the container is running, you can access:

- **Zenobia API**: http://localhost:3000
- **VNC Web Interface**: http://localhost:6901/vnc.html
  - Password: `SecurePassword123`
- **VNC Direct Connection**: localhost:5901 (using a VNC client)
  - Password: `SecurePassword123`

## Configuration

The key configuration is set through environment variables:

- `CUSTOM_PORT=6901`: Sets the noVNC web interface port to 6901
- `VNC_PORT=5901`: Sets the direct VNC connection port to 5901
- `VNC_PASSWORD=SecurePassword123`: Sets the VNC password

## Files Overview

- `Dockerfile`: Combined configuration for Zenobia app and VNC support
- `docker-compose.test.yml`: Docker Compose configuration for testing
- `startup.sh`: Script that starts both VNC and the Zenobia application
- `test-zenobia.sh`: Convenience script for testing

## Manual Testing

If you prefer to run the container manually:

```bash
# Build and start the container
docker-compose -f docker-compose.test.yml up --build

# Stop the container
docker-compose -f docker-compose.test.yml down
```

## Troubleshooting

If you encounter issues:

1. Check container logs:
   ```bash
   docker logs zenobia-full
   ```

2. Shell into the running container:
   ```bash
   docker exec -it zenobia-full /bin/bash
   ```

3. Check VNC processes:
   ```bash
   docker exec zenobia-full ps aux | grep vnc
   ```

4. Verify ports are listening:
   ```bash
   docker exec zenobia-full netstat -tuln
   ```