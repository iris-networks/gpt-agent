/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { Injectable, Logger } from '@nestjs/common';
import { promisify } from 'util';
import { exec as execCallback } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { homedir } from 'os';

const exec = promisify(execCallback);

@Injectable()
export class VideoProcessorService {
  private readonly logger = new Logger(VideoProcessorService.name);
  private readonly outputDir = path.join(homedir(), '.iris', 'uploads', 'processed');

  constructor() {
    // Ensure the .iris directory exists
    const irisDir = path.join(homedir(), '.iris');
    if (!fs.existsSync(irisDir)) {
      fs.mkdirSync(irisDir, { recursive: true });
    }
    
    // Ensure the uploads directory exists
    const uploadsDir = path.join(homedir(), '.iris', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Ensure the output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Process the video using ffmpeg to remove idle segments
   * @param inputPath Path to the input video file
   * @returns Path to the processed video file
   */
  async processVideo(inputPath: string): Promise<string> {
    try {
      this.logger.log(`Processing video: ${inputPath}`);
      
      // Create output filename based on input
      const inputFileName = path.basename(inputPath);
      const outputFileName = `processed-${inputFileName}`;
      const outputPath = path.join(this.outputDir, outputFileName);
      
      // Build ffmpeg command
      const ffmpegCmd = `ffmpeg -i "${inputPath}" \\
       -vf "select='if(eq(n,0),1,gt(scene,0.01))',setpts=N/(2*TB),fps=2" \\
       -r 20 \\
       -c:v libx264 -profile:v main -pix_fmt yuv420p -movflags +faststart -crf 23 -preset medium -an \\
       "${outputPath}"`;
      
      this.logger.debug(`Executing ffmpeg command: ${ffmpegCmd}`);
      
      // Execute ffmpeg command
      const { stdout, stderr } = await exec(ffmpegCmd);
      
      if (stderr) {
        this.logger.debug(`ffmpeg stderr: ${stderr}`);
      }
      
      if (!fs.existsSync(outputPath)) {
        throw new Error('Failed to process video: Output file was not created');
      }
      
      this.logger.log(`Video processed successfully: ${outputPath}`);
      return outputPath;
    } catch (error) {
      this.logger.error(`Error processing video: ${error.message}`, error.stack);
      throw error;
    }
  }
  
  /**
   * Extract key frames from the processed video
   * @param processedVideoPath Path to the processed video
   * @returns Array of paths to extracted frame images
   */
  async extractKeyFrames(processedVideoPath: string): Promise<string[]> {
    try {
      const framesDir = path.join(
        this.outputDir, 
        `frames-${path.basename(processedVideoPath, path.extname(processedVideoPath))}`
      );
      
      if (!fs.existsSync(framesDir)) {
        fs.mkdirSync(framesDir, { recursive: true });
      }
      
      const extractCmd = `ffmpeg -i "${processedVideoPath}" -vf "select='eq(n,0)+gt(scene,0.01)'" -vsync 0 "${framesDir}/frame-%04d.jpg"`;
      
      this.logger.debug(`Executing frame extraction: ${extractCmd}`);
      
      await exec(extractCmd);
      
      // Get list of extracted frames
      const frameFiles = fs.readdirSync(framesDir)
        .filter(file => file.startsWith('frame-') && file.endsWith('.jpg'))
        .map(file => path.join(framesDir, file))
        .sort();
      
      this.logger.log(`Extracted ${frameFiles.length} key frames to ${framesDir}`);
      return frameFiles;
    } catch (error) {
      this.logger.error(`Error extracting key frames: ${error.message}`, error.stack);
      throw error;
    }
  }
}