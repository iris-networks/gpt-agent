/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { Injectable, OnModuleInit } from '@nestjs/common';
import { join } from 'path';
import { promises as fs } from 'fs';
import { spawn } from 'child_process';
import { sessionLogger } from '@app/common/services/logger.service';
import { VideoStorageService } from './video-storage.service';
import { VideoRecording, VideoGenerationStatus, ProcessedCaption } from '@app/shared/types';
import { Conversation } from '@ui-tars/shared/types';
import { VideoCaptionHelper } from './video-caption.helper';
import { VideoProcessingHelper, VideoQualityOptions } from './video-processing.helper';

@Injectable()
export class VideoGeneratorService implements OnModuleInit {
  constructor(
    private readonly videoStorage: VideoStorageService
  ) {
    sessionLogger.info('VideoGeneratorService initialized');
  }

  async onModuleInit() {
    try {
      // Check if ffmpeg is installed
      await this.checkFfmpegInstallation();
    } catch (error) {
      sessionLogger.error('Error initializing VideoGeneratorService:', error);
      sessionLogger.warn('Video generation will be disabled due to missing ffmpeg');
    }
  }

  /**
   * Check if ffmpeg is installed
   * @private
   */
  private async checkFfmpegInstallation(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', ['-version']);
      
      ffmpeg.on('error', (err: any) => {
        sessionLogger.error('FFmpeg is not installed or not in the PATH:', err);
        reject(new Error('FFmpeg is not installed or not in the PATH'));
      });
      
      ffmpeg.on('close', (code) => {
        if (code === 0) {
          sessionLogger.info('FFmpeg is installed and ready for use');
          resolve(true);
        } else {
          sessionLogger.error(`FFmpeg check failed with code ${code}`);
          reject(new Error(`FFmpeg check failed with code ${code}`));
        }
      });
    });
  }

  /**
   * Generate a video file from a recording
   * @param recordingId The ID of the recording to generate a video for
   * @param options Options for video generation
   * @returns Path to the generated video file
   */
  async generateVideo(
    recordingId: string, 
    options: {
      fps?: number;
      captionsEnabled?: boolean;
      format?: 'mp4' | 'webm' | 'gif';
      quality?: 'low' | 'medium' | 'high';
    } = {}
  ): Promise<string> {
    try {
      // Set default options
      const fps = options.fps || 2; // 2 frames per second by default (0.5 seconds per frame)
      const captionsEnabled = options.captionsEnabled !== true; // Enable captions by default
      const format = options.format || 'mp4';
      const quality = options.quality || 'medium';
      
      // Get recording metadata
      const recording = await this.videoStorage.getRecording(recordingId);
      
      // Check if video generation is already in progress
      if (recording.videoGenerationStatus === VideoGenerationStatus.IN_PROGRESS) {
        sessionLogger.info(`Video generation for recording ${recordingId} is already in progress`);
        return recording.videoPath || '';
      }
      
      // Check if video generation is already completed
      if (recording.videoGenerationStatus === VideoGenerationStatus.COMPLETED && recording.hasVideo) {
        sessionLogger.info(`Video already exists for recording ${recordingId}`);
        return recording.videoPath || '';
      }
      
      // Update status to in progress
      await this.updateGenerationStatus(recording, VideoGenerationStatus.IN_PROGRESS);
      
      const recordingDir = recording.filePath;
      
      // Path for the output video
      const outputVideoPath = join(recordingDir, `video.${format}`);
      
      // Get frame files
      const frameFiles = await this.getFrameFiles(recordingDir);
      if (frameFiles.length === 0) {
        await this.updateGenerationStatus(
          recording, 
          VideoGenerationStatus.FAILED, 
          'No frames found for this recording'
        );
        throw new Error('No frames found for this recording');
      }
      
      try {
        // Create a temporary directory for processing
        const tmpDir = join(recordingDir, 'tmp');
        await fs.mkdir(tmpDir, { recursive: true });
        
        // Get captions if enabled and process frames
        let captions: ProcessedCaption[] = [];
        
        if (captionsEnabled) {
          // Load captions from the recording
          captions = await VideoCaptionHelper.loadCaptions(recordingDir);
          
          // Process frames to add captions
          const captionedFrames = await VideoProcessingHelper.processFrames(
            frameFiles,
            tmpDir,
            captions
          );
          
          // Update frameFiles with the captioned frames
          for (let i = 0; i < frameFiles.length; i++) {
            if (captionedFrames[i] !== frameFiles[i]) {
              frameFiles[i] = captionedFrames[i];
            }
          }
        }
        
        // Create frame pattern for ffmpeg
        const framePattern = captionsEnabled 
          ? join(tmpDir, '*.png') 
          : join(recordingDir, '*.png');
        
        // Prepare quality options for the video
        const qualityOptions: VideoQualityOptions = {
          fps,
          captionsEnabled,
          format,
          quality
        };
        
        // Build ffmpeg arguments
        const ffmpegArgs = VideoProcessingHelper.buildFfmpegArgs(
          qualityOptions,
          framePattern,
          outputVideoPath,
          frameFiles.length
        );
        
        // Generate the video
        await VideoProcessingHelper.runFfmpegCommand(ffmpegArgs, tmpDir);
        
        // Update recording metadata with video path
        await this.updateRecordingWithVideo(recording, outputVideoPath, format);
        
        // Update status to completed
        await this.updateGenerationStatus(recording, VideoGenerationStatus.COMPLETED);
        
        sessionLogger.info(`Generated ${format} video for recording ${recordingId}`);
        return outputVideoPath;
      } catch (error) {
        // Update status to failed
        await this.updateGenerationStatus(
          recording, 
          VideoGenerationStatus.FAILED, 
          error.message || 'Unknown error during video generation'
        );
        throw error;
      }
    } catch (error) {
      sessionLogger.error(`Error generating video for recording ${recordingId}:`, error);
      throw error;
    }
  }
  
  /**
   * Update the generation status of a recording
   * @param recording The recording to update
   * @param status The new status
   * @param errorMessage Optional error message for failed status
   * @private
   */
  private async updateGenerationStatus(
    recording: VideoRecording,
    status: VideoGenerationStatus,
    errorMessage?: string
  ): Promise<void> {
    try {
      const now = Date.now();
      const updatedRecording = {
        ...recording,
        videoGenerationStatus: status
      };
      
      // Set appropriate timestamps based on status
      if (status === VideoGenerationStatus.IN_PROGRESS) {
        updatedRecording.videoGenerationStartedAt = now;
      } else if (status === VideoGenerationStatus.COMPLETED || status === VideoGenerationStatus.FAILED) {
        updatedRecording.videoGenerationCompletedAt = now;
      }
      
      // Add error message if provided
      if (errorMessage && status === VideoGenerationStatus.FAILED) {
        updatedRecording.videoGenerationError = errorMessage;
      }
      
      // Save updated metadata
      const metadataPath = join(recording.filePath, '..', 'metadata', `${recording.id}.json`);
      await fs.writeFile(metadataPath, JSON.stringify(updatedRecording), 'utf8');
      
      sessionLogger.info(`Updated video generation status for recording ${recording.id} to ${status}`);
    } catch (error) {
      sessionLogger.error(`Error updating generation status for recording ${recording.id}:`, error);
    }
  }
  
  /**
   * Get sorted frame files from the recording directory
   * @param recordingDir Path to the recording directory
   * @private
   */
  private async getFrameFiles(recordingDir: string): Promise<string[]> {
    const files = await fs.readdir(recordingDir);
    return files
      .filter(file => file.startsWith('frame_') && file.endsWith('.png'))
      .sort()
      .map(file => join(recordingDir, file));
  }
  
  /**
   * Update recording metadata with video information
   * @param recording Recording metadata
   * @param videoPath Path to the video file
   * @param format Video format
   * @private
   */
  private async updateRecordingWithVideo(
    recording: VideoRecording,
    videoPath: string,
    format: string
  ): Promise<void> {
    try {
      // Get video file stats
      const stats = await fs.stat(videoPath);
      
      // Update recording
      const updatedRecording = {
        ...recording,
        videoPath,
        videoFormat: format,
        videoSize: stats.size,
        hasVideo: true,
        // Don't change the generation status here - that's handled by updateGenerationStatus
      };
      
      // Save updated metadata
      const metadataPath = join(recording.filePath, '..', 'metadata', `${recording.id}.json`);
      await fs.writeFile(metadataPath, JSON.stringify(updatedRecording), 'utf8');
      
      sessionLogger.info(`Updated recording ${recording.id} with video information: format=${format}, size=${Math.round(stats.size / 1024)} KB`);
    } catch (error) {
      sessionLogger.error('Error updating recording metadata:', error);
      throw error;
    }
  }
}