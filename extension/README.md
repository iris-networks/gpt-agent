# Zenobia Chrome Extension

This Chrome extension connects to the Zenobia AI agent via WebSocket, allowing you to control your computer using natural language commands.

## Features

- WebSocket connection to the Zenobia agent server
- Floating UI for interaction within web pages
- Popup UI for quick commands
- Real-time feedback on agent progress

## Development

### Prerequisites

- Bun runtime
- Node.js and npm/pnpm/yarn

### Setup

1. Install dependencies:
```bash
cd extension
bun install
```

2. Build the extension:
```bash
bun run build
```

This will:
- Generate extension icons
- Compile TypeScript code
- Create the manifest.json file
- Copy static assets to the dist folder

### Loading in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in the top-right corner)
3. Click "Load unpacked" and select the `dist` folder from this project

### Development Workflow

For development with auto-reloading:

```bash
bun run watch
```

## Connection to Zenobia Server

The extension connects to a WebSocket server running at `ws://localhost:3000/agent`. Make sure the Zenobia server is running before using the extension.

## Usage

1. Click the Zenobia extension icon to open the popup
2. Enter a task in the text field
3. Click "Run Agent" to execute the command
4. View real-time feedback in the popup or floating UI

You can also use the floating UI on any webpage by clicking the "Z" button that appears in the bottom-right corner.