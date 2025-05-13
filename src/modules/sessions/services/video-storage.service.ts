/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { Injectable, OnModuleInit } from '@nestjs/common';
import { homedir } from 'os';
import { join, basename } from 'path';
import { promises as fs } from 'fs';
import { createWriteStream } from 'fs';
import * as archiver from 'archiver';
import { tmpdir } from 'os';
import { ConfigService } from '@app/modules/config/config.service';
import { VideoRecordingDto, ScreenshotDto, VideoGenerationStatus, CaptionDataDto } from '@app/shared/dto';
import { Conversation } from '@ui-tars/shared/types';
import { randomUUID } from 'crypto';
import { sessionLogger } from '@app/common/services/logger.service';
import { OperatorType } from '@app/shared/constants';

@Injectable()
export class VideoStorageService implements OnModuleInit {
  private readonly storagePath: string;
  
  constructor(private readonly configService: ConfigService) {
    const homeDir = homedir();
    const irisDir = join(homeDir, '.iris');
    this.storagePath = join(irisDir, 'videos');
  }
  
  async onModuleInit() {
    try {
      // Ensure .iris directory exists
      const homeDir = homedir();
      const irisDir = join(homeDir, '.iris');
      await fs.mkdir(irisDir, { recursive: true });
      
      // Ensure videos directory exists
      await fs.mkdir(this.storagePath, { recursive: true });
      
      // Create metadata directory
      await fs.mkdir(join(this.storagePath, 'metadata'), { recursive: true });
      
      sessionLogger.info(`VideoStorageService initialized with storage path: ${this.storagePath}`);
    } catch (error) {
      sessionLogger.error('Error initializing VideoStorageService:', error);
      throw error;
    }
  }
  
  /**
   * Store a video recording from screenshots and captions
   * @param sessionId The session ID
   * @param screenshots Array of screenshots with associated thoughts
   * @param operatorType The operator type used for the session
   * @returns VideoRecording metadata
   */
  async storeRecording(sessionId: string, screenshots: ScreenshotDto[], operatorType: OperatorType): Promise<VideoRecordingDto> {
    try {
      // Generate unique ID
      const recordingId = randomUUID();
      
      // Create directory for this recording
      const recordingPath = join(this.storagePath, recordingId);
      await fs.mkdir(recordingPath, { recursive: true });
      
      // Extract frames and captions
      const frames = screenshots.map(s => s.base64);
      
      // Store the timestamps, conversation data, and frame index
      const captionsData = screenshots.map((s, index) => {
        return {
          timestamp: s.timestamp,
          conversation: s.conversation,
          // Store the frame index this caption belongs to, so we can match captions to frames later
          frameIndex: index
        };
      });
      
      // Save frames to disk
      await Promise.all(frames.map(async (base64, index) => {
        const buffer = Buffer.from(base64, 'base64');
        const framePath = join(recordingPath, `frame_${index.toString().padStart(6, '0')}.png`);
        await fs.writeFile(framePath, buffer);
      }));
      
      // Save structured captions data
      const captionsPath = join(recordingPath, 'captions.json');
      await fs.writeFile(captionsPath, JSON.stringify(captionsData), 'utf8');
      
      // Create thumbnail (first frame)
      let thumbnailPath = null;
      if (frames.length > 0) {
        thumbnailPath = join(recordingPath, 'thumbnail.png');
        await fs.writeFile(thumbnailPath, Buffer.from(frames[0], 'base64'));
      }
      
      // Create metadata
      const metadata: VideoRecordingDto = {
        id: recordingId,
        sessionId,
        title: `Session ${sessionId.substring(0, 8)} Recording`,
        createdAt: Date.now(),
        duration: frames.length * 1000, // Estimate 1 second per frame
        frameCount: frames.length,
        thumbnailPath: thumbnailPath,
        filePath: recordingPath,
        size: 0, // Will update after calculating
        videoGenerationStatus: VideoGenerationStatus.PENDING, // Set initial status to pending
        operatorType // Store the operator type used for the session
      };
      
      // Calculate size of all files
      const stats = await this.getDirectorySize(recordingPath);
      metadata.size = stats.size;
      
      // Save metadata
      const metadataPath = join(this.storagePath, 'metadata', `${recordingId}.json`);
      await fs.writeFile(metadataPath, JSON.stringify(metadata), 'utf8');
      
      sessionLogger.info(`Stored recording ${recordingId} for session ${sessionId} with ${frames.length} frames`);
      
      return metadata;
    } catch (error) {
      sessionLogger.error(`Error storing recording for session ${sessionId}:`, error);
      throw error;
    }
  }
  
  /**
   * List all recordings
   * @returns Array of video recording metadata
   */
  async listRecordings(): Promise<VideoRecordingDto[]> {
    try {
      const metadataDir = join(this.storagePath, 'metadata');
      const files = await fs.readdir(metadataDir);
      
      const recordings: VideoRecordingDto[] = [];
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const metadataPath = join(metadataDir, file);
            const metadataContent = await fs.readFile(metadataPath, 'utf8');
            const metadata = JSON.parse(metadataContent) as VideoRecordingDto;
            recordings.push(metadata);
          } catch (error) {
            sessionLogger.error(`Error reading metadata file ${file}:`, error);
          }
        }
      }
      
      // Sort by creation date, newest first
      return recordings.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      sessionLogger.error('Error listing recordings:', error);
      return [];
    }
  }
  
  /**
   * Get a specific recording by ID
   * @param id Recording ID
   * @returns VideoRecording metadata
   */
  async getRecording(id: string): Promise<VideoRecordingDto> {
    try {
      const metadataPath = join(this.storagePath, 'metadata', `${id}.json`);
      const metadataContent = await fs.readFile(metadataPath, 'utf8');
      return JSON.parse(metadataContent) as VideoRecordingDto;
    } catch (error) {
      sessionLogger.error(`Error getting recording ${id}:`, error);
      throw new Error(`Recording with ID ${id} not found`);
    }
  }
  
  /**
   * Get all frames for a recording
   * @param id Recording ID
   * @returns Array of base64 encoded frames
   */
  async getRecordingFrames(id: string): Promise<string[]> {
    try {
      const recording = await this.getRecording(id);
      const frameFiles = await fs.readdir(recording.filePath);
      
      // Filter to only include frame files
      const framePaths = frameFiles
        .filter(file => file.startsWith('frame_') && file.endsWith('.png'))
        .sort(); // Ensure frames are in order
      
      const frames: string[] = [];
      
      for (const framePath of framePaths) {
        const fullPath = join(recording.filePath, framePath);
        const buffer = await fs.readFile(fullPath);
        frames.push(buffer.toString('base64'));
      }
      
      return frames;
    } catch (error) {
      sessionLogger.error(`Error getting frames for recording ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Get captions for a recording
   * @param id Recording ID
   * @returns Array of caption data including timestamp, conversation, and frameIndex
   */
  async getRecordingCaptions(id: string): Promise<CaptionDataDto[]> {
    try {
      const recording = await this.getRecording(id);
      const captionsPath = join(recording.filePath, 'captions.json');
      
      try {
        const captionsContent = await fs.readFile(captionsPath, 'utf8');
        const captions = JSON.parse(captionsContent);
        
        // Ensure each caption has a frameIndex for proper matching
        return captions.map((caption, index) => {
          if (caption.frameIndex === undefined) {
            caption.frameIndex = index;
          }
          return caption;
        });
      } catch (error) {
        sessionLogger.error(`Error reading captions for recording ${id}:`, error);
        return [];
      }
    } catch (error) {
      sessionLogger.error(`Error getting captions for recording ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Get thumbnail for a recording
   * @param id Recording ID
   * @returns Base64 encoded thumbnail
   */
  async getRecordingThumbnail(id: string): Promise<string> {
    try {
      const recording = await this.getRecording(id);
      
      if (!recording.thumbnailPath) {
        // If no thumbnail, try to use first frame
        const frames = await this.getRecordingFrames(id);
        if (frames.length > 0) {
          return frames[0];
        }
        throw new Error('No thumbnail available');
      }
      
      const buffer = await fs.readFile(recording.thumbnailPath);
      return buffer.toString('base64');
    } catch (error) {
      sessionLogger.error(`Error getting thumbnail for recording ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Create a ZIP archive of a recording
   * @param id Recording ID
   * @returns Path to the created ZIP file
   */
  async createRecordingZip(id: string): Promise<string> {
    try {
      const recording = await this.getRecording(id);
      
      // Create a temporary zip file
      const zipFilePath = join(tmpdir(), `recording_${id}.zip`);
      const output = createWriteStream(zipFilePath);
      const archive = archiver('zip', { zlib: { level: 9 } });
      
      // Pipe archive data to the file
      archive.pipe(output);
      
      // Add all files from recording directory
      archive.directory(recording.filePath, false);
      
      // Finalize the archive
      await archive.finalize();
      
      // Wait for the stream to finish
      return new Promise((resolve, reject) => {
        output.on('close', () => resolve(zipFilePath));
        output.on('error', (err) => reject(err));
      });
    } catch (error) {
      sessionLogger.error(`Error creating ZIP for recording ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete a recording
   * @param id Recording ID
   * @returns True if deleted successfully
   */
  async deleteRecording(id: string): Promise<boolean> {
    try {
      const recording = await this.getRecording(id);
      
      // Delete all files in the recording directory
      await fs.rm(recording.filePath, { recursive: true, force: true });
      
      // Delete metadata file
      const metadataPath = join(this.storagePath, 'metadata', `${id}.json`);
      await fs.unlink(metadataPath);
      
      sessionLogger.info(`Deleted recording ${id}`);
      return true;
    } catch (error) {
      sessionLogger.error(`Error deleting recording ${id}:`, error);
      return false;
    }
  }
  
  /**
   * Get the size of a directory
   * @param directoryPath Path to directory
   * @returns Size in bytes and file count
   */
  private async getDirectorySize(directoryPath: string): Promise<{ size: number, files: number }> {
    try {
      const files = await fs.readdir(directoryPath);
      let totalSize = 0;
      let fileCount = 0;
      
      for (const file of files) {
        const fullPath = join(directoryPath, file);
        const stats = await fs.stat(fullPath);
        
        if (stats.isDirectory()) {
          const subDirStats = await this.getDirectorySize(fullPath);
          totalSize += subDirStats.size;
          fileCount += subDirStats.files;
        } else {
          totalSize += stats.size;
          fileCount += 1;
        }
      }
      
      return { size: totalSize, files: fileCount };
    } catch (error) {
      sessionLogger.error(`Error calculating directory size for ${directoryPath}:`, error);
      return { size: 0, files: 0 };
    }
  }
}