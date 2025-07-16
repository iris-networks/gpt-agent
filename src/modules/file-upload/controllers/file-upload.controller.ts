/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Get,
  Param,
  NotFoundException,
  Logger,
  Res,
  HttpStatus,
  HttpCode,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { homedir } from 'os';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiResponse, ApiParam } from '@nestjs/swagger';
import { FileUploadService } from '../services/file-upload.service';
import { FileInfoDto, FileUploadDto, FileUploadResponseDto } from '../dto/file-upload.dto';

@ApiTags('files')
@Controller('files')
export class FileUploadController {
  private readonly logger = new Logger(FileUploadController.name);
  private readonly filesDir = process.env.IS_CONTAINERIZED == 'true' 
    ? '/config/files' 
    : path.join(homedir(), '.iris', 'files');

  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('upload')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Upload a file',
    description: 'Upload a file for later processing. The system stores the file and provides a unique identifier for future reference.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File upload',
    type: FileUploadDto,
  })
  @ApiResponse({
    status: 200,
    description: 'File uploaded successfully',
    type: FileUploadResponseDto,
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadDir = process.env.IS_CONTAINERIZED == 'true' 
            ? '/config/files' 
            : path.join(homedir(), '.iris', 'files');
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          // Create a unique filename with timestamp
          const timestamp = Date.now();
          const originalName = path.parse(file.originalname).name;
          const extension = path.parse(file.originalname).ext;
          cb(null, `${originalName}-${timestamp}${extension}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Reject video files and large objects
        const invalidMimeTypes = [
          'video/mp4',
          'video/mpeg',
          'video/quicktime',
          'video/x-msvideo',
          'video/webm',
        ];
        
        if (invalidMimeTypes.includes(file.mimetype)) {
          return cb(new BadRequestException('Video files are not supported.'), false);
        }
        
        // Set a reasonable size limit in the controller as well (10MB)
        const sizeLimitInBytes = 10 * 1024 * 1024;
        if (parseInt(req.headers['content-length']) > sizeLimitInBytes) {
          return cb(new BadRequestException('File size exceeds the 10MB limit.'), false);
        }
        
        cb(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<FileUploadResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      return await this.fileUploadService.processUploadedFile(file);
    } catch (error) {
      this.logger.error(`Error uploading file: ${error.message}`, error.stack);
      throw new BadRequestException(`Error uploading file: ${error.message}`);
    }
  }

  @Get()
  @ApiOperation({ summary: 'List all uploaded files' })
  @ApiResponse({
    status: 200,
    description: 'List of files',
    type: [FileInfoDto],
  })
  async listFiles(): Promise<FileInfoDto[]> {
    try {
      return await this.fileUploadService.listAllFiles();
    } catch (error) {
      this.logger.error(`Error listing files: ${error.message}`, error.stack);
      throw new BadRequestException('Error listing files');
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get information about a specific file' })
  @ApiParam({
    name: 'id',
    description: 'File ID',
    example: '1682598432741',
  })
  @ApiResponse({
    status: 200,
    description: 'File information',
    type: FileInfoDto,
  })
  async getFileInfo(@Param('id') id: string): Promise<FileInfoDto> {
    try {
      return await this.fileUploadService.getFileInfo(id);
    } catch (error) {
      this.logger.error(`Error retrieving file info: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error retrieving file information');
    }
  }

  @Get('download/:filename')
  @ApiOperation({ summary: 'Download a file' })
  @ApiParam({
    name: 'filename',
    description: 'Filename',
    example: 'document-1682598432741.pdf',
  })
  @ApiResponse({
    status: 200,
    description: 'File download',
  })
  async downloadFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = path.join(this.filesDir, filename);
    
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`File ${filename} not found`);
    }
    
    try {
      const stat = fs.statSync(filePath);
      const fileSize = stat.size;
      const mimeType = this.getMimeType(filePath);
      
      res.setHeader('Content-Length', fileSize);
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      this.logger.error(`Error downloading file: ${error.message}`, error.stack);
      throw new BadRequestException('Error downloading file');
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a file' })
  @ApiParam({
    name: 'id',
    description: 'File ID',
    example: '1682598432741',
  })
  @ApiResponse({
    status: 200,
    description: 'File deleted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  async deleteFile(@Param('id') id: string): Promise<{ success: boolean; message: string }> {
    try {
      return await this.fileUploadService.deleteFile(id);
    } catch (error) {
      this.logger.error(`Error deleting file: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error deleting file');
    }
  }

  /**
   * Get MIME type based on file extension
   */
  private getMimeType(filePath: string): string {
    const extension = path.extname(filePath).toLowerCase();
    
    const mimeTypes = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg', 
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.txt': 'text/plain',
      '.csv': 'text/csv',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.json': 'application/json',
    };
    
    return mimeTypes[extension] || 'application/octet-stream';
  }
}