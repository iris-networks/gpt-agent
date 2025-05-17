# WebSocket API Documentation

## Overview

The Zenobia platform uses WebSockets to provide real-time communication between the client and server for session management, events notification, and human-layer interaction. This document outlines the available WebSocket endpoints, event types, and the recommended sequence for API interactions.

## Connection

The WebSocket server is accessible at the same host and port as the REST API with CORS enabled for all origins.

```javascript
// Client-side connection example
const socket = io('http://your-server-url', {
  transports: ['websocket'],
});

socket.on('connect', () => {
  console.log('Connected to WebSocket server with ID:', socket.id);
});
```

## Session Management Flow

The recommended sequence for session operations is:

1. Connect to the WebSocket server
2. Create a session with `createSession`
3. Join the session with `joinSession`
4. Listen for `sessionStatus` events
5. Perform operations (take screenshots, etc.)
6. Leave the session with `leaveSession` when done
7. Cancel the session with `cancelSession` if needed

## Event Types

### Client to Server Events (Emit)

| Event Name | Payload | Description |
|------------|---------|-------------|
| `createSession` | `CreateSessionDto` | Creates a new session with optional file attachments |
| `joinSession` | `string` (sessionId) | Joins an existing session |
| `leaveSession` | None | Leaves the current session |
| `cancelSession` | None | Cancels the active session |
| `takeScreenshot` | None | Takes a screenshot of the current session |
| `sendFileAttachments` | `{ fileIds: string[] }` or `{ fileIds: { fileId: string, fileName: string, ... }[] }` | Attaches files to the current session |
| `approveHumanLayerRequest` | `string` (requestId) | Approves a pending human layer request |
| `getHumanLayerRequests` | None | Gets all active human layer requests |

### Server to Client Events (Listen)

| Event Name | Payload | Description |
|------------|---------|-------------|
| `sessionStatus` | `SocketEventDto` | Updates about session status changes |

## Event Payload Types

### CreateSessionDto

```typescript
{
  sessionType?: string;       // Type of session
  prompt?: string;            // Initial prompt for the session
  files?: {                   // File metadata array
    fileId: string;           // Unique ID of the file
    fileName: string;         // Name of the file
    contentType: string;      // MIME type
    size: number;             // File size in bytes
    [key: string]: any;       // Additional metadata
  }[];
  fileIds?: string[];         // Alternative: just file IDs
}
```

### SocketEventDto

```typescript
{
  eventType: string;          // Type of event (e.g., 'status', 'error')
  message: string;            // Human-readable message
  status: string;             // Session status
  sessionId: string;          // ID of the session
  timestamp: number;          // Event timestamp
  data?: any;                 // Additional event data
}
```

## Single Active Client Model

The WebSocket implementation follows a single active client model:

- Only one client is considered active at any time
- The most recently connected or interacted client becomes the active client
- Session updates are only sent to the active client
- When a client disconnects, if it was the active client, no client will receive updates until a new connection is established

## Detailed API Reference

### createSession

Creates a new session with optional file attachments.

```javascript
socket.emit('createSession', {
  prompt: 'My session prompt',
  files: [
    {
      fileId: 'file-123',
      fileName: 'document.pdf',
      contentType: 'application/pdf',
      size: 1024
    }
  ]
}, (response) => {
  if (response.success) {
    console.log('Session created:', response.sessionId);
  } else {
    console.error('Error creating session:', response.error);
  }
});
```

### joinSession

Joins an existing session to receive updates.

```javascript
socket.emit('joinSession', 'session-id', (response) => {
  if (response.success) {
    console.log('Joined session:', response.session);
  } else {
    console.error('Error joining session:', response.error);
  }
});
```

### leaveSession

Leaves the current session.

```javascript
socket.emit('leaveSession', (response) => {
  if (response.success) {
    console.log('Left session successfully');
  }
});
```

### cancelSession

Cancels the active session.

```javascript
socket.emit('cancelSession', (response) => {
  if (response.success) {
    console.log('Session canceled successfully');
  } else {
    console.error('Error canceling session:', response.error);
  }
});
```

### takeScreenshot

Takes a screenshot of the current session.

```javascript
socket.emit('takeScreenshot', (response) => {
  if (response.success) {
    console.log('Screenshot taken:', response.screenshot);
    // response.screenshot contains the image data
  } else {
    console.error('Error taking screenshot:', response.error);
  }
});
```

### sendFileAttachments

Attaches files to the current session.

```javascript
socket.emit('sendFileAttachments', {
  fileIds: ['file-123', 'file-456']
}, (response) => {
  if (response.success) {
    console.log('Files attached successfully');
  } else {
    console.error('Error attaching files:', response.error);
  }
});

// Alternative with metadata
socket.emit('sendFileAttachments', {
  fileIds: [
    {
      fileId: 'file-123',
      fileName: 'document.pdf',
      contentType: 'application/pdf',
      size: 1024
    }
  ]
}, (response) => {
  if (response.success) {
    console.log('Files with metadata attached successfully');
  } else {
    console.error('Error attaching files:', response.error);
  }
});
```

### approveHumanLayerRequest

Approves a pending human layer request.

```javascript
socket.emit('approveHumanLayerRequest', 'request-id', (response) => {
  if (response.success) {
    console.log('Human layer request approved');
  } else {
    console.error('Error approving request:', response.error);
  }
});
```

### getHumanLayerRequests

Gets all active human layer requests.

```javascript
socket.emit('getHumanLayerRequests', (response) => {
  if (response.success) {
    console.log('Active human layer requests:', response.requests);
  } else {
    console.error('Error getting requests:', response.error);
  }
});
```

## Listening for Server Events

### sessionStatus

Listen for session status updates.

```javascript
socket.on('sessionStatus', (data) => {
  console.log('Session status update:', data);
  // data.status contains the current session status
  // data.message contains a human-readable message
  // data.data may contain additional context
});
```

## Error Handling

All WebSocket operations return a response object with:

- `success`: Boolean indicating if the operation was successful
- `error`: Error message if success is false
- Additional data specific to the operation if success is true

## Best Practices

1. **Connection Management**: Always handle connection errors and reconnection logic
2. **Event Listening**: Set up event listeners before emitting events
3. **Error Handling**: Always check the success property in response callbacks
4. **Session Lifecycle**: Follow the recommended session lifecycle (create → join → operate → leave/cancel)
5. **Disconnection Handling**: Handle unexpected disconnections gracefully

## Implementation Example

```javascript
// Example client implementation
const socket = io('http://your-server-url', {
  transports: ['websocket'],
});

// Handle connection events
socket.on('connect', () => {
  console.log('Connected to WebSocket server');
  
  // Set up event listeners
  socket.on('sessionStatus', handleSessionStatus);
  
  // Create a new session
  createNewSession();
});

socket.on('disconnect', () => {
  console.log('Disconnected from WebSocket server');
});

function handleSessionStatus(data) {
  console.log(`Session ${data.sessionId} status: ${data.status}`);
  console.log(`Message: ${data.message}`);
  
  // Update UI based on status
  updateSessionUI(data);
}

function createNewSession() {
  socket.emit('createSession', {
    prompt: 'Perform a search for recent news'
  }, (response) => {
    if (response.success) {
      console.log('Session created:', response.sessionId);
      
      // Join the session to receive updates
      socket.emit('joinSession', response.sessionId, (joinResponse) => {
        if (joinResponse.success) {
          console.log('Joined session successfully');
        }
      });
    }
  });
}

function takeSessionScreenshot() {
  socket.emit('takeScreenshot', (response) => {
    if (response.success) {
      displayScreenshot(response.screenshot);
    }
  });
}
```