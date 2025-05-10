const { useState, useEffect } = React;

// RecordingsList component for browsing saved recordings (using HTTP)
function RecordingsList({ onSelectRecording }) {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRpaExecution, setActiveRpaExecution] = useState(null);
  const [rpaStatus, setRpaStatus] = useState(null);
  const [showRpaConfigModal, setShowRpaConfigModal] = useState(false);
  const [selectedRecordingForRpa, setSelectedRecordingForRpa] = useState(null);
  const [rpaActionDelay, setRpaActionDelay] = useState(1000);
  
  useEffect(() => {
    fetchRecordings();
  }, []);
  
  // Effect to periodically check RPA status when active
  useEffect(() => {
    let intervalId;
    
    if (activeRpaExecution) {
      // Check status immediately
      checkRpaStatus(activeRpaExecution);
      
      // Then check every 2 seconds
      intervalId = setInterval(() => {
        checkRpaStatus(activeRpaExecution);
      }, 2000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [activeRpaExecution]);
  
  const fetchRecordings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/videos');
      const data = await response.json();
      setRecordings(data || []);
    } catch (error) {
      console.error("Error fetching recordings:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };
  
  const formatDuration = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  const downloadRecording = (id, title) => {
    window.open(`/api/videos/${id}/download`, '_blank');
  };
  
  const deleteRecording = async (id) => {
    if (confirm("Are you sure you want to delete this recording?")) {
      try {
        const response = await fetch(`/api/videos/${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          fetchRecordings(); // Refresh list
        } else {
          const data = await response.json();
          alert("Failed to delete recording: " + (data.error || "Unknown error"));
        }
      } catch (error) {
        alert("Error deleting recording: " + error.message);
      }
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (recordings.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500 mb-4">No recordings found</p>
        <button 
          onClick={fetchRecordings}
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>
    );
  }
  
  return (
    <div className="recordings-list">
      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-semibold">Recordings ({recordings.length})</h3>
        <button 
          onClick={fetchRecordings}
          className="text-blue-600 hover:text-blue-800"
        >
          Refresh
        </button>
      </div>
      
      {/* Simple table layout for recordings */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Title</th>
            <th className="p-2 text-left">Created</th>
            <th className="p-2 text-left">Duration</th>
            <th className="p-2 text-left">Frames</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {recordings.map(recording => (
            <tr key={recording.id} className="border-t">
              <td className="p-2">{recording.title}</td>
              <td className="p-2">{formatDate(recording.createdAt)}</td>
              <td className="p-2">{formatDuration(recording.duration)}</td>
              <td className="p-2">{recording.frameCount}</td>
              <td className="p-2 flex gap-2">
                <button
                  onClick={() => onSelectRecording(recording.id)}
                  className="bg-blue-100 text-blue-700 px-2 py-1 rounded"
                >
                  View
                </button>
                <a
                  href={`./frame-editor.html?id=${recording.id}`}
                  className="bg-orange-100 text-orange-700 px-2 py-1 rounded"
                >
                  Edit Frames
                </a>
                <button
                  onClick={() => downloadRecording(recording.id, recording.title)}
                  className="bg-green-100 text-green-700 px-2 py-1 rounded"
                >
                  Download
                </button>
                <button
                  onClick={() => deleteRecording(recording.id)}
                  className="bg-red-100 text-red-700 px-2 py-1 rounded"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    setSelectedRecordingForRpa(recording);
                    setShowRpaConfigModal(true);
                  }}
                  className={`px-2 py-1 rounded ${
                    activeRpaExecution === null ? 
                    "bg-purple-100 text-purple-700 hover:bg-purple-200" : 
                    activeRpaExecution && rpaStatus && rpaStatus.recordingId === recording.id ?
                    "bg-purple-500 text-white" :
                    "bg-gray-100 text-gray-400"
                  }`}
                  disabled={activeRpaExecution !== null}
                >
                  {activeRpaExecution && rpaStatus && rpaStatus.recordingId === recording.id ? 
                   `Running (${rpaStatus.currentActionIndex}/${rpaStatus.totalActions})` : 
                   "Automate"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* RPA Config Modal */}
      {showRpaConfigModal && selectedRecordingForRpa && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">RPA Execution Configuration</h3>
            
            <div className="mb-4">
              <p className="text-gray-600 mb-2">
                Configure parameters for automating recording: <span className="font-medium">{selectedRecordingForRpa.title}</span>
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Action Delay (ms)
                </label>
                <input
                  type="range"
                  min="100"
                  max="5000"
                  step="100"
                  value={rpaActionDelay}
                  onChange={(e) => setRpaActionDelay(parseInt(e.target.value, 10))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Fast (100ms)</span>
                  <span>{rpaActionDelay}ms</span>
                  <span>Slow (5000ms)</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowRpaConfigModal(false);
                  setSelectedRecordingForRpa(null);
                }}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  startRpaExecution(selectedRecordingForRpa.id, rpaActionDelay);
                  setShowRpaConfigModal(false);
                }}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                Start Automation
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* RPA Status Dialog */}
      {rpaStatus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">RPA Execution Status</h3>
            
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">Status:</span>
                <span className={`font-medium ${
                  rpaStatus.status === 'running' ? 'text-blue-600' :
                  rpaStatus.status === 'completed' ? 'text-green-600' :
                  rpaStatus.status === 'failed' ? 'text-red-600' :
                  'text-orange-600'
                }`}>
                  {rpaStatus.status.charAt(0).toUpperCase() + rpaStatus.status.slice(1)}
                </span>
              </div>
              
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">Progress:</span>
                <span className="font-medium">
                  {rpaStatus.currentActionIndex} / {rpaStatus.totalActions} actions
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${(rpaStatus.currentActionIndex / rpaStatus.totalActions) * 100}%` }}
                ></div>
              </div>
              
              {rpaStatus.errorMessage && (
                <div className="text-red-600 mb-2">
                  <span className="font-medium">Error: </span>
                  {rpaStatus.errorMessage}
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2">
              {rpaStatus.status === 'running' ? (
                <button
                  onClick={stopRpaExecution}
                  className="bg-red-100 text-red-700 px-4 py-2 rounded hover:bg-red-200"
                >
                  Stop Execution
                </button>
              ) : (
                <button
                  onClick={() => {
                    setRpaStatus(null);
                    setActiveRpaExecution(null);
                  }}
                  className="bg-blue-100 text-blue-700 px-4 py-2 rounded hover:bg-blue-200"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
  // Function to start RPA execution
  async function startRpaExecution(recordingId, actionDelay = 1000) {
    try {
      const response = await fetch(API_ENDPOINTS.RPA_EXECUTE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recordingId,
          actionDelay // Configurable delay between actions
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to start RPA execution');
      }
      
      const data = await response.json();
      setActiveRpaExecution(data.executionId);
      setRpaStatus(data);
    } catch (error) {
      alert('Error starting RPA execution: ' + error.message);
    }
  }
  
  // Function to check RPA execution status
  async function checkRpaStatus(executionId) {
    try {
      const response = await fetch(API_ENDPOINTS.RPA_STATUS(executionId));
      
      if (!response.ok) {
        // If we can't get the status, stop polling
        setActiveRpaExecution(null);
        return;
      }
      
      const data = await response.json();
      setRpaStatus(data);
      
      // If execution is complete or failed, stop polling
      if (data.status !== 'running') {
        setActiveRpaExecution(null);
      }
    } catch (error) {
      console.error('Error checking RPA status:', error);
      setActiveRpaExecution(null);
    }
  }
  
  // Function to stop RPA execution
  async function stopRpaExecution() {
    if (!activeRpaExecution) return;
    
    try {
      const response = await fetch(API_ENDPOINTS.RPA_STOP(activeRpaExecution), {
        method: 'POST'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to stop RPA execution');
      }
      
      const data = await response.json();
      setRpaStatus(data);
      setActiveRpaExecution(null);
    } catch (error) {
      alert('Error stopping RPA execution: ' + error.message);
    }
  }
}