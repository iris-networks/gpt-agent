# Zenobia Browser Extension

A Chrome extension that uses a custom ReactAI agent to automate browser interactions.

## Features

- 🤖 AI-powered browser automation using ReactAI agent
- 🖼️ Screen analysis for intelligent interaction detection
- 🔧 Command execution for browser control (clicking, typing, scrolling)
- 📋 Sidepanel UI for interaction with the agent
- 🔄 Support for multiple browser environments

## Architecture

This extension implements a custom ReactAI agent that can run entirely in the browser. The architecture consists of:

- **Background Service Worker**: Manages the agent lifecycle and handles communication between the agent and UI
- **Content Script**: Executes commands on web pages and analyzes DOM elements
- **Sidepanel UI**: Provides a user interface for interacting with the agent
- **ReactAI Agent**: Core implementation that orchestrates tools to complete tasks

## Development

### Prerequisites

- Bun 1.0 or higher
- Chrome browser (v88+)

### Getting Started

1. Clone the repository
2. Install dependencies: `bun install`
3. Build the extension: `bun run build`
4. Load the unpacked extension from the `dist` directory in Chrome's extension settings

### Development Commands

```bash
# Build the extension
bun run build

# Start development server
bun run dev

# Watch for changes and rebuild
bun run watch
```

## Usage

1. Click the extension icon to open the sidepanel
2. Enter your Anthropic API key in the settings tab
3. Type a task in the input field and click "Run"
4. The agent will analyze the screen and take actions to complete the task

## Architecture Details

### ReactAI Agent

The ReactAI agent is a custom implementation designed to run in browser extensions. It uses a reasoning and action loop to:

1. Observe the current state of the browser
2. Think about what to do next
3. Execute an action using available tools
4. Repeat until the task is complete

### Tools

The agent has access to the following tools:

- **NextActionTool**: Analyzes the screen and suggests the next action
- **CommandExecutorTool**: Executes browser automation commands (click, type, scroll, etc.)

### Communication

- The agent runs in the background service worker
- Commands are sent to the content script for execution
- Results and updates are sent back to the UI through message passing

## License

MIT



---
- Claude Sonner
- Nova
- gemma 27b
- 