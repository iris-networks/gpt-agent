/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { homedir } from 'os';
import { FileInfoDto } from '../dto/file-upload.dto';

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);
  private readonly filesDir: string;
  
  constructor() {
    // Create .iris/files directory structure if it doesn't exist
    this.filesDir = path.join(homedir(), '.iris', 'files');
    this.ensureDirectoriesExist();
  }

  /**
   * Ensure the necessary directories exist
   */
  private ensureDirectoriesExist(): void {
    const irisDir = path.join(homedir(), '.iris');
    
    if (!fs.existsSync(irisDir)) {
      fs.mkdirSync(irisDir, { recursive: true });
    }
    
    if (!fs.existsSync(this.filesDir)) {
      fs.mkdirSync(this.filesDir, { recursive: true });
    }
  }

  /**
   * Process and store uploaded file metadata
   */
  async processUploadedFile(file: Express.Multer.File): Promise<{
    fileId: string;
    fileName: string;
    filePath: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    message: string;
  }> {
    try {
      // Create a unique ID for this file
      const fileId = Date.now().toString();
      
      // Create metadata file
      const metadataPath = path.join(this.filesDir, `${fileId}.json`);
      const metadata = {
        fileId,
        originalName: file.originalname,
        fileName: file.filename,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        uploadDate: new Date().toISOString(),
      };
      
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
      
      this.logger.log(`File uploaded: ${file.filename} (${file.size} bytes)`);
      
      return {
        fileId,
        fileName: file.filename,
        filePath: file.path,
        fileUrl: `/api/files/download/${file.filename}`,
        fileSize: file.size,
        mimeType: file.mimetype,
        message: 'File uploaded successfully',
      };
    } catch (error) {
      this.logger.error(`Error processing uploaded file: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * List all uploaded files
   */
  async listAllFiles(): Promise<FileInfoDto[]> {
    try {
      const files: FileInfoDto[] = [];
      
      // Read all .json metadata files in the files directory
      const metadataFiles = fs.readdirSync(this.filesDir)
        .filter(file => file.endsWith('.json'));
      
      for (const metadataFile of metadataFiles) {
        const metadataPath = path.join(this.filesDir, metadataFile);
        const rawData = fs.readFileSync(metadataPath, 'utf8');
        const metadata = JSON.parse(rawData);
        
        // Ensure the actual file still exists
        if (fs.existsSync(metadata.filePath)) {
          files.push({
            fileId: metadata.fileId,
            fileName: metadata.fileName,
            filePath: metadata.filePath,
            fileUrl: `/api/files/download/${metadata.fileName}`,
            fileSize: metadata.fileSize,
            mimeType: metadata.mimeType,
            uploadDate: metadata.uploadDate,
          });
        }
      }
      
      // Sort by upload date (most recent first)
      return files.sort((a, b) => 
        new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
      );
    } catch (error) {
      this.logger.error(`Error listing files: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get file info by ID
   */
  async getFileInfo(fileId: string): Promise<FileInfoDto> {
    const metadataPath = path.join(this.filesDir, `${fileId}.json`);
    
    if (!fs.existsSync(metadataPath)) {
      throw new NotFoundException(`File with ID ${fileId} not found`);
    }
    
    try {
      const rawData = fs.readFileSync(metadataPath, 'utf8');
      const metadata = JSON.parse(rawData);
      
      // Check if the actual file still exists
      if (!fs.existsSync(metadata.filePath)) {
        throw new NotFoundException(`File ${metadata.fileName} not found`);
      }
      
      return {
        fileId: metadata.fileId,
        fileName: metadata.fileName,
        filePath: metadata.filePath,
        fileUrl: `/api/files/download/${metadata.fileName}`,
        fileSize: metadata.fileSize,
        mimeType: metadata.mimeType,
        uploadDate: metadata.uploadDate,
      };
    } catch (error) {
      this.logger.error(`Error retrieving file info: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get file path from ID
   */
  async getFilePathFromId(fileId: string): Promise<string> {
    const fileInfo = await this.getFileInfo(fileId);
    return fileInfo.filePath;
  }

  /**
   * Delete file by ID
   */
  async deleteFile(fileId: string): Promise<{ success: boolean; message: string }> {
    const metadataPath = path.join(this.filesDir, `${fileId}.json`);
    
    if (!fs.existsSync(metadataPath)) {
      throw new NotFoundException(`File with ID ${fileId} not found`);
    }
    
    try {
      const rawData = fs.readFileSync(metadataPath, 'utf8');
      const metadata = JSON.parse(rawData);
      
      // Delete the actual file if it exists
      if (fs.existsSync(metadata.filePath)) {
        fs.unlinkSync(metadata.filePath);
      }
      
      // Delete the metadata file
      fs.unlinkSync(metadataPath);
      
      this.logger.log(`File deleted: ${metadata.fileName}`);
      
      return {
        success: true,
        message: `File ${metadata.fileName} deleted successfully`,
      };
    } catch (error) {
      this.logger.error(`Error deleting file: ${error.message}`, error.stack);
      throw error;
    }
  }
}