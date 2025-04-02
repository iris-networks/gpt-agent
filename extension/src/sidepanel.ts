// This script handles the sidepanel UI logic for the AI Assistant

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const statusIndicator = document.getElementById('status-indicator') as HTMLDivElement;
  const promptInput = document.getElementById('prompt-input') as HTMLTextAreaElement;
  const runButton = document.getElementById('run-button') as HTMLButtonElement;
  const micButton = document.getElementById('mic-button') as HTMLButtonElement;
  const chatMessages = document.getElementById('chat-messages') as HTMLDivElement;
  const typingIndicator = document.getElementById('typing-indicator') as HTMLDivElement;
  
  // Get tab elements
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
    });
    
    // Show the corresponding tab pane
    const tabPane = document.getElementById(`${tabName}-tab`);
    
    if (tabPane) {
      tabPane.classList.remove('hidden');
    } else {
      console.error(`Tab pane not found: ${tabName}-tab`);
    }
  }
  
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
          // Remove all messages except welcome message
          chatMessages.innerHTML = '';
          
          // Create a new welcome message
          const welcomeEl = createWelcomeMessage();
          chatMessages.appendChild(welcomeEl);
        }
        
        showToast('Chat history cleared successfully');
      });
    }
  });
  
  // Create welcome message element
  function createWelcomeMessage() {
    const welcomeElement = document.createElement('div');
    welcomeElement.className = 'flex items-start message-group';
    welcomeElement.innerHTML = `
      <div class="avatar-container flex items-center justify-center bg-purple-100 rounded-full mr-2">
        <img src="icons/icon16.png" alt="AI" class="w-4 h-4">
      </div>
      <div class="flex flex-col">
        <div class="message-bubble assistant-message p-3 shadow-sm">
          <p class="text-sm">Hello! I'm your AI assistant. How can I help you today?</p>
        </div>
        <div class="message-time">Just now</div>
      </div>
      <div class="message-actions ml-2 flex flex-col">
        <button class="btn btn-ghost btn-xs text-gray-400 hover:text-gray-700" title="Copy message">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3 h-3"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
        </button>
      </div>
    `;
    return welcomeElement;
  }
  
  // Speech recognition setup
  let recognition: any = null;
  let isRecording = false;
  
  // Initialize speech recognition
  function setupSpeechRecognition() {
    // @ts-ignore
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
      // Clear default welcome message if we have history
      if (result.activities.length > 0) {
        chatMessages.innerHTML = '';
      }
      
      // Group activities by conversation
      let currentConversation: any[] = [];
      let lastType = '';
      
      result.activities.forEach((activity: any, index: number) => {
        // If this is a new prompt or the first item, we start a new conversation
        if (activity.type === 'prompt' || index === 0) {
          // Add the previous conversation to chat if it exists
          if (currentConversation.length > 0) {
            processConversation(currentConversation);
          }
          // Start new conversation
          currentConversation = [activity];
        } else {
          // Add to current conversation
          currentConversation.push(activity);
        }
        
        lastType = activity.type;
      });
      
      // Add the last conversation
      if (currentConversation.length > 0) {
        processConversation(currentConversation);
      }
    }
  });
  
  // Process a group of conversation activities
  function processConversation(activities: any[]) {
    // First activity should be the user prompt
    if (activities[0].type === 'prompt') {
      addUserMessage(activities[0].content);
    }
    
    // Create an assistant response container
    let currentAssistantMessage = createAssistantResponseContainer();
    let hasTools = false;
    let hasThought = false;
    
    // Process the rest of the activities
    for (let i = 1; i < activities.length; i++) {
      const activity = activities[i];
      
      if (activity.type === 'thought') {
        addThoughtToMessage(currentAssistantMessage, activity.content);
        hasThought = true;
      } else if (activity.type === 'tool-call' || activity.type === 'tool-result') {
        addToolToMessage(
          currentAssistantMessage, 
          activity.content, 
          activity.type, 
          activity.toolName || ''
        );
        hasTools = true;
      } else if (activity.type === 'answer') {
        addAnswerToMessage(currentAssistantMessage, activity.content);
      } else if (activity.type === 'error') {
        addErrorToMessage(currentAssistantMessage, activity.content);
      }
    }
    
    // Add the message to chat
    chatMessages.appendChild(currentAssistantMessage);
    
    // Toggle visibility of collapsible sections based on content
    const thoughtsSection = currentAssistantMessage.querySelector('.thinking-container');
    const toolsSection = currentAssistantMessage.querySelector('.tools-container');
    
    if (thoughtsSection && hasThought) {
      thoughtsSection.classList.remove('hidden');
    }
    
    if (toolsSection && hasTools) {
      toolsSection.classList.remove('hidden');
    }
  }
  
  // Run agent when button is clicked
  runButton.addEventListener('click', () => {
    const prompt = promptInput.value.trim();
    if (!prompt) return;
    
    // Update UI
    updateStatusIndicator('warning', true);
    runButton.disabled = true;
    typingIndicator.classList.remove('hidden');
    
    // Add user message to chat
    addUserMessage(prompt);
    
    // Add to activity log
    addActivityToLog('prompt', prompt);
    
    // Create and add a new assistant response container
    const assistantContainer = createAssistantResponseContainer();
    chatMessages.appendChild(assistantContainer);
    
    // Send request to run agent
    chrome.runtime.sendMessage(
      { action: 'run_agent', prompt },
      (response) => {
        if (!response || !response.success) {
          updateStatusIndicator('error');
          runButton.disabled = false;
          typingIndicator.classList.add('hidden');
          
          // Add error message to chat
          addErrorToMessage(assistantContainer, 'I encountered an error processing your request. Please try again.');
          
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
      typingIndicator.classList.remove('hidden');
      
      // Find current assistant response container
      const assistantContainer = document.querySelector('.assistant-response-container:last-child') as HTMLDivElement;
      
      if (!assistantContainer) return;
      
      // Handle different types of updates
      if (message.data.key === 'thought') {
        // Add or update thought
        addThoughtToMessage(assistantContainer, message.data.data);
      } else if (message.data.key === 'toolExecution' || message.data.key === 'toolResult') {
        // Add or update tool execution
        const toolType = message.data.key === 'toolExecution' ? 'tool-call' : 'tool-result';
        const toolName = message.data.key === 'toolExecution' 
          ? message.data.value.replace('Executing ', '') 
          : message.data.value.replace(' returned result', '');
          
        addToolToMessage(
          assistantContainer,
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
      typingIndicator.classList.add('hidden');
      
      // Find current assistant response container
      const assistantContainer = document.querySelector('.assistant-response-container:last-child') as HTMLDivElement;
      
      if (!assistantContainer) return;
      
      // Add the assistant's final response
      addAnswerToMessage(assistantContainer, message.data.result.text);
      
      // Save to activity log
      addActivityToLog('answer', message.data.result.text);
      
    } else if (message.action === 'agent_error') {
      updateStatusIndicator('error');
      runButton.disabled = false;
      typingIndicator.classList.add('hidden');
      
      // Find current assistant response container
      const assistantContainer = document.querySelector('.assistant-response-container:last-child') as HTMLDivElement;
      
      if (!assistantContainer) return;
      
      // Add error message
      addErrorToMessage(assistantContainer, `Error: ${message.data.message}`);
      
      // Save to activity log
      addActivityToLog('error', message.data.message);
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
      statusIndicator.className = `w-3 h-3 rounded-full bg-${status} ${pulse ? 'pulse-dot' : ''}`;
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
      chrome.storage.local.set({ activities: activities.slice(-50) }); // Keep last 50 activities
    });
  }
  
  // Utility function to format timestamps
  function formatTimestamp(timestamp?: string) {
    if (!timestamp) return 'Just now';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  }
  
  // Add a user message to the chat
  function addUserMessage(message: string, timestamp?: string) {
    const messageEl = document.createElement('div');
    messageEl.className = 'flex items-start message-group justify-end mb-4';
    messageEl.innerHTML = `
      <div class="message-actions mr-2 flex flex-col">
        <button class="btn btn-ghost btn-xs text-gray-400 hover:text-gray-700" title="Copy message">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3 h-3"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
        </button>
      </div>
      <div class="flex flex-col items-end">
        <div class="message-bubble user-message p-3 shadow-sm">
          <p class="text-sm">${message}</p>
        </div>
        <div class="message-time">${formatTimestamp(timestamp)}</div>
      </div>
      <div class="avatar-container flex items-center justify-center bg-gray-200 rounded-full ml-2">
        <div class="w-4 h-4 flex items-center justify-center text-xs text-gray-500">
          You
        </div>
      </div>
    `;
    
    // Add copy functionality
    const copyButton = messageEl.querySelector('button') as HTMLButtonElement;
    if (copyButton) {
      copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(message).then(() => {
          showToast('Message copied to clipboard');
        });
      });
    }
    
    chatMessages.appendChild(messageEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  // Create an assistant response container
  function createAssistantResponseContainer() {
    const container = document.createElement('div');
    container.className = 'flex items-start message-group mb-4 assistant-response-container';
    container.innerHTML = `
      <div class="avatar-container flex items-center justify-center bg-purple-100 rounded-full mr-2">
        <img src="icons/icon16.png" alt="AI" class="w-4 h-4">
      </div>
      <div class="flex flex-col flex-grow">
        <!-- Thinking section (collapsible) -->
        <div class="thinking-container hidden mb-2">
          <div class="collapsible-header flex items-center justify-between p-2 bg-purple-50 rounded-t-md">
            <span class="text-xs font-medium text-purple-800">Thinking</span>
            <span class="thinking-toggle text-xs">▼</span>
          </div>
          <div class="collapsible-content thinking-content p-2">
            <pre class="text-xs whitespace-pre-wrap overflow-auto"></pre>
          </div>
        </div>
        
        <!-- Tools section (collapsible) -->
        <div class="tools-container hidden mb-2">
          <div class="collapsible-header flex items-center justify-between p-2 bg-blue-50 rounded-t-md">
            <span class="text-xs font-medium text-blue-800">Tools</span>
            <span class="tools-toggle text-xs">▼</span>
          </div>
          <div class="collapsible-content tools-content p-2">
            <!-- Tool items will be added here -->
          </div>
        </div>
        
        <!-- Final answer -->
        <div class="message-bubble assistant-message p-3 shadow-sm mb-1">
          <div class="answer-content">
            <!-- Answer will be added here -->
          </div>
        </div>
        <div class="message-time">Just now</div>
      </div>
      <div class="message-actions ml-2 flex flex-col">
        <button class="copy-btn btn btn-ghost btn-xs text-gray-400 hover:text-gray-700" title="Copy message">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3 h-3"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
        </button>
      </div>
    `;
    
    // Add toggle functionality for thinking section
    const thinkingHeader = container.querySelector('.thinking-container .collapsible-header') as HTMLDivElement;
    const thinkingContent = container.querySelector('.thinking-container .collapsible-content') as HTMLDivElement;
    const thinkingToggle = container.querySelector('.thinking-container .thinking-toggle') as HTMLSpanElement;
    
    if (thinkingHeader && thinkingContent && thinkingToggle) {
      thinkingHeader.addEventListener('click', () => {
        if (thinkingContent.classList.contains('hidden')) {
          thinkingContent.classList.remove('hidden');
          thinkingToggle.textContent = '▼';
        } else {
          thinkingContent.classList.add('hidden');
          thinkingToggle.textContent = '▶';
        }
      });
    }
    
    // Add toggle functionality for tools section
    const toolsHeader = container.querySelector('.tools-container .collapsible-header') as HTMLDivElement;
    const toolsContent = container.querySelector('.tools-container .collapsible-content') as HTMLDivElement;
    const toolsToggle = container.querySelector('.tools-container .tools-toggle') as HTMLSpanElement;
    
    if (toolsHeader && toolsContent && toolsToggle) {
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
    
    return container;
  }
  
  // Add thought content to an assistant message
  function addThoughtToMessage(container: HTMLDivElement, thought: string) {
    const thinkingContainer = container.querySelector('.thinking-container') as HTMLDivElement;
    const thinkingContent = container.querySelector('.thinking-content pre') as HTMLPreElement;
    
    if (thinkingContainer && thinkingContent) {
      thinkingContainer.classList.remove('hidden');
      thinkingContent.textContent = thought;
      
      // Add to activity log
      addActivityToLog('thought', thought);
    }
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  // Add tool execution/result to an assistant message
  function addToolToMessage(container: HTMLDivElement, content: string, type: string, toolName: string) {
    const toolsContainer = container.querySelector('.tools-container') as HTMLDivElement;
    const toolsContent = container.querySelector('.tools-content') as HTMLDivElement;
    
    if (toolsContainer && toolsContent) {
      toolsContainer.classList.remove('hidden');
      
      // Check if we already have a container for this tool
      let toolSection = toolsContent.querySelector(`[data-tool="${toolName}"]`) as HTMLDivElement;
      
      if (!toolSection) {
        // Create a new tool section
        toolSection = document.createElement('div');
        toolSection.className = 'tool-section mb-2';
        toolSection.setAttribute('data-tool', toolName);
        toolSection.innerHTML = `
          <div class="collapsible-header tool-header flex items-center justify-between p-1 bg-blue-50">
            <span class="text-xs font-medium text-blue-700">${toolName}</span>
            <span class="tool-toggle text-xs">▼</span>
          </div>
          <div class="collapsible-content tool-content">
            <div class="call-container hidden p-1"></div>
            <div class="result-container hidden p-1"></div>
          </div>
        `;
        
        // Add toggle functionality for tool
        const toolHeader = toolSection.querySelector('.tool-header') as HTMLDivElement;
        const toolContent = toolSection.querySelector('.tool-content') as HTMLDivElement;
        const toolToggle = toolSection.querySelector('.tool-toggle') as HTMLSpanElement;
        
        if (toolHeader && toolContent && toolToggle) {
          toolHeader.addEventListener('click', () => {
            if (toolContent.classList.contains('hidden')) {
              toolContent.classList.remove('hidden');
              toolToggle.textContent = '▼';
            } else {
              toolContent.classList.add('hidden');
              toolToggle.textContent = '▶';
            }
          });
        }
        
        toolsContent.appendChild(toolSection);
      }
      
      // Add content to appropriate section
      if (type === 'tool-call') {
        const callContainer = toolSection.querySelector('.call-container') as HTMLDivElement;
        if (callContainer) {
          callContainer.classList.remove('hidden');
          callContainer.innerHTML = `
            <div class="bg-blue-50 p-1 mb-1 rounded">
              <span class="text-xs text-blue-800">Input</span>
            </div>
            <pre class="text-xs whitespace-pre-wrap overflow-auto">${content}</pre>
          `;
          
          // Add to activity log
          addActivityToLog('tool-call', content, toolName);
        }
      } else if (type === 'tool-result') {
        const resultContainer = toolSection.querySelector('.result-container') as HTMLDivElement;
        if (resultContainer) {
          resultContainer.classList.remove('hidden');
          resultContainer.innerHTML = `
            <div class="bg-green-50 p-1 mb-1 rounded">
              <span class="text-xs text-green-800">Output</span>
            </div>
            <pre class="text-xs whitespace-pre-wrap overflow-auto">${content}</pre>
          `;
          
          // Add to activity log
          addActivityToLog('tool-result', content, toolName);
        }
      }
    }
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  // Add final answer to an assistant message
  function addAnswerToMessage(container: HTMLDivElement, answer: string) {
    const answerContent = container.querySelector('.answer-content') as HTMLDivElement;
    
    if (answerContent) {
      answerContent.innerHTML = `<p class="text-sm">${answer}</p>`;
      
      // Add copy functionality
      const copyButton = container.querySelector('.copy-btn') as HTMLButtonElement;
      if (copyButton) {
        copyButton.addEventListener('click', () => {
          navigator.clipboard.writeText(answer).then(() => {
            showToast('Message copied to clipboard');
          });
        });
      }
    }
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  // Add error to an assistant message
  function addErrorToMessage(container: HTMLDivElement, error: string) {
    const answerContent = container.querySelector('.answer-content') as HTMLDivElement;
    
    if (answerContent) {
      answerContent.innerHTML = `
        <div class="bg-red-50 p-2 rounded mb-2">
          <span class="text-xs font-medium text-red-800">Error</span>
        </div>
        <p class="text-xs text-red-600">${error}</p>
      `;
    }
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
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