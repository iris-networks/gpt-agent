# BrowserWise Agent Build Documentation

> Always refer to the `./typescript/docs` folder for detailed implementation guidelines.

## Core Requirements

1. **Framework**: Build using ElysiaJS for the backend server
2. **Agent Implementation**: 
   - Implement a computer-use agent based on the i-am-bee framework
   - Ensure cross-platform compatibility (macOS, Linux, and other operating systems)
   - Configure necessary tools based on agent requirements

3. **Real-time Communication**:
   - Implement WebSocket support for bidirectional communication with the agent

4. **User Experience**:
   - Support interruption of ongoing agent tasks
   - Implement graceful cancellation of operations
   - Provide clear status updates during long-running processes

5. **Code Quality**:
   - Maintain clean, modular code architecture
   - Keep file sizes manageable (<500 lines per file recommended)
   - Implement comprehensive error handling
   - Follow consistent naming conventions

6. **Tool Management**:
   - Implement timeouts for all external tool operations
   - Add retry mechanisms with exponential backoff
   - Provide detailed logging for tool execution

## Architecture Overview

The system consists of three primary agent types, each with specialized tools:

### 1. Planning Agent

- **Task Decomposition Engine**: Breaks down complex requests into manageable subtasks
- **Dependency Analyzer**: Identifies relationships between tasks and their prerequisites
- **Strategy Optimizer**: Determines the most efficient approach to completing tasks
- **Resource Estimator**: Predicts the computational and time resources needed
- **Context Manager**: Maintains project state and requirements across planning sessions
- **Priority Scheduler**: Orders tasks based on dependencies and importance

### 2. System Interface Agent (Mouse/Keyboard Navigation)

- **Screen Analyzer**: Recognizes UI elements and their state
- **Element Locator**: Finds specific elements on screen by visual characteristics
- **Mouse Controller**: Precise movement and click operations
- **Keyboard Controller**: Text input and shortcut execution
- **Navigation Mapper**: Creates efficient paths for moving between UI elements
- **State Observer**: Monitors system response to interactions
- **Event Handler**: Responds to popups, alerts, and unexpected UI changes

### 3. Code Writer and Execution Agent

- **Code Generator**: Creates executable code based on planning specifications
- **Claude Code CLI Interface**: Direct integration with Claude Code for execution / liniting etc ...
