// Status Display Component
export class StatusDisplay {
  constructor(eventBus, isDebugMode = false) {
    this.eventBus = eventBus;
    this.isDebugMode = isDebugMode;
    this.statusDisplay = null;
    this.debugToggle = null;
    this.connectionStatus = 'disconnected';
    this.currentSessionStatus = null;
    this.statusHistory = [];
    this.maxStatusHistory = 100;
  }
  
  init() {
    this.statusDisplay = document.getElementById('session-status');
    this.debugToggle = document.getElementById('debug-toggle');
    
    if (!this.statusDisplay) {
      console.error('Status display element not found');
      return;
    }
    
    this.setupEventListeners();
    this.updateStatusDisplay();
    
    console.log('StatusDisplay initialized');
  }
  
  setupEventListeners() {
    // Connection events
    this.eventBus.on('connectionStatus', this.handleConnectionStatus.bind(this));
    
    // Session events
    this.eventBus.on('sessionStatusReceived', this.handleSessionStatusReceived.bind(this));
    this.eventBus.on('sessionCreated', this.handleSessionCreated.bind(this));
    this.eventBus.on('sessionDeleted', this.handleSessionDeleted.bind(this));
    this.eventBus.on('sessionJoined', this.handleSessionJoined.bind(this));
    
    // Message events
    this.eventBus.on('messageSending', this.handleMessageSending.bind(this));
    this.eventBus.on('conversationHistoryCleared', this.handleConversationCleared.bind(this));
    
    // Debug toggle
    if (this.debugToggle) {
      this.debugToggle.addEventListener('change', (e) => {
        this.toggleDebugMode(e.target.checked);
      });
    }
  }
  
  updateStatusDisplay() {
    if (!this.statusDisplay) return;
    
    const statusText = this.getStatusText();
    const statusClass = this.getStatusClass();
    
    this.statusDisplay.innerHTML = `
      <div class="flex items-center space-x-2">
        <span class="status-dot w-2 h-2 rounded-full ${statusClass}"></span>
        <span class="status-text">${statusText}</span>
        ${this.isDebugMode ? this.getDebugInfo() : ''}
      </div>
    `;
  }
  
  getStatusText() {
    // Priority order: connection > session > default
    if (this.connectionStatus === 'connecting') {
      return 'Connecting to server...';
    }
    
    if (this.connectionStatus === 'disconnected') {
      return 'Disconnected from server';
    }
    
    if (this.connectionStatus === 'error') {
      return 'Connection error';
    }
    
    if (this.currentSessionStatus) {
      return this.getSessionStatusText(this.currentSessionStatus);
    }
    
    return 'Ready to start a new session';
  }
  
  getSessionStatusText(statusData) {
    const statusMessages = {
      'RUNNING': 'Agent is processing your request...',
      'END': 'Request completed successfully',
      'ERROR': 'An error occurred during processing',
      'PENDING': 'Request is pending...'
    };
    
    const baseMessage = statusMessages[statusData.status] || `Status: ${statusData.status}`;
    
    // Add custom message if available
    if (statusData.message && statusData.message !== statusData.status) {
      return `${baseMessage} - ${statusData.message}`;
    }
    
    return baseMessage;
  }
  
  getStatusClass() {
    if (this.connectionStatus === 'connecting') {
      return 'bg-warning animate-pulse';
    }
    
    if (this.connectionStatus === 'disconnected' || this.connectionStatus === 'error') {
      return 'bg-error';
    }
    
    if (this.currentSessionStatus) {
      const statusMap = {
        'RUNNING': 'bg-warning animate-pulse',
        'END': 'bg-success',
        'ERROR': 'bg-error',
        'PENDING': 'bg-info'
      };
      
      return statusMap[this.currentSessionStatus.status] || 'bg-info';
    }
    
    return 'bg-success';
  }
  
  getDebugInfo() {
    if (!this.isDebugMode) return '';
    
    const debugData = {
      connection: this.connectionStatus,
      sessionStatus: this.currentSessionStatus?.status || 'none',
      lastUpdate: this.currentSessionStatus?.timestamp || 'none',
      historyCount: this.statusHistory.length
    };
    
    return `
      <div class="text-xs text-base-content/50 ml-2">
        [Debug: ${JSON.stringify(debugData)}]
      </div>
    `;
  }
  
  addToStatusHistory(statusData) {
    this.statusHistory.unshift({
      ...statusData,
      timestamp: new Date().toISOString()
    });
    
    // Limit history size
    if (this.statusHistory.length > this.maxStatusHistory) {
      this.statusHistory = this.statusHistory.slice(0, this.maxStatusHistory);
    }
    
    if (this.isDebugMode) {
      console.log('Status history updated:', this.statusHistory[0]);
    }
  }
  
  showStatusNotification(statusData) {
    // Show toast notification for important status changes
    const importantStatuses = ['END', 'ERROR'];
    
    if (importantStatuses.includes(statusData.status)) {
      const toastType = statusData.status === 'ERROR' ? 'error' : 'success';
      const message = this.getSessionStatusText(statusData);
      
      this.eventBus.emit('showToast', {
        message,
        type: toastType,
        duration: 5000
      });
    }
  }
  
  showProgressIndicator(statusData) {
    // Show progress for running status
    if (statusData.status === 'RUNNING') {
      this.createProgressIndicator(statusData);
    } else {
      this.hideProgressIndicator();
    }
  }
  
  createProgressIndicator(statusData) {
    const existingProgress = document.getElementById('status-progress');
    if (existingProgress) return;
    
    const progressDiv = document.createElement('div');
    progressDiv.id = 'status-progress';
    progressDiv.className = 'mt-2';
    progressDiv.innerHTML = `
      <div class="flex items-center space-x-2">
        <progress class="progress progress-primary w-full" value="0" max="100"></progress>
        <span class="text-xs text-base-content/70">Processing...</span>
      </div>
    `;
    
    this.statusDisplay.appendChild(progressDiv);
    
    // Animate progress (simulated)
    this.animateProgress(progressDiv);
  }
  
  animateProgress(progressDiv) {
    const progressBar = progressDiv.querySelector('progress');
    if (!progressBar) return;
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      
      progressBar.value = progress;
    }, 500);
    
    // Store interval for cleanup
    progressDiv.dataset.interval = interval;
  }
  
  hideProgressIndicator() {
    const progressDiv = document.getElementById('status-progress');
    if (progressDiv) {
      const interval = progressDiv.dataset.interval;
      if (interval) {
        clearInterval(interval);
      }
      progressDiv.remove();
    }
  }
  
  // Public methods
  setDebugMode(enabled) {
    this.isDebugMode = enabled;
    
    if (this.debugToggle) {
      this.debugToggle.checked = enabled;
    }
    
    this.updateStatusDisplay();
    
    if (enabled) {
      this.showDebugPanel();
    } else {
      this.hideDebugPanel();
    }
  }
  
  toggleDebugMode(enabled) {
    this.setDebugMode(enabled);
    this.eventBus.emit('debugModeToggled', enabled);
  }
  
  showDebugPanel() {
    // Create or show debug panel
    let debugPanel = document.getElementById('debug-panel');
    if (!debugPanel) {
      debugPanel = this.createDebugPanel();
      document.body.appendChild(debugPanel);
    }
    
    debugPanel.classList.remove('hidden');
    this.updateDebugPanel();
  }
  
  hideDebugPanel() {
    const debugPanel = document.getElementById('debug-panel');
    if (debugPanel) {
      debugPanel.classList.add('hidden');
    }
  }
  
  createDebugPanel() {
    const panel = document.createElement('div');
    panel.id = 'debug-panel';
    panel.className = 'fixed bottom-4 right-4 w-80 max-h-96 bg-base-200 border border-base-300 rounded-lg shadow-lg overflow-hidden z-50';
    panel.innerHTML = `
      <div class="p-3 border-b border-base-300 flex items-center justify-between">
        <h3 class="text-sm font-semibold">Debug Panel</h3>
        <button class="btn btn-xs btn-ghost" onclick="this.parentElement.parentElement.classList.add('hidden')">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      <div class="p-3 overflow-y-auto max-h-80">
        <div id="debug-content" class="space-y-2"></div>
      </div>
    `;
    
    return panel;
  }
  
  updateDebugPanel() {
    const debugContent = document.getElementById('debug-content');
    if (!debugContent) return;
    
    debugContent.innerHTML = `
      <div class="text-xs space-y-2">
        <div>
          <div class="font-semibold">Connection Status:</div>
          <div class="text-base-content/70">${this.connectionStatus}</div>
        </div>
        
        <div>
          <div class="font-semibold">Session Status:</div>
          <div class="text-base-content/70">${this.currentSessionStatus?.status || 'none'}</div>
        </div>
        
        <div>
          <div class="font-semibold">Recent Status History:</div>
          <div class="space-y-1 mt-1">
            ${this.statusHistory.slice(0, 5).map(status => `
              <div class="text-xs p-1 bg-base-100 rounded">
                <div class="font-mono">${status.status}</div>
                <div class="text-base-content/50">${new Date(status.timestamp).toLocaleTimeString()}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }
  
  clearStatusHistory() {
    this.statusHistory = [];
    if (this.isDebugMode) {
      this.updateDebugPanel();
    }
  }
  
  exportStatusHistory() {
    const data = {
      statusHistory: this.statusHistory,
      currentStatus: this.currentSessionStatus,
      connectionStatus: this.connectionStatus,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zenobia-status-history-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  // Event handlers
  handleConnectionStatus(status) {
    this.connectionStatus = status;
    this.addToStatusHistory({ status: `connection_${status}`, type: 'connection' });
    this.updateStatusDisplay();
    
    if (this.isDebugMode) {
      this.updateDebugPanel();
    }
  }
  
  handleSessionStatusReceived(statusData) {
    this.currentSessionStatus = statusData;
    this.addToStatusHistory(statusData);
    this.updateStatusDisplay();
    this.showStatusNotification(statusData);
    this.showProgressIndicator(statusData);
    
    if (this.isDebugMode) {
      this.updateDebugPanel();
    }
  }
  
  handleSessionCreated(response) {
    this.currentSessionStatus = {
      status: 'CREATED',
      message: 'Session created successfully',
      sessionId: response.sessionId
    };
    this.updateStatusDisplay();
  }
  
  handleSessionDeleted(response) {
    this.currentSessionStatus = null;
    this.hideProgressIndicator();
    this.updateStatusDisplay();
    
    this.addToStatusHistory({
      status: 'DELETED',
      message: 'Session deleted',
      type: 'session'
    });
  }
  
  handleSessionJoined(response) {
    this.currentSessionStatus = {
      status: 'JOINED',
      message: 'Joined session successfully',
      sessionId: response.session?.sessionId
    };
    this.updateStatusDisplay();
  }
  
  handleMessageSending(data) {
    this.currentSessionStatus = {
      status: 'SENDING',
      message: 'Sending message...',
      type: 'message'
    };
    this.updateStatusDisplay();
  }
  
  handleConversationCleared() {
    this.currentSessionStatus = null;
    this.hideProgressIndicator();
    this.updateStatusDisplay();
  }
}