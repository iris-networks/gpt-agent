// Chat panel component
import { MessageList, IntermediateMessages } from './MessageComponents.js';
import { AttachedFilesArea } from './FileUploadComponents.js';
import { VideoStatusComponent } from './VideoComponents.js';

const ChatPanel = ({
  width,
  currentMode,
  setMode,
  takeScreenshot,
  displayMode,
  toggleDisplayMode,
  messages,
  intermediateMessages,
  messageEndRef,
  videoStatus,
  videoRecording,
  playVideoRecording,
  sessionId,
  status,
  checkVideoRecording,
  attachedFiles,
  removeAttachedFile,
  instruction,
  setInstruction,
  handleSendInstruction,
  handleInstructionKeyDown
}) => {
  return (
    <div className={`flex flex-col ${width} h-full border-r transition-all duration-300`}>
      {/* Header */}
      <div className="bg-white p-4 border-b flex justify-between items-center">
        <h1 className="text-xl font-semibold">AI Agent Assistant</h1>
        <div className="flex space-x-2">
          <button 
            className={`px-3 py-1 rounded-lg flex items-center ${currentMode === 'Computer Use' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
            onClick={() => setMode('Computer Use')}
          >
            <span className="material-icons mr-1">💻</span> Computer Use
          </button>
          <button 
            className={`px-3 py-1 rounded-lg flex items-center ${currentMode === 'Browser Use' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
            onClick={() => setMode('Browser Use')}
          >
            <span className="material-icons mr-1">🌐</span> Browser Use
          </button>
          <button 
            className="px-3 py-1 rounded-lg bg-gray-100"
            onClick={takeScreenshot}
            title="Take screenshot"
          >
            <span className="material-icons">📷</span>
          </button>
          {sessionId && status === 'COMPLETED' && (
            <button 
              className="px-3 py-1 rounded-lg bg-gray-100 ml-1"
              onClick={() => checkVideoRecording(sessionId)}
              title="Check for recording"
            >
              <span className="material-icons">🎬</span>
            </button>
          )}
          {displayMode !== 'chat' && (
            <button 
              className="px-3 py-1 rounded-lg bg-gray-100 ml-2"
              onClick={() => toggleDisplayMode('chat')}
              title="Expand chat"
            >
              <span className="material-icons">⬅️</span>
            </button>
          )}
          {displayMode !== 'split' && (
            <button 
              className="px-3 py-1 rounded-lg bg-gray-100"
              onClick={() => toggleDisplayMode('split')}
              title="Split view"
            >
              <span className="material-icons">⬌</span>
            </button>
          )}
        </div>
      </div>
      
      {/* Message area */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50">
        <MessageList 
          messages={messages} 
          messageEndRef={messageEndRef} 
        />
        
        {/* Intermediate messages toggle */}
        <IntermediateMessages messages={intermediateMessages} />
        
        {/* Video recording status and controls */}
        <VideoStatusComponent 
          videoStatus={videoStatus}
          videoRecording={videoRecording}
          onPlayVideo={playVideoRecording}
        />
      </div>
      
      {/* Attached files area */}
      <AttachedFilesArea 
        files={attachedFiles} 
        onRemoveFile={removeAttachedFile} 
      />
      
      {/* Input area */}
      <div className="p-4 border-t bg-white">
        <div className="flex items-center space-x-3">
          <input 
            type="file" 
            id="file-upload" 
            className="hidden" 
            onChange={(e) => document.getElementById('file-upload').onchange(e)}
            multiple
          />
          <button 
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
            onClick={() => document.getElementById('file-upload').click()}
            title="Attach file"
          >
            <span className="material-icons">📎</span>
          </button>
          <textarea
            className="flex-grow p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Type your instruction here..."
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            onKeyDown={handleInstructionKeyDown}
            rows="1"
          />
          <button 
            onClick={handleSendInstruction}
            className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600"
            title="Send"
          >
            <span className="material-icons">➡️</span>
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          Current mode: {currentMode}
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;