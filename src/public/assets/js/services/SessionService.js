// Session Service for managing chat sessions
export class SessionService {
  constructor(eventBus, socketService) {
    this.eventBus = eventBus;
    this.socketService = socketService;
    this.currentSession = null;
    this.sessionHistory = [];
    this.conversationHistory = [];
    
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    // Listen for session events from socket service
    this.eventBus.on('sessionCreated', this.handleSessionCreated.bind(this));
    this.eventBus.on('sessionContinued', this.handleSessionContinued.bind(this));
    this.eventBus.on('sessionJoined', this.handleSessionJoined.bind(this));
    this.eventBus.on('sessionDeleted', this.handleSessionDeleted.bind(this));
    this.eventBus.on('sessionStatusUpdate', this.handleSessionStatusUpdate.bind(this));
    
    // Listen for message events
    this.eventBus.on('sendMessage', this.handleSendMessage.bind(this));
    this.eventBus.on('createNewSession', this.handleCreateNewSession.bind(this));
    this.eventBus.on('deleteSession', this.handleDeleteSession.bind(this));
  }
  
  // Session management methods
  async createSession(instructions, fileIds = [], files = [], composioApps = []) {
    try {
      // Add user message to conversation history
      this.addToConversationHistory({
        sender: 'user',
        message: instructions,
        timestamp: new Date().toISOString(),
        files: files,
        fileIds: fileIds,
        type: 'message'
      });
      
      // Send create session request
      this.socketService.createSession(instructions, fileIds, files, composioApps);
      
      // Update UI to show sending state
      this.eventBus.emit('messageSending', {
        message: instructions,
        files: files,
        fileIds: fileIds
      });
      
    } catch (error) {
      console.error('Error creating session:', error);
      this.eventBus.emit('error', { message: 'Failed to create session' });
    }
  }
  
  async continueSession(instructions, fileIds = [], files = []) {
    try {
      if (!this.currentSession) {
        throw new Error('No active session to continue');
      }
      
      // Add user message to conversation history
      this.addToConversationHistory({
        sender: 'user',
        message: instructions,
        timestamp: new Date().toISOString(),
        files: files,
        fileIds: fileIds,
        type: 'message'
      });
      
      // Send continue session request
      this.socketService.continueSession(instructions, fileIds, files);
      
      // Update UI to show sending state
      this.eventBus.emit('messageSending', {
        message: instructions,
        files: files,
        fileIds: fileIds
      });
      
    } catch (error) {
      console.error('Error continuing session:', error);
      this.eventBus.emit('error', { message: 'Failed to continue session' });
    }
  }
  
  async joinSession() {
    try {
      this.socketService.joinSession();
    } catch (error) {
      console.error('Error joining session:', error);
      this.eventBus.emit('error', { message: 'Failed to join session' });
    }
  }
  
  async deleteSession() {
    try {
      if (!this.currentSession) {
        throw new Error('No active session to delete');
      }
      
      this.socketService.deleteSession();
    } catch (error) {
      console.error('Error deleting session:', error);
      this.eventBus.emit('error', { message: 'Failed to delete session' });
    }
  }
  
  // Event handlers
  handleSessionCreated(response) {
    this.currentSession = {
      sessionId: response.sessionId,
      status: response.status,
      files: response.files || [],
      fileIds: response.fileIds || [],
      composioApps: response.composioApps || [],
      createdAt: new Date().toISOString()
    };
    
    this.addToSessionHistory(this.currentSession);
    this.eventBus.emit('sessionUpdated', this.currentSession);
    
    console.log('Session created:', this.currentSession);
  }
  
  handleSessionContinued(response) {
    if (this.currentSession) {
      this.currentSession.status = response.status;
      this.currentSession.files = response.files || this.currentSession.files;
      this.currentSession.fileIds = response.fileIds || this.currentSession.fileIds;
      this.currentSession.lastContinuedAt = new Date().toISOString();
    }
    
    this.eventBus.emit('sessionUpdated', this.currentSession);
    
    console.log('Session continued:', this.currentSession);
  }
  
  handleSessionJoined(response) {
    if (response.session) {
      this.currentSession = {
        ...response.session,
        joinedAt: new Date().toISOString()
      };
      
      // Load conversation history if available
      if (response.session.conversations) {
        this.conversationHistory = response.session.conversations;
        this.eventBus.emit('conversationHistoryLoaded', this.conversationHistory);
      }
      
      this.eventBus.emit('sessionUpdated', this.currentSession);
    }
    
    console.log('Session joined:', this.currentSession);
  }
  
  handleSessionDeleted(response) {
    const deletedSession = this.currentSession;
    this.currentSession = null;
    this.conversationHistory = [];
    
    this.eventBus.emit('sessionUpdated', null);
    this.eventBus.emit('conversationHistoryCleared');
    
    console.log('Session deleted:', deletedSession);
  }
  
  handleSessionStatusUpdate(statusData) {
    // Add status update to conversation history
    this.addToConversationHistory({
      sender: 'system',
      message: statusData.message || statusData.status,
      timestamp: new Date().toISOString(),
      status: statusData.status,
      sessionId: statusData.sessionId,
      type: 'status',
      data: statusData.data
    });
    
    // Update current session status
    if (this.currentSession && statusData.sessionId === this.currentSession.sessionId) {
      this.currentSession.status = statusData.status;
      this.currentSession.lastStatusUpdate = new Date().toISOString();
    }
    
    this.eventBus.emit('sessionStatusReceived', statusData);
    
    console.log('Session status update:', statusData);
  }
  
  handleSendMessage(data) {
    const { message, files, type } = data;
    
    if (type === 'createSession') {
      this.createSession(message, files?.map(f => f.fileId) || [], files || []);
    } else if (type === 'continueSession') {
      this.continueSession(message, files?.map(f => f.fileId) || [], files || []);
    }
  }
  
  handleCreateNewSession() {
    // Clear current session and conversation history
    this.currentSession = null;
    this.conversationHistory = [];
    
    this.eventBus.emit('sessionUpdated', null);
    this.eventBus.emit('conversationHistoryCleared');
    
    console.log('Ready for new session');
  }
  
  handleDeleteSession() {
    this.deleteSession();
  }
  
  // Conversation history management
  addToConversationHistory(entry) {
    this.conversationHistory.push({
      id: this.generateMessageId(),
      ...entry
    });
    
    // Limit conversation history to prevent memory issues
    if (this.conversationHistory.length > 1000) {
      this.conversationHistory = this.conversationHistory.slice(-500);
    }
    
    this.eventBus.emit('conversationHistoryUpdated', this.conversationHistory);
  }
  
  getConversationHistory() {
    return this.conversationHistory;
  }
  
  clearConversationHistory() {
    this.conversationHistory = [];
    this.eventBus.emit('conversationHistoryCleared');
  }
  
  // Session history management
  addToSessionHistory(session) {
    this.sessionHistory.push({
      ...session,
      archivedAt: new Date().toISOString()
    });
    
    // Keep only last 50 sessions
    if (this.sessionHistory.length > 50) {
      this.sessionHistory = this.sessionHistory.slice(-25);
    }
    
    this.saveSessionHistory();
  }
  
  getSessionHistory() {
    return this.sessionHistory;
  }
  
  // Persistence methods
  saveSessionHistory() {
    try {
      localStorage.setItem('zenobia_session_history', JSON.stringify(this.sessionHistory));
    } catch (error) {
      console.error('Error saving session history:', error);
    }
  }
  
  loadSessionHistory() {
    try {
      const saved = localStorage.getItem('zenobia_session_history');
      if (saved) {
        this.sessionHistory = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading session history:', error);
      this.sessionHistory = [];
    }
  }
  
  // Utility methods
  generateMessageId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
  
  getCurrentSession() {
    return this.currentSession;
  }
  
  hasActiveSession() {
    return this.currentSession !== null;
  }
  
  getSessionStatus() {
    return this.currentSession?.status || 'none';
  }
  
  // Message filtering for debug mode
  getFilteredMessages(includeDebugMessages = false) {
    if (includeDebugMessages) {
      return this.conversationHistory;
    }
    
    return this.conversationHistory.filter(entry => {
      // Always show user messages
      if (entry.sender === 'user') {
        return true;
      }
      
      // Show system messages that are END status or final responses
      if (entry.sender === 'system' && entry.status === 'END') {
        return true;
      }
      
      // Show error messages
      if (entry.type === 'error') {
        return true;
      }
      
      // Hide running/debug messages
      return false;
    });
  }
  
  // Export conversation
  exportConversation() {
    const exportData = {
      session: this.currentSession,
      conversation: this.conversationHistory,
      exportedAt: new Date().toISOString()
    };
    
    return JSON.stringify(exportData, null, 2);
  }
  
  // Import conversation
  importConversation(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.session) {
        this.currentSession = data.session;
        this.eventBus.emit('sessionUpdated', this.currentSession);
      }
      
      if (data.conversation) {
        this.conversationHistory = data.conversation;
        this.eventBus.emit('conversationHistoryLoaded', this.conversationHistory);
      }
      
      return true;
    } catch (error) {
      console.error('Error importing conversation:', error);
      return false;
    }
  }
}