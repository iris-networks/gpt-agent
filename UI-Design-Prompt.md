# Zenobia: AI-Powered RPA Platform UI Development

## Technology Stack

### Core Technologies
- **Remix**: Full-stack React framework with optimized data loading
- **TypeScript**: For type safety and improved developer experience
- **ZenStack**: For schema design and access control / user management

### UI & State Management
- **Shadcn/UI**: Component library (ported to Remix)
- **Scalar-inspired design system**: For consistent UI matching Scalar's theme
- **TanStack Query**: For data fetching within Remix
- **Zustand**: For client-side state management
- **Zod**: For schema validation
- **Tailwind CSS**: For styling
- **Lucide Icons**: Icon library (no custom SVG/PNG creation)
- **Recharts**: For data visualization charts

### Real-time Communication
- **Socket.IO**: For WebSocket implementation

## Project Overview

Zenobia is a next-generation Robotic Process Automation (RPA) platform that leverages AI agents to automate complex tasks. Unlike traditional RPA tools that require manual recording of actions, Zenobia enables two revolutionary approaches:

1. **AI Agent Automation**: Users simply describe what they want to accomplish in natural language, and our AI agents autonomously navigate and interact with interfaces to complete the task.

2. **Video-Based Learning**: Users can upload videos of tasks being performed, and our system automatically extracts the steps, which AI agents can then execute precisely.

The platform supports two automation contexts that users can easily toggle between:

- **Computer Operator**: Control the entire operating system, including desktop applications, file systems, and system utilities
- **Browser Operator**: Specialized control of web browsers for navigating websites and web applications

All agent actions are captured with screenshots and explanatory captions, creating detailed recordings for review or reuse.

## Why This Matters

Current RPA solutions require technical expertise to create automation scripts, often involving manual step recording, programming, and complex configuration. Zenobia dramatically simplifies this process by:

- Eliminating the need for manual recording of steps
- Allowing natural language instructions instead of programming
- Learning from existing video demonstrations
- Providing simple operator selection for computer-wide or browser-specific automation
- Creating editable, parameterizable automations
- Enabling non-technical users to automate complex workflows

## The UI Challenge

We need to build a comprehensive frontend application that makes this AI-powered automation accessible and intuitive. The UI must allow users to:

1. Provide instructions to AI agents and monitor their progress
2. Toggle between computer and browser operators with a simple selector
3. Upload videos for analysis and review extracted steps
4. Manage, edit, and refine automation recordings
5. Parameterize automations for dynamic inputs
6. Execute automations individually or in batches
7. Review and analyze results

This interface needs to balance power and simplicity, catering to both technical RPA developers and business users who may have limited technical expertise.

## Core UI Flows to Build

### 1. Dashboard & Navigation Flow

**Purpose**: Provide a central command center for the platform

**User Experience Requirements**:
- Clear overview of system status, recent activities, and available resources
- Intuitive navigation between all platform features
- Customizable widgets showing key metrics and statuses
- Quick access to recent recordings and sessions
- Notification center for system alerts and updates

**Key Screens**:
- Main dashboard with activity cards and metrics
- Global navigation system with contextual options
- Settings and configuration interfaces
- User profile and preferences management

### 2. Agent Instruction Flow

**Purpose**: Enable users to instruct AI agents and monitor their execution

**User Experience Requirements**:
- Simple interface for providing natural language instructions
- Prominent operator toggle (Computer/Browser) for selecting automation context
- Guided configuration of operating environments
- Real-time visibility into agent actions with visual feedback
- Clear status indicators and progress updates
- Ability to pause, resume, or cancel agent operations
- Option to save completed sessions as reusable recordings

**Key Screens**:
- Operator type toggle (prominent computer/browser selector)
- Instruction editor with guidelines and templates
- Environment configuration panel with context-specific options
- Real-time execution monitor showing:
  - Live screenshots of agent activity
  - Current step and action being performed
  - Historical steps with timestamps
  - Status and progress indicators
- Session results summary with statistics and insights
- Save/export options with metadata input

### 3. Video Processing Flow

**Purpose**: Transform video demonstrations into executable automation steps

**User Experience Requirements**:
- Simple, reliable video upload with progress feedback
- Operator toggle to specify whether the video shows computer or browser actions
- Clear visualization of the video analysis process
- Intuitive review of extracted steps with confidence scores
- Ability to edit, correct, or enhance extracted steps
- Option to execute the extracted steps immediately or save for later
- Results comparison between video and execution

**Key Screens**:
- Video upload interface with drag-drop support
- Operator type toggle for proper step extraction
- Processing status display with progress indicators
- Step extraction results showing:
  - Timeline of identified actions
  - Screenshots for each action point
  - Extracted action metadata (clicks, typing, navigation, system interactions)
  - Confidence scores for extracted actions
- Step editor/refinement interface
- Execution options panel
- Results comparison view

### 4. Recording Management Flow

**Purpose**: Organize, browse, and manage automation recordings

**User Experience Requirements**:
- Comprehensive library of recordings with filtering and search
- Clear designation of computer vs. browser operator recordings
- Rich metadata display for quick identification
- Playback capabilities with various speed options
- Intuitive navigation between recordings
- Organization features (tags, folders, favorites)
- Sharing and collaboration capabilities

**Key Screens**:
- Recordings library with grid/list views and filtering by operator type
- Recording details page showing:
  - Operator type (computer/browser)
  - Metadata (creation date, duration, step count)
  - Performance metrics
  - Usage history
  - Related recordings
- Video player with timeline navigation
- Frame-by-frame browser
- Organization tools (tagging, categorization)
- Sharing/export interface

### 5. Frame Editing Flow

**Purpose**: Edit and refine the details of automation recordings

**User Experience Requirements**:
- Frame-by-frame navigation through recordings
- Ability to edit captions and action descriptions
- Tools to modify action parameters (coordinates, text input, system commands)
- Interface to add, remove, or reorder frames
- Side-by-side comparison of before/after edits
- Preview of edited recording

**Key Screens**:
- Sequential frame browser with thumbnail navigation
- Caption editor with formatting options
- Action editor for modifying parameters based on operator type:
  - For computer operator: system commands, application interactions, file operations
  - For browser operator: click positions, text inputs, navigation targets
- Frame management tools
- Before/after comparison view
- Regeneration controls for updated video

### 6. Parameterization Flow

**Purpose**: Transform static recordings into dynamic, reusable automations

**User Experience Requirements**:
- Intuitive identification of parameterizable elements
- Support for parameters in both computer and browser contexts
- Simple process for defining parameters and their properties
- Ability to set validation rules and default values
- Testing interface for parameter variations
- Template creation for standardization
- Parameter set management for batch operations

**Key Screens**:
- Recording analyzer highlighting parameterizable elements
- Parameter definition interface showing:
  - Name, type, and description fields
  - Validation rule configuration
  - Default value settings
  - Context-specific options based on operator type
- Parameter test bench
- Template configuration panel
- Parameter set creation and management
- Execution preview with parameter substitution

### 7. Batch Execution Flow

**Purpose**: Execute multiple automations with different parameter sets

**User Experience Requirements**:
- Clear setup process for batch operations
- Ability to select multiple recordings and/or parameter sets
- Support for mixing computer and browser automations in batches
- Configuration of execution parameters (timing, error handling)
- Real-time monitoring of multiple concurrent executions
- Comprehensive results aggregation and analysis
- Export capabilities for batch results

**Key Screens**:
- Batch operation designer
- Recording/parameter matrix selection
- Execution configuration panel with options:
  - Automation environment settings
  - Concurrency settings
  - Error handling policies
  - Notification preferences
- Multi-execution monitoring dashboard
- Results summary with filtering and aggregation
- Detailed execution logs
- Export and reporting tools

## Essential UI Components

### Core Components

- **Operator Toggle**: Prominent control to switch between computer and browser modes
- **Instruction Editor**: Rich text editor with templates and guidance
- **Agent Monitor**: Real-time visualization of agent activity
- **Video Uploader**: Drag-drop interface with progress tracking
- **Recording Browser**: Grid/list view of automation recordings
- **Video Player**: Custom player with timeline and action markers
- **Frame Navigator**: Interface for browsing recording frames
- **Step Visualizer**: Interactive view of automation steps
- **Parameter Designer**: Interface for creating and managing variables
- **Batch Configurator**: Matrix view for batch execution setup
- **Execution Dashboard**: Real-time monitoring of automations

### Supporting Components

- **Navigation System**: Consistent, context-aware navigation
- **Dashboard Widgets**: Customizable information panels
- **Notification Center**: System for alerts and updates
- **Timeline Visualizer**: Chronological view of steps/actions
- **Comparison Viewer**: Side-by-side comparison of recordings/frames
- **Results Analyzer**: Tools for reviewing execution outcomes
- **Export Tools**: Interfaces for saving and sharing data
- **Environment Configuration**: Settings for computer and browser environments

## WebSocket Implementation

Zenobia uses WebSockets for real-time communication between the frontend and backend, particularly for session management and live agent monitoring. The implementation should follow these specifications:

### WebSocket Architecture

1. **Connection Management**:
   - Connect to the WebSocket server when the application initializes
   - Implement reconnection logic with exponential backoff
   - Handle connection state transitions with clear UI feedback

2. **Event System**:
   - Two primary event types: `sessionUpdate` and `sessionError`
   - Events include session ID, status, and relevant payload data
   - Implement typed event handlers for all event types

3. **WebSocket Actions**:
   - `createSession`: Initiate a new agent session with instructions and operator type
   - `joinSession`: Subscribe to updates for a specific session
   - `leaveSession`: Unsubscribe from a session
   - `cancelSession`: Stop an active session
   - `takeScreenshot`: Request a current screenshot from an active session

### Implementation Requirements

```typescript
// Example WebSocket service structure
class WebSocketService {
  // Connection management
  connect(): void;
  disconnect(): void;
  getConnectionStatus(): ConnectionStatus;
  
  // Event listeners
  onSessionUpdate(callback: (event: SessionUpdateEvent) => void): void;
  onSessionError(callback: (event: SessionErrorEvent) => void): void;
  
  // Actions
  createSession(instructions: string, operatorType: 'computer' | 'browser'): Promise<SessionResponse>;
  joinSession(sessionId: string): Promise<JoinSessionResponse>;
  leaveSession(): Promise<SuccessResponse>;
  cancelSession(sessionId: string): Promise<SuccessResponse>;
  takeScreenshot(): Promise<ScreenshotResponse>;
}

// Event types
interface SessionUpdateEvent {
  sessionId: string;
  status: SessionStatus; // 'initializing' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled'
  conversations?: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: number;
  }>;
  errorMsg?: string;
}

interface SessionErrorEvent {
  sessionId: string;
  error: string;
  status?: SessionStatus;
}
```

### UI Integration

1. **Connection Status Indicator**:
   - Persistent indicator showing WebSocket connection status
   - Visual feedback for connecting, connected, disconnected states
   - Automatic reconnection with progress indication

2. **Session Monitoring**:
   - Real-time updates of agent activity without page refreshes
   - Immediate reflection of state changes in UI (status, progress)
   - Streaming of conversation updates and screenshots

3. **Error Handling**:
   - Graceful degradation when WebSocket is unavailable
   - Clear error messaging for connection failures
   - Fallback to polling for critical functionality

