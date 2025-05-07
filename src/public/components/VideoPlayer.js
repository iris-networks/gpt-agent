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
  
  if (!frames || frames.length === 0) {
    return <div className="text-center p-4 text-gray-500">No frames available</div>;
  }
  
  return (
    <div className="video-player">
      {/* Frame display */}
      <div className="video-frame bg-gray-100 flex flex-col items-center mb-4 p-2 border">
        <img 
          src={`data:image/png;base64,${frames[currentFrame]}`} 
          alt={`Frame ${currentFrame}`}
          className="max-w-full max-h-[50vh] object-contain mb-2"
        />
        <div className="caption w-full bg-gray-200 p-2 text-center">
          {captions[currentFrame] || `Frame ${currentFrame + 1}`}
        </div>
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