const { useState, useEffect } = React;

// RecordingsList component for browsing saved recordings (using HTTP)
function RecordingsList({ onSelectRecording }) {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchRecordings();
  }, []);
  
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}