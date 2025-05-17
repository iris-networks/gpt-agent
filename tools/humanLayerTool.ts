import { tool } from 'ai';
import { z } from 'zod';
import { notify } from 'node-notifier';
import { EventEmitter } from 'events';
import fetch from 'node-fetch';
import { HumanLayerRequest } from './human-layer.interface';
import { eventBus, EventType } from './event-bus';

// Configuration (can be moved to environment variables)
const config = {
  webhookUrl: process.env.HUMAN_LAYER_WEBHOOK_URL || '',
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  timeoutMs: parseInt(process.env.HUMAN_LAYER_TIMEOUT_MS || '3600000'), // 1 hour default
};

// Global event emitter for human layer interactions
const humanLayerEvents = new EventEmitter();

// Global state to track human layer requests
let activeRequests: HumanLayerRequest[] = [];

// Event handlers for external integration
humanLayerEvents.on('request_created', (request: HumanLayerRequest) => {
  console.log(`Human layer request created: ${request.id}`);
  // This will be handled by external systems if needed
});

humanLayerEvents.on('request_updated', (request: HumanLayerRequest) => {
  console.log(`Human layer request updated: ${request.id}, status: ${request.status}`);
  // This will be handled by external systems if needed
});

// Send webhook notification
async function sendWebhookNotification(request: HumanLayerRequest) {
  if (!config.webhookUrl) return false;
  
  try {
    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: request.id,
        title: request.title,
        reason: request.reason,
        timestamp: request.timestamp,
        timeoutAt: request.timeoutAt,
        approvalUrl: `${config.baseUrl}/api/human-layer/${request.id}/approve`
      })
    });
    
    console.log(`Webhook notification sent for request ${request.id}, status: ${response.status}`);
    return response.ok;
  } catch (error) {
    console.error(`Failed to send webhook notification for request ${request.id}:`, error);
    return false;
  }
}

// Export functions for external systems
export function getActiveRequests(): HumanLayerRequest[] {
  return [...activeRequests];
}

export function resumeExecution(requestId: string): boolean {
  const request = activeRequests.find(req => req.id === requestId);
  if (request && request.status === 'pending') {
    // Update status
    request.status = 'approved';

    // Emit event to unblock execution
    humanLayerEvents.emit(`human-layer-response-${requestId}`, 'approved');

    // Emit update event
    humanLayerEvents.emit('request_updated', request);

    // Emit event using the global event bus
    eventBus.emit(EventType.HUMAN_LAYER_REQUEST_UPDATED, request);
    console.log('Emitted request updated event via EventBus');

    // Clean up
    activeRequests = activeRequests.filter(req => req.id !== requestId);

    console.log(`Human layer request ${requestId} approved externally`);
    return true;
  }
  return false;
}

/**
 * Tool that waits for human input by pausing execution
 * The tool blocks execution until the user clicks on the notification
 * or approves via external system, or until the timeout is reached
 */
export const humanLayerTool = tool({
  description: 'If there is a captcha on the screen, or a login page is presented and user is required to enter credentials, it is then that this tool is invoked.',
  parameters: z.object({
    title: z.string().describe('Short title for the human input request (e.g., "Captcha", "Login")'),
    reason: z.string().describe('Clear explanation of why human input is needed (e.g., "Please solve the captcha", "Login required")')
  }),
  execute: async ({ reason, title }) => {
    console.log("humanLayerTool invoked:", reason, title);
    
    // Create a unique ID for this request
    const requestId = `human-layer-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Create a new human layer request
    const timeoutAt = Date.now() + config.timeoutMs;
    const request: HumanLayerRequest = {
      id: requestId,
      title,
      reason,
      status: 'pending',
      timestamp: Date.now(),
      timeoutAt
    };
    
    // Add to active requests
    activeRequests.push(request);

    // Emit event for request creation
    humanLayerEvents.emit('request_created', request);

    // Update session status if available
    try {
      console.log(`Pausing session: ${reason}`);
      // If integrated with session service:
      // sessionEvents.emitStatus(reason, StatusEnum.PAUSED, sessionId, { humanLayerRequest: request });

      // Emit event using the global event bus
      eventBus.emit(EventType.HUMAN_LAYER_REQUEST_CREATED, request);
      console.log('Emitted request created event via EventBus');
    } catch (error) {
      console.error("Failed to update session status", error);
    }
    
    // Send webhook notification for external apps
    sendWebhookNotification(request).catch(err => {
      console.error("Failed to send webhook notification:", err);
    });
    
    // Send desktop notification
    // THIS IS THE KEY PART that handles the user click
    notify({
      title: title || "Human interaction required",
      message: reason || "AI needs your input to continue",
      sound: true,
      wait: true,  // Critical: makes the notification wait for user action
      actions: ['Continue'],  // Button user can click
      closeLabel: 'Continue',  // Label for the close button
      timeout: 300000  // 5 minutes for notification (not the entire waiting period)
    }, (err, response, metadata) => {
      // This callback runs when user clicks on the notification
      console.log("Notification response:", response, metadata);
      
      // Check if request is still pending
      const request = activeRequests.find(req => req.id === requestId);
      if (request && request.status === 'pending') {
        // Update status
        request.status = 'approved';
        
        // Emit event to unblock execution
        humanLayerEvents.emit(`human-layer-response-${requestId}`, 'approved');
        
        // Clean up
        activeRequests = activeRequests.filter(req => req.id !== requestId);
      }
    });
    
    // CRITICAL: Block execution until notification is clicked, external approval, or timeout
    return new Promise<string>((resolve) => {
      const eventName = `human-layer-response-${requestId}`;
      
      // Configure listener for notification click or external approval
      humanLayerEvents.once(eventName, (status) => {
        const resultMsg = status === 'timeout' 
          ? `Human interaction timed out after 1 hour: ${title}` 
          : `Human interaction completed: ${title}`;
        resolve(resultMsg);
      });
      
      // IMPORTANT: Set mandatory timeout
      setTimeout(() => {
        // Check if request is still pending
        const request = activeRequests.find(req => req.id === requestId);
        if (request && request.status === 'pending') {
          // Update status
          request.status = 'timed_out';

          // Emit event to unblock execution
          humanLayerEvents.emit(eventName, 'timeout');

          // Emit update event
          humanLayerEvents.emit('request_updated', request);

          // Emit event using the global event bus
          eventBus.emit(EventType.HUMAN_LAYER_REQUEST_UPDATED, request);
          console.log('Emitted request timeout event via EventBus');

          // Clean up
          activeRequests = activeRequests.filter(req => req.id !== requestId);

          console.log(`Human layer request ${requestId} timed out after 1 hour`);
        }
      }, config.timeoutMs);
    });
  }
});