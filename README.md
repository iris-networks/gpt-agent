# Zenobia AI Agent

Zenobia is an AI agent framework built on ElysiaJS and BeeAI Framework that allows controlling a computer system through natural language commands.

## Features

- Command executor for keyboard and mouse control
- Terminal tool for executing shell commands
- WebSocket server for remote connection
- Chrome extension for browser integration

## Server Components

### WebSocket Server

The project includes a WebSocket server built with ElysiaJS that exposes the AI agent functionality:

- Endpoint: `ws://localhost:3000/agent`
- Protocol: JSON messages with the following format:
  ```json
  {
    "prompt": "Task description in natural language",
    "sessionId": "optional-session-id"
  }
  ```
- Responses: Real-time updates via JSON messages

To start the server:
```bash
bun run index.ts
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

## Development

See [CLAUDE.md](./CLAUDE.md) for development guidelines and commands.