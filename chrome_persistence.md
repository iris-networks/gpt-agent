# Persistent Chrome Sessions Documentation

## Docker Implementation

1. **Dockerfile Changes**:
   - Add a volume mount point for Chrome user data:
   ```dockerfile
   VOLUME /home/vncuser/.config/google-chrome
   ```

2. **docker-compose.yml Changes**:
   - Add a named volume for Chrome data:
   ```yaml
   volumes:
     chrome-data:
       driver: local
   ```
   - Mount the volume to the container:
   ```yaml
   services:
     zenobia:
       volumes:
         - chrome-data:/home/vncuser/.config/google-chrome
   ```

## Fly Machines Implementation

1. **fly.toml Changes**:
   - Add a persistent volume for Chrome data:
   ```toml
   [[mounts]]
     source = "chrome_data"
     destination = "/home/vncuser/.config/google-chrome"
   ```

## Usage Notes

- The Chrome profile will persist across container/machine restarts
- Data will be stored in the mounted volumes
- Ensure proper permissions are set on the volume directories
- Consider backup strategies for important profile data