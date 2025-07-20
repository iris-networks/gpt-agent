# Zenobia Chat Application

A professional, clean chat interface built for AI agent interactions with real-time streaming capabilities.

## Features

### Chat Interface (25% width)
- Professional message bubbles with user/assistant avatars
- File upload support with drag-and-drop
- Real-time connection status
- Message history with timestamps
- Auto-resizing input field
- File attachment preview

### Streaming Section (75% width)
- Real-time AI agent status monitoring
- Timeline view of session progress
- Live activity tracking
- Session management
- Status indicators for different agent states

## Architecture

- **Frontend**: Vanilla JavaScript with modern ES6+ classes
- **WebSocket**: Socket.IO for real-time communication
- **Backend Integration**: Zenobia Sessions Gateway
- **UI**: Clean, responsive CSS with professional styling
- **Layout**: 1:3 split layout (chat:streaming)

## Status Types Supported

Based on `StatusEnum` from `agent.ts`:
- `init` - Session initialization
- `running` - AI agent processing
- `pause` - Processing paused
- `end` - Session completed
- `call_user` - Human assistance required
- `max_loop` - Maximum iterations reached
- `user_stopped` - Stopped by user
- `error` - Error occurred

## Files Structure

```
src/public/
├── chat-app.html                 # Main chat interface
├── assets/
│   ├── css/
│   │   └── chat-app.css         # Professional styling
│   └── js/
│       ├── chat-app.js          # Main application logic
│       ├── services/
│       │   ├── websocket.js     # WebSocket service
│       │   └── fileUpload.js    # File handling service
│       └── utils/
│           └── helpers.js       # Utility functions
```

## Usage

1. Open `chat-app.html` in a browser
2. Ensure the backend server is running on `localhost:3000`
3. Start chatting with the AI agent
4. Monitor real-time streaming in the right panel
5. Upload files by clicking the attachment button or drag-and-drop

## Backend Integration

The application integrates with:
- **Sessions Gateway**: `/src/modules/sessions/gateways/sessions.gateway.ts`
- **WebSocket Events**: `createSession`, `continueSession`, `joinSession`, etc.
- **File Upload API**: `localhost:3000/api/files`

## Responsive Design

- Desktop: 1:3 layout (chat:streaming)
- Tablet: Adjusted proportions (35%:65%)
- Mobile: Stacked layout (40%:60% height)

## Browser Support

- Modern browsers with ES6+ support
- WebSocket/Socket.IO compatibility
- File API support for uploads