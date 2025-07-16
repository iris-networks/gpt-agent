/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { sessionLogger } from '@app/common/services/logger.service';
import { VideoStorageService } from './video-storage.service';
import { VideoGeneratorService } from './video-generator.service';
import { OperatorType } from '@app/shared/constants';
import {
  ScreenshotDto,
  VideoRecordingDto,
  VideoDataDto,
  CaptionDataDto
} from '../dto/sessions-dto';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Service responsible for managing session screenshots and video-related functionality
 */
@Injectable()
export class SessionScreenshotsService {
  // Screenshots metadata for sessions (file paths and conversation data)
  private sessionScreenshots: Map<string, Array<{filePath: string, timestamp: number, conversation: any}>> = new Map();
  
  // Base directory for storing screenshots
  private readonly screenshotsDir: string;

  constructor(
    private readonly videoStorage: VideoStorageService,
    @Inject(forwardRef(() => VideoGeneratorService))
    private readonly videoGenerator: VideoGeneratorService
  ) {
    // Initialize screenshots directory
    this.screenshotsDir = path.join(process.cwd(), 'temp', 'screenshots');
    this.ensureDirectoryExists(this.screenshotsDir);
    
    sessionLogger.info('SessionScreenshotsService initialized');
    
    // Add a periodic cleanup task to prevent memory leaks and disk space issues
    setInterval(() => {
      this.cleanupStaleScreenshots();
    }, 15 * 60 * 1000); // Run every 15 minutes
  }
  
  /**
   * Ensure a directory exists, create if it doesn't
   * @private
   */
  private ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      sessionLogger.info(`Created screenshots directory: ${dirPath}`);
    }
  }
  
  /**
   * Clean up screenshots from inactive sessions to prevent memory leaks and disk space issues
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
          // Delete screenshot files from disk
          screenshots.forEach(screenshot => {
            try {
              if (fs.existsSync(screenshot.filePath)) {
                fs.unlinkSync(screenshot.filePath);
              }
            } catch (error) {
              sessionLogger.warn(`Failed to delete screenshot file ${screenshot.filePath}: ${error.message}`);
            }
          });
          
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
    const screenshots = this.sessionScreenshots.get(sessionId);
    if (screenshots) {
      // Delete screenshot files from disk
      screenshots.forEach(screenshot => {
        try {
          if (fs.existsSync(screenshot.filePath)) {
            fs.unlinkSync(screenshot.filePath);
          }
        } catch (error) {
          sessionLogger.warn(`Failed to delete screenshot file ${screenshot.filePath}: ${error.message}`);
        }
      });
    }
    
    this.sessionScreenshots.delete(sessionId);
    sessionLogger.info(`Cleared screenshots for session ${sessionId}`);
  }

  /**
   * Add a screenshot to the session
   * @param sessionId The session ID
   * @param screenshot The screenshot to add
   */
  public addScreenshot(sessionId: string, screenshot: ScreenshotDto): void {
    if (!this.sessionScreenshots.has(sessionId)) {
      this.initSessionScreenshots(sessionId);
    }

    // Create session directory if it doesn't exist
    const sessionDir = path.join(this.screenshotsDir, sessionId);
    this.ensureDirectoryExists(sessionDir);

    // Generate filename with timestamp
    const filename = `screenshot_${screenshot.timestamp}.png`;
    const filePath = path.join(sessionDir, filename);

    try {
      // Convert base64 to buffer and save to disk
      const base64Data = screenshot.base64.replace(/^data:image\/[a-z]+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(filePath, buffer);

      // Store metadata instead of full screenshot data
      const screenshots = this.sessionScreenshots.get(sessionId);
      screenshots.push({
        filePath,
        timestamp: screenshot.timestamp,
        conversation: screenshot.conversation
      });

      sessionLogger.debug(`Added screenshot to session ${sessionId}, saved to ${filePath}, total: ${screenshots.length}`);
    } catch (error) {
      sessionLogger.error(`Failed to save screenshot for session ${sessionId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Add multiple screenshots to the session
   * @param sessionId The session ID
   * @param screenshots Array of screenshots to add
   */
  public addScreenshots(sessionId: string, screenshots: ScreenshotDto[]): void {
    screenshots.forEach(screenshot => {
      this.addScreenshot(sessionId, screenshot);
    });
    
    const existingScreenshots = this.sessionScreenshots.get(sessionId);
    sessionLogger.info(`Added ${screenshots.length} screenshots to session ${sessionId}, total: ${existingScreenshots?.length || 0}`);
  }

  /**
   * Get all screenshots for a session
   * @param sessionId The session ID
   * @returns Array of screenshots
   */
  public getSessionScreenshots(sessionId: string): ScreenshotDto[] {
    if (!this.sessionScreenshots.has(sessionId)) {
      return [];
    }

    const screenshotMetadata = this.sessionScreenshots.get(sessionId) || [];
    
    // Convert file-based screenshots back to ScreenshotDto format
    return screenshotMetadata.map(metadata => {
      try {
        const base64Data = fs.readFileSync(metadata.filePath, 'base64');
        return {
          base64: `data:image/png;base64,${base64Data}`,
          timestamp: metadata.timestamp,
          conversation: metadata.conversation
        };
      } catch (error) {
        sessionLogger.error(`Failed to read screenshot file ${metadata.filePath}: ${error.message}`);
        // Return a placeholder or skip this screenshot
        return null;
      }
    }).filter(screenshot => screenshot !== null);
  }

  /**
   * Get screenshot metadata for a session (for efficient file copying)
   * @param sessionId The session ID
   * @returns Array of screenshot metadata with file paths
   */
  public getSessionScreenshotFiles(sessionId: string): Array<{filePath: string, timestamp: number, conversation: any}> {
    if (!this.sessionScreenshots.has(sessionId)) {
      return [];
    }

    return this.sessionScreenshots.get(sessionId) || [];
  }

  /**
   * Save the session screenshots as a video recording
   * @param sessionId The session ID
   * @param operatorType The operator type used for the session
   * @returns VideoRecording metadata
   */
  public async saveSessionRecording(sessionId: string, operatorType: OperatorType): Promise<VideoRecordingDto> {
    const screenshotFiles = this.getSessionScreenshotFiles(sessionId);
    
    if (screenshotFiles.length === 0) {
      throw new Error('No screenshots available for video export');
    }
    
    sessionLogger.info(`Saving session recording with ${screenshotFiles.length} screenshots using operator type: ${operatorType}`);
    
    try {
      // Store recording using VideoStorageService with efficient file copying
      const recording = await this.videoStorage.storeRecordingFromFiles(sessionId, screenshotFiles, operatorType);
      
      // Log success message
      sessionLogger.info(
        `Successfully saved recording ${recording.id} for session ${sessionId} ` +
        `with ${screenshotFiles.length} frames, size: ${Math.round(recording.size / 1024)} KB`
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
  public getSessionVideoData(sessionId: string): VideoDataDto {
    const screenshots = this.getSessionScreenshots(sessionId);
    
    if (screenshots.length === 0) {
      throw new Error('No screenshots available for video export');
    }
    
    const frames = screenshots.map(s => s.base64);
    
    // Store the timestamps, conversation data, and frame index
    const captions: CaptionDataDto[] = screenshots.map((s, index) => {
      return {
        timestamp: s.timestamp,
        conversation: s.conversation,
        frameIndex: index // Include frame index to maintain proper pairing
      };
    });
    
    // Log to help debug any issues with the data
    sessionLogger.debug(`Returning video data with ${frames.length} frames and ${captions.length} captions`);
    
    return {
      frames,
      captions
    };
  }
}