// Chat Interface Component
export class ChatInterface {
  constructor(eventBus, isDebugMode = false) {
    this.eventBus = eventBus;
    this.isDebugMode = isDebugMode;
    this.container = null;
    this.autoScroll = true;
    this.isAtBottom = true;
    this.messages = [];
    this.typingIndicator = null;
  }
  
  init() {
    this.container = document.getElementById('chat-container');
    if (!this.container) {
      console.error('Chat container not found');
      return;
    }
    
    this.setupEventListeners();
    this.setupScrollHandling();
    this.displayWelcomeMessage();
    
    console.log('ChatInterface initialized');
  }
  
  setupEventListeners() {
    // Listen for conversation events
    this.eventBus.on('conversationHistoryLoaded', this.handleConversationHistoryLoaded.bind(this));
    this.eventBus.on('conversationHistoryUpdated', this.handleConversationHistoryUpdated.bind(this));
    this.eventBus.on('conversationHistoryCleared', this.handleConversationHistoryCleared.bind(this));
    
    // Listen for session events
    this.eventBus.on('sessionStatusReceived', this.handleSessionStatusReceived.bind(this));
    this.eventBus.on('messageSending', this.handleMessageSending.bind(this));
    
    // Listen for settings changes
    this.eventBus.on('settingsChanged', this.handleSettingsChanged.bind(this));
  }
  
  setupScrollHandling() {
    if (!this.container) return;
    
    this.container.addEventListener('scroll', () => {
      const { scrollTop, scrollHeight, clientHeight } = this.container;
      this.isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
    });
  }
  
  displayWelcomeMessage() {
    const welcomeMessage = {
      id: 'welcome',
      sender: 'system',
      message: 'Welcome to Zenobia! Start a conversation by typing a message below.',
      timestamp: new Date().toISOString(),
      type: 'welcome'
    };
    
    this.addMessage(welcomeMessage);
  }
  
  // Message handling
  addMessage(messageData) {
    const messageElement = this.createMessageElement(messageData);
    this.container.appendChild(messageElement);
    
    // Add to messages array
    this.messages.push(messageData);
    
    // Auto-scroll if enabled and user is at bottom
    if (this.autoScroll && this.isAtBottom) {
      this.scrollToBottom();
    }
    
    // Animate message entrance
    messageElement.classList.add('message-enter');
  }
  
  createMessageElement(messageData) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message-item';
    messageDiv.dataset.messageId = messageData.id;
    messageDiv.dataset.messageType = messageData.type;
    messageDiv.dataset.sender = messageData.sender;
    
    // Filter message based on debug mode
    if (!this.shouldShowMessage(messageData)) {
      messageDiv.style.display = 'none';
    }
    
    if (messageData.sender === 'user') {
      messageDiv.innerHTML = this.createUserMessage(messageData);
    } else if (messageData.sender === 'system') {
      messageDiv.innerHTML = this.createSystemMessage(messageData);
    } else {
      messageDiv.innerHTML = this.createAgentMessage(messageData);
    }
    
    return messageDiv;
  }
  
  createUserMessage(messageData) {
    const filesHtml = this.createFilesDisplay(messageData.files);
    const timeHtml = this.formatTimestamp(messageData.timestamp);
    
    return `
      <div class="chat chat-end">
        <div class="chat-image avatar">
          <div class="w-10 rounded-full">
            <img src="/assets/images/user.png" alt="User" class="w-full h-full rounded-full object-cover" />
          </div>
        </div>
        <div class="chat-header">
          You
          <time class="text-xs opacity-50">${timeHtml}</time>
        </div>
        <div class="chat-bubble chat-bubble-primary">
          ${this.formatMessage(messageData.message)}
          ${filesHtml}
        </div>
      </div>
    `;
  }
  
  createSystemMessage(messageData) {
    const timeHtml = this.formatTimestamp(messageData.timestamp);
    const bubbleClass = this.getSystemMessageClass(messageData);
    
    return `
      <div class="chat chat-start">
        <div class="chat-image avatar">
          <div class="w-10 h-10 rounded-full">
            <img src="/assets/images/i1.png" alt="System" class="w-full h-full rounded-full object-cover" />
          </div>
        </div>
        <div class="chat-header">
          ${this.getSystemMessageSender(messageData)}
          <time class="text-xs opacity-50">${timeHtml}</time>
        </div>
        <div class="chat-bubble ${bubbleClass}">
          ${this.formatMessage(messageData.message)}
          ${this.createStatusDisplay(messageData)}
        </div>
        ${this.isDebugMode ? this.createDebugInfo(messageData) : ''}
      </div>
    `;
  }
  
  createAgentMessage(messageData) {
    const timeHtml = this.formatTimestamp(messageData.timestamp);
    const bubbleClass = this.getAgentMessageClass(messageData);
    
    return `
      <div class="chat chat-start">
        <div class="chat-image avatar">
          <div class="w-10 rounded-full">
            <img src="/assets/images/ai.png" alt="Assistant" class="w-full h-full rounded-full object-cover" />
          </div>
        </div>
        <div class="chat-header">
          Assistant
          <time class="text-xs opacity-50">${timeHtml}</time>
        </div>
        <div class="chat-bubble ${bubbleClass}">
          ${this.formatMessage(messageData.message)}
        </div>
        ${this.isDebugMode ? this.createDebugInfo(messageData) : ''}
      </div>
    `;
  }
  
  createFilesDisplay(files) {
    if (!files || files.length === 0) return '';
    
    const filesHtml = files.map(file => `
      <div class="flex items-center space-x-2 mt-2 p-2 bg-base-200 rounded">
        <span class="text-sm">${this.getFileIcon(file.mimeType)}</span>
        <span class="text-sm">${file.fileName || file.originalName}</span>
        <span class="text-xs opacity-70">${this.formatFileSize(file.fileSize)}</span>
      </div>
    `).join('');
    
    return `<div class="mt-2">${filesHtml}</div>`;
  }
  
  createStatusDisplay(messageData) {
    if (!messageData.status) return '';
    
    const statusClass = this.getStatusClass(messageData.status);
    const statusIcon = this.getStatusIcon(messageData.status);
    
    return `
      <div class="mt-2 flex items-center space-x-2">
        <span class="badge ${statusClass} badge-sm">
          ${statusIcon}
          ${messageData.status}
        </span>
      </div>
    `;
  }
  
  createDebugInfo(messageData) {
    if (!messageData.data) return '';
    
    return `
      <div class="debug-info mt-2 p-2 bg-base-200 rounded text-xs">
        <details>
          <summary class="cursor-pointer">Debug Info</summary>
          <pre class="mt-1 overflow-x-auto">${JSON.stringify(messageData.data, null, 2)}</pre>
        </details>
      </div>
    `;
  }
  
  // Message filtering
  shouldShowMessage(messageData) {
    if (this.isDebugMode) {
      return true;
    }
    
    // Always show user messages
    if (messageData.sender === 'user') {
      return true;
    }
    
    // Show system messages that are END status or final responses
    if (messageData.sender === 'system' && messageData.status === 'END') {
      return true;
    }
    
    // Show welcome and error messages
    if (messageData.type === 'welcome' || messageData.type === 'error') {
      return true;
    }
    
    // Hide running/debug messages
    return false;
  }
  
  // Utility methods
  getSystemMessageClass(messageData) {
    if (messageData.type === 'error') return 'chat-bubble-error';
    if (messageData.type === 'welcome') return 'chat-bubble-info';
    if (messageData.status === 'END') return 'chat-bubble-success';
    return 'chat-bubble-debug';
  }
  
  getSystemMessageIcon(messageData) {
    if (messageData.type === 'error') {
      // SVG version (commented):
      // return `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      //   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
      // </svg>`;
      
      return `<img src="/assets/images/i1.png" alt="Error" class="w-5 h-5 rounded-full object-cover" />`;
    }
    
    if (messageData.type === 'welcome') {
      // SVG version (commented):
      // return `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      //   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      // </svg>`;
      
      return `<img src="/assets/images/i1.png" alt="Welcome" class="w-5 h-5 rounded-full object-cover" />`;
    }
    
    // SVG version (commented):
    // return `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    // </svg>`;
    
    return `<img src="/assets/images/i1.png" alt="System" class="w-5 h-5 rounded-full object-cover" />`;
  }
  
  getSystemMessageSender(messageData) {
    if (messageData.type === 'error') return 'Error';
    if (messageData.type === 'welcome') return 'System';
    return 'Assistant';
  }
  
  getAgentMessageClass(messageData) {
    if (messageData.type === 'error') return 'chat-bubble-error';
    return 'chat-bubble-secondary';
  }
  
  getStatusClass(status) {
    switch (status) {
      case 'END': return 'badge-success';
      case 'RUNNING': return 'badge-warning';
      case 'ERROR': return 'badge-error';
      default: return 'badge-info';
    }
  }
  
  getStatusIcon(status) {
    switch (status) {
      case 'END': return '✓';
      case 'RUNNING': return '⏳';
      case 'ERROR': return '❌';
      default: return 'ℹ️';
    }
  }
  
  getFileIcon(mimeType) {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('text/')) return '📄';
    if (mimeType === 'application/pdf') return '📕';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel')) return '📊';
    if (mimeType === 'application/json') return '📋';
    return '📎';
  }
  
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  formatMessage(message) {
    return message
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-base-200 px-1 rounded">$1</code>');
  }
  
  // Public methods
  setDebugMode(enabled) {
    this.isDebugMode = enabled;
    this.refreshMessages();
  }
  
  refreshMessages() {
    // Update visibility of existing messages
    const messageElements = this.container.querySelectorAll('.message-item');
    messageElements.forEach(element => {
      const messageId = element.dataset.messageId;
      const messageData = this.messages.find(m => m.id === messageId);
      
      if (messageData) {
        element.style.display = this.shouldShowMessage(messageData) ? 'block' : 'none';
      }
    });
  }
  
  clearMessages() {
    this.container.innerHTML = '';
    this.messages = [];
  }
  
  scrollToBottom() {
    if (this.container) {
      this.container.scrollTop = this.container.scrollHeight;
    }
  }
  
  showTypingIndicator() {
    if (this.typingIndicator) return;
    
    this.typingIndicator = document.createElement('div');
    this.typingIndicator.className = 'chat chat-start';
    this.typingIndicator.innerHTML = `
      <div class="chat-image avatar">
        <div class="w-10 rounded-full">
          <img src="/assets/images/ai.png" alt="Assistant" class="w-full h-full rounded-full object-cover" />
        </div>
      </div>
      <div class="chat-bubble">
        <div class="typing-indicator">
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
        </div>
      </div>
    `;
    
    this.container.appendChild(this.typingIndicator);
    this.scrollToBottom();
  }
  
  hideTypingIndicator() {
    if (this.typingIndicator) {
      this.typingIndicator.remove();
      this.typingIndicator = null;
    }
  }
  
  // Event handlers
  handleConversationHistoryLoaded(history) {
    this.clearMessages();
    history.forEach(message => this.addMessage(message));
  }
  
  handleConversationHistoryUpdated(history) {
    // Only add the last message if it's new
    const lastMessage = history[history.length - 1];
    if (lastMessage && !this.messages.find(m => m.id === lastMessage.id)) {
      this.addMessage(lastMessage);
    }
  }
  
  handleConversationHistoryCleared() {
    this.clearMessages();
    this.displayWelcomeMessage();
  }
  
  handleSessionStatusReceived(statusData) {
    if (statusData.status === 'RUNNING') {
      this.showTypingIndicator();
    } else {
      this.hideTypingIndicator();
    }
  }
  
  handleMessageSending(data) {
    // Mark the last user message as sending
    const lastMessage = this.messages[this.messages.length - 1];
    if (lastMessage && lastMessage.sender === 'user') {
      const messageElement = this.container.querySelector(`[data-message-id="${lastMessage.id}"]`);
      if (messageElement) {
        messageElement.classList.add('message-sending');
      }
    }
    
    this.showTypingIndicator();
  }
  
  handleSettingsChanged(settings) {
    this.autoScroll = settings.autoScroll;
  }
}