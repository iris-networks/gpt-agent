# Frontend Development Plan - Zenobia Chat Application

## Overview
This document outlines the plan to build a modern, responsive chat application frontend that integrates with the Zenobia backend WebSocket API and file upload endpoints. The interface features a tabbed design with multiple functional areas for comprehensive AI agent interaction.

**Development Environment:**
- **Frontend (WebRTC Interface)**: `localhost:6901`
- **Backend Server & APIs**: `localhost:3000`

**Target UI Design:**
The application features a dark theme interface with:
- **Left Sidebar**: Session history management with "New Session" button and session list
- **Top Navigation**: Tab-based interface with Chat, Screen, Terminal, Explorer, and Editor tabs
- **Main Content Area**: Context-aware content based on selected tab
- **Bottom Status Bar**: System status indicators and CPU/Memory usage
- **Autonomous Mode Toggle**: Toggle for autonomous AI agent operation

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
- **UI Framework**: Choose appropriate CSS framework or custom styles for component-based styling
- **WebSocket**: Socket.IO client for real-time communication
- **File Upload**: Native FormData API with drag-and-drop support
- **Module System**: ES6 modules for code organization

### Project Structure
```
src/public/
├── index.html                 # Main application interface
├── assets/
│   ├── css/
│   │   ├── styles.css        # Main stylesheet with dark theme
│   │   ├── tabs.css          # Tab navigation styling
│   │   └── components.css    # Component-specific styles
│   ├── js/
│   │   ├── app.js            # Main application controller
│   │   ├── components/
│   │   │   ├── TabManager.js        # Tab navigation component
│   │   │   ├── ChatInterface.js     # Chat UI component
│   │   │   ├── ScreenViewer.js      # WebRTC screen viewer (port 6901)
│   │   │   ├── FileExplorer.js      # File listing and management
│   │   │   ├── SessionSidebar.js    # Session history sidebar
│   │   │   ├── StatusBar.js         # Bottom status bar component
│   │   │   └── AutonomousToggle.js  # Autonomous mode toggle
│   │   ├── services/
│   │   │   ├── SocketService.js     # Socket.IO integration
│   │   │   ├── FileService.js       # File API integration
│   │   │   ├── SessionService.js    # Session API integration
│   │   │   └── ScreenService.js     # WebRTC screen integration
│   │   └── utils/
│   │       ├── dom.js              # DOM utilities
│   │       ├── validation.js       # Input validation
│   │       ├── formatting.js       # Text/date formatting
│   │       └── tabUtils.js         # Tab management utilities
│   └── images/
│       ├── icons/             # UI icons and assets
│       └── avatars/          # User and agent avatars
```

## Component Design

### 1. TabManager Component
**Responsibilities:**
- Manage tab navigation and switching
- Handle tab state and active tab tracking
- Control tab visibility and accessibility
- Integrate with premium feature restrictions

**Features:**
- Five main tabs: Chat, Screen, Terminal (paid), Explorer (paid), Editor (paid)
- Visual active state indication
- Smooth tab transitions
- Premium feature lockouts with upgrade prompts
- Responsive tab layout

### 2. ChatInterface Component
**Responsibilities:**
- Render chat messages and conversation history
- Handle user input and message sending
- Display session status and connection state
- Manage chat layout and scrolling

**Features:**
- Message bubbles with sender identification using appropriate styling
- Typing indicators with loading animations
- Message timestamps with elegant formatting
- Auto-scroll to latest messages
- Message status indicators (sending, sent, error) with visual badges
- Beautiful chat layout with card and bubble components

### 3. ScreenViewer Component
**Responsibilities:**
- Embed WebRTC interface from localhost:6901
- Provide remote desktop viewing capabilities
- Handle screen interaction events
- Manage screen state and connection status

**Features:**
- Full-screen iframe embedding of port 6901
- Connection status indicators
- Screen refresh and reconnection controls
- Responsive screen scaling
- Interactive screen controls

### 4. FileExplorer Component
**Responsibilities:**
- Display files created/managed by the agent using File APIs
- Provide file browsing and management interface
- Show file metadata and properties
- Handle file operations (download, delete)

**Features:**
- File listing from backend File API (GET /api/files)
- File type icons and thumbnails
- File metadata display (size, date, type)
- Download functionality (GET /api/files/download/:filename)
- Delete file capability (DELETE /api/files/:id)
- Search and filter functionality
- Grid and list view modes

### 5. SessionSidebar Component
**Responsibilities:**
- Display session history in left sidebar
- Create new sessions with "New Session" button
- Show session list with timestamps
- Handle session selection and switching

**Features:**
- "New Session" button with prominent styling
- Session history list with timestamps
- Session name/title display
- Active session highlighting
- Session deletion capabilities
- Collapsible sidebar for mobile

### 6. StatusBar Component
**Responsibilities:**
- Display system status at bottom of interface
- Show CPU and memory usage indicators
- Provide connection status information
- Display current session status

**Features:**
- CPU usage percentage display
- Memory usage indicator
- Connection status (idle, active, error)
- Session status updates
- System resource monitoring

### 7. AutonomousToggle Component
**Responsibilities:**
- Control autonomous mode state
- Toggle between manual and autonomous operation
- Provide visual feedback for current mode
- Handle mode switching events

**Features:**
- Toggle switch with clear on/off states
- "Autonomous Mode" label
- Visual state indicators (colors, icons)
- Smooth toggle animations
- Mode persistence across sessions

### 8. StatusDisplay Component
**Responsibilities:**
- Show real-time session status updates
- Display connection status
- Show system notifications
- Provide debug toggle for verbose status messages

**Features:**
- Status indicator (connected/disconnected) with visual indicators and badges
- Session progress updates with progress radial or linear components
- Error message display with alert components
- Success notifications with toast or alert notifications
- Debug toggle with distinctive toggle component styling
- Beautiful status cards with gradient styling

## Implementation Plan

### Phase 1: Core Setup & Layout
1. **Directory Structure**: Create public directory with organized file structure
2. **Base HTML**: Create main HTML template with dark theme styling
3. **Layout Framework**: Implement sidebar + tabbed main content layout
4. **Tab Navigation**: Build tab manager with Chat, Screen, Terminal, Explorer, Editor tabs
5. **Premium Features**: Implement feature lockouts for Terminal, Explorer, and Editor tabs
6. **Socket Service**: Implement Socket.IO connection and event handling

### Phase 2: Session Management & Sidebar
1. **Session Sidebar**: Implement left sidebar with session history
2. **New Session**: Create "New Session" button and session creation flow
3. **Session History**: Display session list with timestamps and navigation
4. **Session Status**: Display real-time session status updates
5. **Autonomous Toggle**: Implement autonomous mode toggle functionality

### Phase 3: Chat Interface
1. **Chat Tab**: Implement primary chat interface tab
2. **Message Display**: Create chat message rendering with agent/user distinction
3. **Input Handling**: Add message input and sending functionality
4. **Real-time Updates**: Integrate WebSocket for live chat updates
5. **Message Filtering**: Implement debug mode toggle for verbose messages

### Phase 4: Screen & File Explorer Tabs
1. **Screen Viewer**: Implement iframe embedding of localhost:6901 for WebRTC interface
2. **Screen Controls**: Add connection status and refresh controls for screen viewer
3. **File Explorer**: Create file listing interface using File API endpoints
4. **File Operations**: Implement download, delete, and file management features
5. **File Upload**: Add drag-and-drop file upload capability in chat interface

### Phase 5: Status Bar & System Integration
1. **Status Bar**: Implement bottom status bar with CPU/Memory indicators
2. **System Monitoring**: Add real-time system resource monitoring
3. **Connection Status**: Display WebSocket and screen connection states
4. **Error Handling**: Implement comprehensive error handling across all components

### Phase 6: Polish & Premium Features
1. **Premium Feature Gates**: Implement subscription checks for Terminal, Explorer, and Editor tabs
2. **Upgrade Prompts**: Create upgrade prompts for locked premium features
3. **Dark Theme**: Fine-tune dark theme styling and visual consistency
4. **Responsive Design**: Ensure mobile-friendly interface with collapsible sidebar
5. **Performance**: Optimize tab switching and WebRTC performance
6. **Testing**: Test all features with backend integration

## UI Framework Integration and Modular Design

### Component Strategy
- **Chat Components**: Implement chat bubbles, message display, headers, and footers for conversation UI
- **Form Components**: Create form controls, labels, inputs, textareas, and selects for user interaction
- **Navigation**: Build navigation bars, drawers, and breadcrumbs for app navigation
- **Feedback**: Design alerts, toasts, modals, and loading indicators for user feedback
- **Data Display**: Develop tables, cards, collapsible sections, and timelines for information presentation
- **Actions**: Style buttons, button groups, and dropdowns for interactive elements

### Theme System Integration
- **Multi-theme Support**: Implement theme switching capability
- **Custom Theme**: Create a custom "Zenobia" theme with brand colors
- **Theme Persistence**: Save user theme preference in localStorage
- **Dynamic Theme Switching**: Allow real-time theme changes without page reload

### Modular Component Architecture
- **Component Isolation**: Each UI component is self-contained with its own styling
- **Reusable Elements**: Create common component wrappers (Button, Card, Modal, etc.)
- **Consistent Styling**: Use design tokens for consistent spacing, colors, and typography
- **Responsive Design**: Implement responsive utilities for mobile-first design

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
      <div class="message ${this.data.sender === 'user' ? 'message-user' : 'message-agent'}">
        <div class="message-avatar">
          <div class="avatar-image">
            <img src="${this.data.avatar}" alt="${this.data.sender}" />
          </div>
        </div>
        <div class="message-header">
          ${this.data.sender}
          <time class="message-time">${this.data.timestamp}</time>
        </div>
        <div class="message-content ${this.getMessageClass()}">
          ${this.data.message}
        </div>
      </div>
    `;
  }
  
  getMessageClass() {
    if (this.data.sender === 'user') return 'message-user-content';
    if (this.data.type === 'error') return 'message-error';
    if (this.data.type === 'debug') return 'message-debug';
    return 'message-agent-content';
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
- **Multi-tab Interface**: Chat, Screen, Terminal (premium), Explorer (premium), Editor (premium)
- **Real-time Chat**: Agent conversation with message filtering and autonomous mode
- **WebRTC Screen Access**: Direct interaction with localhost:6901 desktop environment
- **File Management**: View and manage agent-created files through File API integration
- **Session Management**: Create, continue, and manage AI agent sessions
- **System Monitoring**: Real-time CPU/Memory usage display in status bar
- **Premium Features**: Subscription-gated access to Terminal, Explorer, and Editor tabs

### Advanced Features
- **Debug Mode Toggle**: Show/hide verbose agent status messages and tool calls
- **Session History Navigation**: Quick access to previous sessions with timestamps
- **File Operations**: Download, delete, and organize agent-created files
- **Autonomous Mode**: Toggle between manual and autonomous agent operation
- **Screen Interaction**: Full desktop environment access through WebRTC integration
- **Premium Upgrades**: In-app prompts for unlocking Terminal, Explorer, and Editor features
- **Responsive Layout**: Collapsible sidebar and mobile-optimized interface

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
- **Debug toggle UI**: Prominent toggle switch in the status bar or settings panel
- **Visual distinction**: Different styling for debug messages using text utilities (muted colors, smaller text)
- **Performance consideration**: Limit debug message history to prevent memory issues
- **Modular components**: Each message type rendered by dedicated component modules

### User Experience Benefits
- **Clean interface**: Non-technical users see only relevant final responses
- **Developer insight**: Debug mode provides full transparency for troubleshooting
- **Flexible workflow**: Users can toggle between modes as needed
- **Better UX**: Reduces cognitive load while maintaining power user capabilities

---

This plan provides a comprehensive roadmap for building a modern, feature-rich chat application frontend that seamlessly integrates with the Zenobia backend infrastructure.