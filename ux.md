# Iris Platform UX Design

## Core User Experience Principles

1. **AI-First Automation**: Center the experience around AI agent task execution with automatic action recording
2. **Task-to-Automation Pipeline**: Seamless conversion of one-time AI tasks into reusable automations
3. **Visual Feedback**: Provide continuous visual feedback on agent actions and automation status
4. **Human-Automation Collaboration**: Seamlessly integrate human approval/intervention points in automated processes

## Information Architecture

```
Home
├── Dashboard
├── AI Agent Task Console
│   ├── Task Creation
│   │   ├── Natural Language Input
│   │   ├── File Attachments
│   │   └── Task Configuration
│   ├── Agent Execution
│   │   ├── Browser Actions
│   │   └── System Actions
│   ├── Live View (VNC Display)
│   └── Task History
├── Recordings Library
│   ├── Recording Gallery
│   ├── Recording Details
│   └── Viewing Options
│       ├── Frame-by-Frame View with Captions
│       └── Generated MP4 Playback
├── Frame Editor
│   ├── Frame-by-Frame Navigation
│   ├── Caption Editing
│   ├── Action Parameterization
│   └── Video Regeneration
├── RPA Executions
│   ├── Execution Console
│   ├── Batch Manager
│   └── Parameter Sets Management
├── Human Layer
│   ├── Pending Approvals
│   └── Interaction Panel
└── Settings
```

## Key Screens & Components

### 1. Dashboard

A unified control center showing:

- Active AI agent tasks with live status
- Recent recordings with thumbnail previews
- Ongoing RPA executions with status indicators
- Pending human approval requests (with priority indicators)
- System status and resource usage metrics
- Quick action buttons for creating new AI agent tasks and managing recordings

### 2. AI Agent Task Console

The primary interface for creating and monitoring AI agent tasks:

#### 2.1 Task Creation

- **Natural Language Input**:
  - Conversational interface for task description
  - Intent recognition and clarification
  - Task history suggestions
  
- **File Attachments**:
  - Upload supporting documents for context
  - Link to existing data sources
  - Specify files for agent to work with

- **Task Configuration**:
  - Recording preferences (browser or system-wide recording)
  - Permission settings for agent actions
  - Timeout and resource allocation settings
  - Human approval checkpoint configuration

#### 2.2 Agent Execution

- **Live Execution View**:
  - VNC display showing real-time agent actions
  - Split view of browser and system actions when applicable
  - Action log with timestamps and descriptions
  - Progress indicators with estimated completion time
  
- **Control Panel**:
  - Pause/resume buttons for agent execution
  - Force approval request button
  - Cancel execution option
  - Highlight/flag important actions

- **Execution Insights**:
  - Real-time metrics on agent performance
  - Execution bottlenecks identification
  - Resource usage monitoring
  - Comparison to similar past tasks

#### 2.3 Recording Creation

- Automatic recording of agent actions during task execution
- Post-task recording summary with key frames
- Quick options for saving, naming, and tagging the recording
- Direct link to Frame Editor for immediate parameterization

### 3. Recordings Library

A gallery view of all recorded agent sessions:

- Visual thumbnails showing key frames from each recording
- Metadata including task name, creation date, duration, and execution count
- Filtering by recording type (browser vs. system), tags, date, and originating task
- Search functionality with preview highlights
- Quick actions for execution, frame editing, and deletion
- Dual viewing options:
  - **Frame-by-Frame View**: For detailed inspection with captions
  - **MP4 Video Playback**: For continuous visualization of the workflow

### 4. Frame Editor

A powerful tool for editing frames and captions, and parameterizing agent actions:

- Frame navigation controls with timeline visualization
- Side-by-side display of frame image and associated captions
- Caption editor with rich formatting options
- **Parameterization Interface**:
  - Visual highlighting of parameterizable fields in agent actions
  - Parameter naming and type definition
  - Default value configuration
  - Parameter set management

- Frame manipulation tools:
  - Delete/insert frames
  - Reorder frames
  - Adjust timing
  - Regenerate video after edits

### 5. Execution Console

A real-time monitoring interface for active RPA executions based on recorded agent tasks:

- Live view of automation in progress (VNC display)
- Step progression indicators with timing data
- Log panel with filterable events
- Controls for pause, resume, and cancel
- Exception handling interface for when automation encounters issues
- Split screen option to compare with original recording

### 6. Parameter Sets Management

A comprehensive interface for managing parameter sets for parameterized recordings:

- Table view of parameter sets with filtering and sorting
- Form-based editor for individual parameter sets
- Batch parameter import/export (CSV/Excel)
- Parameter validation with intelligent suggestions
- Template saving and management
- Quick launch to batch execution

### 8. Human Layer Interaction Panel

A dedicated interface for human-in-the-loop workflows:

- Priority-sorted approval requests from both live agent tasks and RPA executions
- Context-rich information for decision making
- Visual comparison between current state and expected state
- Quick approve/reject/modify actions
- Annotation capabilities for feedback
- History of past interactions with searchable logs

## Interaction Design Patterns

### AI Agent Task-to-Recording Flow

1. User creates a new AI agent task with natural language description
2. User optionally attaches relevant files and configures recording preferences
3. System initiates agent execution with WebSocket-based session
4. System provides live VNC display of agent actions
5. Agent performs actions (browser or system) with automatic recording
6. User can observe, pause, or intervene if needed
7. Upon task completion, system automatically generates a recording
8. User reviews recording summary, names it, and decides to save or discard
9. User can immediately proceed to Frame Editor for parameterization

### Frame Editing Flow

1. User selects a recording from completed agent tasks
2. System loads the frame-by-frame view with associated captions
3. User navigates through frames using timeline or controls
4. User can:
   - Edit captions for clarity or accuracy
   - Delete unnecessary frames
   - Parameterize input fields or target elements
   - Highlight important agent actions
5. User saves changes to frame sequence
6. System regenerates the MP4 video based on edits

### RPA Execution Flow

1. User selects a parameterized recording to execute as RPA
2. System prompts for parameter values or sets
3. User initiates execution through WebSocket
4. System provides real-time visualization and progress through VNC display
5. If human intervention is needed, system pauses and notifies
6. User provides necessary input/approval
7. System continues execution to completion
8. Results and metrics are presented

## Visual Design Elements

### Layout

- Clean, uncluttered workspace focused on visual representation of agent actions
- Consistent grid system with responsive design
- Collapsible panels for detailed information
- Split-screen capability for comparison views
- WebSocket status indicators for real-time connection health

### Components

- Custom timeline visualization for agent actions and recordings
- Card-based UI for tasks, recordings, and executions
- Progress indicators with detailed step information
- Toast notifications for system events and WebSocket status
- Modal dialogs for approvals and confirmations
- VNC display component with overlay controls
- Natural language input with AI assistance