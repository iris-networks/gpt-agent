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

  // Fetch available sessions when component mounts
  React.useEffect(() => {
    if (activeTab === 'execute' && analysisId) {
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
          className={`py-2 px-4 ${activeTab === 'execute' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'} ${!analysisId ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => analysisId && setActiveTab('execute')}
          disabled={!analysisId}
        >
          Execute RPA
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
            <h3 className="text-lg font-semibold mb-2">Generated RPA Steps</h3>
            <div 
              className="bg-gray-100 p-4 rounded-lg max-h-64 overflow-y-auto font-mono text-sm whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: sanitizeSteps(analysisResult.rpaSteps) }}
            />
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setActiveTab('upload')}
              className="py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800"
            >
              Upload Another Video
            </button>
            <button
              onClick={() => setActiveTab('execute')}
              className="py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-md text-white"
            >
              Continue to Execution
            </button>
          </div>
        </div>
      )}

      {/* Execute Tab */}
      {activeTab === 'execute' && analysisResult && (
        <div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Execute RPA Steps</h3>
            <p className="mb-4 text-gray-700">
              Select a browser session to execute the generated RPA steps:
            </p>

            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a session</option>
              {availableSessions.map(session => (
                <option key={session.id} value={session.id}>
                  {session.name}
                </option>
              ))}
            </select>
          </div>

          {executionStatus && (
            <div className={`mb-6 p-4 rounded-lg ${executionStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {executionStatus.message}
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
              onClick={executeRpaSteps}
              disabled={!selectedSession}
              className={`py-2 px-4 rounded-md text-white ${!selectedSession ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              Execute RPA Steps
            </button>
          </div>
        </div>
      )}
    </div>
  );
};