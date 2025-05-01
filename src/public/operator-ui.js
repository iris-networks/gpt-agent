// DOM elements
const operatorTypeSelect = document.getElementById('operator-type');
const vlmApiKeyInput = document.getElementById('vlm-api-key');
const maxLoopCountInput = document.getElementById('max-loop-count');
const loopIntervalInput = document.getElementById('loop-interval');
const initOperatorBtn = document.getElementById('init-operator');
const executeInstructionsBtn = document.getElementById('execute-instructions');
const cancelExecutionBtn = document.getElementById('cancel-execution');
const closeOperatorBtn = document.getElementById('close-operator');
const takeScreenshotBtn = document.getElementById('take-screenshot');
const instructionsTextarea = document.getElementById('instructions');
const conversationsContainer = document.getElementById('conversations-container');
const screenshotImg = document.getElementById('screenshot');
const screenshotMessage = document.getElementById('screenshot-message');
const operatorIdSpan = document.getElementById('operator-id');
const operatorStatusSpan = document.getElementById('operator-status');
const setupPanel = document.getElementById('setup-panel');
const controlPanel = document.getElementById('control-panel');
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

// State
let currentSessionId = null;
let pollIntervalId = null;

// --- Modular Functions ---

function initializeOperator() {
  const payload = {
    instructions: "Initialize operator",
    operator: operatorTypeSelect.value,
    config: {
      vlmApiKey: vlmApiKeyInput.value || undefined,
      maxLoopCount: parseInt(maxLoopCountInput.value) || 10,
      loopIntervalInMs: parseInt(loopIntervalInput.value) || 1000,
    }
  };

  fetch('/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(response => response.json())
    .then(data => {
      if (data.sessionId) {
        currentSessionId = data.sessionId;
        operatorIdSpan.textContent = `Session ID: ${currentSessionId}`;
        updateOperatorStatus('INITIALIZING');
        setupPanel.classList.add('hidden');
        controlPanel.classList.remove('hidden');
        addConversation('System', `Operator initialized successfully. Ready to execute instructions.`);
        startStatusPolling();
      } else {
        addConversation('System', `Failed to initialize operator: ${data.error || 'Unknown error'}`);
      }
    })
    .catch(error => {
      console.error('Error initializing operator:', error);
      addConversation('System', 'Failed to initialize operator. Check console for details.');
    });
}

function executeInstructions() {
  if (!currentSessionId) {
    addConversation('System', 'No active session. Please initialize an operator first.');
    return;
  }
  
  const instructions = instructionsTextarea.value.trim();
  if (!instructions) {
    addConversation('System', 'Please enter instructions.');
    return;
  }
  
  // Create a new session with the instructions
  const payload = {
    instructions: instructions,
    operator: operatorTypeSelect.value,
  };

  fetch('/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(response => response.json())
    .then(data => {
      if (data.sessionId) {
        currentSessionId = data.sessionId;
        updateOperatorStatus('RUNNING');
        addConversation('System', `Execution started: ${instructions}`);
        startStatusPolling();
      } else {
        addConversation('System', `Failed to execute instructions: ${data.error || 'Unknown error'}`);
      }
    })
    .catch(error => {
      console.error('Error executing instructions:', error);
      addConversation('System', 'Failed to execute instructions. Check console for details.');
    });
}

function cancelExecution() {
  if (!currentSessionId) return;
  
  fetch(`/api/sessions/${currentSessionId}/cancel`, { method: 'POST' })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        updateOperatorStatus('CANCELLED');
        addConversation('System', 'Operation cancelled.');
      } else {
        addConversation('System', `Failed to cancel operation: ${data.error || 'Unknown error'}`);
      }
    })
    .catch(error => {
      console.error('Error cancelling operation:', error);
      addConversation('System', 'Failed to cancel operation. Check console for details.');
    });
}

function closeOperator() {
  if (!currentSessionId) return;
  
  if (pollIntervalId) {
    clearInterval(pollIntervalId);
    pollIntervalId = null;
  }
  
  cancelExecution();
  
  // Use setTimeout to give the cancel operation time to complete
  setTimeout(() => {
    currentSessionId = null;
    operatorIdSpan.textContent = 'No operator active';
    updateOperatorStatus('CLOSED');
    setupPanel.classList.remove('hidden');
    controlPanel.classList.add('hidden');
    screenshotImg.style.display = 'none';
    screenshotMessage.style.display = 'block';
    addConversation('System', 'Operator closed successfully.');
  }, 1000);
}

function takeScreenshot() {
  if (!currentSessionId) {
    addConversation('System', 'No active session. Please initialize an operator first.');
    return;
  }
  
  fetch(`/api/sessions/${currentSessionId}/screenshot`)
    .then(response => response.json())
    .then(data => {
      if (data.success && data.screenshot) {
        screenshotImg.src = 'data:image/png;base64,' + data.screenshot;
        screenshotImg.style.display = 'block';
        screenshotMessage.style.display = 'none';
        activateTab('screenshot');
      } else {
        addConversation('System', `Failed to take screenshot: ${data.error || 'Unable to capture screenshot'}`);
      }
    })
    .catch(error => {
      console.error('Error taking screenshot:', error);
      addConversation('System', 'Failed to take screenshot. Check console for details.');
    });
}

function activateTab(tabName) {
  tabs.forEach(tab => {
    tab.classList.toggle('active', tab.getAttribute('data-tab') === tabName);
  });
  tabContents.forEach(content => {
    content.classList.toggle('active', content.id === tabName + '-tab');
  });
}

function addConversation(role, message) {
  const conversationDiv = document.createElement('div');
  conversationDiv.className = 'conversation';
  
  const roleDiv = document.createElement('div');
  roleDiv.className = 'conversation-role';
  roleDiv.textContent = role;
  
  const contentDiv = document.createElement('div');
  contentDiv.className = 'conversation-content';
  contentDiv.textContent = message;
  
  conversationDiv.appendChild(roleDiv);
  conversationDiv.appendChild(contentDiv);
  
  conversationsContainer.appendChild(conversationDiv);
  conversationsContainer.scrollTop = conversationsContainer.scrollHeight;
}

function updateOperatorStatus(status) {
  operatorStatusSpan.textContent = status;
  operatorStatusSpan.className = 'status-badge';
  
  switch (status.toLowerCase()) {
    case 'running':
      operatorStatusSpan.classList.add('status-running');
      break;
    case 'ready':
    case 'initializing':
      operatorStatusSpan.classList.add('status-ready');
      break;
    case 'error':
      operatorStatusSpan.classList.add('status-error');
      break;
    case 'closed':
    case 'cancelled':
      operatorStatusSpan.classList.add('status-closed');
      break;
    default:
      operatorStatusSpan.classList.add('status-ready');
  }
}

function startStatusPolling() {
  if (pollIntervalId) clearInterval(pollIntervalId);
  
  pollIntervalId = setInterval(() => {
    if (!currentSessionId) return;
    
    fetch(`/api/sessions/${currentSessionId}`)
      .then(response => response.json())
      .then(data => {
        updateOperatorStatus(data.status);
        
        // If there are new conversations, add them
        if (data.conversations && data.conversations.length > 0) {
          // Clear existing conversations first to avoid duplicates
          // This is a simplification; in a real app you'd need to track conversation IDs
          conversationsContainer.innerHTML = '';
          
          data.conversations.forEach(conv => {
            addConversation(conv.role || 'System', conv.content || conv.message || JSON.stringify(conv));
          });
        }
        
        // If completed, error, or cancelled, stop polling
        if (['completed', 'error', 'cancelled'].includes(data.status.toLowerCase())) {
          clearInterval(pollIntervalId);
          pollIntervalId = null;
        }
      })
      .catch(error => {
        console.error('Error polling session status:', error);
        clearInterval(pollIntervalId);
        pollIntervalId = null;
      });
  }, 2000);
}

// --- Event Listeners ---

initOperatorBtn.addEventListener('click', initializeOperator);
executeInstructionsBtn.addEventListener('click', executeInstructions);
cancelExecutionBtn.addEventListener('click', cancelExecution);
closeOperatorBtn.addEventListener('click', closeOperator);
takeScreenshotBtn.addEventListener('click', takeScreenshot);
tabs.forEach(tab => tab.addEventListener('click', () => activateTab(tab.getAttribute('data-tab'))));

// --- Initialization ---
document.addEventListener('DOMContentLoaded', function() {
  // Fullscreen functionality for VNC iframe
  const fullscreenBtn = document.getElementById('vnc-fullscreen-btn');
  const vncIframe = document.getElementById('vnc-iframe');
  if (fullscreenBtn && vncIframe) {
    fullscreenBtn.addEventListener('click', function() {
      if (vncIframe.requestFullscreen) {
        vncIframe.requestFullscreen();
      } else if (vncIframe.webkitRequestFullscreen) { // Safari
        vncIframe.webkitRequestFullscreen();
      } else if (vncIframe.msRequestFullscreen) { // IE11
        vncIframe.msRequestFullscreen();
      }
    });
  }
});