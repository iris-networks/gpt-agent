# Fly Machines Implementation

## Task
Use Fly Machines to create new containers and assign them to users, storing this data in the database.

## Solution Approach
1. Implement Fly Machines API integration for container provisioning
2. Design database schema for user-container mapping
3. Create user assignment logic and authentication layer
4. Implement container lifecycle management

## User-Machine Allocation
1. **One-to-One Mapping**: Each user gets their own dedicated Fly Machine
2. **Authentication**: JWT tokens for user identification
3. **Resource Isolation**: Separate VNC sessions per machine
4. **Auto-Provisioning**: Machines created on first user login
5. **Cleanup Policy**: Inactive machines automatically terminated after timeout

## Dependencies
- Fly Machines API access
- Database connection

## Estimated Complexity: High