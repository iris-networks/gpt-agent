const { useState, useEffect, useRef } = React;

function App() {
  const [operatorType, setOperatorType] = useState("computer");
  const [instruction, setInstruction] = useState("");
  const [isWidgetOpen, setIsWidgetOpen] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const [sessionStatus, setSessionStatus] = useState('initializing');
  const [loading, setLoading] = useState(false);
  const [vncUrl, setVncUrl] = useState("");
  const [showVncPrompt, setShowVncPrompt] = useState(true);
  const [tempVncUrl, setTempVncUrl] = useState("http://localhost:6901?password=SecurePassword123&resize=scale&autoconnect=true");
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  // New state for videos
  const [videoData, setVideoData] = useState(null);
  const [showRecordingsList, setShowRecordingsList] = useState(false);
  const [selectedRecordingId, setSelectedRecordingId] = useState(null);

  // File upload state
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showFileUploadPanel, setShowFileUploadPanel] = useState(false);
  const [fileUploadStatus, setFileUploadStatus] = useState(null);
  
  // Use refs to access current state values in socket callbacks
  const sessionIdRef = useRef(null);
  
  // Keep the ref in sync with the state
  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);
  
  // Load VNC URL from localStorage on component mount
  useEffect(() => {
    const savedVncUrl = localStorage.getItem('vncUrl');
    if (savedVncUrl) {
      setVncUrl(savedVncUrl);
      setShowVncPrompt(false);
    }
  }, []);
  
  // Initialize WebSocket connection
  // Fetch uploaded files
  useEffect(() => {
    fetchFiles();
  }, []);

  // Function to fetch available files
  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/files');
      if (response.ok) {
        const data = await response.json();
        setFiles(data);
      } else {
        console.error('Failed to fetch files');
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  // Function to handle file upload
  const handleFileUpload = async (e) => {
    e.preventDefault();

    const fileInput = document.getElementById('fileInput');
    if (!fileInput.files.length) {
      setFileUploadStatus({
        type: 'error',
        message: 'Please select a file first'
      });
      return;
    }

    try {
      setLoading(true);
      setFileUploadStatus(null);

      // Upload each file individually
      const uploadedFiles = [];

      for (const file of fileInput.files) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/files/upload', {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          const result = await response.json();
          uploadedFiles.push(result);
        } else {
          const error = await response.text();
          throw new Error(`Error uploading ${file.name}: ${error}`);
        }
      }

      // Update file list after upload
      fetchFiles();

      // Clear file input
      fileInput.value = '';

      setFileUploadStatus({
        type: 'success',
        message: `Successfully uploaded ${uploadedFiles.length} files`
      });
    } catch (error) {
      setFileUploadStatus({
        type: 'error',
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to select/deselect a file for the session
  const toggleFileSelection = (file) => {
    const isSelected = selectedFiles.some(f => f.fileId === file.fileId);

    if (isSelected) {
      setSelectedFiles(selectedFiles.filter(f => f.fileId !== file.fileId));
    } else {
      setSelectedFiles([...selectedFiles, file]);
    }
  };

  useEffect(() => {
    // Initialize Socket.io connection
    const newSocket = io(window.location.origin, {
      path: '/socket.io',
      transports: ['websocket'],
      autoConnect: true
    });
    
    // Connection events
    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      setConnected(true);
      
      // Update the connection indicator
      const socketBulb = document.getElementById('socket-bulb');
      const socketStatusText = document.getElementById('socket-status');
      if (socketBulb) socketBulb.className = 'w-3 h-3 rounded-full bg-green-500';
      if (socketStatusText) socketStatusText.textContent = 'Connected';
    });
    
    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setConnected(false);
      
      // Update the connection indicator
      const socketBulb = document.getElementById('socket-bulb');
      const socketStatusText = document.getElementById('socket-status');
      if (socketBulb) socketBulb.className = 'w-3 h-3 rounded-full bg-red-500';
      if (socketStatusText) socketStatusText.textContent = 'Disconnected';
    });
    
    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setConnected(false);
      
      // Update the connection indicator
      const socketBulb = document.getElementById('socket-bulb');
      const socketStatusText = document.getElementById('socket-status');
      if (socketBulb) socketBulb.className = 'w-3 h-3 rounded-full bg-red-500 pulse';
      if (socketStatusText) socketStatusText.textContent = 'Connection Error';
    });
    
    // Session-specific events
    newSocket.on('sessionUpdate', (data) => {
      console.log('Session update received:', data);
      
      // Use ref to get the current sessionId
      const currentSessionId = sessionIdRef.current;
      
      // If we have a sessionId and it matches the received data
      if (currentSessionId && data.sessionId === currentSessionId) {
        // console.log(`Updating session status from ${sessionStatus} to ${data.status}`); // sessionStatus here is stale
        setSessionStatus(data.status);
        
        // Clear loading state when receiving terminal states
        if (['completed', 'error', 'cancelled', 'failed'].includes(data.status)) {
          setLoading(false);
        }
      } else {
        console.log(`Received data for session ${data.sessionId}, but current session is ${currentSessionId}`);
      }
    });
    
    newSocket.on('sessionError', (data) => {
      console.error('Session error received:', data);
      
      // Use ref to get the current sessionId
      const currentSessionId = sessionIdRef.current;
      
      if (currentSessionId && data.sessionId === currentSessionId) {
        setSessionStatus('error');
        // Always clear loading state on error
        setLoading(false);
      }
    });
    
    setSocket(newSocket);
    
    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);
  
  // Register session update listener when sessionId changes
  useEffect(() => {
    if (!socket || !sessionId) return;
    
    // Join the session to receive updates
    socket.emit('joinSession', sessionId, (response) => {
      console.log('Join session response:', response);
      if (response.success && response.session) {
        setSessionStatus(response.session.status);
      }
    });
    
  }, [socket, sessionId]);
  
  const createSession = () => {
    if (!instruction.trim()) {
      alert("Please enter instructions");
      return;
    }
    
    if (!socket || !connected) {
      alert("WebSocket not connected. Please refresh the page.");
      return;
    }
    
    setLoading(true);
    
    // Safety timeout to clear loading state after 60 seconds
    // in case WebSocket responses don't come back
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 60000);
    
    // Check if there's an active session that can be interrupted
    const canInterruptSession = sessionId && ['initializing', 'running', 'paused'].includes(sessionStatus);
    
    if (canInterruptSession) {
      // Show confirmation dialog for interruption
      if (confirm("Do you want to interrupt the current session and continue with new instructions?")) {
        // Use WebSocket to interrupt the current session with new instructions
        socket.emit('createSession', {
          instructions: instruction,
          operator: operatorType,
          files: selectedFiles
        }, (response) => {
          setLoading(false);
          clearTimeout(safetyTimeout);
          
          if (response.success && response.sessionId) {
            const newSessionId = response.sessionId;
            
            // Set the session ID
            setSessionId(newSessionId);
            setSessionStatus(response.status || 'initializing');
            setInstruction("");
            setIsWidgetOpen(false);
            
            // Explicitly join the session we just created/updated
            console.log(`Joining session ${newSessionId} after update`);
            socket.emit('joinSession', newSessionId, (joinResponse) => {
              console.log('Join session response after update:', joinResponse);
            });
          } else {
            console.error("Error updating session:", response.error);
            alert("Failed to update session: " + (response.error || "Unknown error"));
          }
        });
      } else {
        // User canceled interruption
        setLoading(false);
        clearTimeout(safetyTimeout);
      }
    } else {
      // Create a new session (no active session to interrupt)
      socket.emit('createSession', {
        instructions: instruction,
        operator: operatorType,
        files: selectedFiles
      }, (response) => {
        setLoading(false);
        clearTimeout(safetyTimeout);
        
        if (response.success && response.sessionId) {
          const newSessionId = response.sessionId;
          
          // Set the session ID
          setSessionId(newSessionId);
          setSessionStatus('initializing');
          setInstruction("");
          setIsWidgetOpen(false);
          
          // Explicitly join the session we just created
          console.log(`Joining session ${newSessionId} after creation`);
          socket.emit('joinSession', newSessionId, (joinResponse) => {
            console.log('Join session response after creation:', joinResponse);
          });
        } else {
          console.error("Error creating session:", response.error);
          alert("Failed to create session: " + (response.error || "Unknown error"));
        }
      });
    }
  };
  
  const cancelSession = () => {
    if (!sessionId) return;
    
    if (!socket || !connected) {
      alert("WebSocket not connected. Please refresh the page.");
      return;
    }
    
    setLoading(true);
    
    // Safety timeout to clear loading state after 15 seconds
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 15000);
    
    // Use WebSocket to cancel session
    socket.emit('cancelSession', sessionId, (response) => {
      setLoading(false);
      clearTimeout(safetyTimeout);
      
      if (response.success) {
        setSessionStatus('cancelled');
      } else {
        console.error("Error cancelling session:", response.error);
        alert("Failed to cancel session: " + (response.error || "Unknown error"));
      }
    });
  };

  const takeScreenshot = () => {
    if (!sessionId) return;
    
    if (!socket || !connected) {
      alert("WebSocket not connected. Please refresh the page.");
      return;
    }
    
    setLoading(true);
    
    // Safety timeout to clear loading state after 15 seconds
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 15000);
    
    // Use WebSocket to take screenshot
    socket.emit('takeScreenshot', sessionId, (response) => {
      setLoading(false);
      clearTimeout(safetyTimeout);
      
      if (response.success && response.screenshot) {
        // Open screenshot in new tab
        const newTab = window.open();
        newTab.document.write(`<img src="data:image/png;base64,${response.screenshot}" alt="Screenshot" />`);
      } else {
        console.error("Error taking screenshot:", response.error);
        alert("Failed to take screenshot: " + (response.error || "Unknown error"));
      }
    });
  };
  
  const resetSession = () => {
    setSessionId(null);
    setSessionStatus(null); // Changed from 'initializing' to null for clarity
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'initializing': return 'bg-yellow-500';
      case 'running': return 'bg-green-500';
      case 'paused': return 'bg-blue-500';
      case 'completed': return 'bg-green-700';
      case 'error': return 'bg-red-500';
      case 'cancelled': return 'bg-gray-500';
      case 'failed': return 'bg-red-700';
      default: return 'bg-gray-300';
    }
  };
  
  const submitVncUrl = () => {
    if (tempVncUrl.trim()) {
      setVncUrl(tempVncUrl);
      // Save to localStorage
      localStorage.setItem('vncUrl', tempVncUrl);
      setShowVncPrompt(false);
    } else {
      alert("Please enter a valid VNC URL");
    }
  };
  
  // Add function to fetch video data for current session via HTTP
  const fetchVideoData = async () => {
    if (!sessionId) {
      alert("No active session");
      return;
    }
    
    try {
      setLoading(true);
      
      // Safety timeout to clear loading state after 20 seconds
      const safetyTimeout = setTimeout(() => {
        setLoading(false);
        console.warn("Safety timeout triggered while fetching video data");
      }, 20000);
      
      const response = await fetch('/api/videos/current-session/video-data');
      const data = await response.json();
      
      clearTimeout(safetyTimeout);
      
      if (data.success && data.videoData) {
        setVideoData(data.videoData);
        setSelectedRecordingId(null); // Indicate this is current session
      } else {
        alert("Failed to get video data: " + (data.error || "No screenshots available"));
      }
    } catch (error) {
      alert("Error fetching video data: " + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Add button to access RPA Video Upload component
  const showRpaUpload = () => {
    // Open RPA Video Upload in new tab
    window.open('/rpa-upload.html', '_blank');
  };
  
  // Add function to fetch recording data via HTTP
  const fetchRecording = async (recordingId) => {
    try {
      setLoading(true);
      
      // Safety timeout to clear loading state after 30 seconds
      const safetyTimeout = setTimeout(() => {
        setLoading(false);
        console.warn("Safety timeout triggered while fetching recording data");
      }, 30000);
      
      // First, get metadata
      const metaResponse = await fetch(`/api/videos/${recordingId}`);
      const metaData = await metaResponse.json();
      
      if (!metaData.success) {
        clearTimeout(safetyTimeout);
        alert("Failed to get recording metadata: " + (metaData.error || "Unknown error"));
        setLoading(false);
        return;
      }
      
      // Get frames
      const framesResponse = await fetch(`/api/videos/${recordingId}/video-data`);
      
      // For debugging
      console.log('Frames API response status:', framesResponse.status);
      console.log('Frames API response content type:', framesResponse.headers.get('content-type'));
      
      let framesData;
      try {
        const framesText = await framesResponse.text();
        console.log('Frames API response text (first 100 chars):', framesText.substring(0, 100));
        
        // Parse the JSON
        const data = JSON.parse(framesText);
        
        // Check success flag
        if (data.success) {
          framesData = data.replayData;
        } else {
          throw new Error(data.error || "Failed to get recording frames");
        }
      } catch (parseError) {
        console.error('Error parsing frames response:', parseError);
        clearTimeout(safetyTimeout);
        throw new Error('Invalid response format from server');
      }
      
      clearTimeout(safetyTimeout);
      
      setVideoData({
        frames: framesData.frames,
        captions: framesData.captions,
        metadata: metaData.recording
      });
      setSelectedRecordingId(recordingId);
    } catch (error) {
      alert("Error fetching recording: " + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Add function to save current session as recording via HTTP
  const saveSessionAsRecording = async () => {
    if (!sessionId) {
      alert("No active session");
      return;
    }
    
    try {
      setLoading(true);
      
      // Safety timeout to clear loading state after 30 seconds
      const safetyTimeout = setTimeout(() => {
        setLoading(false);
        console.warn("Safety timeout triggered while saving recording");
      }, 30000);
      
      const response = await fetch('/api/videos/save-current-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      clearTimeout(safetyTimeout);
      
      if (data.success && data.recording) {
        alert(`Recording saved: ${data.recording.title}`);
      } else {
        alert("Failed to save recording: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      alert("Error saving recording: " + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle recording selection from list
  const handleSelectRecording = (recordingId) => {
    setShowRecordingsList(false);
    fetchRecording(recordingId);
  };
  
  return (
    <div className="h-full flex flex-col">
      {/* VNC URL Prompt Modal */}
      {showVncPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96 max-w-full">
            <h2 className="text-xl font-bold mb-4">Enter VNC URL</h2>
            <p className="text-gray-600 mb-4">Please enter the VNC URL to connect to your remote session.</p>
            
            <div className="mb-4">
              <input
                type="text"
                value={tempVncUrl}
                onChange={(e) => setTempVncUrl(e.target.value)}
                placeholder="Enter VNC URL"
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <button
              onClick={submitVncUrl}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Connect
            </button>
          </div>
        </div>
      )}
      
      {/* Recordings List Modal */}
      {showRecordingsList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-3/4 max-h-3/4 overflow-auto">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">Session Recordings</h2>
              <button 
                onClick={() => setShowRecordingsList(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
            
            <RecordingsList onSelectRecording={handleSelectRecording} />
          </div>
        </div>
      )}
      
      {/* Video Player Modal */}
      {videoData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-3/4 max-h-3/4 overflow-auto">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">
                {videoData.metadata ? videoData.metadata.title : "Current Session Recording"}
              </h2>
              <button 
                onClick={() => {
                  setVideoData(null);
                  setSelectedRecordingId(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
            
            <VideoPlayer 
              frames={videoData.frames} 
              captions={videoData.captions} 
            />
            
            {/* Only show save button for current session */}
            {!selectedRecordingId && videoData.frames && videoData.frames.length > 0 && (
              <div className="mt-4">
                <button
                  onClick={saveSessionAsRecording}
                  className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save as Recording"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* VNC iframe taking full height */}
      <div className="flex-grow">
        {vncUrl ? (
          <iframe 
            src={vncUrl} 
            className="w-full h-full border-0"
            title="VNC Viewer"
          ></iframe>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <p className="text-gray-500">Waiting for VNC URL...</p>
          </div>
        )}
      </div>
      
      {/* Floating widget toggle button */}
      <button 
        onClick={() => setIsWidgetOpen(!isWidgetOpen)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 z-50"
      >
        {isWidgetOpen ? "×" : "+"}
      </button>
      
      {/* Video Controls and Recordings Button - Simplified UI */}
      <div className="fixed bottom-6 right-20 z-40 flex gap-2">
        {sessionId && (
          <button
            onClick={fetchVideoData}
            disabled={loading}
            className="bg-purple-600 text-white px-3 py-1 rounded-md shadow-md hover:bg-purple-700 disabled:bg-purple-400"
            title="View Current Session Recording"
          >
            View Session Recording
          </button>
        )}
        
        <button
          onClick={() => setShowRecordingsList(true)}
          disabled={loading}
          className="bg-blue-600 text-white px-3 py-1 rounded-md shadow-md hover:bg-blue-700 disabled:bg-blue-400"
          title="View Saved Recordings"
        >
          All Recordings
        </button>
        
        <button
          onClick={showRpaUpload}
          className="bg-green-600 text-white px-3 py-1 rounded-md shadow-md hover:bg-green-700"
          title="RPA Video Upload"
        >
          RPA Automation
        </button>
      </div>
      
      {/* Session status indicator */}
      {sessionId && (
        <div className="fixed top-6 right-6 bg-white p-2 rounded-lg shadow-lg z-40 flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${getStatusColor(sessionStatus)}`}></div>
          <span className="text-sm font-medium">
            Session: {sessionStatus || 'unknown'} (ID: {sessionId.substring(sessionId.length - 4)})
          </span>
          
          <div className="ml-4 flex gap-2">
            <button
              onClick={takeScreenshot}
              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
            >
              Screenshot
            </button>
            
            {['initializing', 'running', 'paused', 'failed'].includes(sessionStatus) && (
              <button
                onClick={cancelSession}
                className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                disabled={loading}
              >
                Cancel
              </button>
            )}
            
            {['completed', 'error', 'cancelled', 'failed'].includes(sessionStatus) && (
              <button
                onClick={resetSession}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Floating widget */}
      {isWidgetOpen && (
        <div className="fixed bottom-20 right-6 bg-white p-4 rounded-lg shadow-lg w-80 z-40">
          <h3 className="text-lg font-semibold mb-4">Create Session</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              VNC URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={vncUrl}
                onChange={(e) => {
                  const newUrl = e.target.value;
                  setVncUrl(newUrl);
                  // Save to localStorage when changed from the widget
                  localStorage.setItem('vncUrl', newUrl);
                }}
                placeholder="Enter VNC URL"
                className="flex-grow p-2 border rounded-md"
              />
              <button
                onClick={() => setShowVncPrompt(true)}
                className="bg-gray-200 text-gray-700 p-2 rounded-md hover:bg-gray-300 flex items-center justify-center"
                title="Change VNC URL"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Operator Type
            </label>
            <select 
              value={operatorType}
              onChange={(e) => setOperatorType(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="browser">Browser</option>
              <option value="computer">Computer</option> {/* Removed selected attribute, rely on useState default */}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instructions
            </label>
            <textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="Enter instructions for the AI agent..."
              className="w-full p-2 border rounded-md h-24"
            ></textarea>
          </div>
          
          {/* File upload and selection section */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                File Attachments
              </label>
              <button
                onClick={() => setShowFileUploadPanel(!showFileUploadPanel)}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
              >
                {showFileUploadPanel ? "Hide Upload" : "Show Upload"}
              </button>
            </div>

            {/* File upload panel */}
            {showFileUploadPanel && (
              <div className="mb-3 p-3 border rounded-md bg-gray-50">
                <form onSubmit={handleFileUpload} className="mb-2">
                  <div className="flex gap-2">
                    <input
                      type="file"
                      id="fileInput"
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-blue-600 text-white py-1 px-3 rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
                    >
                      Upload
                    </button>
                  </div>
                </form>

                {fileUploadStatus && (
                  <div className={`text-sm p-2 rounded ${fileUploadStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {fileUploadStatus.message}
                  </div>
                )}
              </div>
            )}

            {/* Selected files list */}
            <div className="max-h-32 overflow-y-auto mb-2 border rounded-md p-2">
              {selectedFiles.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {selectedFiles.map(file => (
                    <li key={file.fileId} className="py-1 flex justify-between items-center">
                      <span className="text-sm truncate flex-1">{file.fileName}</span>
                      <button
                        onClick={() => toggleFileSelection(file)}
                        className="text-xs bg-red-100 text-red-700 px-1 py-0.5 rounded hover:bg-red-200 ml-2"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic">No files selected</p>
              )}
            </div>

            {/* Available files */}
            <div className="max-h-32 overflow-y-auto border rounded-md p-2">
              <p className="text-xs font-medium text-gray-700 mb-1">Available Files:</p>
              {files.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {files.map(file => {
                    const isSelected = selectedFiles.some(f => f.fileId === file.fileId);
                    return (
                      <li key={file.fileId} className="py-1 flex justify-between items-center">
                        <span className="text-sm truncate flex-1">{file.fileName}</span>
                        <button
                          onClick={() => toggleFileSelection(file)}
                          className={`text-xs ${isSelected ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700'} px-1 py-0.5 rounded hover:opacity-80 ml-2`}
                        >
                          {isSelected ? 'Selected' : 'Select'}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic">No files available</p>
              )}
            </div>
          </div>

          <button
            onClick={createSession}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : sessionId && ['initializing', 'running', 'paused'].includes(sessionStatus) ? "Interrupt Current Session" : "Create New Session"}
          </button>

          {sessionId && (
            <p className="mt-2 text-sm text-gray-600">
              Session ID: {sessionId}
            </p>
          )}
        </div>
      )}
    </div>
  );
}