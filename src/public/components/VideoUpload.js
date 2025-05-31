// VideoUpload.js
const VideoUpload = () => {
  const [file, setFile] = React.useState(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [analysisId, setAnalysisId] = React.useState(null);
  const [analysisResult, setAnalysisResult] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [activeTab, setActiveTab] = React.useState('upload');
  const [availableSessions, setAvailableSessions] = React.useState([]);
  const [selectedSession, setSelectedSession] = React.useState('');
  const [executionStatus, setExecutionStatus] = React.useState(null);
  const [operatorType, setOperatorType] = React.useState("browser");
  const [isCreatingSession, setIsCreatingSession] = React.useState(false);
  const [sessionStatus, setSessionStatus] = React.useState(null);
  
  // Initialize socket outside component state
  const socketRef = React.useRef(null);
  
  // Clean up socket on unmount
  React.useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Fetch available sessions when component mounts
  React.useEffect(() => {
    if (activeTab === 'createSession' && analysisId) {
      fetchSessions();
    }
  }, [activeTab, analysisId]);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/sessions');
      if (response.ok) {
        const data = await response.json();
        setAvailableSessions(data.map(session => ({
          id: session.id,
          name: `Session: ${session.id.substring(0, 8)}...`
        })));
      } else {
        console.error('Failed to fetch sessions');
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file size (limit to 100MB)
      if (selectedFile.size > 100 * 1024 * 1024) {
        setError('File size exceeds 100MB limit');
        return;
      }
      
      // Check file type
      if (!['video/mp4', 'video/webm', 'video/avi'].includes(selectedFile.type)) {
        setError('Only MP4, WebM, and AVI formats are supported');
        return;
      }
      
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      });
      
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          setAnalysisId(response.analysisId);
          setActiveTab('results');
          fetchResults(response.analysisId);
        } else {
          let errorMessage = 'Upload failed';
          try {
            const response = JSON.parse(xhr.responseText);
            errorMessage = response.message || 'Upload failed';
          } catch (e) {
            // Ignore parsing error
          }
          setError(errorMessage);
        }
        setIsUploading(false);
      });
      
      xhr.addEventListener('error', () => {
        setError('Upload failed. Please try again.');
        setIsUploading(false);
      });
      
      xhr.open('POST', '/api/video/upload');
      xhr.send(formData);
    } catch (err) {
      setError(`Upload failed: ${err.message}`);
      setIsUploading(false);
    }
  };

  const fetchResults = async (id) => {
    try {
      const response = await fetch(`/api/video/analysis/${id}`);
      if (response.ok) {
        const result = await response.json();
        setAnalysisResult(result);
      } else {
        setError('Failed to fetch analysis results. Please try again later.');
      }
    } catch (err) {
      setError(`Error fetching results: ${err.message}`);
    }
  };

  const executeRpaSteps = async () => {
    if (!selectedSession) {
      setError('Please select a session to execute RPA steps');
      return;
    }

    try {
      const response = await fetch(`/api/video/execute/${analysisId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId: selectedSession }),
      });

      if (response.ok) {
        const result = await response.json();
        setExecutionStatus({ success: true, message: result.message });
      } else {
        const errorData = await response.json();
        setExecutionStatus({ success: false, message: errorData.message || 'Execution failed' });
      }
    } catch (err) {
      setExecutionStatus({ success: false, message: `Error executing RPA steps: ${err.message}` });
    }
  };
  
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

  // Helper function to sanitize strings for safe display in HTML
  const sanitizeSteps = (steps) => {
    return steps
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/\n/g, '<br>');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">RPA Video Processing</h2>
      
      {/* Tabs */}
      <div className="flex mb-6 border-b">
        <button 
          className={`py-2 px-4 ${activeTab === 'upload' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('upload')}
        >
          Upload Video
        </button>
        <button 
          className={`py-2 px-4 ${activeTab === 'results' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'} ${!analysisId ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => analysisId && setActiveTab('results')}
          disabled={!analysisId}
        >
          View Results
        </button>
        <button 
          className={`py-2 px-4 ${activeTab === 'createSession' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'} ${!analysisId ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => analysisId && setActiveTab('createSession')}
          disabled={!analysisId}
        >
          Create Session
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Select a video recording to process:
            </label>
            <input
              type="file"
              accept="video/mp4,video/webm,video/avi"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
              disabled={isUploading}
            />
            <p className="mt-1 text-sm text-gray-500">
              Supports MP4, WebM, and AVI formats (max 100MB)
            </p>
          </div>

          {file && (
            <div className="mb-4">
              <p className="text-gray-700">
                Selected file: <span className="font-medium">{file.name}</span> ({(file.size / (1024 * 1024)).toFixed(2)} MB)
              </p>
            </div>
          )}

          {isUploading && (
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-center mt-2 text-sm text-gray-600">
                Uploading: {uploadProgress}%
              </p>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium 
              ${(!file || isUploading) 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isUploading ? 'Uploading...' : 'Upload and Process Video'}
          </button>
        </div>
      )}

      {/* Results Tab */}
      {activeTab === 'results' && analysisResult && (
        <div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Processed Video</h3>
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <video 
                src={analysisResult.processedVideoUrl} 
                controls 
                className="w-full h-full"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              This video has been optimized by removing idle segments.
            </p>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Generated RPA Steps</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    // Copy steps to clipboard
                    navigator.clipboard.writeText(analysisResult.rpaSteps);
                    alert('RPA steps copied to clipboard!');
                  }}
                  className="text-xs py-1 px-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  Copy
                </button>
                <button
                  onClick={() => {
                    // Download steps as text file
                    const element = document.createElement('a');
                    const file = new Blob([analysisResult.rpaSteps], {type: 'text/plain'});
                    element.href = URL.createObjectURL(file);
                    element.download = `rpa-steps-${analysisResult.analysisId}.txt`;
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                  }}
                  className="text-xs py-1 px-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  Download
                </button>
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-2">
              <p className="text-sm text-gray-700 mb-2">
                You can edit these steps below before executing the workflow. Each step should be on a new line.
              </p>
            </div>
            <textarea
              className="bg-gray-100 p-4 rounded-lg max-h-64 overflow-y-auto font-mono text-sm whitespace-pre-wrap w-full h-64 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={analysisResult.rpaSteps}
              onChange={(e) => {
                setAnalysisResult({
                  ...analysisResult,
                  rpaSteps: e.target.value
                });
              }}
              placeholder="Edit RPA steps here..."
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={() => {
                  // Get the original steps from the message
                  if (analysisResult.message && analysisResult.message !== analysisResult.rpaSteps) {
                    if (confirm('Reset to original steps? This will discard your changes.')) {
                      setAnalysisResult({
                        ...analysisResult,
                        rpaSteps: analysisResult.message
                      });
                    }
                  }
                }}
                className="text-xs py-1 px-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Reset to Original
              </button>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setActiveTab('upload')}
              className="py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800"
            >
              Upload Another Video
            </button>
            <button
              onClick={() => setActiveTab('createSession')}
              className="py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-md text-white"
            >
              Continue to Create Session
            </button>
          </div>
        </div>
      )}

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
    </div>
  );
};