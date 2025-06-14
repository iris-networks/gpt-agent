# WebSocket Session API Documentation

This document describes the WebSocket API for session management in the Zenobia application.

## Connection

Connect to the server using Socket.IO client:

```javascript
const socket = io('https://your-server-url', {
  transports: ['websocket']
});
```

## Session Lifecycle Methods

### 1. Create Session

Creates a new session with a new agent instance.

**Event:** `createSession`

**Payload:**
```typescript
{
  instructions: string;        // Required: User's instructions/prompt
  operator?: string;           // Optional: Type of operator to use
  config?: Object;             // Optional: Configuration overrides
  files?: Array<{              // Optional: File metadata
    fileId: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
    originalName?: string;
  }>;
  fileIds?: string[];         // Optional: Legacy file ID format
}
```

**Response:**
```typescript
{
  success: boolean;
  sessionId?: string;         // Session ID if successful
  status?: string;            // Current session status
  files?: Array<Object>;      // Files attached to the session
  fileIds?: string[];         // Legacy file IDs
  error?: string;             // Error message if unsuccessful
}
```

### 2. Update Session

Updates an existing session with new instructions without creating a new agent instance.

**Event:** `updateSession`

**Payload:** Same format as `createSession`

**Response:** Same format as `createSession`

> **Important:** Unlike `createSession`, this method reuses the existing agent, avoiding the creation of duplicate agents when a user sends follow-up instructions.

### 3. Join Session

Joins an existing session.

**Event:** `joinSession`

**Payload:** `string` (sessionId - currently ignored)

**Response:**
```typescript
{
  success: boolean;
  session?: {                // Session data if successful
    sessionId: string;
    status: string;
    operator: string;
    conversations: Array<Object>;
    errorMsg?: string;
  };
  error?: string;            // Error message if unsuccessful
}
```

### 4. Leave Session

Leaves the current session (client disconnects from session).

**Event:** `leaveSession`

**Payload:** None

**Response:**
```typescript
{
  success: boolean;
}
```

### 5. Cancel Session

Cancels the current session execution.

**Event:** `cancelSession`

**Payload:** None

**Response:**
```typescript
{
  success: boolean;
  error?: string;            // Error message if unsuccessful
}
```

### 6. Delete Session

Completely deletes the session and all associated resources.

**Event:** `deleteSession`

**Payload:** None

**Response:**
```typescript
{
  success: boolean;
  message?: string;          // Success message
  error?: string;            // Error message if unsuccessful
}
```

## Additional Methods

### Send File Attachments

Sends file attachments to the current session.

**Event:** `sendFileAttachments`

**Payload:**
```typescript
{
  fileIds: Array<string> | Array<{
    fileId: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
    originalName?: string;
  }>
}
```

**Response:**
```typescript
{
  success: boolean;
  message?: string;          // Success message
  error?: string;            // Error message if unsuccessful
}
```

### Human Layer Methods

#### Approve Human Layer Request

Approves a pending human layer request.

**Event:** `approveHumanLayerRequest`

**Payload:** `string` (requestId)

**Response:**
```typescript
{
  success: boolean;
  error?: string;            // Error message if unsuccessful
}
```

#### Get Human Layer Requests

Gets active human layer requests.

**Event:** `getHumanLayerRequests`

**Payload:** None

**Response:**
```typescript
{
  success: boolean;
  requests?: Array<Object>;  // Active requests
  error?: string;            // Error message if unsuccessful
}
```

## Status Updates

The server emits status updates about the session.

**Event:** `sessionStatus`

**Data:**
```typescript
{
  message: string;           // Status message
  status: string;            // Status code (RUNNING, END, ERROR, etc.)
  sessionId: string;         // ID of the session
  timestamp: number;         // Timestamp of the event
  data?: any;                // Additional data
}
```

## Status Codes

- `INIT`: Session is initializing
- `RUNNING`: Session is running
- `PAUSE`: Session is paused
- `END`: Session completed successfully
- `ERROR`: Session encountered an error
- `CALL_USER`: Session needs user input
- `MAX_LOOP`: Session reached maximum execution steps
- `USER_STOPPED`: Session was stopped by the user