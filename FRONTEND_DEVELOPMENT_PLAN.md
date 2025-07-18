# Frontend Development Plan - Zenobia Chat Application

## Overview
This document outlines the plan to build a modern, responsive chat application frontend that integrates with the Zenobia backend WebSocket API and file upload endpoints.

## Backend API Analysis

### WebSocket Gateway (`/src/modules/sessions/gateways/sessions.gateway.ts`)
The backend provides the following WebSocket events:

**Outgoing Events (from server):**
- `sessionStatus` - Broadcasts session status updates to all connected clients

**Incoming Events (to server):**
- `createSession` - Creates a new session with optional file attachments and Composio apps
- `continueSession` - Continues an existing session with additional instructions
- `joinSession` - Joins the current active session
- `leaveSession` - Leaves the current session
- `deleteSession` - Deletes the current session

### File Upload API (`/src/modules/file-upload/controllers/file-upload.controller.ts`)
REST endpoints for file management:
- `POST /api/files/upload` - Upload files (max 10MB, no videos)
- `GET /api/files` - List all uploaded files
- `GET /api/files/:id` - Get file information
- `GET /api/files/download/:filename` - Download file
- `DELETE /api/files/:id` - Delete file

### Data Transfer Objects
- `CreateSessionDto` - Session creation with instructions, files, and Composio apps
- `ContinueSessionDto` - Session continuation with additional instructions
- `FileMetadataDto` - File metadata structure
- `FileUploadResponseDto` - File upload response structure

## Frontend Architecture

### Technology Stack
- **Framework**: Vanilla JavaScript with ES6 modules (keeping it lightweight)
- **UI Framework**: DaisyUI + Tailwind CSS for stunning, component-based styling
- **WebSocket**: Socket.IO client for real-time communication
- **File Upload**: Native FormData API with drag-and-drop support
- **Module System**: ES6 modules for code organization

### Project Structure
```
src/public/
├── index.html                 # Main chat interface
├── assets/
│   ├── css/
│   │   └── styles.css        # Custom styles and DaisyUI theme customizations
│   ├── js/
│   │   ├── app.js            # Main application controller
│   │   ├── components/
│   │   │   ├── ChatInterface.js     # Chat UI component
│   │   │   ├── FileUpload.js        # File upload component
│   │   │   ├── SessionManager.js    # Session management
│   │   │   └── StatusDisplay.js     # Status updates display
│   │   ├── services/
│   │   │   ├── SocketService.js     # Socket.IO integration
│   │   │   ├── FileService.js       # File upload/management
│   │   │   └── SessionService.js    # Session API integration
│   │   └── utils/
│   │       ├── dom.js              # DOM utilities
│   │       ├── validation.js       # Input validation
│   │       └── formatting.js       # Text/date formatting
│   └── images/
│       └── icons/             # UI icons and assets
```

## Component Design

### 1. ChatInterface Component
**Responsibilities:**
- Render chat messages and conversation history
- Handle user input and message sending
- Display session status and connection state
- Manage chat layout and scrolling

**Features:**
- Message bubbles with sender identification using DaisyUI chat components
- Typing indicators with DaisyUI loading animations
- Message timestamps with elegant formatting
- Auto-scroll to latest messages
- Message status indicators (sending, sent, error) using DaisyUI badges
- Beautiful chat layout with DaisyUI card and bubble components

### 2. FileUpload Component
**Responsibilities:**
- Handle file selection and drag-and-drop
- Upload files to backend API
- Display upload progress and file list
- Manage file attachments for sessions

**Features:**
- Drag-and-drop file upload area using DaisyUI card with dashed borders
- File type validation (no videos, 10MB limit) with DaisyUI alerts
- Upload progress bars using DaisyUI progress components
- File preview thumbnails in DaisyUI card grid layout
- Remove uploaded files using DaisyUI button with close icon
- Beautiful file list display with DaisyUI table or list components

### 3. SessionManager Component
**Responsibilities:**
- Create new sessions with instructions
- Continue existing sessions
- Join/leave sessions
- Display session information

**Features:**
- Session creation form using DaisyUI form components and textarea
- Session continuation interface with DaisyUI input groups
- Session status display using DaisyUI badges and status indicators
- Session history with DaisyUI timeline or accordion components
- Action buttons using DaisyUI button variants (primary, secondary, accent)

### 4. StatusDisplay Component
**Responsibilities:**
- Show real-time session status updates
- Display connection status
- Show system notifications
- Provide debug toggle for verbose status messages

**Features:**
- Status indicator (connected/disconnected) using DaisyUI indicators and badges
- Session progress updates with DaisyUI progress radial or linear components
- Error message display using DaisyUI alert components (error variant)
- Success notifications using DaisyUI toast or alert components (success variant)
- Debug toggle using DaisyUI toggle component with distinctive styling
- Beautiful status cards using DaisyUI card components with gradients

## Implementation Plan

### Phase 1: Core Setup
1. **Directory Structure**: Create public directory with organized file structure
2. **Base HTML**: Create main HTML template with DaisyUI + Tailwind CSS
3. **DaisyUI Setup**: Configure DaisyUI themes and components via CDN
4. **Socket Service**: Implement Socket.IO connection and event handling
5. **Basic UI**: Create responsive layout with DaisyUI components (navbar, drawer, main content)

### Phase 2: Session Management
1. **Session Creation**: Implement create session functionality
2. **Session Continuation**: Add continue session capability
3. **Session Status**: Display real-time session status updates
4. **Error Handling**: Implement proper error handling for session operations

### Phase 3: File Upload
1. **File Upload Service**: Implement file upload API integration via REST endpoints
2. **Drag-and-Drop**: Create intuitive file upload interface
3. **File Management**: Add file listing and deletion capabilities
4. **File Attachment**: Integrate uploaded file IDs with session creation/continuation

### Backend Code Cleanup
1. **Remove sendFileAttachments**: Remove the `sendFileAttachments` WebSocket event handler from sessions gateway
2. **Simplify File Integration**: Use only the REST API endpoints for file operations
3. **Update Frontend Logic**: Files will be uploaded via REST API, then file IDs passed to WebSocket session events

### Phase 4: Chat Interface
1. **Message Display**: Implement chat message rendering with filtering
2. **Real-time Updates**: Add live session status updates
3. **Message History**: Display conversation history
4. **User Input**: Handle user input and message sending
5. **Debug Toggle**: Add debug mode toggle for verbose status messages

### Phase 5: Polish & Integration
1. **Styling**: Apply consistent UI styling with DaisyUI themes and components
2. **Theme Customization**: Implement custom color schemes and branding
3. **Responsive Design**: Ensure mobile-friendly interface using DaisyUI responsive utilities
4. **Testing**: Test all features with backend integration
5. **Performance**: Optimize for performance and user experience

## DaisyUI Integration and Modular Design

### DaisyUI Component Strategy
- **Chat Components**: Use `chat`, `chat-bubble`, `chat-image`, `chat-header`, `chat-footer` for message display
- **Form Components**: Leverage `form-control`, `label`, `input`, `textarea`, `select` for user inputs
- **Navigation**: Implement `navbar`, `drawer`, `breadcrumbs` for app navigation
- **Feedback**: Use `alert`, `toast`, `modal`, `loading` for user feedback
- **Data Display**: Utilize `table`, `card`, `collapse`, `timeline` for information presentation
- **Actions**: Apply `btn`, `btn-group`, `dropdown` for interactive elements

### Theme System Integration
- **Multi-theme Support**: Implement theme switching with DaisyUI's built-in themes
- **Custom Theme**: Create a custom "Zenobia" theme with brand colors
- **Theme Persistence**: Save user theme preference in localStorage
- **Dynamic Theme Switching**: Allow real-time theme changes without page reload

### Modular Component Architecture
- **Component Isolation**: Each UI component is self-contained with its own DaisyUI styling
- **Reusable Elements**: Create common DaisyUI component wrappers (Button, Card, Modal, etc.)
- **Consistent Styling**: Use DaisyUI design tokens for consistent spacing, colors, and typography
- **Responsive Design**: Leverage DaisyUI's responsive utilities for mobile-first design

### Code Organization for Modularity
```javascript
// Component structure example
class ChatMessage {
  constructor(messageData, isDarkMode = false) {
    this.data = messageData;
    this.isDarkMode = isDarkMode;
  }
  
  render() {
    return `
      <div class="chat ${this.data.sender === 'user' ? 'chat-end' : 'chat-start'}">
        <div class="chat-image avatar">
          <div class="w-10 rounded-full">
            <img src="${this.data.avatar}" />
          </div>
        </div>
        <div class="chat-header">
          ${this.data.sender}
          <time class="text-xs opacity-50">${this.data.timestamp}</time>
        </div>
        <div class="chat-bubble ${this.getChatBubbleClass()}">
          ${this.data.message}
        </div>
      </div>
    `;
  }
  
  getChatBubbleClass() {
    if (this.data.sender === 'user') return 'chat-bubble-primary';
    if (this.data.type === 'error') return 'chat-bubble-error';
    if (this.data.type === 'debug') return 'chat-bubble-ghost';
    return 'chat-bubble-secondary';
  }
}
```

## Technical Considerations

### WebSocket Integration
- Maintain persistent connection with automatic reconnection
- Handle connection states (connecting, connected, disconnected)
- Implement proper event listeners for all backend events
- Add heartbeat mechanism for connection health

### File Upload Optimization
- Use REST API endpoints exclusively for file operations
- Add upload progress tracking
- Handle upload errors gracefully
- Provide visual feedback during uploads
- Upload files first, then pass file IDs to WebSocket session events

### State Management
- Use simple state management pattern with event emitters
- Maintain session state across components
- Handle browser refresh and reconnection scenarios

### Security Considerations
- Validate all user inputs
- Sanitize file uploads
- Implement proper error handling without exposing sensitive information
- Use HTTPS in production

### Performance Optimization
- Lazy load components as needed
- Implement virtual scrolling for large chat histories
- Optimize file upload handling
- Minimize bundle size with tree shaking

## User Experience Features

### Core Features
- Real-time chat interface with DaisyUI chat components
- File upload with drag-and-drop using DaisyUI cards and progress bars
- Session management (create/continue/join) with DaisyUI forms and buttons
- Status indicators and notifications using DaisyUI badges and alerts
- Responsive design for all screen sizes using DaisyUI grid system

### Advanced Features
- Message search and filtering with DaisyUI input components
- File preview before upload with DaisyUI modal dialogs
- Session history and management using DaisyUI timeline or accordion
- Keyboard shortcuts for common actions
- Multiple theme support using DaisyUI theme system (light/dark/cyberpunk/retro)
- Debug mode toggle for verbose agent status messages using DaisyUI toggle

## Future Enhancements
- Voice input integration
- Message reactions and annotations
- Multi-language support
- Advanced file management (folders, tagging)
- Integration with external services (Composio apps)
- Offline mode with message queuing

## Development Guidelines
- Follow modern JavaScript best practices
- Implement proper error handling and logging
- Use semantic HTML and accessibility features
- Write clean, maintainable code with proper documentation
- Test thoroughly across different browsers and devices

## Message Filtering and Debug Mode

### Default Message Display
By default, the chat interface will show a clean, user-friendly view displaying only:
- **User messages**: All messages sent by the user
- **Agent final responses**: Only `StatusEnum.END` messages from the agent (completed responses)

### Debug Mode Toggle
Users can enable debug mode to see verbose agent status updates:
- **StatusEnum.Running messages**: Real-time agent processing updates, tool calls, and intermediate steps
- **All status updates**: Complete visibility into agent workflow and decision-making process
- **Toggle persistence**: Debug mode preference saved in localStorage

### Implementation Details
- **Message filtering logic**: Filter messages based on status type and sender
- **Debug toggle UI**: Prominent DaisyUI toggle switch in the status bar or settings panel
- **Visual distinction**: Different styling for debug messages using DaisyUI text utilities (muted colors, smaller text)
- **Performance consideration**: Limit debug message history to prevent memory issues
- **Modular components**: Each message type rendered by dedicated component modules

### User Experience Benefits
- **Clean interface**: Non-technical users see only relevant final responses
- **Developer insight**: Debug mode provides full transparency for troubleshooting
- **Flexible workflow**: Users can toggle between modes as needed
- **Better UX**: Reduces cognitive load while maintaining power user capabilities

---

This plan provides a comprehensive roadmap for building a modern, feature-rich chat application frontend that seamlessly integrates with the Zenobia backend infrastructure.