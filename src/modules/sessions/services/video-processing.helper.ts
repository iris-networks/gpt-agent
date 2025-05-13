/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { join, basename } from 'path';
import { sessionLogger } from '@app/common/services/logger.service';
import { VideoCaptionHelper } from './video-caption.helper';
import { ProcessedCaptionDto } from '@app/shared/dto';

/**
 * Video quality configuration
 */
export interface VideoQualityOptions {
  quality: 'low' | 'medium' | 'high';
  format: 'mp4' | 'webm' | 'gif';
  fps: number;
  captionsEnabled: boolean;
}

/**
 * Helper class for video processing operations
 */
export class VideoProcessingHelper {
  /**
   * Process frames and add captions
   * @param frameFiles Array of frame file paths
   * @param tmpDir Temporary directory for processed frames
   * @param captions Array of captions
   */
  public static async processFrames(
    frameFiles: string[],
    tmpDir: string,
    captions: ProcessedCaptionDto[]
  ): Promise<string[]> {
    // Create an array of the final frame paths (either original or captioned)
    const processedFrames = [...frameFiles];
    
    // Create a map for quick caption lookup by frameIndex
    const captionMap = new Map<number, { text: string; action: string; details: string; frameIndex: number }>();
    captions.forEach(caption => {
      if (caption.frameIndex !== undefined) {
        captionMap.set(caption.frameIndex, caption);
      }
    });
    
    // Log for debugging
    sessionLogger.debug(`Processing ${frameFiles.length} frames with ${captions.length} captions`);
    
    // Process each frame to add captions directly
    await Promise.all(frameFiles.map(async (framePath, index) => {
      try {
        // Extract frame number from file name (expecting format: frame_XXXXXX.png)
        const frameNumber = parseInt(basename(framePath).match(/frame_(\d+)\.png/)?.[1] || '0', 10);
        
        // Get caption for this frame
        const caption = captionMap.get(frameNumber) || captionMap.get(index) || { 
          text: '', 
          action: '', 
          details: '',
          frameIndex: index
        };
        
        // Skip if no caption text
        if (!caption.text && !caption.action) {
          return;
        }
        
        // Create a temporary output path for the captioned image
        const captionedFramePath = join(tmpDir, basename(framePath));
        
        // Add caption to the frame
        const success = await VideoCaptionHelper.addCaptionToFrame(
          framePath,
          captionedFramePath,
          caption,
          index
        );
        
        // If successful, update the frame path in the array
        if (success) {
          processedFrames[index] = captionedFramePath;
          sessionLogger.debug(`Added caption to frame ${index}, action: ${caption.action}`);
        }
      } catch (error) {
        sessionLogger.error(`Error processing frame ${index}:`, error);
        // Continue with original frame if there's an error
      }
    }));
    
    return processedFrames;
  }
  
  /**
   * Build ffmpeg arguments based on quality options
   * @param options Video quality options
   * @param framePattern Input frame pattern
   * @param outputPath Output video path
   * @param frameCount Total number of frames
   */
  public static buildFfmpegArgs(
    options: VideoQualityOptions,
    framePattern: string,
    outputPath: string,
    frameCount: number
  ): string[] {
    // Prepare ffmpeg args using the glob pattern approach
    const ffmpegArgs = [
      '-y', // Overwrite output files without asking
      '-framerate', options.fps.toString(), // Set input framerate
      '-pattern_type', 'glob', // Use glob pattern for input
      '-i', framePattern, // Input pattern
    ];
    
    // Base filter for framerate
    const vfFilter = `fps=${options.fps}`;
    
    // Add format-specific settings
    // Set explicit duration based on frame count and fps for all formats
    const totalDurationSeconds = frameCount / options.fps;
    ffmpegArgs.push('-t', totalDurationSeconds.toString());
    
    // Video codec and quality settings
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
    
    return ffmpegArgs;
  }
  
  /**
   * Run ffmpeg command to generate video
   * @param ffmpegArgs Array of ffmpeg arguments
   * @param tmpDir Temporary directory to clean up
   */
  public static runFfmpegCommand(ffmpegArgs: string[], tmpDir: string): Promise<void> {
    return new Promise((resolve, reject) => {
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
          // Clean up temporary directory with all captioned images
          await fs.rm(tmpDir, { recursive: true, force: true })
            .catch(err => {
              // Log but don't fail if cleanup fails
              sessionLogger.warn(`Failed to clean up temporary directory: ${err.message}`);
            });
          
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
    });
  }
}