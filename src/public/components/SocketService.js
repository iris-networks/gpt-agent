// Socket and API services

// Initialize socket connection
export const initializeSocket = (callbacks) => {
  const socketInstance = io(window.location.origin);
  
  // Basic socket connection events
  socketInstance.on('connect', () => {
    console.log('Socket connected');
    if (callbacks.onConnect) callbacks.onConnect();
  });

  socketInstance.on('disconnect', () => {
    console.log('Socket disconnected');
    if (callbacks.onDisconnect) callbacks.onDisconnect();
  });

  // Session status events
  socketInstance.on('sessionStatus', (data) => {
    console.log('Session status update:', data);
    if (callbacks.onSessionStatus) callbacks.onSessionStatus(data);
  });
  
  // Return the socket instance for other operations
  return socketInstance;
};

// Session API operations
export const createSession = (socket, payload, callback) => {
  if (!socket) return;
  socket.emit('createSession', payload, (response) => {
    console.log('Create session response:', response);
    if (callback) callback(response);
  });
};

export const cancelSession = (socket, callback) => {
  if (!socket) return;
  socket.emit('cancelSession', (response) => {
    console.log('Cancel session response:', response);
    if (callback) callback(response);
  });
};

export const takeScreenshot = (socket, callback) => {
  if (!socket) return;
  socket.emit('takeScreenshot', (response) => {
    console.log('Screenshot response:', response);
    if (callback) callback(response);
  });
};

// Video API operations
export const fetchVideoRecording = async (sessionId) => {
  try {
    const response = await fetch(`/api/videos/session/${sessionId}`);
    if (!response.ok) {
      throw new Error(`Error fetching video: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching video:', error);
    throw error;
  }
};

// File upload operations
export const uploadFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/files/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Error uploading file: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error uploading file: ${error.message}`);
    throw error;
  }
};