# Idle Pod Monitoring and Termination

This document outlines the implementation of an idle pod monitoring and termination system for Zenobia's Kubernetes deployment. The system will monitor WebSocket activity in each pod and trigger termination when a pod is determined to be idle.

## Problem Statement

Zenobia runs one pod per user session, but these pods may remain idle if:
1. The user disconnects without proper session cleanup
2. The user is inactive for an extended period
3. The session ends but the pod continues running

These idle pods consume resources unnecessarily. We need an automated system to:
- Monitor WebSocket traffic within each pod
- Detect when a pod has been idle for a configurable period
- Safely terminate idle pods to free up cluster resources

## Solution Design

### 1. Idle Pod Monitor Service

We'll implement a new service in the NestJS application that monitors WebSocket connections and pod activity.

```typescript
// src/modules/pod-monitor/services/idle-pod-monitor.service.ts

import { Injectable, OnModuleInit } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '../../config/config.service';
import { SessionsGateway } from '../../sessions/gateways/sessions.gateway';
import { SessionManagerService } from '../../sessions/services/session-manager.service';
import { apiLogger } from '../../../common/services/logger.service';

@Injectable()
export class IdlePodMonitorService implements OnModuleInit {
  private lastWebSocketActivity: number = Date.now();
  private lastProcessActivity: number = Date.now();
  private podTerminationEndpoint: string;
  private idleTimeoutMs: number; // Configurable idle timeout
  private podName: string;
  private podNamespace: string;
  private enabled: boolean = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly sessionsGateway: SessionsGateway,
    private readonly sessionManagerService: SessionManagerService,
  ) {
    // Get configuration from ConfigService
    const config = this.configService.getConfig();
    this.idleTimeoutMs = config.idlePodTimeout || 30 * 60 * 1000; // Default 30 minutes
    this.podTerminationEndpoint = config.podTerminationEndpoint || '';
    this.podName = process.env.POD_NAME || '';
    this.podNamespace = process.env.POD_NAMESPACE || '';
    this.enabled = config.enableIdlePodMonitoring || false;

    apiLogger.info(`Idle Pod Monitor initialized with timeout: ${this.idleTimeoutMs}ms`);
    apiLogger.info(`Pod Termination Endpoint: ${this.podTerminationEndpoint}`);
    apiLogger.info(`Pod Name: ${this.podName}, Namespace: ${this.podNamespace}`);
    apiLogger.info(`Idle Pod Monitoring Enabled: ${this.enabled}`);
  }

  onModuleInit() {
    // Register listener for WebSocket activity
    this.registerActivityListeners();
  }

  private registerActivityListeners() {
    // Create a method in SessionsGateway to register an activity callback
    if (this.sessionsGateway.registerActivityCallback) {
      this.sessionsGateway.registerActivityCallback(() => {
        this.updateWebSocketActivity();
      });
      apiLogger.info('Registered WebSocket activity callback');
    } else {
      apiLogger.warn('SessionsGateway.registerActivityCallback not available');
    }

    // Listen for session state changes
    if (this.sessionManagerService) {
      // To be implemented: hook into session manager activity
      apiLogger.info('Registered SessionManager activity listener');
    }
  }

  /**
   * Update the timestamp of the last WebSocket activity
   */
  updateWebSocketActivity() {
    this.lastWebSocketActivity = Date.now();
    apiLogger.debug('WebSocket activity detected');
  }

  /**
   * Update the timestamp of the last process activity (other than WebSocket)
   */
  updateProcessActivity() {
    this.lastProcessActivity = Date.now();
    apiLogger.debug('Process activity detected');
  }

  /**
   * Check if the pod is idle based on WebSocket and process activity
   */
  isIdle(): boolean {
    const now = Date.now();
    const webSocketIdleTime = now - this.lastWebSocketActivity;
    const processIdleTime = now - this.lastProcessActivity;
    
    return webSocketIdleTime >= this.idleTimeoutMs && processIdleTime >= this.idleTimeoutMs;
  }

  /**
   * Check pod idle status periodically and terminate if needed
   * Run every 5 minutes
   */
  @Interval(5 * 60 * 1000)
  async checkIdleStatus() {
    if (!this.enabled) {
      return;
    }

    apiLogger.info('Checking pod idle status...');
    
    if (this.isIdle()) {
      apiLogger.info(`Pod has been idle for at least ${this.idleTimeoutMs}ms, initiating termination`);
      await this.terminatePod();
    } else {
      const webSocketIdleTime = Date.now() - this.lastWebSocketActivity;
      const processIdleTime = Date.now() - this.lastProcessActivity;
      apiLogger.info(`Pod is active. WebSocket idle: ${webSocketIdleTime}ms, Process idle: ${processIdleTime}ms`);
    }
  }

  /**
   * Call the pod termination API to terminate this pod
   */
  async terminatePod(): Promise<boolean> {
    if (!this.podTerminationEndpoint || !this.podName || !this.podNamespace) {
      apiLogger.error('Cannot terminate pod: missing termination endpoint, pod name, or namespace');
      return false;
    }

    try {
      // Close any active sessions first
      await this.cleanupBeforeTermination();

      // Call the pod termination API
      const response = await this.httpService.axiosRef.post(this.podTerminationEndpoint, {
        podName: this.podName,
        namespace: this.podNamespace,
        reason: 'Idle pod termination',
      });

      apiLogger.info(`Pod termination API response: ${response.status} ${response.statusText}`);
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      apiLogger.error('Error calling pod termination API:', error);
      return false;
    }
  }

  /**
   * Clean up resources before pod termination
   */
  private async cleanupBeforeTermination(): Promise<void> {
    try {
      // Close any active session
      if (this.sessionManagerService) {
        await this.sessionManagerService.closeSession();
        apiLogger.info('Active session closed before pod termination');
      }
    } catch (error) {
      apiLogger.error('Error cleaning up before pod termination:', error);
    }
  }
}
```

### 2. SessionsGateway Modification

Enhance the SessionsGateway to track WebSocket activity and report it to the IdlePodMonitorService.

```typescript
// Update to src/modules/sessions/gateways/sessions.gateway.ts

export class SessionsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  // ... existing code ...

  // Activity tracking
  private activityCallbacks: Array<() => void> = [];

  // ... existing code ...

  /**
   * Register a callback to be notified on WebSocket activity
   */
  registerActivityCallback(callback: () => void): void {
    this.activityCallbacks.push(callback);
    apiLogger.debug('Activity callback registered');
  }

  /**
   * Notify all activity callbacks
   */
  private notifyActivityCallbacks(): void {
    this.activityCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        apiLogger.error('Error in activity callback:', error);
      }
    });
  }

  // Update existing methods to track activity

  handleConnection(client: Socket) {
    // Existing code
    this.activeClientId = client.id;
    apiLogger.info(`Client connected: ${client.id} (set as active client)`);
    
    // Notify activity callbacks
    this.notifyActivityCallbacks();
  }

  // Update all other handlers to call notifyActivityCallbacks()
  // For example:

  @SubscribeMessage('createSession')
  async handleCreateSession(client: Socket, payload: CreateSessionDto) {
    this.notifyActivityCallbacks();
    
    // Existing code...
  }
  
  // Update all other message handlers similarly
}
```

### 3. Kubernetes Integration

#### Pod Identity Configuration

Each pod needs to know its own identity for termination. Add these environment variables to the Kubernetes deployment:

```yaml
env:
  - name: POD_NAME
    valueFrom:
      fieldRef:
        fieldPath: metadata.name
  - name: POD_NAMESPACE
    valueFrom:
      fieldRef:
        fieldPath: metadata.namespace
```

#### Pod Termination API

Create a separate Kubernetes service with appropriate RBAC permissions to terminate pods:

```typescript
// External Pod Termination Service (simplified)
app.post('/api/pods/terminate', async (req, res) => {
  const { podName, namespace, reason } = req.body;
  
  if (!podName || !namespace) {
    return res.status(400).json({ error: 'Missing pod name or namespace' });
  }
  
  try {
    const k8sApi = new k8s.CoreV1Api();
    await k8sApi.deleteNamespacedPod(podName, namespace);
    console.log(`Pod ${namespace}/${podName} terminated: ${reason}`);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(`Error terminating pod ${namespace}/${podName}:`, error);
    return res.status(500).json({ error: error.message });
  }
});
```

### 4. Module Integration

Create a new module for pod monitoring:

```typescript
// src/modules/pod-monitor/pod-monitor.module.ts

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { IdlePodMonitorService } from './services/idle-pod-monitor.service';
import { SessionsModule } from '../sessions/sessions.module';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [
    HttpModule,
    ScheduleModule.forRoot(),
    SessionsModule,
    ConfigModule,
  ],
  providers: [IdlePodMonitorService],
  exports: [IdlePodMonitorService],
})
export class PodMonitorModule {}
```

And import it in the app module:

```typescript
// src/app.module.ts

import { PodMonitorModule } from './modules/pod-monitor/pod-monitor.module';

@Module({
  imports: [
    // ...existing modules
    PodMonitorModule,
  ],
})
export class AppModule {}
```

### 5. Configuration

Add the required configuration options:

```typescript
// src/modules/config/dto/config.dto.ts

export class ConfigDto {
  // ...existing fields
  
  // Idle pod monitoring
  enableIdlePodMonitoring: boolean;
  idlePodTimeout: number; // ms
  podTerminationEndpoint: string;
}
```

## Implementation Plan

1. **Phase 1: Activity Monitoring**
   - Implement SessionsGateway activity tracking
   - Create IdlePodMonitorService with activity tracking
   - Add logging for activity events

2. **Phase 2: Pod Termination**
   - Create the external pod termination API service
   - Implement pod termination logic in IdlePodMonitorService
   - Add pre-termination cleanup

3. **Phase 3: Configuration and Testing**
   - Update ConfigService with new options
   - Add environment variables to Kubernetes deployments
   - Test idle detection and pod termination

## Considerations

### Security

- The pod termination API should authenticate requests to prevent unauthorized terminations
- RBAC permissions should be tightly scoped to only allow pod deletion

### Graceful Shutdown

- Ensure all resources are properly cleaned up before termination
- Consider implementing a grace period for session persistence

### Monitoring and Observability

- Add detailed logging for all termination events
- Consider adding metrics for:
  - Idle time tracking
  - Number of terminated pods
  - Resource savings from termination

### Configuration Flexibility

- Make all timeouts and behaviors configurable
- Allow enabling/disabling the feature with feature flags

## Conclusion

This idle pod monitoring and termination system will help optimize resource usage in the Kubernetes cluster by automatically cleaning up unused pods. By tracking WebSocket activity and process state, we can accurately identify when a pod is truly idle and can be safely terminated.