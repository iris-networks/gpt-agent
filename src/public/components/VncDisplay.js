// VNC display component
const VncDisplay = ({ 
  connected, 
  resolution, 
  fps, 
  displayMode, 
  toggleDisplayMode 
}) => {
  // Calculate width based on display mode
  const vncWidth = displayMode === 'chat' 
    ? 'w-0 hidden' 
    : displayMode === 'vnc' 
      ? 'w-full' 
      : 'w-1/2';
      
  return (
    <div className={`${vncWidth} h-full bg-gray-900 flex flex-col transition-all duration-300`}>
      <div className="bg-gray-800 p-4 text-white flex justify-between items-center">
        <h2 className="text-xl font-semibold">VNC Remote Desktop</h2>
        <div className="flex items-center space-x-2">
          {displayMode !== 'vnc' && (
            <button 
              className="text-white p-1 rounded hover:bg-gray-700"
              onClick={() => toggleDisplayMode('vnc')}
              title="Expand VNC"
            >
              <span className="material-icons">➡️</span>
            </button>
          )}
          {displayMode !== 'split' && (
            <button 
              className="text-white p-1 rounded hover:bg-gray-700"
              onClick={() => toggleDisplayMode('split')}
              title="Split view"
            >
              <span className="material-icons">⬌</span>
            </button>
          )}
          <button className="text-white p-1 rounded hover:bg-gray-700" title="Fullscreen">
            <span className="material-icons">⤢</span>
          </button>
        </div>
      </div>
      
      <div className="flex-grow flex flex-col items-center justify-center text-white text-center p-8">
        <div className="text-gray-400 text-6xl mb-4">🖥️</div>
        <h3 className="text-xl font-medium mb-2">VNC Display</h3>
        <p className="text-gray-400 mb-8">Remote desktop preview will appear here</p>
        <p className="text-xs text-gray-500 max-w-md">
          This is a placeholder for the VNC remote desktop viewer. In a real implementation, this would show the actual computer screen.
        </p>
      </div>
      
      <div className="bg-gray-800 p-2 text-white text-sm flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span>{connected ? 'Connected' : 'Disconnected'}</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>Resolution: {resolution}</span>
          <span>FPS: {fps}</span>
        </div>
      </div>
    </div>
  );
};

export default VncDisplay;