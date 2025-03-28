// This script handles the sidepanel UI logic for the AI Assistant

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const statusIndicator = document.getElementById('status-indicator') as HTMLDivElement;
  const promptInput = document.getElementById('prompt-input') as HTMLTextAreaElement;
  const runButton = document.getElementById('run-button') as HTMLButtonElement;
  const micButton = document.getElementById('mic-button') as HTMLButtonElement;
  const chatMessages = document.getElementById('chat-messages') as HTMLDivElement;
  const tabs = document.querySelectorAll('.tab') as NodeListOf<HTMLButtonElement>;
  const tabPanes = document.querySelectorAll('.tab-pane') as NodeListOf<HTMLDivElement>;
  const darkModeToggle = document.getElementById('dark-mode-toggle') as HTMLInputElement;
  const serverUrlInput = document.getElementById('server-url') as HTMLInputElement;
  const claudeApiKeyInput = document.getElementById('claude-api-key') as HTMLInputElement;
  
  // Initialize dark mode from saved preference
  chrome.storage.local.get(['darkMode'], (result) => {
    const isDarkMode = result.darkMode || false;
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      darkModeToggle.checked = true;
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      darkModeToggle.checked = false;
    }
  });
  
  // Dark mode toggle
  darkModeToggle.addEventListener('change', () => {
    const isDarkMode = darkModeToggle.checked;
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    chrome.storage.local.set({ darkMode: isDarkMode });
  });
  
  // Handle input events
  promptInput.addEventListener('input', () => {
    // Enable/disable run button based on input
    runButton.disabled = !promptInput.value.trim();
  });
  
  // Allow submitting with Enter key (but Shift+Enter for new line)
  promptInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (promptInput.value.trim()) {
        runButton.click();
      }
    }
  });
  
  // Tab switching logic
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs
      tabs.forEach(t => t.classList.remove('tab-active'));
      
      // Add active class to clicked tab
      tab.classList.add('tab-active');
      
      // Hide all tab panes
      tabPanes.forEach(pane => pane.classList.add('hidden'));
      
      // Show the corresponding tab pane
      const tabName = tab.getAttribute('data-tab');
      const tabPane = document.getElementById(`${tabName}-tab`);
      if (tabPane) tabPane.classList.remove('hidden');
    });
  });
  
  // Initialize the AI Assistant interface
  chrome.runtime.sendMessage(
    { action: 'check_connection' },
    (response) => {
      updateConnectionStatus(response?.connected || false);
    }
  );
  
  // Initialize settings from storage
  chrome.storage.local.get(['serverUrl', 'claudeApiKey'], (result) => {
    if (result.serverUrl) serverUrlInput.value = result.serverUrl;
    if (result.claudeApiKey) claudeApiKeyInput.value = result.claudeApiKey;
  });
  
  // Save settings when changed
  serverUrlInput.addEventListener('change', () => {
    chrome.storage.local.set({ serverUrl: serverUrlInput.value });
    showToast('Server URL saved');
  });
  
  claudeApiKeyInput.addEventListener('change', () => {
    chrome.storage.local.set({ claudeApiKey: claudeApiKeyInput.value });
    showToast('API Key saved');
  });
  
  // Speech recognition setup
  let recognition: any = null;
  let isRecording = false;
  
  // Initialize speech recognition
  function setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      micButton.disabled = true;
      micButton.title = 'Speech recognition not supported in this browser';
      return;
    }
    
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      promptInput.value += transcript;
      runButton.disabled = false;
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      stopRecording();
    };
    
    recognition.onend = () => {
      stopRecording();
    };
  }
  
  // Toggle recording state
  function toggleRecording() {
    if (!recognition) setupSpeechRecognition();
    if (!recognition) return;
    
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }
  
  // Start recording
  function startRecording() {
    try {
      recognition.start();
      isRecording = true;
      micButton.classList.add('bg-purple-600');
      micButton.classList.add('text-white');
      micButton.classList.remove('bg-purple-100');
      micButton.classList.remove('text-purple-800');
    } catch (error) {
      console.error('Failed to start recording', error);
    }
  }
  
  // Stop recording
  function stopRecording() {
    try {
      if (recognition) recognition.stop();
      isRecording = false;
      micButton.classList.remove('bg-purple-600');
      micButton.classList.remove('text-white');
      micButton.classList.add('bg-purple-100');
      micButton.classList.add('text-purple-800');
    } catch (error) {
      console.error('Failed to stop recording', error);
    }
  }
  
  // Add mic button click handler
  micButton.addEventListener('click', toggleRecording);
  
  // Add any stored activities to the chat messages
  chrome.storage.local.get(['activities'], (result) => {
    if (result.activities && Array.isArray(result.activities)) {
      result.activities.forEach((activity: any) => {
        addMessageToChat(activity);
      });
    }
  });
  
  // Run agent when button is clicked
  runButton.addEventListener('click', () => {
    const prompt = promptInput.value.trim();
    if (!prompt) return;
    
    // Update UI
    updateStatusIndicator('warning', true);
    runButton.disabled = true;
    
    // Add user message to chat
    addUserMessage(prompt);
    
    // Add to activity log
    addActivityToLog('prompt', prompt);
    
    chrome.runtime.sendMessage(
      { action: 'run_agent', prompt },
      (response) => {
        if (!response || !response.success) {
          updateStatusIndicator('error');
          runButton.disabled = false;
          
          // Add error message to chat
          addAssistantMessage('I encountered an error processing your request. Please try again.');
          
          // Update activity log
          addActivityToLog('error', 'Could not execute command');
        }
      }
    );
  });
  
  // Listen for messages from background
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'agent_update') {
      updateStatusIndicator('warning', true);
      
      // We could add a typing indicator here if needed
    } else if (message.action === 'agent_complete') {
      updateStatusIndicator('success');
      runButton.disabled = false;
      promptInput.value = '';
      
      // Add the assistant's response to the chat
      addAssistantMessage(message.data.result.text);
      
    } else if (message.action === 'agent_error') {
      updateStatusIndicator('error');
      runButton.disabled = false;
      
      // Add error message to chat
      addAssistantMessage(`Error: ${message.data.message}`);
    }
  });
  
  function updateConnectionStatus(connected: boolean) {
    if (connected) {
      updateStatusIndicator('success');
      runButton.disabled = false;
    } else {
      updateStatusIndicator('error');
      runButton.disabled = true;
    }
  }
  
  function updateStatusIndicator(status: 'success' | 'error' | 'warning', pulse = false) {
    statusIndicator.className = `w-3 h-3 rounded-full bg-${status} ${pulse ? 'animate-pulse' : ''}`;
  }
  
  // Add activity to the history log (for storage)
  function addActivityToLog(type: string, content: string) {
    // Create a new activity
    const activity = {
      type,
      content,
      timestamp: new Date().toISOString()
    };
    
    // Store activity for persistence
    chrome.storage.local.get(['activities'], (result) => {
      const activities = result.activities || [];
      activities.push(activity);
      chrome.storage.local.set({ activities: activities.slice(-20) }); // Keep last 20 activities
    });
  }
  
  // Add a user message to the chat
  function addUserMessage(message: string) {
    const messageEl = document.createElement('div');
    messageEl.className = 'card bg-white shadow-sm mb-3';
    messageEl.innerHTML = `
      <div class="card-body p-3">
        <div class="flex items-start">
          <div class="avatar">
            <div class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
              <span class="text-xs">You</span>
            </div>
          </div>
          <div class="ml-2">
            <p class="text-xs">${message}</p>
          </div>
        </div>
      </div>
    `;
    
    chatMessages.appendChild(messageEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  // Add an assistant message to the chat
  function addAssistantMessage(message: string) {
    const messageEl = document.createElement('div');
    messageEl.className = 'card bg-white shadow-sm mb-3';
    messageEl.innerHTML = `
      <div class="card-body p-3">
        <div class="flex items-start">
          <div class="avatar">
            <div class="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
              <img src="icons/icon16.png" alt="AI" class="w-4 h-4">
            </div>
          </div>
          <div class="ml-2">
            <p class="text-xs">${message}</p>
          </div>
        </div>
      </div>
    `;
    
    chatMessages.appendChild(messageEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  // Add a stored activity to the chat (for loading history)
  function addMessageToChat(activity: any) {
    if (activity.type === 'prompt') {
      addUserMessage(activity.content);
    } else if (activity.type === 'error') {
      addAssistantMessage(`Error: ${activity.content}`);
    }
    // We don't display 'accept_connection' messages anymore as they're LinkedIn-specific
  }
  
  function showToast(message: string) {
    const toast = document.createElement('div');
    toast.className = 'toast toast-top toast-center';
    toast.innerHTML = `
      <div class="alert alert-success">
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
});