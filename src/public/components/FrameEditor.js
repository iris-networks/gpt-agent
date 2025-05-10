const { useState, useEffect, useCallback } = React;

/**
 * Frame Editor component for editing video frames and captions
 * @param {Object} props - Component props
 * @param {string} props.sessionId - ID of the recording session
 */
function FrameEditor({ sessionId }) {
  const [frames, setFrames] = useState([]);
  const [captions, setCaptions] = useState([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch frames and captions data
  const loadData = useCallback(async () => {
    try {
      setIsProcessing(true);
      setStatusMessage('Loading frames and captions...');
      setError('');
      
      // First get video-data using the existing endpoint
      const response = await fetch(`/api/videos/${sessionId}/video-data`);
      
      if (!response.ok) {
        throw new Error(`Failed to load data: ${response.status} ${response.statusText}`);
      }
      
      // Check the content type of the response
      const contentType = response.headers.get('content-type');
      console.log('Response content type:', contentType);
      
      let data;
      // Parse response based on content type
      try {
        const responseText = await response.text();
        console.log('Response text preview:', responseText.substring(0, 100));
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        throw new Error(`Error parsing response: ${parseError.message}`);
      }
      
      if (data.success && data.replayData) {
        setFrames(data.replayData.frames || []);
        setCaptions(data.replayData.captions || []);
        setCurrentFrame(0);
        setStatusMessage('Data loaded successfully.');
      } else {
        throw new Error('Failed to load frames and captions: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [sessionId]);

  // Load initial data on mount
  useEffect(() => {
    if (sessionId) {
      loadData();
    }
  }, [sessionId, loadData]);

  // Delete current frame
  const deleteFrame = async () => {
    if (!confirm('Are you sure you want to delete this frame? This action cannot be undone.')) {
      return;
    }
    
    try {
      setIsProcessing(true);
      setStatusMessage('Deleting frame...');
      setError('');
      
      // Get the current caption to find its actual frameIndex
      const currentCaption = getCurrentCaption();
      
      if (!currentCaption) {
        throw new Error('Cannot find caption for the current frame');
      }
      
      // Use the frameIndex from the caption object if available, otherwise use the currentFrame index
      // This handles both types of caption indexing that might be in the system
      const frameIndex = currentCaption.frameIndex !== undefined ? currentCaption.frameIndex : currentFrame;
      
      console.log('Deleting frame for currentFrame:', currentFrame, 'using frameIndex:', frameIndex);
      console.log('Caption object:', currentCaption);
      
      const response = await fetch(`/api/videos/${sessionId}/frames/${frameIndex}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        // Try to get additional error information if possible
        let errorDetail = '';
        try {
          const errorText = await response.text();
          errorDetail = errorText ? `: ${errorText}` : '';
        } catch (e) {
          // Ignore error reading response text
        }
        
        throw new Error(`Failed to delete frame: ${response.status} ${response.statusText}${errorDetail}
URL: ${response.url}`);
      }
      
      try {
        const responseText = await response.text();
        console.log('Delete response:', responseText);
        
        // Only try to parse if there's content
        if (responseText.trim().length > 0) {
          const data = JSON.parse(responseText);
          if (!data.success) {
            throw new Error(data.error || 'Unknown error');
          }
        }
      } catch (parseError) {
        console.error('Error parsing delete response:', parseError);
        // Continue anyway since the response.ok was true
      }
      
      // Reload data after successful deletion
      await loadData();
      setStatusMessage('Frame deleted successfully');
      
      // If we deleted the last frame, go to new last frame
      if (currentFrame >= frames.length - 1) {
        setCurrentFrame(Math.max(0, frames.length - 2));
      }
    } catch (err) {
      console.error('Error deleting frame:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Update caption for current frame - handles both text and action updates
  const updateCaption = async (updatedCaption) => {
    try {
      setIsProcessing(true);
      setStatusMessage('Updating caption...');
      setError('');
      
      // Extract the caption text
      const captionText = updatedCaption.conversation?.value || '';
      
      // Get the current caption to find its actual frameIndex
      const currentCaption = getCurrentCaption();
      
      if (!currentCaption) {
        throw new Error('Cannot find caption for the current frame');
      }
      
      // Use the frameIndex from the caption object if available, otherwise use the currentFrame index
      // This handles both types of caption indexing that might be in the system
      const frameIndex = currentCaption.frameIndex !== undefined ? currentCaption.frameIndex : currentFrame;
      
      console.log('Updating caption for currentFrame:', currentFrame, 'using frameIndex:', frameIndex);
      console.log('Caption object:', currentCaption);
      
      // Send the entire updated caption object to the backend
      const response = await fetch(`/api/videos/${sessionId}/captions/${frameIndex}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          caption: updatedCaption 
        })
      });
      
      if (!response.ok) {
        // Try to get additional error information if possible
        let errorDetail = '';
        try {
          const errorText = await response.text();
          errorDetail = errorText ? `: ${errorText}` : '';
        } catch (e) {
          // Ignore error reading response text
        }
        
        throw new Error(`Failed to update caption: ${response.status} ${response.statusText}${errorDetail}
URL: ${response.url}`);
      }
      
      try {
        const responseText = await response.text();
        console.log('Caption update response:', responseText);
        
        // Only try to parse if there's content
        if (responseText.trim().length > 0) {
          const data = JSON.parse(responseText);
          if (!data.success) {
            throw new Error(data.error || 'Unknown error');
          }
        }
      } catch (parseError) {
        console.error('Error parsing caption update response:', parseError);
        // Continue anyway since the response.ok was true
      }
      
      // Update local state to reflect the change
      const updatedCaptions = [...captions];
      
      // Find the caption with matching frameIndex
      const captionIndex = updatedCaptions.findIndex(c => c.frameIndex === currentFrame);
      
      if (captionIndex !== -1) {
        // Replace the entire caption object with the updated one
        updatedCaptions[captionIndex] = updatedCaption;
        setCaptions(updatedCaptions);
      }
      
      setStatusMessage('Caption updated successfully');
    } catch (err) {
      console.error('Error updating caption:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Regenerate video after edits
  const regenerateVideo = async () => {
    try {
      setIsProcessing(true);
      setStatusMessage('Regenerating video...');
      setError('');
      
      const response = await fetch(`/api/videos/${sessionId}/regenerate`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to regenerate video: ${response.status} ${response.statusText}`);
      }
      
      try {
        const responseText = await response.text();
        console.log('Regenerate video response:', responseText);
        
        // Only try to parse if there's content
        if (responseText.trim().length > 0) {
          const data = JSON.parse(responseText);
          if (!data.success) {
            throw new Error(data.error || 'Unknown error');
          }
        }
      } catch (parseError) {
        console.error('Error parsing regenerate video response:', parseError);
        // Continue anyway since the response.ok was true
      }
      
      setStatusMessage('Video regenerated successfully');
    } catch (err) {
      console.error('Error regenerating video:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Navigation controls
  const goToPreviousFrame = () => {
    if (currentFrame > 0) {
      setCurrentFrame(currentFrame - 1);
    }
  };

  const goToNextFrame = () => {
    if (currentFrame < frames.length - 1) {
      setCurrentFrame(currentFrame + 1);
    }
  };

  // Get the current caption
  const getCurrentCaption = () => {
    if (!captions || captions.length === 0) {
      console.error('No captions available');
      return null;
    }
    
    // Debug: log all frameIndex values
    console.log('All captions frameIndexes:', captions.map(c => c.frameIndex));
    console.log('Current frame index:', currentFrame);
    
    // First check if any caption has a matching frameIndex property
    const matchByProperty = captions.find(caption => caption.frameIndex === currentFrame);
    
    if (matchByProperty) {
      console.log('Found caption by frameIndex property:', matchByProperty.frameIndex);
      return matchByProperty;
    }
    
    // If no match, try to use the array index position
    if (currentFrame < captions.length) {
      console.log('Using caption at array position:', currentFrame);
      return captions[currentFrame];
    }
    
    console.error('Could not find caption for frame', currentFrame);
    return null;
  };

  // If no frames, show message
  if (frames.length === 0 && !isProcessing) {
    return (
      <div className="frame-editor p-4">
        <h2 className="text-xl font-bold mb-4">Frame Editor</h2>
        {error ? (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
        ) : (
          <div className="bg-yellow-100 text-yellow-700 p-3 rounded">
            No frames available for this recording.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="frame-editor p-4">
      <h2 className="text-xl font-bold mb-4">Frame Editor</h2>
      
      {/* Status and error messages */}
      {statusMessage && (
        <div className="bg-blue-100 text-blue-700 p-3 rounded mb-4">{statusMessage}</div>
      )}
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}
      
      {/* Loading indicator */}
      {isProcessing && (
        <div className="flex justify-center items-center h-16 mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
        </div>
      )}
      
      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Frame display */}
        <div className="lg:col-span-2">
          <div className="bg-gray-100 border rounded overflow-hidden">
            {frames.length > 0 && currentFrame < frames.length && (
              <img 
                src={`data:image/png;base64,${frames[currentFrame]}`} 
                alt={`Frame ${currentFrame}`}
                className="max-w-full max-h-[50vh] object-contain mx-auto"
              />
            )}
          </div>
          
          {/* Frame navigation */}
          <div className="frame-navigation my-4 flex items-center justify-between">
            <button 
              onClick={goToPreviousFrame} 
              disabled={currentFrame === 0 || isProcessing}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              Previous
            </button>
            
            <span className="font-medium">
              Frame {currentFrame + 1} of {frames.length}
            </span>
            
            <button 
              onClick={goToNextFrame} 
              disabled={currentFrame === frames.length - 1 || isProcessing}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
          
          {/* Frame actions */}
          <div className="frame-actions flex justify-between my-4">
            <button 
              onClick={deleteFrame} 
              disabled={isProcessing || frames.length <= 1}
              className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
            >
              Delete Frame
            </button>
            
            <button 
              onClick={regenerateVideo} 
              disabled={isProcessing}
              className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
            >
              Regenerate Video
            </button>
          </div>
        </div>
        
        {/* Caption editor */}
        <div>
          <CaptionEditor 
            caption={getCurrentCaption()} 
            onSave={updateCaption}
          />
          
          {/* Return to video button */}
          <div className="mt-6">
            <a 
              href={`/public/index.html?id=${sessionId}`}
              className="inline-block px-4 py-2 bg-gray-600 text-white rounded"
            >
              Return to Video
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}