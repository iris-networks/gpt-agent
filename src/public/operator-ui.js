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
let currentOperatorId = null;
let pollIntervalId = null;

// --- Modular Functions ---

function loadConfigOptions() {
  fetch('/api/operators/configs')
    .then(response => response.json())
    .then(data => {
      populateOperatorTypes(data.modes);
      populateVLMProviders(data.providers);
    })
    .catch(error => {
      console.error('Error loading configurations:', error);
      addConversation('System', 'Failed to load configurations. Check console for details.');
    });
}

function populateOperatorTypes(modes) {
  operatorTypeSelect.innerHTML = '';
  modes.forEach(mode => {
    const option = document.createElement('option');
    option.value = mode.id;
    option.textContent = mode.name;
    operatorTypeSelect.appendChild(option);
  });
}

function populateVLMProviders(providers) {
  vlmProviderSelect.innerHTML = '';
  providers.forEach(provider => {
    const option = document.createElement('option');
    option.value = provider.id;
    option.textContent = provider.name;
    vlmProviderSelect.appendChild(option);
  });
}

function initializeOperator() {
  const payload = {
    operatorType: operatorTypeSelect.value,
    vlmConfig: {
      apiKey: vlmApiKeyInput.value || undefined
    },
    settings: {
      maxLoopCount: parseInt(maxLoopCountInput.value) || 10,
      loopIntervalInMs: parseInt(loopIntervalInput.value) || 1000,
    }
  };

  fetch('/api/operators/init', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(response => response.json().then(data => ({ ok: response.ok, data })))
    .then(({ ok, data }) => {
      if (ok) {
        currentOperatorId = data.operatorId;
        operatorIdSpan.textContent = `Operator ID: ${currentOperatorId}`;
        updateOperatorStatus(data.status);
        setupPanel.classList.add('hidden');
        controlPanel.classList.remove('hidden');
        addConversation('System', `Operator initialized successfully. Ready to execute instructions.`);
        startStatusPolling();
      } else {
        addConversation('System', `Failed to initialize operator: ${data.error || data.message}`);
      }
    })
    .catch(error => {
      console.error('Error initializing operator:', error);
      addConversation('System', 'Failed to initialize operator. Check console for details.');
    });
}

function executeInstructions() {
  if (!currentOperatorId) {
    addConversation('System', 'No active operator. Please initialize an operator first.');
    return;
  }
  const instructions = instructionsTextarea.value.trim();
  if (!instructions) {
    addConversation('System', 'Please enter instructions.');
    return;
  }
  fetch(`/api/operators/${currentOperatorId}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ instructions })
  })
    .then(response => response.json().then(data => ({ ok: response.ok, data })))
    .then(({ ok, data }) => {
      if (ok) {
        updateOperatorStatus(data.status);
        addConversation('System', `Execution started: ${instructions}`);
      } else {
        addConversation('System', `Failed to execute instructions: ${data.error || data.message}`);
      }
    })
    .catch(error => {
      console.error('Error executing instructions:', error);
      addConversation('System', 'Failed to execute instructions. Check console for details.');
    });
}

function cancelExecution() {
  if (!currentOperatorId) return;
  fetch(`/api/operators/${currentOperatorId}/cancel`, { method: 'POST' })
    .then(response => response.json().then(data => ({ ok: response.ok, data })))
    .then(({ ok, data }) => {
      if (ok) {
        updateOperatorStatus(data.status);
        addConversation('System', 'Operation cancelled.');
      } else {
        addConversation('System', `Failed to cancel operation: ${data.error || data.message}`);
      }
    })
    .catch(error => {
      console.error('Error cancelling operation:', error);
      addConversation('System', 'Failed to cancel operation. Check console for details.');
    });
}

function closeOperator() {
  if (!currentOperatorId) return;
  fetch(`/api/operators/${currentOperatorId}`, { method: 'DELETE' })
    .then(response => response.json().then(data => ({ ok: response.ok, data })))
    .then(({ ok, data }) => {
      if (ok) {
        if (pollIntervalId) {
          clearInterval(pollIntervalId);
          pollIntervalId = null;
        }
        currentOperatorId = null;
        operatorIdSpan.textContent = 'No operator active';
        updateOperatorStatus('CLOSED');
        setupPanel.classList.remove('hidden');
        controlPanel.classList.add('hidden');
        screenshotImg.style.display = 'none';
        screenshotMessage.style.display = 'block';
        addConversation('System', 'Operator closed successfully.');
      } else {
        addConversation('System', `Failed to close operator: ${data.error || data.message}`);
      }
    })
    .catch(error => {
      console.error('Error closing operator:', error);
      addConversation('System', 'Failed to close operator. Check console for details.');
    });
}

function takeScreenshot() {
  if (!currentOperatorId) {
    addConversation('System', 'No active operator. Please initialize an operator first.');
    return;
  }
  fetch(`/api/operators/${currentOperatorId}/screenshot`)
    .then(response => response.json())
    .then(data => {
      if (data.screenshot) {
        screenshotImg.src = 'data:image/png;base64,' + data.screenshot;
        screenshotImg.style.display = 'block';
        screenshotMessage.style.display = 'none';
        activateTab('screenshot');
      } else {
        addConversation('System', `Failed to take screenshot: ${data.error || data.message}`);
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

function startStatusPolling() {
  if (pollIntervalId) clearInterval(pollIntervalId);
  pollIntervalId = setInterval(async () => {
    if (!currentOperatorId) return;
    // ... polling logic ...
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
  loadConfigOptions();

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