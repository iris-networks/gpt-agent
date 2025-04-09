# Zenobia AI Agent

Zenobia is an AI agent framework built on Hyper Express and BeeAI Framework that allows controlling a computer system through natural language commands.

## Features

- Command executor for keyboard and mouse control
- Terminal tool for executing shell commands
- WebSocket server for remote connection
- Chrome extension for browser integration

## Server Components

### WebSocket Server

The project includes a WebSocket server built with Hyper Express that exposes the AI agent functionality:

- Endpoint: `ws://localhost:8080/pulsar`
- Protocol: JSON messages with the following format:
  ```json
  {
    "prompt": "Task description in natural language",
    "sessionId": "optional-session-id"
  }
  ```
- Responses: Real-time updates via JSON messages

To build and start the server:
```bash
# Build the application
npm run build

# Start the production server
npm start

# Or for development mode
npm run dev
```

You can also use the build script:
```bash
# First time setup with dependency installation
./build.sh --install

# Just build
./build.sh
```

## Chrome Extension

A Chrome extension is included for easy interaction with the Zenobia agent from any webpage:

- WebSocket connection to the Zenobia server
- Floating UI for interaction within webpages
- Popup UI for quick commands
- Real-time feedback on agent progress

See the [extension README](./extension/README.md) for more details.

## Custom Memory Implementation
---
import { BaseMemory } from "beeai-framework/memory/base";
import { Message } from "beeai-framework/backend/message";
import { NotImplementedError } from "beeai-framework/errors";

export class MyMemory extends BaseMemory {
  get messages(): readonly Message[] {
    throw new NotImplementedError("Method not implemented.");
  }

  add(message: Message, index?: number): Promise<void> {
    throw new NotImplementedError("Method not implemented.");
  }

  delete(message: Message): Promise<boolean> {
    throw new NotImplementedError("Method not implemented.");
  }

  reset(): void {
    throw new NotImplementedError("Method not implemented.");
  }

  createSnapshot(): unknown {
    throw new NotImplementedError("Method not implemented.");
  }

  loadSnapshot(state: ReturnType<typeof this.createSnapshot>): void {
    throw new NotImplementedError("Method not implemented.");
  }
}
---

## Configuration

### Screen Dimensions and Display

You can configure screen dimensions and display settings using environment variables:

- `SCREEN_WIDTH`: Set the screen width in pixels
- `SCREEN_HEIGHT`: Set the screen height in pixels  
- `SCREEN_SCALING_FACTOR`: Set the display scaling factor (e.g., 1 for standard, 2 for Retina/HiDPI)
- `DISPLAY`: Set the X11 display server connection string (critical for containerized environments)

When these variables are set, the system will use them instead of auto-detecting screen dimensions. This is useful for:
- Running in containerized environments (Docker, Kubernetes)
- Supporting headless servers with virtual displays (Xvfb)
- Supporting non-standard display configurations
- Ensuring consistent behavior across different systems

Example:
```bash
# Set environment variables before running
export SCREEN_WIDTH=1920
export SCREEN_HEIGHT=1080
export SCREEN_SCALING_FACTOR=1
export DISPLAY=:0  # Default X11 display
# Then run the application
npm run dev
```

#### Containerized Environments

When running in Docker or other containerized environments, you'll typically need to:

1. Install X11 utilities and screenshot tools (scrot, gnome-screenshot)
2. Set up a virtual display server like Xvfb
3. Configure the DISPLAY environment variable

Example Docker setup:
```bash
# Start a virtual display
Xvfb :1 -screen 0 1920x1080x24 &

# Set environment variables
export DISPLAY=:1
export SCREEN_WIDTH=1920
export SCREEN_HEIGHT=1080

# Run your application
npm run dev
```

## Development

See [CLAUDE.md](./CLAUDE.md) for development guidelines and commands.



-----

Submit button doesn't work most of the times, since its a combo of cmd + enter on mac, and some other key combo on other systems