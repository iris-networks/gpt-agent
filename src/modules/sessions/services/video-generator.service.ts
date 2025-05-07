/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { Injectable, OnModuleInit, Inject, forwardRef } from '@nestjs/common';
import { join } from 'path';
import { promises as fs } from 'fs';
import { spawn } from 'child_process';
import { sessionLogger } from '@app/common/services/logger.service';
import { VideoStorageService } from './video-storage.service';
import { VideoRecording, VideoGenerationStatus } from '@app/shared/types';

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
      
      // Get captions if enabled
      let captions: string[] = [];
      if (captionsEnabled) {
        captions = await this.loadCaptions(recordingDir);
      }
      
      try {
        // Generate video using ffmpeg
        await this.runFfmpegCommand(frameFiles, outputVideoPath, {
          fps,
          captions,
          quality,
          format
        });
        
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
   * Load captions from the captions.json file
   * @param recordingDir Path to the recording directory
   * @private
   */
  private async loadCaptions(recordingDir: string): Promise<string[]> {
    try {
      const captionsPath = join(recordingDir, 'captions.json');
      const captionsContent = await fs.readFile(captionsPath, 'utf8');
      return JSON.parse(captionsContent);
    } catch (error) {
      sessionLogger.error(`Error loading captions:`, error);
      return [];
    }
  }
  
  /**
   * Run ffmpeg command to generate video
   * @param frameFiles Array of frame file paths
   * @param outputPath Output video path
   * @param options Options for ffmpeg
   * @private
   */
  private async runFfmpegCommand(
    frameFiles: string[],
    outputPath: string,
    options: {
      fps: number;
      captions: string[];
      quality: 'low' | 'medium' | 'high';
      format: 'mp4' | 'webm' | 'gif';
    }
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        // Create a temporary directory for processing
        const tmpDir = join(frameFiles[0], '..', 'tmp');
        await fs.mkdir(tmpDir, { recursive: true });
        
        // Create a glob pattern for the frames in the recording directory
        const recordingDir = join(frameFiles[0], '..');
        const framePattern = join(recordingDir, '*.png');
        
        // Determine video codec and quality settings based on format and quality
        const videoCodec = options.format === 'webm' ? 'libvpx-vp9' : 'libx264';
        let videoBitrate = '1M'; // Default for medium quality
        let crf = '23'; // Default CRF for medium quality
        
        if (options.quality === 'low') {
          videoBitrate = '500k';
          crf = '28';
        } else if (options.quality === 'high') {
          videoBitrate = '2M';
          crf = '18';
        }
        
        // Prepare ffmpeg args using the glob pattern approach
        const ffmpegArgs = [
          '-y', // Overwrite output files without asking
          '-framerate', options.fps.toString(), // Set input framerate
          '-pattern_type', 'glob', // Use glob pattern for input
          '-i', framePattern, // Input pattern
        ];
        
        // Use a simple vf filter with just framerate control
        const vfFilter = `fps=${options.fps}`;
        
        // We'll deal with captions separately to simplify the process
        let captions = [];
        if (options.captions.length > 0) {
          // Store captions for potential future use but don't add them to ffmpeg yet
          // Creating caption overlay is causing issues, so we'll disable it for now
          captions = options.captions;
        }
        
        // Add format-specific settings
        // Set explicit duration based on frame count and fps for all formats
        const totalDurationSeconds = frameFiles.length / options.fps;
        ffmpegArgs.push('-t', totalDurationSeconds.toString());
        
        if (options.format === 'gif') {
          // For GIF, use a specific filter chain for palette generation
          ffmpegArgs.push('-vf', `${vfFilter},scale=800:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`);
        } else {
          // For video formats, use a simple fps filter
          ffmpegArgs.push('-vf', vfFilter);
          
          // Add video codec for non-GIF formats
          ffmpegArgs.push(
            '-c:v', videoCodec
          );
          
          if (videoCodec === 'libx264') {
            ffmpegArgs.push(
              '-pix_fmt', 'yuv420p',
              '-preset', 'medium', 
              '-crf', crf
            );
          } else {
            ffmpegArgs.push('-b:v', videoBitrate);
          }
          
          if (options.format === 'mp4') {
            ffmpegArgs.push('-movflags', '+faststart');
          }
        }
        
        // Add output path
        ffmpegArgs.push(outputPath);
        
        // Log the command for debugging
        sessionLogger.info(`FFMPEG command: ffmpeg ${ffmpegArgs.join(' ')}`);
        
        // Run ffmpeg
        const ffmpeg = spawn('ffmpeg', ffmpegArgs);
        
        // Log output
        ffmpeg.stdout.on('data', (data) => {
          sessionLogger.debug(`ffmpeg stdout: ${data}`);
        });
        
        ffmpeg.stderr.on('data', (data) => {
          sessionLogger.debug(`ffmpeg stderr: ${data}`);
        });
        
        // Handle completion
        ffmpeg.on('close', async (code) => {
          try {
            // Clean up temporary directory
            await fs.rm(tmpDir, { recursive: true, force: true });
            
            if (code === 0) {
              resolve();
            } else {
              reject(new Error(`FFmpeg process exited with code ${code}`));
            }
          } catch (error) {
            sessionLogger.error('Error cleaning up temporary files:', error);
            // Still resolve if the video was generated successfully
            if (code === 0) {
              resolve();
            } else {
              reject(error);
            }
          }
        });
        
        ffmpeg.on('error', (err) => {
          reject(err);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * Format time for SRT subtitles
   * @param milliseconds Time in milliseconds
   * @private
   */
  private formatSrtTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds - (hours * 3600)) / 60);
    const seconds = totalSeconds - (hours * 3600) - (minutes * 60);
    const ms = Math.floor(milliseconds % 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
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