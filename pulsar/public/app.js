// DOM Elements
const configForm = document.getElementById('configForm');
const apiKeyInput = document.getElementById('apiKey');
const apiUrlInput = document.getElementById('apiUrl');
const modelSelection = document.getElementById('modelSelection');
const promptInput = document.getElementById('prompt');
const submitBtn = document.getElementById('submitBtn');
const stopBtn = document.getElementById('stopBtn');
const consoleOutput = document.getElementById('consoleOutput');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const settingsBtn = document.getElementById('settingsBtn');
const settingsOverlay = document.getElementById('settingsOverlay');
const closeSettings = document.getElementById('closeSettings');
const saveGeneralSettings = document.getElementById('saveGeneralSettings');
const saveCredentialsCheckbox = document.getElementById('saveCredentials');

// Workflow Elements
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const workflowList = document.getElementById('workflowList');
const emptyWorkflows = document.getElementById('emptyWorkflows');
const workflowForm = document.querySelector('.workflow-form');
const workflowNameInput = document.getElementById('workflowName');
const workflowUrlInput = document.getElementById('workflowUrl');
const workflowInstructionsInput = document.getElementById('workflowInstructions');
const saveWorkflowBtn = document.getElementById('saveWorkflow');
const resetWorkflowFormBtn = document.getElementById('resetWorkflowForm');

// Workflow Selection Elements
const workflowSelection = document.getElementById('workflowSelection');
const activeWorkflowInfo = document.getElementById('activeWorkflowInfo');
const activeWorkflowName = document.getElementById('activeWorkflowName');
const viewWorkflowDetails = document.getElementById('viewWorkflowDetails');

// WebSocket connection
let ws = null;
let currentSessionId = null;
let isProcessing = false;

// Constants
const DEFAULT_API_URL = 'https://agent.tryiris.dev'; // API endpoint stays the same
const STORAGE_KEY = 'operatorCredentials';
const WORKFLOW_STORAGE_KEY = 'operatorWorkflows';

// Workflow data
let workflows = [];
let editingWorkflowId = null;

// Initialize app
function init() {
    loadSavedCredentials();
    loadWorkflows();
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

// Load saved workflows from localStorage
function loadWorkflows() {
    workflows = JSON.parse(localStorage.getItem(WORKFLOW_STORAGE_KEY) || '[]');
    renderWorkflows();
    populateWorkflowDropdown();
}

// Populate the workflow dropdown in the main form
function populateWorkflowDropdown() {
    // Clear all options except the default
    while (workflowSelection.options.length > 1) {
        workflowSelection.remove(1);
    }
    
    // Add options for each workflow
    workflows.forEach(workflow => {
        const option = document.createElement('option');
        option.value = workflow.id;
        option.textContent = workflow.name;
        workflowSelection.appendChild(option);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Main form
    configForm.addEventListener('submit', handleSubmit);
    stopBtn.addEventListener('click', stopProcess);
    
    // Settings modal
    settingsBtn.addEventListener('click', () => settingsOverlay.classList.add('active'));
    closeSettings.addEventListener('click', () => settingsOverlay.classList.remove('active'));
    saveGeneralSettings.addEventListener('click', saveUserSettings);
    
    // Close modal when clicking outside
    settingsOverlay.addEventListener('click', (e) => {
        if (e.target === settingsOverlay) {
            settingsOverlay.classList.remove('active');
        }
    });
    
    // Tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.add('hidden'));
            
            // Add active class to clicked button and show corresponding content
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(`${tabId}Tab`).classList.remove('hidden');
        });
    });
    
    // Workflow form
    saveWorkflowBtn.addEventListener('click', saveWorkflow);
    resetWorkflowFormBtn.addEventListener('click', resetWorkflowForm);
    
    // Workflow selection and preview
    workflowSelection.addEventListener('change', updateActiveWorkflowInfo);
    viewWorkflowDetails.addEventListener('click', showWorkflowPreview);
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
    
        // Get selected workflow if any
    const selectedWorkflowId = workflowSelection.value;
    let selectedWorkflow = null;
    
    if (selectedWorkflowId) {
        selectedWorkflow = workflows.find(w => w.id === selectedWorkflowId);
    }
    
    // Get selected model
    const modelType = modelSelection.value;
    
    // Send message to server with selected workflow and model
    ws.send(JSON.stringify({
        prompt,
        sessionId: currentSessionId,
        apiKey,
        apiUrl,
        modelType,
        workflow: selectedWorkflow
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

// Render workflows in the list
function renderWorkflows() {
    // Clear existing content except the empty state message
    const items = workflowList.querySelectorAll('.workflow-item');
    items.forEach(item => item.remove());
    
    // Show/hide empty state message
    if (workflows.length === 0) {
        emptyWorkflows.classList.remove('hidden');
    } else {
        emptyWorkflows.classList.add('hidden');
        
        // Render each workflow
        workflows.forEach(workflow => {
            const workflowItem = document.createElement('div');
            workflowItem.className = 'workflow-item';
            workflowItem.dataset.id = workflow.id;
            
            const header = document.createElement('div');
            header.className = 'workflow-header';
            
            const name = document.createElement('div');
            name.className = 'workflow-name';
            name.textContent = workflow.name;
            
            const actions = document.createElement('div');
            actions.className = 'workflow-actions';
            
            const editBtn = document.createElement('button');
            editBtn.className = 'workflow-edit';
            editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
            editBtn.addEventListener('click', () => editWorkflow(workflow.id));
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'workflow-delete';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
            deleteBtn.addEventListener('click', () => deleteWorkflow(workflow.id));
            
            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);
            header.appendChild(name);
            header.appendChild(actions);
            
            const url = document.createElement('div');
            url.className = 'workflow-url';
            url.textContent = `URL Pattern: ${workflow.urlPattern}`;
            
            const instructions = document.createElement('div');
            instructions.className = 'workflow-instructions';
            instructions.textContent = workflow.instructions;
            
            workflowItem.appendChild(header);
            workflowItem.appendChild(url);
            workflowItem.appendChild(instructions);
            
            workflowList.appendChild(workflowItem);
        });
    }
}

// Save or update a workflow
function saveWorkflow() {
    const name = workflowNameInput.value.trim();
    const urlPattern = workflowUrlInput.value.trim();
    const instructions = workflowInstructionsInput.value.trim();
    
    if (!name || !urlPattern || !instructions) {
        alert('All fields are required!');
        return;
    }
    
    if (editingWorkflowId) {
        // Update existing workflow
        const index = workflows.findIndex(w => w.id === editingWorkflowId);
        if (index !== -1) {
            workflows[index] = {
                ...workflows[index],
                name,
                urlPattern,
                instructions,
                updatedAt: new Date().toISOString()
            };
        }
    } else {
        // Create new workflow
        workflows.push({
            id: Date.now().toString(),
            name,
            urlPattern,
            instructions,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
    }
    
    // Save to localStorage
    localStorage.setItem(WORKFLOW_STORAGE_KEY, JSON.stringify(workflows));
    
    // Reset form and re-render
    resetWorkflowForm();
    renderWorkflows();
    populateWorkflowDropdown();
    
    // Show success message
    addConsoleEntry({
        type: 'update',
        message: `Workflow ${editingWorkflowId ? 'updated' : 'created'} successfully`,
        sessionId: 'system'
    });
}

// Edit a workflow
function editWorkflow(id) {
    const workflow = workflows.find(w => w.id === id);
    if (workflow) {
        editingWorkflowId = id;
        
        // Fill form with workflow data
        workflowNameInput.value = workflow.name;
        workflowUrlInput.value = workflow.urlPattern;
        workflowInstructionsInput.value = workflow.instructions;
        
        // Update button text
        saveWorkflowBtn.textContent = 'Update Workflow';
    }
}

// Delete a workflow
function deleteWorkflow(id) {
    if (confirm('Are you sure you want to delete this workflow?')) {
        workflows = workflows.filter(w => w.id !== id);
        
        // Save to localStorage
        localStorage.setItem(WORKFLOW_STORAGE_KEY, JSON.stringify(workflows));
        
        // Reset form if editing the deleted workflow
        if (editingWorkflowId === id) {
            resetWorkflowForm();
        }
        
        // Re-render workflows and update dropdown
        renderWorkflows();
        populateWorkflowDropdown();
        
        // Clear selection if the active workflow was deleted
        if (workflowSelection.value === id) {
            workflowSelection.value = '';
            updateActiveWorkflowInfo();
        }
        
        // Show success message
        addConsoleEntry({
            type: 'update',
            message: 'Workflow deleted successfully',
            sessionId: 'system'
        });
    }
}

// Reset workflow form
function resetWorkflowForm() {
    editingWorkflowId = null;
    workflowNameInput.value = '';
    workflowUrlInput.value = '';
    workflowInstructionsInput.value = '';
    saveWorkflowBtn.textContent = 'Add Workflow';
}

// Update active workflow info display
function updateActiveWorkflowInfo() {
    const selectedWorkflowId = workflowSelection.value;
    
    if (selectedWorkflowId) {
        const selectedWorkflow = workflows.find(w => w.id === selectedWorkflowId);
        
        if (selectedWorkflow) {
            activeWorkflowName.textContent = selectedWorkflow.name;
            activeWorkflowInfo.classList.remove('hidden');
            return;
        }
    }
    
    // No workflow selected or workflow not found
    activeWorkflowInfo.classList.add('hidden');
}

// Show workflow preview modal
function showWorkflowPreview() {
    const selectedWorkflowId = workflowSelection.value;
    if (!selectedWorkflowId) return;
    
    const selectedWorkflow = workflows.find(w => w.id === selectedWorkflowId);
    if (!selectedWorkflow) return;
    
    // Check if preview already exists and remove it
    const existingPreview = document.querySelector('.workflow-preview-modal');
    if (existingPreview) {
        existingPreview.remove();
    }
    
    // Create preview modal
    const previewModal = document.createElement('div');
    previewModal.className = 'workflow-preview-modal';
    
    // Add header
    const previewHeader = document.createElement('div');
    previewHeader.className = 'workflow-preview-header';
    
    const previewTitle = document.createElement('div');
    previewTitle.className = 'workflow-preview-title';
    previewTitle.textContent = 'Workflow Details';
    
    const previewClose = document.createElement('button');
    previewClose.className = 'workflow-preview-close';
    previewClose.innerHTML = '<i class="fas fa-times"></i>';
    previewClose.addEventListener('click', () => previewModal.remove());
    
    previewHeader.appendChild(previewTitle);
    previewHeader.appendChild(previewClose);
    
    // Add content
    const previewContent = document.createElement('div');
    previewContent.className = 'workflow-preview-content';
    
    // Name
    const nameContainer = document.createElement('div');
    nameContainer.className = 'workflow-preview-item';
    
    const nameLabel = document.createElement('div');
    nameLabel.className = 'workflow-preview-label';
    nameLabel.textContent = 'Workflow Name';
    
    const nameValue = document.createElement('div');
    nameValue.className = 'workflow-preview-value';
    nameValue.textContent = selectedWorkflow.name;
    
    nameContainer.appendChild(nameLabel);
    nameContainer.appendChild(nameValue);
    
    // URL Pattern
    const urlContainer = document.createElement('div');
    urlContainer.className = 'workflow-preview-item';
    
    const urlLabel = document.createElement('div');
    urlLabel.className = 'workflow-preview-label';
    urlLabel.textContent = 'URL Pattern';
    
    const urlValue = document.createElement('div');
    urlValue.className = 'workflow-preview-value';
    urlValue.textContent = selectedWorkflow.urlPattern;
    
    urlContainer.appendChild(urlLabel);
    urlContainer.appendChild(urlValue);
    
    // Instructions
    const instructionsContainer = document.createElement('div');
    instructionsContainer.className = 'workflow-preview-item';
    
    const instructionsLabel = document.createElement('div');
    instructionsLabel.className = 'workflow-preview-label';
    instructionsLabel.textContent = 'Special Instructions';
    
    const instructionsValue = document.createElement('div');
    instructionsValue.className = 'workflow-preview-value';
    instructionsValue.textContent = selectedWorkflow.instructions;
    
    instructionsContainer.appendChild(instructionsLabel);
    instructionsContainer.appendChild(instructionsValue);
    
    // Information about system prompt
    const infoContainer = document.createElement('div');
    infoContainer.className = 'workflow-preview-item';
    
    const infoValue = document.createElement('div');
    infoValue.style.fontSize = '0.9rem';
    infoValue.style.color = 'var(--on-surface-medium)';
    infoValue.style.fontStyle = 'italic';
    infoValue.innerHTML = 'These instructions will be appended to the system prompt when sending your command to Operator.';
    
    infoContainer.appendChild(infoValue);
    
    // Add all content
    previewContent.appendChild(nameContainer);
    previewContent.appendChild(urlContainer);
    previewContent.appendChild(instructionsContainer);
    previewContent.appendChild(infoContainer);
    
    previewModal.appendChild(previewHeader);
    previewModal.appendChild(previewContent);
    
    // Add to page after the form
    configForm.appendChild(previewModal);
}

// Initialize app when page loads
document.addEventListener('DOMContentLoaded', init);