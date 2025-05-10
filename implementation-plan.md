# Implementation Plan: Making RPA Steps Editable and Creating New Sessions

## Current Functionality

Currently, the RPA upload feature in the Zenobia application has the following flow:
1. Users upload a video file for RPA analysis
2. Gemini analyzes the video and generates RPA steps
3. Users are shown the generated RPA steps in a read-only view
4. Users must select an existing browser session to execute the generated RPA steps
5. The application executes the RPA steps in the selected session

## Requested Enhancements

1. Make the Generated RPA Steps editable so users can modify them if needed
2. When users click on "Create new session", create a new session (with choice of browser or computer operator) with the RPA steps that were generated instead of requiring an existing session

## Implementation Plan

### 1. Make RPA Steps Editable

#### Changes to `VideoUpload.js` component:

Replace the read-only div displaying RPA steps:
```javascript
<div 
  className="bg-gray-100 p-4 rounded-lg max-h-64 overflow-y-auto font-mono text-sm whitespace-pre-wrap"
  dangerouslySetInnerHTML={{ __html: sanitizeSteps(analysisResult.rpaSteps) }}
/>
```

With an editable textarea:
```javascript
<textarea 
  className="bg-gray-100 p-4 rounded-lg max-h-64 overflow-y-auto font-mono text-sm whitespace-pre-wrap w-full h-64"
  value={analysisResult.rpaSteps}
  onChange={(e) => {
    setAnalysisResult({
      ...analysisResult,
      rpaSteps: e.target.value
    });
  }}
/>
```

This allows users to edit the RPA steps directly in the UI before execution.

### 2. Create New Session for RPA Execution

#### Update the Tab Name and Purpose

Rename the "Execute" tab to "Create Session" for clarity:

```javascript
<button 
  className={`py-2 px-4 ${activeTab === 'createSession' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'} ${!analysisId ? 'opacity-50 cursor-not-allowed' : ''}`}
  onClick={() => analysisId && setActiveTab('createSession')}
  disabled={!analysisId}
>
  Create Session
</button>
```

#### Update the Tab Content in `VideoUpload.js`:

Replace the session selection with operator type selection and session creation:

```javascript
{/* Create Session Tab */}
{activeTab === 'createSession' && analysisResult && (
  <div>
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Create New Session</h3>
      <p className="mb-4 text-gray-700">
        Select an operator type and click "Create New Session" to run the RPA steps:
      </p>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Operator Type
        </label>
        <select 
          value={operatorType}
          onChange={(e) => setOperatorType(e.target.value)}
          className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="browser">Browser</option>
          <option value="computer">Computer</option>
        </select>
      </div>
    </div>

    {sessionStatus && (
      <div className={`mb-6 p-4 rounded-lg ${sessionStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {sessionStatus.message}
      </div>
    )}

    <div className="flex justify-between">
      <button
        onClick={() => setActiveTab('results')}
        className="py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800"
      >
        Back to Results
      </button>
      <button
        onClick={createNewSession}
        disabled={isCreatingSession}
        className={`py-2 px-4 rounded-md text-white ${isCreatingSession ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
      >
        {isCreatingSession ? 'Creating Session...' : 'Create New Session'}
      </button>
    </div>
  </div>
)}
```

#### Add state for operator selection and session creation:

```javascript
// Add these to the existing state variables at the top of the component
const [operatorType, setOperatorType] = useState("browser");
const [isCreatingSession, setIsCreatingSession] = useState(false);
const [sessionStatus, setSessionStatus] = useState(null);

// Initialize socket outside component state
const socketRef = React.useRef(null);

// Set up socket connection when component mounts
React.useEffect(() => {
  // Clean up socket on unmount
  return () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  };
}, []);
```

#### Implement the `createNewSession` function using the existing WebSocket connection:

```javascript
const createNewSession = () => {
  if (!analysisResult || !analysisResult.rpaSteps) {
    setError('No RPA steps available to execute');
    return;
  }
  
  setIsCreatingSession(true);
  setError(null);
  
  // Initialize socket if not already created
  if (!socketRef.current) {
    socketRef.current = io(window.location.origin, {
      path: '/socket.io',
      transports: ['websocket'],
      autoConnect: true
    });
  }
  
  // Set up connect event handler
  socketRef.current.on('connect', () => {
    console.log('Connected to WebSocket server');
    
    // Create a new session with the RPA steps as instructions
    socketRef.current.emit('createSession', {
      instructions: analysisResult.rpaSteps,
      operator: operatorType
    }, (response) => {
      setIsCreatingSession(false);
      
      if (response.success && response.sessionId) {
        setSessionStatus({
          success: true,
          message: `New session created successfully! Session ID: ${response.sessionId.substring(0, 8)}...`
        });
        
        // Optionally open the main dashboard in a new tab/window
        if (confirm('Session created! Would you like to go to the main dashboard to view it?')) {
          window.open('/', '_blank');
        }
      } else {
        setSessionStatus({
          success: false,
          message: `Failed to create session: ${response.error || 'Unknown error'}`
        });
      }
    });
  });
  
  // Set up connect error handler
  socketRef.current.on('connect_error', (error) => {
    console.error('WebSocket connection error:', error);
    setIsCreatingSession(false);
    setSessionStatus({
      success: false,
      message: `Connection error: ${error.message}`
    });
  });
  
  // Connect to the socket server if not already connected
  if (!socketRef.current.connected) {
    socketRef.current.connect();
  } else {
    // If already connected, emit createSession directly
    socketRef.current.emit('createSession', {
      instructions: analysisResult.rpaSteps,
      operator: operatorType
    }, (response) => {
      setIsCreatingSession(false);
      
      if (response.success && response.sessionId) {
        setSessionStatus({
          success: true,
          message: `New session created successfully! Session ID: ${response.sessionId.substring(0, 8)}...`
        });
        
        // Optionally open the main dashboard in a new tab/window
        if (confirm('Session created! Would you like to go to the main dashboard to view it?')) {
          window.open('/', '_blank');
        }
      } else {
        setSessionStatus({
          success: false,
          message: `Failed to create session: ${response.error || 'Unknown error'}`
        });
      }
    });
  }
};
```

### 3. No Backend Changes Required!

Since we're using the existing WebSocket gateway to create sessions, we don't need to add any new endpoints or services. The existing `SessionsGateway` already implements the `createSession` functionality that we need:

```typescript
// This already exists in sessions.gateway.ts
@SubscribeMessage('createSession')
async handleCreateSession(client: Socket, payload: CreateSessionDto) {
  try {
    // Make sure this is the active client
    this.activeClientId = client.id;
    const sessionId = await this.sessionManagerService.createSession(payload);
    apiLogger.info(`Session ${sessionId} created via WebSocket by client ${client.id}`);
    
    // Get the session data
    const session = this.sessionManagerService.getSession();
    
    return { sessionId, success: true, status: session.status };
  } catch (error) {
    apiLogger.error('Failed to create session via WebSocket:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to create session' 
    };
  }
}
```

The `CreateSessionDto` already includes:
```typescript
// From sessions.dto.ts
export class CreateSessionDto {
  @IsString()
  instructions: string;
  
  @IsString()
  @IsIn(['browser', 'computer']) 
  operator: string;
}
```

This is perfect for our use case, as we can send the RPA steps as instructions directly and specify the operator type.

## Implementation Steps

1. Update the `VideoUpload.js` component:
   - Add new state variables for operator selection and session creation
   - Convert the read-only RPA steps view to an editable textarea
   - Rename the "Execute" tab to "Create Session"
   - Add operator type selection dropdown (browser or computer)
   - Implement the `createNewSession` function using WebSockets

2. Test Changes:
   - Verify that RPA steps are editable
   - Test the session creation with both browser and computer operators
   - Verify that the new session appears on the main dashboard
   - Check error handling for various edge cases

## Benefits of this Approach

1. **Reuse of Existing Code**: Uses the existing WebSocket infrastructure and session creation logic
2. **Consistency**: Creates sessions in the same way as the main dashboard, ensuring consistent behavior
3. **Minimal Changes**: Only requires frontend changes, minimizing risk
4. **User Choice**: Allows users to select their preferred operator type (browser or computer)
5. **Enhanced User Experience**: Allows users to edit RPA steps and create sessions directly

## Testing Plan

1. Test RPA Steps Editing:
   - Upload a video and verify the RPA steps are editable
   - Make changes to the steps and verify they are preserved when switching tabs
   - Verify the edited steps are used when creating a new session

2. Test New Session Creation:
   - Verify both browser and computer operator selections work
   - Verify a new session is properly created with the RPA steps as instructions
   - Confirm the session appears on the main dashboard
   - Test error handling for connection issues

3. Test User Experience:
   - Ensure the UI clearly communicates that a new session is being created
   - Verify that session creation status is properly displayed
   - Test the optional redirect to the main dashboard