const { useState, useEffect } = React;

// Simplified VideoPlayer component for playing session recordings
function VideoPlayer({ frames, captions }) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Playback controls
  const play = () => setIsPlaying(true);
  const pause = () => setIsPlaying(false);
  const reset = () => {
    setIsPlaying(false);
    setCurrentFrame(0);
  };
  
  // Playback effect - simple 1 second per frame
  useEffect(() => {
    let interval;
    if (isPlaying && frames && frames.length > 0) {
      interval = setInterval(() => {
        setCurrentFrame(prev => {
          if (prev >= frames.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isPlaying, frames]);
  
  // Find the caption for the current frame
  const findCaptionForFrame = (frameIndex) => {
    if (!captions || captions.length === 0) {
      return null;
    }
    
    // First try to find by frameIndex property
    const captionWithFrameIndex = captions.find(caption => 
      caption.frameIndex !== undefined && caption.frameIndex === frameIndex
    );
    
    if (captionWithFrameIndex) {
      return captionWithFrameIndex;
    }
    
    // Fallback to array index if frameIndex property not found
    return captions[frameIndex] || null;
  };
  
  // Function to extract caption text from conversation
  const getCaptionText = (index) => {
    const caption = findCaptionForFrame(index);
    
    if (!caption) {
      return `Frame ${index + 1}`;
    }
    
    // Try to get text from conversation
    if (caption.conversation && caption.conversation.value) {
      const text = caption.conversation.value;
      // Remove the "Thought: " prefix if present
      return text.replace(/^Thought:\s*/i, '');
    }
    
    // Fallback for backward compatibility
    if (caption.predictionParsed && caption.predictionParsed.length > 0) {
      return caption.predictionParsed
        .map(p => p.thought)
        .filter(Boolean)
        .join(" | ");
    }
    
    return `Frame ${index + 1}`;
  };
  
  // Function to get all actions for a frame
  const getFrameActions = (index) => {
    const caption = findCaptionForFrame(index);
    
    if (!caption) {
      return [];
    }
    
    // Try to get actions from conversation's predictionParsed
    if (caption.conversation && caption.conversation.predictionParsed) {
      return caption.conversation.predictionParsed
        .filter(p => p.action_type)
        .map(p => ({
          action: p.action_type,
          selectors: (p.action_inputs && p.action_inputs.selectors) ? p.action_inputs.selectors : undefined,
          params: p.action_inputs
        }));
    }
    
    // Fallback for backward compatibility
    if (caption.predictionParsed) {
      return caption.predictionParsed
        .filter(p => p.action)
        .map(p => ({
          action: p.action,
          selectors: p.selectors,
          params: p.actionParams
        }));
    }
    
    return [];
  };
  
  if (!frames || frames.length === 0) {
    return <div className="text-center p-4 text-gray-500">No frames available</div>;
  }
  
  const frameActions = getFrameActions(currentFrame);
  
  return (
    <div className="video-player">
      {/* Frame display */}
      <div className="video-frame bg-gray-100 flex flex-col items-center mb-4 p-2 border">
        <img 
          src={`data:image/png;base64,${frames[currentFrame]}`} 
          alt={`Frame ${currentFrame}`}
          className="max-w-full max-h-[50vh] object-contain mb-2"
        />
        <div className="caption w-full bg-gray-800 text-white p-2 text-center">
          {getCaptionText(currentFrame)}
        </div>
        
        {/* Show actions if available */}
        {frameActions.length > 0 && (
          <div className="actions w-full bg-yellow-50 p-2 mt-2 border-t text-sm">
            <div className="font-medium mb-1 text-yellow-800">Actions:</div>
            <ul className="list-disc pl-5">
              {frameActions.map((action, idx) => (
                <li key={idx}>
                  <span className="font-medium">{action.action}</span>
                  {action.params && action.params.start_coords && (
                    <span className="text-blue-600"> at position ({Math.round(action.params.start_coords[0])}, {Math.round(action.params.start_coords[1])})</span>
                  )}
                  {action.params && action.params.content && (
                    <span className="text-green-600"> content: "{action.params.content}"</span>
                  )}
                  {action.params && action.params.key && (
                    <span className="text-purple-600"> key: "{action.params.key}"</span>
                  )}
                  {action.selectors && action.selectors.length > 0 && (
                    <span className="text-blue-600"> on {action.selectors.join(', ')}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Simple controls */}
      <div className="controls">
        <div className="flex justify-center gap-2 mb-2">
          <button onClick={play} disabled={isPlaying} className="bg-blue-600 text-white px-4 py-1 rounded">Play</button>
          <button onClick={pause} disabled={!isPlaying} className="bg-blue-600 text-white px-4 py-1 rounded">Pause</button>
          <button onClick={reset} className="bg-blue-600 text-white px-4 py-1 rounded">Reset</button>
        </div>
        
        <div className="flex items-center gap-2">
          <input 
            type="range" 
            min={0} 
            max={frames.length - 1} 
            value={currentFrame} 
            onChange={e => setCurrentFrame(Number(e.target.value))}
            className="flex-grow"
          />
          <span>{currentFrame + 1} / {frames.length}</span>
        </div>
      </div>
    </div>
  );
}