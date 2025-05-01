# Zenobia Issue Tracker

## Index of Issues

1. [Dashboard Integration](#dashboard-integration)
2. [Fly Machines Implementation](#fly-machines-implementation)
3. [Browser Fixes](#browser-fixes)
4. [Session Management](#session-management)
5. [Menu Implementation](#menu-implementation)
6. [Chrome Persistence](#chrome-persistence)
7. [Pause Functionality](#pause-functionality)

---

### Dashboard Integration
**Task**: Integrate computer use system to dashboard
**Solution**: Need to create API endpoints to expose usage data and build dashboard UI components

### Fly Machines Implementation
**Task**: Use Fly Machines to create containers and assign to users, storing data in database
**Solution**: Implement Fly Machines API integration and database schema for user-container mapping

### Browser Fixes
**Task**: Fix browser implementation so VNC server recognizes Puppeteer-launched instances
**Solution**: Modify VNC configuration to detect browser processes launched via Puppeteer

### Session Management
**Task**: Add support to kill running sessions
**Solution**: Implement session tracking and termination endpoints/commands

### Menu Implementation
**Task**: Implement menus
**Solution**: Design and build menu system UI components and navigation structure

### Chrome Persistence
**Task**: Implement persistent storage for Chrome sessions and user data
**Solution**: Create storage mechanism for Chrome profile data and session state

### Pause Functionality
**Task**: Implement pause/resume functionality for running sessions
**Solution**: Add API endpoints and UI controls to pause and resume active sessions