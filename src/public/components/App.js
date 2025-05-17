// App.js component for Iris VNC Interface
import { StatusEnum } from './constants.js';
import { initializeSocket, createSession, takeScreenshot as takeScreenshotAPI } from './SocketService.js';
import { useFileUpload } from './FileUploadComponents.js';
import { useVideoRecording } from './VideoComponents.js';
import ChatPanel from './ChatPanel.js';
import VncDisplay from './VncDisplay.js';

const { useState, useEffect, useRef } = React;

const App = () => {
  // Socket connection state
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  
  // Session state
  const [sessionId, setSessionId] = useState(null);
  const [status, setStatus] = useState(StatusEnum.INITIALIZING);
  
  // Message state
  const [messages, setMessages] = useState([]);
  const [intermediateMessages, setIntermediateMessages] = useState([]);
  const [instruction, setInstruction] = useState('');
  const messageEndRef = useRef(null);
  
  // UI state
  const [currentMode, setCurrentMode] = useState('Computer Use');
  const [resolution, setResolution] = useState('1920x1080');
  const [fps, setFps] = useState(30);
  const [displayMode, setDisplayMode] = useState('split');
  
  // File upload hooks
  const { 
    attachedFiles, 
    handleFileUpload, 
    removeAttachedFile, 
    clearAttachedFiles 
  } = useFileUpload(addMessage);
  
  // Video recording hooks
  const {
    videoRecording,
    videoStatus,
    checkVideoRecording,
    playVideoRecording
  } = useVideoRecording(addMessage);

  // Connect to socket and set up event listeners
  useEffect(() => {
    const socketInstance = initializeSocket({
      onConnect: () => setConnected(true),
      onDisconnect: () => setConnected(false),
      onSessionStatus: handleSessionStatus
    });
    
    setSocket(socketInstance);
    
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Handle session status updates
  const handleSessionStatus = (data) => {
    // Update session data
    if (data.sessionId) setSessionId(data.sessionId);
    if (data.status) setStatus(data.status);

    // Handle file attachments if present
    if (data.data && data.data.files) {
      console.log('File attachments in status update:', data.data.files || data.data.fileIds);
    }

    // Handle message updates based on status
    if (data.message) {
      if (data.status === StatusEnum.RUNNING) {
        // Store intermediate messages separately
        setIntermediateMessages(prev => [...prev, {
          role: 'assistant',
          content: data.message,
          timestamp: Date.now(),
          status: data.status
        }]);

        // Update the temporary assistant message
        setMessages(prevMessages => {
          // Get messages in their correct order, preserving user and system messages
          const orderedMessages = [];

          // First add user and system messages
          for (const msg of prevMessages) {
            if (msg.role === 'user' || msg.role === 'system') {
              orderedMessages.push(msg);
            } else if (msg.role === 'assistant' && msg.isFinalMessage) {
              // Keep any final assistant messages
              orderedMessages.push(msg);
            }
          }

          // Then add the current intermediate message at the end
          orderedMessages.push({
            role: 'assistant',
            content: data.message,
            timestamp: Date.now(),
            isIntermediate: true
          });

          return orderedMessages;
        });
      } else if (data.status === StatusEnum.COMPLETED || data.status === StatusEnum.END || data.status === StatusEnum.MAX_LOOP) {
        // Add final message as a permanent message
        setMessages(prevMessages => {
          // Get messages in their correct order
          const orderedMessages = [];

          // First add user and system messages
          for (const msg of prevMessages) {
            if (msg.role === 'user' || msg.role === 'system') {
              orderedMessages.push(msg);
            }
            // Skip intermediate messages in the main chat
            // They will still be available in the "AI Thinking Process" section
          }

          // Then add the final message
          orderedMessages.push({
            role: 'assistant',
            content: data.message,
            timestamp: Date.now(),
            isFinalMessage: true,
          });

          return orderedMessages;
        });

        // Add a specific message for MAX_LOOP status
        if (data.status === StatusEnum.MAX_LOOP) {
          addMessage('system', 'Maximum execution steps reached.');
        }
      } else if (data.status === StatusEnum.ERROR) {
        // Handle error message
        addMessage('system', `Error: ${data.message}`);
      }
    }

    // Handle explicit errors
    if (data.data && data.data.error) {
      addMessage('system', `Error: ${data.data.error}`);
    }
  };

  // Add a message to the chat
  function addMessage(role, content) {
    setMessages(prev => [...prev, { role, content, timestamp: Date.now() }]);
  }

  // Handle sending instruction
  const handleSendInstruction = () => {
    if (!socket || !instruction.trim()) return;

    // Add file attachments to the payload if present
    const payload = {
      instructions: instruction,
      operator: currentMode === 'Browser Use' ? 'browser' : 'computer'
    };

    // If we have file attachments, include them
    if (attachedFiles.length > 0) {
      // Filter out files that have upload errors or are still uploading
      const validFiles = attachedFiles.filter(file => !file.error && !file.uploading);

      if (validFiles.length > 0) {
        // Create a proper FileMetadataDto array for the backend
        const fileMetadata = validFiles.map(file => ({
          fileId: file.id,
          fileName: file.name,
          originalName: file.originalName || file.name,
          mimeType: file.type,
          fileSize: file.size
        }));

        // Add files to payload
        payload.files = fileMetadata;

        // Add a message to show which files are being attached
        const fileNames = validFiles.map(file => file.name).join(', ');
        console.log(`Attaching files to session: ${fileNames}`);
      } else if (attachedFiles.some(file => file.uploading)) {
        // If files are still uploading, show a message
        addMessage('system', 'Some files are still uploading. Please wait for uploads to complete.');
        return; // Don't create the session yet
      }
    }

    // Create session
    createSession(socket, payload, (response) => {
      if (response.success) {
        setSessionId(response.sessionId);
        setStatus(response.status);

        // Start with user message in the main messages
        setMessages([{
          role: 'user',
          content: instruction,
          timestamp: Date.now()
        }]);

        // Clear intermediate messages from previous sessions
        setIntermediateMessages([]);

        setInstruction('');

        // Clear attached files after creating the session
        clearAttachedFiles();
      } else if (response.error) {
        addMessage('system', `Error creating session: ${response.error}`);
      }
    });
  };

  // Handle instruction input (including Enter key)
  const handleInstructionKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendInstruction();
    }
  };

  // Take a screenshot
  const takeScreenshot = () => {
    if (!socket || !sessionId) return;
    
    takeScreenshotAPI(socket, (response) => {
      if (response.success && response.screenshot) {
        addMessage('system', 'Screenshot taken');
      } else if (response.error) {
        addMessage('system', `Error taking screenshot: ${response.error}`);
      }
    });
  };

  // Set the current mode
  const setMode = (mode) => {
    setCurrentMode(mode);
  };

  // Toggle display mode
  const toggleDisplayMode = (mode) => {
    setDisplayMode(mode);
  };

  // Get current widths based on display mode
  const getWidths = () => {
    switch (displayMode) {
      case 'chat': return { chat: 'w-full', vnc: 'w-0 hidden' };
      case 'vnc': return { chat: 'w-0 hidden', vnc: 'w-full' };
      default: return { chat: 'w-1/2', vnc: 'w-1/2' };
    }
  };

  const { chat: chatWidth, vnc: vncWidth } = getWidths();

  // Set file upload handler
  useEffect(() => {
    const fileUploadElement = document.getElementById('file-upload');
    if (fileUploadElement) {
      fileUploadElement.onchange = handleFileUpload;
    }
  }, []);

  return (
    <div className="flex h-full">
      {/* Chat Panel */}
      <ChatPanel
        width={chatWidth}
        currentMode={currentMode}
        setMode={setMode}
        takeScreenshot={takeScreenshot}
        displayMode={displayMode}
        toggleDisplayMode={toggleDisplayMode}
        messages={messages}
        intermediateMessages={intermediateMessages}
        messageEndRef={messageEndRef}
        videoStatus={videoStatus}
        videoRecording={videoRecording}
        playVideoRecording={playVideoRecording}
        sessionId={sessionId}
        status={status}
        checkVideoRecording={checkVideoRecording}
        attachedFiles={attachedFiles}
        removeAttachedFile={removeAttachedFile}
        instruction={instruction}
        setInstruction={setInstruction}
        handleSendInstruction={handleSendInstruction}
        handleInstructionKeyDown={handleInstructionKeyDown}
      />
      
      {/* VNC Display */}
      <VncDisplay
        connected={connected}
        resolution={resolution}
        fps={fps}
        displayMode={displayMode}
        toggleDisplayMode={toggleDisplayMode}
      />
    </div>
  );
};

export default App;