// DOM Elements
const configForm = document.getElementById('configForm');
const apiKeyInput = document.getElementById('apiKey');
const apiUrlInput = document.getElementById('apiUrl');
const promptInput = document.getElementById('prompt');
const submitBtn = document.getElementById('submitBtn');
const stopBtn = document.getElementById('stopBtn');
const consoleOutput = document.getElementById('consoleOutput');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const settingsBtn = document.getElementById('settingsBtn');
const settingsOverlay = document.getElementById('settingsOverlay');
const closeSettings = document.getElementById('closeSettings');
const saveSettings = document.getElementById('saveSettings');
const saveCredentialsCheckbox = document.getElementById('saveCredentials');

// WebSocket connection
let ws = null;
let currentSessionId = null;
let isProcessing = false;

// Constants
const DEFAULT_API_URL = 'https://agent.tryiris.dev'; // API endpoint stays the same
const STORAGE_KEY = 'operatorCredentials';

// Initialize app
function init() {
    loadSavedCredentials();
    setupEventListeners();
    connectWebSocket();
    
    // Set default API URL
    apiUrlInput.value = DEFAULT_API_URL;
}

// Load saved credentials from localStorage
function loadSavedCredentials() {
    const savedCredentials = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (savedCredentials.apiKey) {
        apiKeyInput.value = savedCredentials.apiKey;
    }
    if (savedCredentials.saveCredentials) {
        saveCredentialsCheckbox.checked = true;
    }
}

// Setup event listeners
function setupEventListeners() {
    configForm.addEventListener('submit', handleSubmit);
    stopBtn.addEventListener('click', stopProcess);
    settingsBtn.addEventListener('click', () => settingsOverlay.classList.add('active'));
    closeSettings.addEventListener('click', () => settingsOverlay.classList.remove('active'));
    saveSettings.addEventListener('click', saveUserSettings);
    
    // Also close modal when clicking outside
    settingsOverlay.addEventListener('click', (e) => {
        if (e.target === settingsOverlay) {
            settingsOverlay.classList.remove('active');
        }
    });
}

// Connect to WebSocket server
function connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
        updateConnectionStatus(true);
        console.log('WebSocket connected');
    };
    
    ws.onclose = () => {
        updateConnectionStatus(false);
        console.log('WebSocket disconnected');
        
        // Attempt to reconnect after a short delay
        setTimeout(connectWebSocket, 3000);
    };
    
    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        addConsoleEntry({
            type: 'error',
            message: 'Connection error. Please check your network.',
            sessionId: currentSessionId
        });
    };
    
    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            handleWebSocketMessage(data);
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    };
}

// Update connection status indicator
function updateConnectionStatus(connected, processing = false) {
    statusDot.classList.remove('connected', 'disconnected', 'processing');
    
    if (processing) {
        statusDot.classList.add('processing');
        statusText.textContent = 'Processing';
    } else if (connected) {
        statusDot.classList.add('connected');
        statusText.textContent = 'Connected';
    } else {
        statusDot.classList.add('disconnected');
        statusText.textContent = 'Disconnected';
    }
}

// Handle WebSocket messages
function handleWebSocketMessage(data) {
    // Add message to console
    addConsoleEntry(data);
    
    // Update UI based on message type
    switch (data.type) {
        case 'complete':
        case 'stopped':
            endProcessingState();
            break;
        case 'error':
            endProcessingState();
            // Optional: Show error notification
            break;
        case 'update':
        case 'tool':
        case 'tool_result':
            updateConnectionStatus(true, true);
            break;
    }
}

// Add entry to console output
function addConsoleEntry(data) {
    const entryDiv = document.createElement('div');
    entryDiv.className = 'console-entry';
    
    const timeDiv = document.createElement('div');
    timeDiv.className = 'entry-time';
    timeDiv.textContent = new Date().toLocaleTimeString();
    
    const contentDiv = document.createElement('div');
    contentDiv.className = `entry-content entry-type-${data.type}`;
    
    // Format content based on message type
    switch (data.type) {
        case 'tool':
            contentDiv.innerHTML = `<strong>🔧 Running tool:</strong> ${data.tool}<br>
                                  <strong>Arguments:</strong> ${JSON.stringify(data.args)}`;
            break;
        case 'tool_result':
            // Truncate long results
            const resultText = data.result && data.result.length > 500 
                ? data.result.substring(0, 500) + '...' 
                : data.result || '';
            contentDiv.innerHTML = `<strong>🔄 Tool result:</strong><br>${resultText}`;
            break;
        case 'error':
            contentDiv.innerHTML = `<strong>❌ Error:</strong> ${data.message}${data.error ? '<br>' + data.error : ''}`;
            break;
        case 'complete':
            contentDiv.innerHTML = `<strong>✅ Complete:</strong> ${data.message}`;
            break;
        case 'stopped':
            contentDiv.innerHTML = `<strong>🛑 Stopped:</strong> ${data.message}`;
            break;
        default:
            contentDiv.textContent = data.message;
    }
    
    entryDiv.appendChild(timeDiv);
    entryDiv.appendChild(contentDiv);
    consoleOutput.appendChild(entryDiv);
    
    // Scroll to bottom
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

// Handle form submission
function handleSubmit(e) {
    e.preventDefault();
    
    if (!ws || ws.readyState !== WebSocket.OPEN) {
        addConsoleEntry({
            type: 'error',
            message: 'Not connected to server. Please wait for connection...',
            sessionId: 'system'
        });
        connectWebSocket();
        return;
    }
    
    const apiKey = apiKeyInput.value.trim();
    const apiUrl = apiUrlInput.value.trim();
    const prompt = promptInput.value.trim();
    
    if (!apiKey || !apiUrl || !prompt) {
        addConsoleEntry({
            type: 'error',
            message: 'All fields are required',
            sessionId: 'system'
        });
        return;
    }
    
    // Generate a session ID
    currentSessionId = Date.now().toString();
    
    // Send message to server
    ws.send(JSON.stringify({
        prompt,
        sessionId: currentSessionId,
        apiKey,
        apiUrl
    }));
    
    // Update UI for processing state
    startProcessingState();
    
    // Save credentials if option is checked
    if (saveCredentialsCheckbox.checked) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            apiKey,
            saveCredentials: true
        }));
    } else {
        localStorage.removeItem(STORAGE_KEY);
    }
    
    // Clear console
    consoleOutput.innerHTML = '';
    
    // Add initial message
    addConsoleEntry({
        type: 'update',
        message: 'Request sent to Operator...',
        sessionId: currentSessionId
    });
}

// Stop the current process
function stopProcess() {
    if (ws && ws.readyState === WebSocket.OPEN && currentSessionId) {
        ws.send(JSON.stringify({
            action: 'stop',
            sessionId: currentSessionId
        }));
        
        addConsoleEntry({
            type: 'update',
            message: 'Stopping process...',
            sessionId: currentSessionId
        });
    }
}

// Update UI for processing state
function startProcessingState() {
    isProcessing = true;
    submitBtn.classList.add('btn-disabled');
    submitBtn.disabled = true;
    stopBtn.classList.remove('hidden');
    promptInput.disabled = true;
    updateConnectionStatus(true, true);
}

// Update UI for idle state
function endProcessingState() {
    isProcessing = false;
    submitBtn.classList.remove('btn-disabled');
    submitBtn.disabled = false;
    stopBtn.classList.add('hidden');
    promptInput.disabled = false;
    updateConnectionStatus(true);
}

// Save user settings
function saveUserSettings() {
    if (saveCredentialsCheckbox.checked) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            apiKey: apiKeyInput.value,
            saveCredentials: true
        }));
    } else {
        localStorage.removeItem(STORAGE_KEY);
    }
    
    settingsOverlay.classList.remove('active');
    
    addConsoleEntry({
        type: 'update',
        message: 'Settings saved',
        sessionId: 'system'
    });
}

// Initialize app when page loads
document.addEventListener('DOMContentLoaded', init);