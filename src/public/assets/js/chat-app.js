/**
 * Professional Chat Application with Streaming Interface
 * Integrates with Zenobia Sessions Gateway for AI agent communication
 */

class ChatApplication {
    constructor() {
        this.wsService = null;
        this.fileService = null;
        this.messages = [];
        this.currentSessionId = null;
        this.isProcessing = false;
        this.runningMessageId = null;
        this.statusTimeline = [];
        
        this.initializeServices();
        this.initializeElements();
        this.setupEventListeners();
        this.setupWebSocketListeners();
        
        this.showToast('Chat application initialized', 'info');
    }

    initializeServices() {
        // Initialize WebSocket service
        this.wsService = new WebSocketService('ws://localhost:3000');
        this.fileService = new FileUploadService();
        
        console.log('Chat Application: Services initialized');
    }

    initializeElements() {
        // Chat elements
        this.chatContainer = document.getElementById('chatMessagesContainer');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.attachBtn = document.getElementById('attachBtn');
        this.clearChatBtn = document.getElementById('clearChatBtn');
        this.fileInput = document.getElementById('fileInput');
        this.fileList = document.getElementById('fileList');
        
        // Desktop elements
        this.desktopPlaceholder = document.getElementById('desktopPlaceholder');
        this.desktopFrame = document.getElementById('desktopFrame');
        this.sessionIdElement = document.getElementById('sessionId');
        this.refreshDesktopBtn = document.getElementById('refreshDesktopBtn');
        this.toggleChatBtn = document.getElementById('toggleChatBtn');
        
        // Status elements
        this.connectionStatus = document.getElementById('connectionStatus');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.toastContainer = document.getElementById('toastContainer');
        
        console.log('Chat Application: Elements initialized');
    }

    setupEventListeners() {
        // Chat input events
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        this.messageInput.addEventListener('input', () => this.autoResizeInput());
        
        // File handling
        this.attachBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Control buttons
        this.clearChatBtn.addEventListener('click', () => this.clearChat());
        this.refreshDesktopBtn.addEventListener('click', () => this.refreshDesktop());
        this.toggleChatBtn.addEventListener('click', () => this.toggleChatSection());
        
        console.log('Chat Application: Event listeners set up');
    }

    setupWebSocketListeners() {
        // Connection status
        this.wsService.onConnect(() => {
            this.updateConnectionStatus(true);
            this.showToast('Connected to server', 'success');
        });
        
        this.wsService.onDisconnect(() => {
            this.updateConnectionStatus(false);
            this.showToast('Disconnected from server', 'warning');
        });
        
        // Session status updates
        this.wsService.onStatusUpdate((status) => {
            this.handleSessionStatus(status);
        });
        
        console.log('Chat Application: WebSocket listeners set up');
    }

    sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || this.isProcessing) return;

        // Check for pending files
        const pendingFiles = this.fileService.getPendingFiles();
        
        // Add user message to chat
        this.addMessage('user', message, pendingFiles.length > 0 ? pendingFiles : null);
        
        // Clear input
        this.messageInput.value = '';
        this.autoResizeInput();
        this.clearFileList();
        
        // Send to backend - only send if not already processing
        if (!this.isProcessing) {
            if (this.currentSessionId) {
                this.wsService.continueSession(message, pendingFiles);
            } else {
                this.wsService.createSession(message, pendingFiles);
            }
            this.setProcessing(true);
            this.activateDesktopView();
        }
    }

    addMessage(type, content, files = null) {
        const messageId = Date.now() + Math.random();
        const timestamp = new Date();
        
        const message = {
            id: messageId,
            type,
            content,
            files,
            timestamp,
            isRunning: type === 'assistant' && this.isProcessing
        };

        this.messages.push(message);
        this.renderMessage(message);
        this.scrollChatToBottom();

        return messageId;
    }

    renderMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.type}`;
        messageDiv.dataset.messageId = message.id;
        
        if (message.isRunning) {
            messageDiv.classList.add('running');
        }

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';

        const content = document.createElement('div');
        content.className = 'message-content';
        if (message.type === 'assistant') {
            content.innerHTML = marked.parse(message.content);
        } else {
            content.textContent = message.content;
        }
        bubble.appendChild(content);

        // Add file attachments if present
        if (message.files && message.files.length > 0) {
            const fileInfo = document.createElement('div');
            fileInfo.className = 'message-files';
            fileInfo.innerHTML = message.files.map(file => `
                <div class="file-attachment">
                    📎 ${file.file ? file.file.name : file.name}
                </div>
            `).join('');
            bubble.appendChild(fileInfo);
        }

        const time = document.createElement('div');
        time.className = 'message-time';
        time.textContent = this.formatTime(message.timestamp);
        bubble.appendChild(time);

        messageDiv.appendChild(bubble);
        this.chatContainer.appendChild(messageDiv);
    }

    handleSessionStatus(status) {
        console.log('Session status update:', status);
        
        if (status.sessionId && status.sessionId !== this.currentSessionId) {
            this.currentSessionId = status.sessionId;
            this.updateSessionId(status.sessionId);
        }
        
        // Handle different status types
        switch (status.status) {
            case 'init':
                this.handleStatusInit(status);
                break;
            case 'running':
                this.handleStatusRunning(status);
                break;
            case 'pause':
                this.handleStatusPause(status);
                break;
            case 'end':
                this.handleStatusEnd(status);
                break;
            case 'call_user':
                this.handleStatusCallUser(status);
                break;
            case 'max_loop':
                this.handleStatusMaxLoop(status);
                break;
            case 'user_stopped':
                this.handleStatusUserStopped(status);
                break;
            case 'error':
                this.handleStatusError(status);
                break;
            default:
                this.handleStatusDefault(status);
        }
    }

    handleStatusInit(status) {
        this.showToast('Session started', 'success');
        this.activateDesktopView();
    }

    handleStatusRunning(status) {
        if (this.runningMessageId) {
            this.updateRunningMessage(status.message);
        } else {
            this.runningMessageId = this.addMessage('assistant', status.message || 'Processing...', null);
        }
    }

    handleStatusPause(status) {
        this.finalizeRunningMessage();
        this.setProcessing(false);
    }

    handleStatusEnd(status) {
        if (status.message) {
            if (this.runningMessageId) {
                this.updateRunningMessage(status.message);
                this.finalizeRunningMessage();
            } else {
                this.addMessage('assistant', status.message);
            }
        }
        
        this.setProcessing(false);
        this.showToast('Session completed', 'success');
    }

    handleStatusCallUser(status) {
        this.finalizeRunningMessage();
        this.addMessage('assistant', status.message || 'I need your help to continue.');
        this.setProcessing(false);
        this.showToast('Human assistance required', 'warning');
    }

    handleStatusMaxLoop(status) {
        this.finalizeRunningMessage();
        this.addMessage('assistant', status.message || 'Process stopped - maximum iterations reached');
        this.setProcessing(false);
        this.showToast('Max iterations reached', 'warning');
    }

    handleStatusUserStopped(status) {
        this.finalizeRunningMessage();
        this.addMessage('assistant', status.message || 'Session stopped');
        this.setProcessing(false);
        this.showToast('Session stopped', 'info');
    }

    handleStatusError(status) {
        this.finalizeRunningMessage();
        this.addMessage('assistant', `Error: ${status.message || 'An error occurred'}`);
        this.setProcessing(false);
        this.showToast(`Error: ${status.message}`, 'error');
    }

    handleStatusDefault(status) {
        this.addMessage('assistant', status.message || 'Status update received');
    }

    activateDesktopView() {
        this.desktopPlaceholder.style.display = 'none';
        this.desktopFrame.style.display = 'block';
    }

    deactivateDesktopView() {
        this.desktopPlaceholder.style.display = 'flex';
        this.desktopFrame.style.display = 'none';
    }

    updateConnectionStatus(connected) {
        const statusDot = this.connectionStatus.querySelector('.status-dot');
        const statusText = this.connectionStatus.querySelector('.status-text');
        
        if (connected) {
            statusDot.classList.add('connected');
            statusText.textContent = 'Connected';
        } else {
            statusDot.classList.remove('connected');
            statusText.textContent = 'Disconnected';
        }
    }

    updateSessionId(sessionId) {
        this.sessionIdElement.textContent = sessionId.substring(0, 8) + '...';
    }

    updateRunningMessage(newContent) {
        if (!this.runningMessageId) return;
        
        const messageElement = document.querySelector(`[data-message-id="${this.runningMessageId}"]`);
        if (messageElement) {
            const contentElement = messageElement.querySelector('.message-content');
            if (contentElement) {
                // Always render markdown for assistant messages
                contentElement.innerHTML = marked.parse(newContent);
            }
        }
    }

    finalizeRunningMessage() {
        if (this.runningMessageId) {
            const messageElement = document.querySelector(`[data-message-id="${this.runningMessageId}"]`);
            if (messageElement) {
                messageElement.classList.remove('running');
            }
            this.runningMessageId = null;
        }
    }

    setProcessing(processing) {
        this.isProcessing = processing;
        this.sendBtn.disabled = processing || this.messageInput.value.trim() === '';
        
        if (!processing) {
            this.hideLoading();
        }
    }

    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        this.processSelectedFiles(files);
        event.target.value = '';
    }

    processSelectedFiles(files) {
        files.forEach(file => {
            this.fileService.addPendingFile(file, {
                name: file.name,
                size: file.size,
                type: file.type
            });
        });
        
        this.updateFileList();
        this.showToast(`${files.length} file(s) selected`, 'success');
    }

    updateFileList() {
        const pendingFiles = this.fileService.getPendingFiles();
        
        if (pendingFiles.length === 0) {
            this.fileList.innerHTML = '';
            return;
        }

        this.fileList.innerHTML = pendingFiles.map((item, index) => `
            <div class="file-item">
                <span>📎 ${item.file.name}</span>
                <button class="file-remove" onclick="chatApp.removePendingFile('${item.file.name}')">×</button>
            </div>
        `).join('');
    }

    removePendingFile(fileName) {
        this.fileService.removePendingFile(fileName);
        this.updateFileList();
    }

    clearFileList() {
        this.fileService.clearPendingFiles();
        this.updateFileList();
    }

    clearChat() {
        if (confirm('Are you sure you want to clear the chat history?')) {
            this.messages = [];
            this.chatContainer.innerHTML = `
                <div class="welcome-message">
                    <div class="welcome-icon">🤖</div>
                    <p>Welcome to Zenobia AI!</p>
                    <p class="welcome-subtitle">Start chatting to interact with your AI agent.</p>
                </div>
            `;
            
            // Reset session
            this.currentSessionId = null;
            this.runningMessageId = null;
            this.sessionIdElement.textContent = 'Not Started';
            
            // Reset desktop view
            this.deactivateDesktopView();
            
            this.setProcessing(false);
        }
    }

    refreshDesktop() {
        this.desktopFrame.src = this.desktopFrame.src; // Force reload iframe
        this.showToast('Desktop refreshed', 'info');
    }

    toggleChatSection() {
        const chatSection = document.querySelector('.chat-section');
        const desktopSection = document.querySelector('.desktop-section');
        
        chatSection.classList.toggle('collapsed');
        desktopSection.classList.toggle('expanded');
        
        // Update button icon
        const icon = this.toggleChatBtn.querySelector('svg');
        if (chatSection.classList.contains('collapsed')) {
            // Show "expand" icon (chevron right)
            icon.innerHTML = '<path d="M9 18l6-6-6-6"/>';
        } else {
            // Show "collapse" icon (hamburger menu)
            icon.innerHTML = '<path d="M3 12h18M3 6h18M3 18h18"/>';
        }
    }

    autoResizeInput() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
        this.sendBtn.disabled = this.messageInput.value.trim() === '' || this.isProcessing;
    }

    scrollChatToBottom() {
        setTimeout(() => {
            this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
        }, 100);
    }


    showLoading(text = 'Loading...') {
        const overlay = this.loadingOverlay;
        const loadingText = overlay.querySelector('.loading-text');
        loadingText.textContent = text;
        overlay.classList.add('active');
    }

    hideLoading() {
        this.loadingOverlay.classList.remove('active');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        this.toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }

    formatTime(date) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
}

// Initialize the chat application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chatApp = new ChatApplication();
    console.log('Chat Application initialized successfully');
});