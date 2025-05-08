/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { Screenshot, VideoRecording } from '@app/shared/types';
import { Conversation } from '@ui-tars/shared/types';
import { sessionLogger } from '@app/common/services/logger.service';
import { VideoStorageService } from './video-storage.service';
import { VideoGeneratorService } from './video-generator.service';

/**
 * Service responsible for managing session screenshots and video-related functionality
 */
@Injectable()
export class SessionScreenshotsService {
  // Screenshots for the current session
  private sessionScreenshots: Map<string, Screenshot[]> = new Map();

  constructor(
    private readonly videoStorage: VideoStorageService,
    @Inject(forwardRef(() => VideoGeneratorService))
    private readonly videoGenerator: VideoGeneratorService
  ) {
    sessionLogger.info('SessionScreenshotsService initialized');
    
    // Add a periodic cleanup task to prevent memory leaks
    setInterval(() => {
      this.cleanupStaleScreenshots();
    }, 15 * 60 * 1000); // Run every 15 minutes
  }
  
  /**
   * Clean up screenshots from inactive sessions to prevent memory leaks
   * @private
   */
  private cleanupStaleScreenshots(): void {
    const now = Date.now();
    const MAX_AGE_MS = 3600000; // 1 hour
    
    let totalRemoved = 0;
    this.sessionScreenshots.forEach((screenshots, sessionId) => {
      // If we have screenshots but the last one is older than MAX_AGE_MS, clear them
      if (screenshots.length > 0) {
        const lastScreenshot = screenshots[screenshots.length - 1];
        if (now - lastScreenshot.timestamp > MAX_AGE_MS) {
          this.sessionScreenshots.delete(sessionId);
          totalRemoved += screenshots.length;
          sessionLogger.info(`Cleaned up ${screenshots.length} screenshots for inactive session ${sessionId}`);
        }
      }
    });
    
    if (totalRemoved > 0) {
      sessionLogger.info(`Screenshot cleanup removed ${totalRemoved} screenshots from inactive sessions`);
    }
  }

  /**
   * Initialize screenshots array for a session
   * @param sessionId The session ID
   */
  public initSessionScreenshots(sessionId: string): void {
    if (!this.sessionScreenshots.has(sessionId)) {
      this.sessionScreenshots.set(sessionId, []);
      sessionLogger.info(`Initialized screenshots array for session ${sessionId}`);
    }
  }

  /**
   * Clear screenshots for a session
   * @param sessionId The session ID
   */
  public clearSessionScreenshots(sessionId: string): void {
    this.sessionScreenshots.delete(sessionId);
    sessionLogger.info(`Cleared screenshots for session ${sessionId}`);
  }

  /**
   * Add a screenshot to the session
   * @param sessionId The session ID
   * @param screenshot The screenshot to add
   */
  public addScreenshot(sessionId: string, screenshot: Screenshot): void {
    if (!this.sessionScreenshots.has(sessionId)) {
      this.initSessionScreenshots(sessionId);
    }

    const screenshots = this.sessionScreenshots.get(sessionId);
    screenshots.push(screenshot);
    sessionLogger.debug(`Added screenshot to session ${sessionId}, total: ${screenshots.length}`);
  }

  /**
   * Add multiple screenshots to the session
   * @param sessionId The session ID
   * @param screenshots Array of screenshots to add
   */
  public addScreenshots(sessionId: string, screenshots: Screenshot[]): void {
    if (!this.sessionScreenshots.has(sessionId)) {
      this.initSessionScreenshots(sessionId);
    }

    const existingScreenshots = this.sessionScreenshots.get(sessionId);
    screenshots.forEach(screenshot => existingScreenshots.push(screenshot));
    
    sessionLogger.info(`Added ${screenshots.length} screenshots to session ${sessionId}, total: ${existingScreenshots.length}`);
  }

  /**
   * Get all screenshots for a session
   * @param sessionId The session ID
   * @returns Array of screenshots
   */
  public getSessionScreenshots(sessionId: string): Screenshot[] {
    if (!this.sessionScreenshots.has(sessionId)) {
      return [];
    }

    return this.sessionScreenshots.get(sessionId) || [];
  }

  /**
   * Save the session screenshots as a video recording
   * @param sessionId The session ID
   * @returns VideoRecording metadata
   */
  public async saveSessionRecording(sessionId: string): Promise<VideoRecording> {
    const screenshots = this.getSessionScreenshots(sessionId);
    
    if (screenshots.length === 0) {
      throw new Error('No screenshots available for video export');
    }
    
    sessionLogger.info(`Saving session recording with ${screenshots.length} screenshots`);
    
    try {
      // Store recording using VideoStorageService
      const recording = await this.videoStorage.storeRecording(sessionId, screenshots);
      
      // Log success message
      sessionLogger.info(
        `Successfully saved recording ${recording.id} for session ${sessionId} ` +
        `with ${screenshots.length} frames, size: ${Math.round(recording.size / 1024)} KB`
      );
      
      // Automatically trigger video generation (non-blocking)
      this.generateVideoForRecording(recording.id).catch(error => {
        sessionLogger.error(`Error in automatic video generation for recording ${recording.id}:`, error);
      });
      
      return recording;
    } catch (error) {
      sessionLogger.error(`Error saving recording for session ${sessionId}:`, error);
      throw error;
    }
  }
  
  /**
   * Trigger video generation for a recording
   * @param recordingId The recording ID
   * @private
   */
  private async generateVideoForRecording(recordingId: string): Promise<void> {
    try {
      // Default options for automatic video generation
      const options = {
        fps: 2, // 0.2 frames per second (5 seconds per frame) for much slower playback
        captionsEnabled: true,
        format: 'mp4' as const,
        quality: 'medium' as const
      };
      
      sessionLogger.info(`Automatically generating video for recording ${recordingId}`);
      
      // Generate video using VideoGeneratorService
      await this.videoGenerator.generateVideo(recordingId, options);
      
      sessionLogger.info(`Automatic video generation completed for recording ${recordingId}`);
    } catch (error) {
      sessionLogger.error(`Error generating video for recording ${recordingId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get video data from a session
   * @param sessionId The session ID
   * @returns Object with frames and captions
   */
  public getSessionVideoData(sessionId: string) {
    const screenshots = this.getSessionScreenshots(sessionId);
    
    if (screenshots.length === 0) {
      throw new Error('No screenshots available for video export');
    }
    
    const frames = screenshots.map(s => s.base64);
    // Store just the timestamps and conversation data
    const captions = screenshots.map(s => {
      return {
        timestamp: s.timestamp,
        conversation: s.conversation
      };
    });
    
    return {
      frames,
      captions
    };
  }
}