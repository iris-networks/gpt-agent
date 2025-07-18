// Session Manager Component
export class SessionManager {
  constructor(eventBus, sessionService) {
    this.eventBus = eventBus;
    this.sessionService = sessionService;
    this.currentSession = null;
    this.sessionHistory = [];
  }
  
  init() {
    this.sessionInfo = document.getElementById('session-info');
    this.newSessionBtn = document.getElementById('new-session-btn');
    this.deleteSessionBtn = document.getElementById('delete-session-btn');
    
    if (!this.sessionInfo) {
      console.error('Session info element not found');
      return;
    }
    
    this.setupEventListeners();
    this.loadSessionHistory();
    this.updateSessionDisplay();
    
    console.log('SessionManager initialized');
  }
  
  setupEventListeners() {
    // Session events
    this.eventBus.on('sessionUpdated', this.handleSessionUpdated.bind(this));
    this.eventBus.on('sessionCreated', this.handleSessionCreated.bind(this));
    this.eventBus.on('sessionDeleted', this.handleSessionDeleted.bind(this));
    this.eventBus.on('sessionJoined', this.handleSessionJoined.bind(this));
    this.eventBus.on('sessionStatusReceived', this.handleSessionStatusReceived.bind(this));
    
    // Connection events
    this.eventBus.on('connectionStatus', this.handleConnectionStatus.bind(this));
  }
  
  updateSessionDisplay() {
    if (!this.sessionInfo) return;
    
    if (!this.currentSession) {
      this.sessionInfo.innerHTML = `
        <div class="text-center">
          <div class="text-sm text-base-content/70">No active session</div>
          <div class="text-xs text-base-content/50 mt-1">Start a new conversation to begin</div>
        </div>
      `;
      
      if (this.deleteSessionBtn) {
        this.deleteSessionBtn.disabled = true;
      }
      return;
    }
    
    const sessionAge = this.getSessionAge(this.currentSession.createdAt);
    const statusBadge = this.getStatusBadge(this.currentSession.status);
    
    this.sessionInfo.innerHTML = `
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <div class="text-sm font-medium">Session Active</div>
          ${statusBadge}
        </div>
        
        <div class="text-xs text-base-content/70">
          <div>ID: ${this.currentSession.sessionId.substring(0, 8)}...</div>
          <div>Age: ${sessionAge}</div>
        </div>
        
        ${this.currentSession.files && this.currentSession.files.length > 0 ? `
          <div class="text-xs">
            <div class="text-base-content/70">Files: ${this.currentSession.files.length}</div>
            <div class="flex flex-wrap gap-1 mt-1">
              ${this.currentSession.files.map(file => `
                <span class="badge badge-xs badge-outline">${file.originalName || file.fileName}</span>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        ${this.currentSession.composioApps && this.currentSession.composioApps.length > 0 ? `
          <div class="text-xs">
            <div class="text-base-content/70">Apps: ${this.currentSession.composioApps.length}</div>
            <div class="flex flex-wrap gap-1 mt-1">
              ${this.currentSession.composioApps.map(app => `
                <span class="badge badge-xs badge-secondary">${app}</span>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
    
    if (this.deleteSessionBtn) {
      this.deleteSessionBtn.disabled = false;
    }
  }
  
  getStatusBadge(status) {
    const statusMap = {
      'RUNNING': { class: 'badge-warning', text: 'Running', icon: '⏳' },
      'END': { class: 'badge-success', text: 'Completed', icon: '✅' },
      'ERROR': { class: 'badge-error', text: 'Error', icon: '❌' },
      'PENDING': { class: 'badge-info', text: 'Pending', icon: '⏸️' }
    };
    
    const statusInfo = statusMap[status] || { class: 'badge-ghost', text: status, icon: '❓' };
    
    return `
      <div class="badge ${statusInfo.class} badge-sm">
        <span class="mr-1">${statusInfo.icon}</span>
        ${statusInfo.text}
      </div>
    `;
  }
  
  getSessionAge(createdAt) {
    if (!createdAt) return 'Unknown';
    
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays}d ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else if (diffMins > 0) {
      return `${diffMins}m ago`;
    } else {
      return 'Just now';
    }
  }
  
  loadSessionHistory() {
    // Load session history from localStorage or service
    const saved = localStorage.getItem('zenobia-session-history');
    if (saved) {
      try {
        this.sessionHistory = JSON.parse(saved);
      } catch (error) {
        console.error('Error loading session history:', error);
        this.sessionHistory = [];
      }
    }
    
    this.updateSessionHistoryDisplay();
  }
  
  saveSessionHistory() {
    localStorage.setItem('zenobia-session-history', JSON.stringify(this.sessionHistory));
  }
  
  updateSessionHistoryDisplay() {
    // This could be implemented to show recent sessions in a dropdown or modal
    // For now, we'll just log it
    console.log('Session history updated:', this.sessionHistory.length, 'sessions');
  }
  
  addToSessionHistory(session) {
    const historyEntry = {
      sessionId: session.sessionId,
      status: session.status,
      createdAt: session.createdAt,
      endedAt: new Date().toISOString(),
      filesCount: session.files?.length || 0,
      composioAppsCount: session.composioApps?.length || 0
    };
    
    this.sessionHistory.unshift(historyEntry);
    
    // Keep only last 50 sessions
    if (this.sessionHistory.length > 50) {
      this.sessionHistory = this.sessionHistory.slice(0, 50);
    }
    
    this.saveSessionHistory();
    this.updateSessionHistoryDisplay();
  }
  
  // Public methods
  createNewSession() {
    if (this.currentSession) {
      const confirmMessage = 'This will end the current session. Continue?';
      if (!confirm(confirmMessage)) {
        return;
      }
    }
    
    this.eventBus.emit('createNewSession');
  }
  
  deleteCurrentSession() {
    if (!this.currentSession) {
      return;
    }
    
    const confirmMessage = 'Are you sure you want to delete this session? This action cannot be undone.';
    if (!confirm(confirmMessage)) {
      return;
    }
    
    this.eventBus.emit('deleteSession');
  }
  
  exportSession() {
    if (!this.currentSession) {
      this.showError('No active session to export');
      return;
    }
    
    const exportData = this.sessionService.exportConversation();
    
    // Create download link
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zenobia-session-${this.currentSession.sessionId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.showSuccess('Session exported successfully');
  }
  
  importSession(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const success = this.sessionService.importConversation(e.target.result);
        if (success) {
          this.showSuccess('Session imported successfully');
        } else {
          this.showError('Failed to import session');
        }
      } catch (error) {
        console.error('Import error:', error);
        this.showError('Invalid session file');
      }
    };
    
    reader.readAsText(file);
  }
  
  // Event handlers
  handleSessionUpdated(session) {
    this.currentSession = session;
    this.updateSessionDisplay();
  }
  
  handleSessionCreated(response) {
    console.log('Session created in manager:', response);
    this.updateSessionDisplay();
  }
  
  handleSessionDeleted(response) {
    if (this.currentSession) {
      this.addToSessionHistory(this.currentSession);
    }
    
    this.currentSession = null;
    this.updateSessionDisplay();
    
    console.log('Session deleted in manager:', response);
  }
  
  handleSessionJoined(response) {
    console.log('Session joined in manager:', response);
    this.updateSessionDisplay();
  }
  
  handleSessionStatusReceived(statusData) {
    if (this.currentSession && statusData.sessionId === this.currentSession.sessionId) {
      this.currentSession.status = statusData.status;
      this.currentSession.lastStatusUpdate = new Date().toISOString();
      this.updateSessionDisplay();
    }
  }
  
  handleConnectionStatus(status) {
    // Update UI based on connection status
    if (this.newSessionBtn) {
      this.newSessionBtn.disabled = status !== 'connected';
    }
    
    if (this.deleteSessionBtn) {
      this.deleteSessionBtn.disabled = status !== 'connected' || !this.currentSession;
    }
  }
  
  // Utility methods
  showError(message) {
    this.eventBus.emit('error', { message });
  }
  
  showSuccess(message) {
    this.eventBus.emit('success', { message });
  }
  
  showInfo(message) {
    this.eventBus.emit('info', { message });
  }
  
  getSessionStats() {
    return {
      current: this.currentSession,
      historyCount: this.sessionHistory.length,
      totalSessions: this.sessionHistory.length + (this.currentSession ? 1 : 0)
    };
  }
  
  clearSessionHistory() {
    if (confirm('Are you sure you want to clear all session history?')) {
      this.sessionHistory = [];
      this.saveSessionHistory();
      this.updateSessionHistoryDisplay();
      this.showSuccess('Session history cleared');
    }
  }
}