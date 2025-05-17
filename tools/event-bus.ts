/**
 * Simple event bus implementation that can be used across the application
 * to avoid circular dependencies between modules.
 */

import { EventEmitter } from 'events';

// Define event types 
export enum EventType {
  HUMAN_LAYER_REQUEST_CREATED = 'human.layer.request.created',
  HUMAN_LAYER_REQUEST_UPDATED = 'human.layer.request.updated',
}

/**
 * Global event bus singleton
 */
class EventBus {
  private static instance: EventBus;
  private emitter: EventEmitter;

  private constructor() {
    this.emitter = new EventEmitter();
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * Emit an event
   */
  public emit(eventType: EventType, data: any): void {
    this.emitter.emit(eventType, data);
  }

  /**
   * Register a listener for an event
   */
  public on(eventType: EventType, listener: (data: any) => void): void {
    this.emitter.on(eventType, listener);
  }

  /**
   * Remove a listener
   */
  public off(eventType: EventType, listener: (data: any) => void): void {
    this.emitter.off(eventType, listener);
  }

  /**
   * Register a one-time listener
   */
  public once(eventType: EventType, listener: (data: any) => void): void {
    this.emitter.once(eventType, listener);
  }
}

// Export the singleton
export const eventBus = EventBus.getInstance();