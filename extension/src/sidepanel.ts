// This script handles the sidepanel UI logic for the AI Assistant

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const statusIndicator = document.getElementById('status-indicator') as HTMLDivElement;
  const promptInput = document.getElementById('prompt-input') as HTMLTextAreaElement;
  const runButton = document.getElementById('run-button') as HTMLButtonElement;
  const micButton = document.getElementById('mic-button') as HTMLButtonElement;
  const chatMessages = document.getElementById('chat-messages') as HTMLDivElement;
  
  // Get tab elements
  const tabs = document.querySelectorAll('.tab') as NodeListOf<HTMLButtonElement>;
  console.log('Tabs found:', tabs.length, Array.from(tabs).map(t => t.getAttribute('data-tab')));
  
  const tabPanes = document.querySelectorAll('.tab-pane') as NodeListOf<HTMLDivElement>;
  console.log('Tab panes found:', tabPanes.length, Array.from(tabPanes).map(p => p.id));
  
  // Add direct handlers for the tab buttons
  const chatTabButton = document.getElementById('chat-tab-button') as HTMLButtonElement;
  const settingsTabButton = document.getElementById('settings-tab-button') as HTMLButtonElement;
  
  if (chatTabButton) {
    chatTabButton.addEventListener('click', () => switchTabDirect('chat'));
  } else {
    console.error('Chat tab button not found');
  }
  
  if (settingsTabButton) {
    settingsTabButton.addEventListener('click', () => switchTabDirect('settings'));
  } else {
    console.error('Settings tab button not found');
  }
  
  const darkModeToggle = document.getElementById('dark-mode-toggle') as HTMLInputElement;
  const claudeApiKeyInput = document.getElementById('claude-api-key') as HTMLInputElement;
  const serverUrlInput = document.getElementById('server-url') as HTMLInputElement;
  const cleanChatsButton = document.getElementById('clean-chats-button') as HTMLButtonElement;
  
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
  
  // Tab switching function
  function switchTabDirect(tabName: string) {
    console.log('Direct tab switch to:', tabName);
    
    // Remove active class from all tabs
    document.querySelectorAll('.tab').forEach(tab => {
      tab.classList.remove('tab-active');
    });
    
    // Add active class to clicked tab
    const clickedTab = document.querySelector(`[data-tab="${tabName}"]`);
    if (clickedTab) {
      clickedTab.classList.add('tab-active');
    }
    
    // Hide all tab panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.add('hidden');
      console.log(`Hiding pane: ${pane.id}`);
    });
    
    // Show the corresponding tab pane
    const tabPane = document.getElementById(`${tabName}-tab`);
    console.log(`Looking for tab pane with ID: ${tabName}-tab`);
    
    if (tabPane) {
      tabPane.classList.remove('hidden');
      console.log(`Showing tab pane: ${tabPane.id}`);
    } else {
      console.error(`Tab pane not found: ${tabName}-tab`);
    }
  }
  
  // Debug: Log all tab panes
  console.log('Tab panes:', Array.from(tabPanes).map(pane => pane.id));
  
  // Initialize the AI Assistant interface
  chrome.runtime.sendMessage(
    { action: 'check_agent' },
    (response) => {
      updateAgentStatus(response?.initialized || false);
    }
  );
  
  // Initialize settings from storage
  chrome.storage.sync.get(['apiKey', 'serverUrl'], (result) => {
    if (result.apiKey) claudeApiKeyInput.value = result.apiKey;
    if (result.serverUrl) serverUrlInput.value = result.serverUrl;
  });
  
  // Save Claude API Key when changed
  claudeApiKeyInput.addEventListener('change', () => {
    const apiKey = claudeApiKeyInput.value.trim();
    
    if (apiKey) {
      chrome.runtime.sendMessage(
        { 
          action: 'update_settings', 
          data: { apiKey } 
        },
        (response) => {
          if (response && response.success) {
            showToast('API Key saved');
            updateAgentStatus(true);
          } else {
            showToast('Failed to save API Key');
          }
        }
      );
    } else {
      showToast('API Key cannot be empty');
    }
  });
  
  // Save Server URL when changed
  serverUrlInput.addEventListener('change', () => {
    const serverUrl = serverUrlInput.value.trim();
    
    if (serverUrl) {
      chrome.runtime.sendMessage(
        { 
          action: 'update_settings', 
          data: { serverUrl } 
        },
        (response) => {
          if (response && response.success) {
            showToast('Server URL saved');
          } else {
            showToast('Failed to save Server URL');
          }
        }
      );
    } else {
      showToast('Server URL cannot be empty');
    }
  });
  
  // Clean Chats Button
  cleanChatsButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all chat history? This cannot be undone.')) {
      // Clear chat messages from storage
      chrome.storage.local.set({ activities: [] }, () => {
        // Clear chat messages from UI
        const chatMessages = document.getElementById('chat-messages') as HTMLDivElement;
        
        if (chatMessages) {
          // Keep only the welcome message
          const welcomeMessage = chatMessages.querySelector('.card:first-child');
          chatMessages.innerHTML = '';
          
          if (welcomeMessage) {
            chatMessages.appendChild(welcomeMessage);
          } else {
            // If no welcome message exists, create one
            const welcomeEl = document.createElement('div');
            welcomeEl.className = 'card bg-white shadow-sm mb-3 rounded-xl border border-purple-100';
            welcomeEl.innerHTML = `
              <div class="card-body p-4">
                <div class="bg-purple-100 p-2 rounded-lg mb-3">
                  <p class="text-sm font-medium text-purple-800">👋 Welcome</p>
                </div>
                <div class="mt-2">
                  <p class="text-sm">Hello! I'm your AI assistant. How can I help you today?</p>
                </div>
              </div>
            `;
            chatMessages.appendChild(welcomeEl);
          }
        }
        
        showToast('Chat history cleared successfully');
      });
    }
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
      
      // Handle different types of updates
      if (message.data.key === 'thought') {
        // Add or update thought
        addAssistantMessage(message.data.data, 'thought');
      } else if (message.data.key === 'toolExecution' || message.data.key === 'toolResult') {
        // Add or update tool execution
        const toolType = message.data.key === 'toolExecution' ? 'tool-call' : 'tool-result';
        const toolName = message.data.key === 'toolExecution' ? message.data.value.replace('Executing ', '') : message.data.value.replace(' returned result', '');
        addAssistantMessage(
          typeof message.data.data === 'string' 
            ? message.data.data 
            : JSON.stringify(message.data.data, null, 2),
          toolType,
          toolName
        );
      }
    } else if (message.action === 'agent_complete') {
      updateStatusIndicator('success');
      runButton.disabled = false;
      promptInput.value = '';
      
      // Add the assistant's final response to the chat
      addAssistantMessage(message.data.result.text, 'final-answer');
      
    } else if (message.action === 'agent_error') {
      updateStatusIndicator('error');
      runButton.disabled = false;
      
      // Add error message to chat
      addAssistantMessage(`Error: ${message.data.message}`, 'error');
    }
  });
  
  function updateAgentStatus(initialized: boolean) {
    if (initialized) {
      updateStatusIndicator('success');
      runButton.disabled = false;
    } else {
      updateStatusIndicator('error');
      runButton.disabled = true;
    }
  }
  
  function updateStatusIndicator(status: 'success' | 'error' | 'warning', pulse = false) {
    if (statusIndicator) {
      statusIndicator.className = `w-3 h-3 rounded-full bg-${status} ${pulse ? 'animate-pulse' : ''}`;
    }
  }
  
  // Add activity to the history log (for storage)
  function addActivityToLog(type: string, content: string, toolName?: string) {
    // Create a new activity
    const activity: any = {
      type,
      content,
      timestamp: new Date().toISOString()
    };
    
    // Add toolName if provided
    if (toolName) {
      activity.toolName = toolName;
    }
    
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
  function addAssistantMessage(message: string, type: string = 'final-answer', toolName: string = '') {
    // Check if we already have a message container for this response
    let aiResponseContainer = document.querySelector('.ai-response-container') as HTMLDivElement;
    
    // Create a container for all AI response parts if it doesn't exist
    if (!aiResponseContainer) {
      aiResponseContainer = document.createElement('div');
      aiResponseContainer.className = 'ai-response-container card bg-white shadow-sm mb-3';
      aiResponseContainer.innerHTML = `
        <div class="card-body p-3">
          <div class="flex items-start">
            <div class="avatar">
              <div class="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                <img src="icons/icon16.png" alt="AI" class="w-4 h-4">
              </div>
            </div>
            <div class="ml-2 w-full">
              <div class="thought-container hidden"></div>
              <div class="tools-container hidden"></div>
              <div class="answer-container"></div>
            </div>
          </div>
        </div>
      `;
      chatMessages.appendChild(aiResponseContainer);
    }
    
    // Find the appropriate container for this message type
    const thoughtContainer = aiResponseContainer.querySelector('.thought-container') as HTMLDivElement;
    const toolsContainer = aiResponseContainer.querySelector('.tools-container') as HTMLDivElement;
    const answerContainer = aiResponseContainer.querySelector('.answer-container') as HTMLDivElement;
    
    // Handle different message types
    if (type === 'thought') {
      // Add thought to the thought container
      thoughtContainer.classList.remove('hidden');
      
      // Check if we already have the thought header
      if (!thoughtContainer.querySelector('.thought-header')) {
        thoughtContainer.innerHTML = `
          <div class="thought-header bg-purple-50 p-2 rounded-lg mb-2 cursor-pointer flex justify-between items-center">
            <span class="text-xs font-medium text-purple-800">Thinking</span>
            <span class="thought-toggle text-xs">▼</span>
          </div>
          <div class="thought-content p-1 mb-3">
            <pre class="text-xs whitespace-pre-wrap">${message}</pre>
          </div>
        `;
        
        // Add toggle functionality
        const thoughtHeader = thoughtContainer.querySelector('.thought-header') as HTMLDivElement;
        const thoughtContent = thoughtContainer.querySelector('.thought-content') as HTMLDivElement;
        const thoughtToggle = thoughtContainer.querySelector('.thought-toggle') as HTMLSpanElement;
        
        thoughtHeader.addEventListener('click', () => {
          if (thoughtContent.classList.contains('hidden')) {
            thoughtContent.classList.remove('hidden');
            thoughtToggle.textContent = '▼';
          } else {
            thoughtContent.classList.add('hidden');
            thoughtToggle.textContent = '▶';
          }
        });
      } else {
        // Update existing thought content
        const thoughtContent = thoughtContainer.querySelector('.thought-content pre') as HTMLPreElement;
        thoughtContent.textContent = message;
      }
    } else if (type === 'tool-call' || type === 'tool-result') {
      // Add tool execution to the tools container
      toolsContainer.classList.remove('hidden');
      
      // Check if we already have the tools header
      if (!toolsContainer.querySelector('.tools-header')) {
        toolsContainer.innerHTML = `
          <div class="tools-header bg-blue-50 p-2 rounded-lg mb-2 cursor-pointer flex justify-between items-center">
            <span class="text-xs font-medium text-blue-800">Tools</span>
            <span class="tools-toggle text-xs">▼</span>
          </div>
          <div class="tools-content p-1 mb-3">
          </div>
        `;
        
        // Add toggle functionality for tools
        const toolsHeader = toolsContainer.querySelector('.tools-header') as HTMLDivElement;
        const toolsContent = toolsContainer.querySelector('.tools-content') as HTMLDivElement;
        const toolsToggle = toolsContainer.querySelector('.tools-toggle') as HTMLSpanElement;
        
        toolsHeader.addEventListener('click', () => {
          if (toolsContent.classList.contains('hidden')) {
            toolsContent.classList.remove('hidden');
            toolsToggle.textContent = '▼';
          } else {
            toolsContent.classList.add('hidden');
            toolsToggle.textContent = '▶';
          }
        });
      }
      
      const toolsContent = toolsContainer.querySelector('.tools-content') as HTMLDivElement;
      
      // Check if we already have a container for this tool
      let toolContainer = toolsContent.querySelector(`[data-tool="${toolName}"]`) as HTMLDivElement;
      
      if (!toolContainer) {
        toolContainer = document.createElement('div');
        toolContainer.setAttribute('data-tool', toolName);
        toolContainer.className = 'tool-container mb-2 border-l-2 border-blue-200 pl-2';
        toolContainer.innerHTML = `
          <div class="tool-header cursor-pointer flex justify-between items-center">
            <span class="text-xs font-medium text-blue-700">${toolName}</span>
            <span class="tool-toggle text-xs">▼</span>
          </div>
          <div class="tool-content">
            <div class="call-container hidden"></div>
            <div class="result-container hidden"></div>
          </div>
        `;
        
        // Add toggle functionality for individual tool
        const toolHeader = toolContainer.querySelector('.tool-header') as HTMLDivElement;
        const toolContent = toolContainer.querySelector('.tool-content') as HTMLDivElement;
        const toolToggle = toolContainer.querySelector('.tool-toggle') as HTMLSpanElement;
        
        toolHeader.addEventListener('click', () => {
          if (toolContent.classList.contains('hidden')) {
            toolContent.classList.remove('hidden');
            toolToggle.textContent = '▼';
          } else {
            toolContent.classList.add('hidden');
            toolToggle.textContent = '▶';
          }
        });
        
        toolsContent.appendChild(toolContainer);
      }
      
      // Add content to appropriate section (call or result)
      if (type === 'tool-call') {
        const callContainer = toolContainer.querySelector('.call-container') as HTMLDivElement;
        callContainer.classList.remove('hidden');
        callContainer.innerHTML = `
          <div class="bg-blue-50 p-1 rounded mb-1">
            <span class="text-xs text-blue-800">Input</span>
          </div>
          <pre class="text-xs whitespace-pre-wrap overflow-auto">${message}</pre>
        `;
      } else {
        const resultContainer = toolContainer.querySelector('.result-container') as HTMLDivElement;
        resultContainer.classList.remove('hidden');
        resultContainer.innerHTML = `
          <div class="bg-green-50 p-1 rounded mb-1">
            <span class="text-xs text-green-800">Output</span>
          </div>
          <pre class="text-xs whitespace-pre-wrap overflow-auto">${message}</pre>
        `;
      }
      
    } else if (type === 'final-answer' || type === 'error') {
      // Add the final answer or error to the answer container
      if (type === 'error') {
        answerContainer.innerHTML = `
          <div class="bg-red-50 p-2 rounded mb-2">
            <span class="text-xs font-medium text-red-800">Error</span>
          </div>
          <p class="text-xs text-red-600">${message}</p>
        `;
      } else {
        answerContainer.innerHTML = `<p class="text-xs">${message}</p>`;
      }
      
      // Clear the AI response container reference so we'll create a new one for the next interaction
      aiResponseContainer = null;
    }
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  // Add a stored activity to the chat (for loading history)
  function addMessageToChat(activity: any) {
    if (activity.type === 'prompt') {
      addUserMessage(activity.content);
    } else if (activity.type === 'error') {
      addAssistantMessage(`Error: ${activity.content}`, 'error');
    } else if (activity.type === 'thought') {
      addAssistantMessage(activity.content, 'thought');
    } else if (activity.type === 'tool-call') {
      addAssistantMessage(activity.content, 'tool-call', activity.toolName || '');
    } else if (activity.type === 'tool-result') {
      addAssistantMessage(activity.content, 'tool-result', activity.toolName || '');
    } else if (activity.type === 'answer') {
      addAssistantMessage(activity.content, 'final-answer');
    }
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