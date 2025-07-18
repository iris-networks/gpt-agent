// Main Application Controller
import { SocketService } from './services/SocketService.js';
import { FileService } from './services/FileService.js';
import { SessionService } from './services/SessionService.js';
import { ChatInterface } from './components/ChatInterface.js';
import { FileUpload } from './components/FileUpload.js';
import { SessionManager } from './components/SessionManager.js';
import { StatusDisplay } from './components/StatusDisplay.js';
import { ThemeManager } from './utils/ThemeManager.js';
import { EventBus } from './utils/EventBus.js';

class ZenobiaApp {
  constructor() {
    this.eventBus = new EventBus();
    this.themeManager = new ThemeManager();
    this.isDebugMode = localStorage.getItem('debugMode') === 'true';
    this.isInitialized = false;
    
    // Initialize services
    this.socketService = new SocketService(this.eventBus);
    this.fileService = new FileService(this.eventBus);
    this.sessionService = new SessionService(this.eventBus, this.socketService);
    
    // Initialize components
    this.chatInterface = new ChatInterface(this.eventBus, this.isDebugMode);
    this.fileUpload = new FileUpload(this.eventBus, this.fileService);
    this.sessionManager = new SessionManager(this.eventBus, this.sessionService);
    this.statusDisplay = new StatusDisplay(this.eventBus, this.isDebugMode);
    
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.initializeComponents();
    this.connectToServer();
    this.loadSettings();
    
    // Mark as initialized after everything is set up
    this.isInitialized = true;
    
    console.log('Zenobia Chat Application initialized');
  }
  
  setupEventListeners() {
    // Global event listeners
    this.eventBus.on('connectionStatus', this.handleConnectionStatus.bind(this));
    this.eventBus.on('sessionCreated', this.handleSessionCreated.bind(this));
    this.eventBus.on('sessionEnded', this.handleSessionEnded.bind(this));
    this.eventBus.on('error', this.handleError.bind(this));
    this.eventBus.on('debugModeToggled', this.handleDebugModeToggle.bind(this));
    
    // UI event listeners
    this.setupUIEventListeners();
    
    // Keyboard shortcuts
    this.setupKeyboardShortcuts();
  }
  
  setupUIEventListeners() {
    // Message input
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const continueBtn = document.getElementById('continue-btn');
    
    messageInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
    
    sendBtn?.addEventListener('click', () => this.sendMessage());
    continueBtn?.addEventListener('click', () => this.continueSession());
    
    // File upload toggle
    const fileUploadBtn = document.getElementById('file-upload-btn');
    fileUploadBtn?.addEventListener('click', () => this.toggleFileUpload());
    
    // Session management
    const newSessionBtn = document.getElementById('new-session-btn');
    const deleteSessionBtn = document.getElementById('delete-session-btn');
    
    newSessionBtn?.addEventListener('click', () => this.createNewSession());
    deleteSessionBtn?.addEventListener('click', () => this.deleteSession());
    
    // Debug toggle
    const debugToggle = document.getElementById('debug-toggle');
    debugToggle?.addEventListener('change', (e) => {
      this.toggleDebugMode(e.target.checked);
    });
    
    // Auto-resize textarea
    messageInput?.addEventListener('input', this.autoResizeTextarea.bind(this));
  }
  
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + Enter to send message
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        this.sendMessage();
      }
      
      // Ctrl/Cmd + N for new session
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        this.createNewSession();
      }
      
      // Ctrl/Cmd + D to toggle debug mode
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        this.toggleDebugMode();
      }
      
      // Escape to close file upload
      if (e.key === 'Escape') {
        this.hideFileUpload();
      }
    });
  }
  
  initializeComponents() {
    // Initialize all components
    this.chatInterface.init();
    this.fileUpload.init();
    this.sessionManager.init();
    this.statusDisplay.init();
    this.themeManager.init();
    
    // Set initial debug mode state without triggering events
    const debugToggle = document.getElementById('debug-toggle');
    if (debugToggle) {
      debugToggle.checked = this.isDebugMode;
    }
    
    // Set initial debug mode on components without emitting events
    this.chatInterface.setDebugMode(this.isDebugMode);
    this.statusDisplay.setDebugMode(this.isDebugMode);
    document.body.classList.toggle('debug-mode', this.isDebugMode);
  }
  
  connectToServer() {
    this.socketService.connect();
  }
  
  loadSettings() {
    // Load saved settings
    const autoScroll = localStorage.getItem('autoScroll') !== 'false';
    const soundNotifications = localStorage.getItem('soundNotifications') === 'true';
    
    document.getElementById('auto-scroll-toggle').checked = autoScroll;
    document.getElementById('sound-toggle').checked = soundNotifications;
    
    // Apply settings
    this.eventBus.emit('settingsChanged', {
      autoScroll,
      soundNotifications
    });
  }
  
  // Message handling
  sendMessage() {
    const messageInput = document.getElementById('message-input');
    const message = messageInput?.value.trim();
    
    if (!message) return;
    
    const attachedFiles = this.fileUpload.getAttachedFiles();
    
    this.eventBus.emit('sendMessage', {
      message,
      files: attachedFiles,
      type: 'createSession'
    });
    
    messageInput.value = '';
    this.autoResizeTextarea({ target: messageInput });
    this.hideFileUpload();
  }
  
  continueSession() {
    const messageInput = document.getElementById('message-input');
    const message = messageInput?.value.trim();
    
    if (!message) return;
    
    const attachedFiles = this.fileUpload.getAttachedFiles();
    
    this.eventBus.emit('sendMessage', {
      message,
      files: attachedFiles,
      type: 'continueSession'
    });
    
    messageInput.value = '';
    this.autoResizeTextarea({ target: messageInput });
    this.hideFileUpload();
  }
  
  createNewSession() {
    this.eventBus.emit('createNewSession');
  }
  
  deleteSession() {
    if (confirm('Are you sure you want to delete the current session?')) {
      this.eventBus.emit('deleteSession');
    }
  }
  
  // File upload handling
  toggleFileUpload() {
    const fileUploadArea = document.getElementById('file-upload-area');
    const isVisible = !fileUploadArea.classList.contains('hidden');
    
    if (isVisible) {
      this.hideFileUpload();
    } else {
      this.showFileUpload();
    }
  }
  
  showFileUpload() {
    const fileUploadArea = document.getElementById('file-upload-area');
    fileUploadArea?.classList.remove('hidden');
    
    // Focus on file input
    setTimeout(() => {
      const fileInput = document.getElementById('file-input');
      fileInput?.focus();
    }, 100);
  }
  
  hideFileUpload() {
    const fileUploadArea = document.getElementById('file-upload-area');
    fileUploadArea?.classList.add('hidden');
  }
  
  // Debug mode handling
  toggleDebugMode(enabled) {
    if (enabled === undefined) {
      enabled = !this.isDebugMode;
    }
    
    this.isDebugMode = enabled;
    localStorage.setItem('debugMode', enabled.toString());
    
    // Update UI
    const debugToggle = document.getElementById('debug-toggle');
    if (debugToggle) {
      debugToggle.checked = enabled;
    }
    
    // Update components
    this.chatInterface.setDebugMode(enabled);
    this.statusDisplay.setDebugMode(enabled);
    
    // Toggle debug class on body
    document.body.classList.toggle('debug-mode', enabled);
    
    this.eventBus.emit('debugModeToggled', enabled);
  }
  
  // Event handlers
  handleConnectionStatus(status) {
    const statusIndicator = document.getElementById('status-indicator');
    const connectionStatusText = document.getElementById('connection-status-text');
    
    if (statusIndicator && connectionStatusText) {
      statusIndicator.className = `badge badge-sm ${
        status === 'connected' ? 'badge-success' : 
        status === 'connecting' ? 'badge-warning' : 
        'badge-error'
      }`;
      
      connectionStatusText.textContent = status.charAt(0).toUpperCase() + status.slice(1);
    }
    
    // Update continue button state
    const continueBtn = document.getElementById('continue-btn');
    if (continueBtn) {
      continueBtn.disabled = status !== 'connected';
    }
  }
  
  handleSessionCreated(session) {
    const continueBtn = document.getElementById('continue-btn');
    const deleteSessionBtn = document.getElementById('delete-session-btn');
    
    if (continueBtn) continueBtn.disabled = false;
    if (deleteSessionBtn) deleteSessionBtn.disabled = false;
    
    this.showToast('Session created successfully', 'success');
  }
  
  handleSessionEnded(session) {
    const continueBtn = document.getElementById('continue-btn');
    const deleteSessionBtn = document.getElementById('delete-session-btn');
    
    if (continueBtn) continueBtn.disabled = true;
    if (deleteSessionBtn) deleteSessionBtn.disabled = true;
    
    this.showToast('Session ended', 'info');
  }
  
  handleError(error) {
    console.error('Application error:', error);
    this.showToast(error.message || 'An error occurred', 'error');
  }
  
  handleDebugModeToggle(enabled) {
    // Only show toast if this is an actual user toggle, not initialization
    if (this.isInitialized) {
      this.showToast(`Debug mode ${enabled ? 'enabled' : 'disabled'}`, 'info');
    }
  }
  
  // Utility methods
  autoResizeTextarea(event) {
    const textarea = event.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  }
  
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `alert alert-${type} toast-item`;
    toast.innerHTML = `
      <div class="flex items-center space-x-2">
        <span>${message}</span>
        <button class="btn btn-sm btn-circle btn-ghost" onclick="this.parentElement.parentElement.remove()">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `;
    
    const container = document.getElementById('toast-container');
    container?.appendChild(toast);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      toast.remove();
    }, 5000);
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.zenobiaApp = new ZenobiaApp();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
  if (window.zenobiaApp) {
    window.zenobiaApp.socketService.disconnect();
  }
});