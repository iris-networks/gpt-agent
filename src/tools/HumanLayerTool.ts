import { tool } from 'ai';
import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { BaseTool } from './base/BaseTool';
import { notify } from 'node-notifier';
import { EventEmitter } from 'events';
import fetch from 'node-fetch';
import { AgentStatusCallback } from '../agent_v2/types';
import { StatusEnum } from '@app/packages/ui-tars/shared/src/types';
import { HumanLayerRequest } from '../../tools/human-layer.interface';
import { eventBus, EventType } from '../../tools/event-bus';

interface HumanLayerToolOptions {
  statusCallback: AgentStatusCallback;  // MANDATORY
  abortController: AbortController;     // MANDATORY
}

// Configuration (can be moved to environment variables)
const config = {
  webhookUrl: process.env.HUMAN_LAYER_WEBHOOK_URL || '',
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  timeoutMs: parseInt(process.env.HUMAN_LAYER_TIMEOUT_MS || '3600000'), // 1 hour default
};

@Injectable()
export class HumanLayerTool extends BaseTool {
  private humanLayerEvents: EventEmitter;
  private activeRequests: HumanLayerRequest[] = [];

  constructor(options: HumanLayerToolOptions) {
    super({
      statusCallback: options.statusCallback,
      abortController: options.abortController
    });

    this.humanLayerEvents = new EventEmitter();
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Event handlers for external integration
    this.humanLayerEvents.on('request_created', (request: HumanLayerRequest) => {
      this.emitStatus(`Human layer request created: ${request.id}`, StatusEnum.RUNNING);
    });

    this.humanLayerEvents.on('request_updated', (request: HumanLayerRequest) => {
      this.emitStatus(`Human layer request updated: ${request.id}, status: ${request.status}`, StatusEnum.RUNNING);
    });
  }

  /**
   * Send webhook notification
   */
  private async sendWebhookNotification(request: HumanLayerRequest): Promise<boolean> {
    if (!config.webhookUrl) return false;
    
    try {
      this.emitStatus(`Sending webhook notification for request ${request.id}`, StatusEnum.RUNNING);
      
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
      
      this.emitStatus(`Webhook notification sent, status: ${response.status}`, StatusEnum.RUNNING);
      return response.ok;
    } catch (error) {
      this.emitStatus(`Failed to send webhook notification: ${error.message}`, StatusEnum.ERROR, { error });
      return false;
    }
  }

  /**
   * Get active requests (for external systems)
   */
  public getActiveRequests(): HumanLayerRequest[] {
    return [...this.activeRequests];
  }

  /**
   * Resume execution (for external systems)
   */
  public resumeExecution(requestId: string): boolean {
    const request = this.activeRequests.find(req => req.id === requestId);
    if (request && request.status === 'pending') {
      this.emitStatus(`Resuming execution for request ${requestId}`, StatusEnum.RUNNING);
      
      // Update status
      request.status = 'approved';

      // Emit event to unblock execution
      this.humanLayerEvents.emit(`human-layer-response-${requestId}`, 'approved');

      // Emit update event
      this.humanLayerEvents.emit('request_updated', request);

      // Emit event using the global event bus
      eventBus.emit(EventType.HUMAN_LAYER_REQUEST_UPDATED, request);

      // Clean up
      this.activeRequests = this.activeRequests.filter(req => req.id !== requestId);

      this.emitStatus(`Human layer request ${requestId} approved externally`, StatusEnum.RUNNING);
      return true;
    }
    return false;
  }

  /**
   * Execute human layer request with status updates
   */
  private async executeHumanLayerRequest(title: string, reason: string): Promise<string> {
    this.emitStatus(`Starting human layer request: ${title}`, StatusEnum.RUNNING);
    
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
    this.activeRequests.push(request);

    // Emit event for request creation
    this.humanLayerEvents.emit('request_created', request);

    try {
      this.emitStatus(`Pausing session for human input: ${reason}`, StatusEnum.RUNNING);
      
      // Emit event using the global event bus
      eventBus.emit(EventType.HUMAN_LAYER_REQUEST_CREATED, request);
    } catch (error) {
      this.emitStatus(`Failed to update session status: ${error.message}`, StatusEnum.ERROR, { error });
    }
    
    // Send webhook notification for external apps
    this.sendWebhookNotification(request).catch(err => {
      this.emitStatus(`Failed to send webhook notification: ${err.message}`, StatusEnum.ERROR, { error: err });
    });
    
    // Send desktop notification
    this.emitStatus("Sending desktop notification and waiting for human response...", StatusEnum.RUNNING);
    
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
      this.emitStatus(`Desktop notification response received: ${response}`, StatusEnum.RUNNING);
      
      // Check if request is still pending
      const request = this.activeRequests.find(req => req.id === requestId);
      if (request && request.status === 'pending') {
        // Update status
        request.status = 'approved';
        
        // Emit event to unblock execution
        this.humanLayerEvents.emit(`human-layer-response-${requestId}`, 'approved');
        
        // Clean up
        this.activeRequests = this.activeRequests.filter(req => req.id !== requestId);
      }
    });
    
    // CRITICAL: Block execution until notification is clicked, external approval, or timeout
    return new Promise<string>((resolve) => {
      const eventName = `human-layer-response-${requestId}`;
      
      // Configure listener for notification click or external approval
      this.humanLayerEvents.once(eventName, (status) => {
        const resultMsg = status === 'timeout' 
          ? `Human interaction timed out after 1 hour: ${title}` 
          : `Human interaction completed: ${title}`;
        
        this.emitStatus(resultMsg, StatusEnum.RUNNING);
        resolve(resultMsg);
      });
      
      // IMPORTANT: Set mandatory timeout
      setTimeout(() => {
        // Check if request is still pending
        const request = this.activeRequests.find(req => req.id === requestId);
        if (request && request.status === 'pending') {
          this.emitStatus(`Human layer request ${requestId} timed out after 1 hour`, StatusEnum.ERROR);
          
          // Update status
          request.status = 'timed_out';

          // Emit event to unblock execution
          this.humanLayerEvents.emit(eventName, 'timeout');

          // Emit update event
          this.humanLayerEvents.emit('request_updated', request);

          // Emit event using the global event bus
          eventBus.emit(EventType.HUMAN_LAYER_REQUEST_UPDATED, request);

          // Clean up
          this.activeRequests = this.activeRequests.filter(req => req.id !== requestId);
        }
      }, config.timeoutMs);
    });
  }

  /**
   * Get the AI SDK tool definition
   */
  getToolDefinition() {
    return tool({
      description: 'If there is a captcha on the screen, or a login page is presented and user is required to enter credentials, it is then that this tool is invoked.',
      parameters: z.object({
        title: z.string().describe('Short title for the human input request (e.g., "Captcha", "Login")'),
        reason: z.string().describe('Clear explanation of why human input is needed (e.g., "Please solve the captcha", "Login required")')
      }),
      execute: async ({ reason, title }) => {
        return this.executeHumanLayerRequest(title, reason);
      }
    });
  }
}