// Video related components
import { VideoStatus } from './constants.js';
import { fetchVideoRecording } from './SocketService.js';

// Video status component
export const VideoStatusComponent = ({ 
  videoStatus, 
  videoRecording, 
  onPlayVideo 
}) => {
  if (!videoStatus) return null;
  
  return (
    <div className={`p-4 rounded-lg mt-4 ${
      videoStatus === VideoStatus.READY 
        ? 'bg-green-50 border border-green-200' 
        : videoStatus === VideoStatus.PROCESSING 
          ? 'bg-yellow-50 border border-yellow-200' 
          : videoStatus === VideoStatus.ERROR 
            ? 'bg-red-50 border border-red-200'
            : 'bg-blue-50 border border-blue-200'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {videoStatus === VideoStatus.READY && <span className="text-xl mr-2">🎬</span>}
          {videoStatus === VideoStatus.PROCESSING && <span className="text-xl mr-2">⏳</span>}
          {videoStatus === VideoStatus.ERROR && <span className="text-xl mr-2">❌</span>}
          {videoStatus === VideoStatus.PENDING && <span className="text-xl mr-2">🔍</span>}
          
          <div>
            <div className="font-medium">
              {videoStatus === VideoStatus.READY && 'Session Recording Available'}
              {videoStatus === VideoStatus.PROCESSING && 'Processing Session Recording...'}
              {videoStatus === VideoStatus.ERROR && 'Error Creating Recording'}
              {videoStatus === VideoStatus.PENDING && 'Checking Recording Status...'}
            </div>
            {videoStatus === VideoStatus.PROCESSING && (
              <div className="text-xs text-gray-500">This may take a few moments.</div>
            )}
            {videoRecording && videoRecording.duration && (
              <div className="text-xs text-gray-500">
                Duration: {Math.floor(videoRecording.duration / 60)}:{(videoRecording.duration % 60).toString().padStart(2, '0')}
              </div>
            )}
          </div>
        </div>
        
        {videoStatus === VideoStatus.READY && (
          <button 
            onClick={onPlayVideo}
            className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
          >
            <span className="mr-1">▶️</span> Play
          </button>
        )}
        
        {videoStatus === VideoStatus.PROCESSING && (
          <div className="animate-pulse px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg">
            <span className="mr-1">⟳</span> Processing...
          </div>
        )}
      </div>
    </div>
  );
};

// Video handling hooks
export const useVideoRecording = (addMessage) => {
  const [videoRecording, setVideoRecording] = React.useState(null);
  const [videoStatus, setVideoStatus] = React.useState(null);
  const [pollingTimeout, setPollingTimeout] = React.useState(null);
  
  // Clean up function for polling
  React.useEffect(() => {
    return () => {
      if (pollingTimeout) {
        clearTimeout(pollingTimeout);
      }
    };
  }, [pollingTimeout]);
  
  // Function to fetch video recording
  const checkVideoRecording = async (sessionId) => {
    if (!sessionId) return;
    
    // Clear any existing polling timeout
    if (pollingTimeout) {
      clearTimeout(pollingTimeout);
      setPollingTimeout(null);
    }
    
    setVideoStatus(VideoStatus.PENDING);
    
    try {
      const data = await fetchVideoRecording(sessionId);
      
      if (data && data.status === 'ready') {
        // Video is ready
        setVideoRecording(data);
        setVideoStatus(VideoStatus.READY);
        if (addMessage) {
          addMessage('system', 'Session recording is ready for playback.');
        }
      } else if (data && data.status === 'error') {
        // Video processing failed
        setVideoStatus(VideoStatus.ERROR);
        if (addMessage) {
          addMessage('system', `Error processing video: ${data.error || 'Unknown error'}`);
        }
      } else {
        // Video is still processing, start polling
        setVideoStatus(VideoStatus.PROCESSING);
        startPollingForVideo(sessionId);
      }
    } catch (error) {
      console.error('Error fetching video:', error);
      setVideoStatus(VideoStatus.ERROR);
      if (addMessage) {
        addMessage('system', `Failed to get session recording: ${error.message}`);
      }
    }
  };
  
  // Start polling for video availability
  const startPollingForVideo = (sessionId) => {
    // Poll every 5 seconds
    const timeoutId = setTimeout(() => {
      checkVideoRecording(sessionId);
    }, 5000);
    
    setPollingTimeout(timeoutId);
  };
  
  // Play video recording
  const playVideoRecording = () => {
    if (!videoRecording || videoStatus !== VideoStatus.READY) return;
    
    // Open the video player in a new tab
    if (videoRecording.videoUrl) {
      window.open(videoRecording.videoUrl, '_blank');
    }
  };
  
  return {
    videoRecording,
    videoStatus,
    checkVideoRecording,
    playVideoRecording
  };
};