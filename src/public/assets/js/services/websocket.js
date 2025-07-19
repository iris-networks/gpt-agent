class WebSocketService {
    constructor(url = 'http://localhost:3000') {
        this.socket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.isConnected = false;
        this.messageCallbacks = new Map();
        this.statusCallback = null;
        this.connectCallback = null;
        this.disconnectCallback = null;
        
        // Auto-connect
        this.connect(url);
    }

    connect(url = 'http://localhost:3000') {
        try {
            this.establishConnection(url);
        } catch (error) {
            console.error('Error connecting to Socket.IO:', error);
            this.updateConnectionStatus('error', 'Connection Failed');
        }
    }

    establishConnection(url) {
        this.socket = io(url, {
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: this.maxReconnectAttempts,
            reconnectionDelay: this.reconnectDelay,
            timeout: 20000
        });

        this.socket.on('connect', () => {
            console.log('Socket.IO connected');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            
            if (this.connectCallback) {
                this.connectCallback();
            }
            
            // Join session on connect
            this.joinSession();
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Socket.IO disconnected:', reason);
            this.isConnected = false;
            
            if (this.disconnectCallback) {
                this.disconnectCallback();
            }
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket.IO connection error:', error);
        });

        this.socket.on('reconnect_attempt', (attemptNumber) => {
            console.log('Reconnection attempt:', attemptNumber);
        });

        this.socket.on('reconnect', (attemptNumber) => {
            console.log('Reconnected after', attemptNumber, 'attempts');
            if (this.connectCallback) {
                this.connectCallback();
            }
        });

        this.socket.on('reconnect_failed', () => {
            console.log('Failed to reconnect');
        });

        // Listen for session status updates
        this.socket.on('sessionStatus', (data) => {
            console.log('🔄 Received session status:', data);
            if (this.statusCallback) {
                this.statusCallback(data);
            } else {
                console.warn('⚠️ No status callback registered!');
            }
        });

        this.setupMessageListeners();
    }

    setupMessageListeners() {
        this.socket.on('error', (error) => {
            console.error('Socket.IO error:', error);
        });
    }

    send(event, data = {}) {
        if (this.socket && this.socket.connected) {
            console.log('Sending Socket.IO message:', { event, data });
            
            this.socket.emit(event, data, (response) => {
                console.log('Response from server:', response);
                this.handleServerResponse(event, response);
            });
        } else {
            console.warn('Socket.IO is not connected');
        }
    }

    handleServerResponse(event, response) {
        if (!response) return;

        if (response.success) {
            console.log(`${event} successful:`, response);
        } else {
            console.error(`${event} failed:`, response.error);
        }
    }

    // Session management methods
    createSession(instructions, files = [], composioApps = []) {
        const payload = {
            instructions: instructions
        };

        // Add files if provided
        if (files && files.length > 0) {
            payload.files = files.map(file => ({
                fileId: file.id || file.fileId,
                fileName: file.filename || file.originalName || file.name,
                originalName: file.originalName || file.name,
                mimeType: file.mimeType || file.type,
                fileSize: file.size || 0
            }));
        }

        if (composioApps && composioApps.length > 0) {
            payload.composioApps = composioApps;
        }

        this.send('createSession', payload);
    }

    continueSession(instructions, files = []) {
        const payload = {
            instructions: instructions
        };

        // Add files if provided
        if (files && files.length > 0) {
            payload.files = files.map(file => ({
                fileId: file.id || file.fileId,
                fileName: file.filename || file.originalName || file.name,
                originalName: file.originalName || file.name,
                mimeType: file.mimeType || file.type,
                fileSize: file.size || 0
            }));
        }

        this.send('continueSession', payload);
    }

    joinSession() {
        this.send('joinSession');
    }

    leaveSession() {
        this.send('leaveSession');
    }

    deleteSession() {
        this.send('deleteSession');
    }

    // Event listeners
    onConnect(callback) {
        this.connectCallback = callback;
        // If already connected, call immediately
        if (this.isConnected) {
            callback();
        }
    }

    onDisconnect(callback) {
        this.disconnectCallback = callback;
    }

    onStatusUpdate(callback) {
        this.statusCallback = callback;
    }

    onMessage(messageType, callback) {
        if (!this.messageCallbacks.has(messageType)) {
            this.messageCallbacks.set(messageType, []);
        }
        this.messageCallbacks.get(messageType).push(callback);
    }

    removeMessageListener(messageType, callback) {
        if (this.messageCallbacks.has(messageType)) {
            const callbacks = this.messageCallbacks.get(messageType);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }
}

// Export for use in other modules
window.WebSocketService = WebSocketService;