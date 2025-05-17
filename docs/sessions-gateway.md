# Sessions Gateway Documentation

## Overview

The `SessionsGateway` is a WebSocket gateway that handles real-time communication for session management in the Zenobia platform. It manages client connections, session events, and human layer interactions.

## Key Concepts

- **Single Active Client**: The system maintains only one active client at a time, tracked by `activeClientId`.
- **Session Preservation**: When a client disconnects, the session state is preserved in memory and marked as `PAUSED`.
- **Task Persistence**: Human layer requests (tasks) remain active even when clients disconnect.
- **Reconnection Handling**: Any new connection becomes the active client and can access existing tasks without creating a new session.
- **State Management**: Sessions in `PAUSE` state can be resumed when a client reconnects.

## WebSocket Events

### Client Events (Incoming)

| Event | Description | Payload | Response |
|-------|-------------|---------|----------|
| `createSession` | Creates a new session or updates an existing one | `CreateSessionDto` | Session ID and status |
| `joinSession` | Joins an existing session | Session ID | Session details |
| `leaveSession` | Leaves the current session | None | Success status |
| `cancelSession` | Cancels the active session | None | Success status |
| `approveHumanLayerRequest` | Approves a pending human layer request | Request ID | Success status |
| `getHumanLayerRequests` | Retrieves all active human layer requests | None | Array of active requests |
| `takeScreenshot` | Takes a screenshot of the current session | None | Screenshot data |
| `sendFileAttachments` | Sends file attachments to the current session | `{ fileIds: any[] }` | Success status |

### Server Events (Outgoing)

| Event | Description | Payload |
|-------|-------------|---------|
| `sessionStatus` | Emitted when session status changes | `SocketEventDto` |

## Connection Lifecycle

1. **Connection**: When a client connects, it becomes the active client.
2. **Disconnection**: When a client disconnects:
   - If it was the active client, `activeClientId` is set to null
   - The session remains in memory with status `PAUSE`
   - Human layer requests remain in memory until they time out (default 1 hour)
3. **Reconnection**: When a new client connects:
   - It becomes the new active client
   - It can retrieve active human layer requests and continue where the previous client left off
   - It can resume the paused session without creating a new one

## Session Behavior

- Sessions are managed by `SessionManagerService`, independent of client connections
- A session can be in one of several states: `RUNNING`, `PAUSE`, `END`, `ERROR`, `USER_STOPPED`
- When a client disconnects, the session state is preserved but marked as `PAUSE`
- When a new client connects and sends instructions to a paused session, it resumes the same session rather than creating a new one
- Only sessions in `END` or `ERROR` states are eligible for replacement with a new session

## Human Layer Tasks

- Human layer requests persist in memory even when clients disconnect
- New clients can retrieve active requests using `getHumanLayerRequests`
- Task timeouts are independent of client connections (default 1 hour)
- Any client can approve pending human layer requests

## Data Transfer Objects (DTOs)

### Socket Events

#### SocketEventDto

Used for all events emitted from the server to clients:

```typescript
{
  sessionId: string;        // Unique identifier for the session
  message: string;          // Message content for the event
  status: StatusEnum;       // Status of the event (RUNNING, PAUSE, END, ERROR, etc.)
  data?: any;               // Additional event data (optional)
  humanLayerRequest?: any;  // Human layer request data if this is a human intervention event (optional)
}
```

### Session Management

#### CreateSessionDto

Used when creating a new session:

```typescript
{
  instructions: string;               // Instructions for the session
  operator?: OperatorType;            // Operator type (optional)
  config?: Partial<IrisConfigDto>;    // Custom configuration options (optional)
  fileIds?: string[];                 // Array of file IDs to include (optional)
  files?: FileMetadataDto[];          // Array of file metadata to include (optional)
}
```

#### SessionResponseDto

Returned when getting session info or creating a session:

```typescript
{
  sessionId: string;                  // Unique identifier for the session
  status: StatusEnum;                 // Current status of the session
  operator: OperatorType;             // Operator type used
  conversations?: MessageDto[];       // Conversation history (optional)
  errorMsg?: string;                  // Error message if there was an issue (optional)
  fileIds?: string[];                 // Array of file IDs attached to the session (optional)
  files?: FileMetadataDto[];          // Array of file metadata objects (optional)
}
```

### File Handling

#### FileMetadataDto

Represents a file attached to a session:

```typescript
{
  fileId: string;         // Unique ID for the file
  fileName: string;       // File name
  originalName?: string;  // Original file name (optional)
  mimeType: string;       // MIME type of the file
  fileSize: number;       // Size of the file in bytes
}
```

### Human Layer Requests

#### HumanLayerRequestEvent

Represents a human layer request:

```typescript
{
  id: string;                              // Unique ID for the request
  title: string;                           // Short title
  reason: string;                          // Explanation of why human input is needed
  status: 'pending'|'approved'|'rejected'|'timed_out';  // Status of the request
  timestamp: number;                       // When the request was created
  timeoutAt: number;                       // When the request will time out
}
```