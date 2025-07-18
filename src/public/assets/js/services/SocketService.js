// Socket.IO Service for WebSocket communication
export class SocketService {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.isConnected = false;
    this.connectionStatus = 'disconnected';
  }
  
  connect() {
    if (this.socket) {
      this.socket.disconnect();
    }
    
    this.updateConnectionStatus('connecting');
    
    // Connect to the WebSocket server
    this.socket = io({
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
      timeout: 20000
    });
    
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    // Connection events
    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.updateConnectionStatus('connected');
      
      // Join the session if there's an active one
      this.joinSession();
    });
    
    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
      this.isConnected = false;
      this.updateConnectionStatus('disconnected');
      
      // Attempt to reconnect if not a manual disconnect
      if (reason !== 'io client disconnect') {
        this.handleReconnect();
      }
    });
    
    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.updateConnectionStatus('error');
      this.handleReconnect();
    });
    
    // Session events
    this.socket.on('sessionStatus', (data) => {
      console.log('Session status:', data);
      this.eventBus.emit('sessionStatusUpdate', data);
    });
    
    // Listen for session responses
    this.socket.on('createSession', (response) => {
      console.log('Create session response:', response);
      if (response.success) {
        this.eventBus.emit('sessionCreated', response);
      } else {
        this.eventBus.emit('error', { message: response.error });
      }
    });
    
    this.socket.on('continueSession', (response) => {
      console.log('Continue session response:', response);
      if (response.success) {
        this.eventBus.emit('sessionContinued', response);
      } else {
        this.eventBus.emit('error', { message: response.error });
      }
    });
    
    this.socket.on('joinSession', (response) => {
      console.log('Join session response:', response);
      if (response.success) {
        this.eventBus.emit('sessionJoined', response);
      } else {
        this.eventBus.emit('error', { message: response.error });
      }
    });
    
    this.socket.on('deleteSession', (response) => {
      console.log('Delete session response:', response);
      if (response.success) {
        this.eventBus.emit('sessionDeleted', response);
      } else {
        this.eventBus.emit('error', { message: response.error });
      }
    });
    
    // Error handling
    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      this.eventBus.emit('error', { message: error.message || 'Socket error occurred' });
    });
  }
  
  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      this.updateConnectionStatus('connecting');
      
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
      this.updateConnectionStatus('failed');
      this.eventBus.emit('error', { 
        message: 'Failed to connect to server after multiple attempts' 
      });
    }
  }
  
  updateConnectionStatus(status) {
    this.connectionStatus = status;
    this.eventBus.emit('connectionStatus', status);
  }
  
  // Session management methods
  createSession(instructions, fileIds = [], files = [], composioApps = []) {
    if (!this.isConnected) {
      this.eventBus.emit('error', { message: 'Not connected to server' });
      return;
    }
    
    const payload = {
      instructions,
      fileIds,
      files,
      composioApps
    };
    
    console.log('Creating session with payload:', payload);
    this.socket.emit('createSession', payload);
  }
  
  continueSession(instructions, fileIds = [], files = []) {
    if (!this.isConnected) {
      this.eventBus.emit('error', { message: 'Not connected to server' });
      return;
    }
    
    const payload = {
      instructions,
      fileIds,
      files
    };
    
    console.log('Continuing session with payload:', payload);
    this.socket.emit('continueSession', payload);
  }
  
  joinSession() {
    if (!this.isConnected) {
      return;
    }
    
    console.log('Joining session');
    this.socket.emit('joinSession');
  }
  
  leaveSession() {
    if (!this.isConnected) {
      return;
    }
    
    console.log('Leaving session');
    this.socket.emit('leaveSession');
  }
  
  deleteSession() {
    if (!this.isConnected) {
      this.eventBus.emit('error', { message: 'Not connected to server' });
      return;
    }
    
    console.log('Deleting session');
    this.socket.emit('deleteSession');
  }
  
  // Utility methods
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.updateConnectionStatus('disconnected');
  }
  
  getConnectionStatus() {
    return this.connectionStatus;
  }
  
  isSocketConnected() {
    return this.isConnected && this.socket && this.socket.connected;
  }
  
  // Heartbeat to maintain connection
  startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.socket.emit('ping');
      }
    }, 30000); // Send ping every 30 seconds
  }
  
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}