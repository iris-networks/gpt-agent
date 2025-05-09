/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  NotFoundException,
  Logger,
  Query,
  HttpStatus,
  HttpCode,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { MinioStorageService } from '../services/minio-storage.service';
import { 
  FileUploadDto, 
  FileUploadResponseDto, 
  FileListResponseDto,
  DeleteFileResponseDto 
} from '../dto/file-upload.dto';

@ApiTags('files')
@Controller('files')
export class FileUploadController {
  private readonly logger = new Logger(FileUploadController.name);
  private readonly uploadDir = path.join(process.cwd(), 'uploads', 'temp');

  constructor(private readonly minioStorageService: MinioStorageService) {
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  @Post('upload')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upload a file to storage' })
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
          cb(null, path.join(process.cwd(), 'uploads', 'temp'));
        },
        filename: (req, file, cb) => {
          // Create a unique filename with timestamp
          const timestamp = Date.now();
          const originalName = path.parse(file.originalname).name;
          const extension = path.parse(file.originalname).ext;
          cb(null, `${originalName}-${timestamp}${extension}`);
        },
      }),
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('bucket') bucket = 'uploads',
    @Query('filename') customFilename?: string,
  ): Promise<FileUploadResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      this.logger.log(`File uploaded to temp: ${file.filename} (${file.size} bytes)`);
      
      // Use custom filename if provided
      const objectName = customFilename || file.filename;
      
      // Upload to Minio storage
      const fileUrl = await this.minioStorageService.uploadFile(bucket, objectName, file.path);
      
      // Clean up temporary file
      fs.unlinkSync(file.path);
      
      return {
        fileId: uuidv4(),
        filename: objectName,
        fileUrl,
        size: file.size,
        contentType: file.mimetype,
        message: 'File uploaded successfully',
      };
    } catch (error) {
      this.logger.error(`Error uploading file: ${error.message}`, error.stack);
      
      // Clean up temp file if it exists
      if (file && file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      
      throw new BadRequestException(`Error uploading file: ${error.message}`);
    }
  }

  @Get()
  @ApiOperation({ summary: 'List files in a bucket' })
  @ApiQuery({
    name: 'bucket',
    required: false,
    description: 'Bucket name (defaults to "uploads")',
  })
  @ApiResponse({
    status: 200,
    description: 'List of files',
    type: FileListResponseDto,
  })
  async listFiles(@Query('bucket') bucket = 'uploads'): Promise<FileListResponseDto> {
    try {
      const objectNames = await this.minioStorageService.listObjects(bucket);
      
      // This is a simplified implementation
      // In a real-world scenario, you would store metadata about files
      // and retrieve that information to provide complete file details
      const files = objectNames.map(objectName => ({
        filename: objectName,
        fileUrl: `https://${bucket}.storage.example.com/${objectName}`,
        size: 0, // Would need to fetch this from metadata
        contentType: this.getContentType(objectName),
        uploadedAt: new Date().toISOString(), // Would come from metadata
      }));
      
      return {
        files,
        total: files.length,
        bucket,
      };
    } catch (error) {
      this.logger.error(`Error listing files: ${error.message}`, error.stack);
      throw new BadRequestException(`Error listing files: ${error.message}`);
    }
  }

  @Get(':filename')
  @ApiOperation({ summary: 'Download a file' })
  @ApiQuery({
    name: 'bucket',
    required: false,
    description: 'Bucket name (defaults to "uploads")',
  })
  async downloadFile(
    @Param('filename') filename: string,
    @Query('bucket') bucket = 'uploads',
    @Res() res: Response,
  ): Promise<void> {
    try {
      // Download the file from Minio
      const localFilePath = await this.minioStorageService.downloadFile(bucket, filename);
      
      // Stream the file to the client
      const stat = fs.statSync(localFilePath);
      const fileSize = stat.size;
      const contentType = this.getContentType(filename);
      
      res.setHeader('Content-Length', fileSize);
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      // Create a read stream and pipe it to the response
      const fileStream = fs.createReadStream(localFilePath);
      fileStream.pipe(res);
      
      // Clean up the temp file after sending
      fileStream.on('end', () => {
        fs.unlinkSync(localFilePath);
      });
    } catch (error) {
      this.logger.error(`Error downloading file: ${error.message}`, error.stack);
      
      if (error.message.includes('not found')) {
        throw new NotFoundException(`File ${filename} not found`);
      } else {
        throw new BadRequestException(`Error downloading file: ${error.message}`);
      }
    }
  }

  @Delete(':filename')
  @ApiOperation({ summary: 'Delete a file' })
  @ApiQuery({
    name: 'bucket',
    required: false,
    description: 'Bucket name (defaults to "uploads")',
  })
  @ApiResponse({
    status: 200,
    description: 'File deleted successfully',
    type: DeleteFileResponseDto,
  })
  async deleteFile(
    @Param('filename') filename: string,
    @Query('bucket') bucket = 'uploads',
  ): Promise<DeleteFileResponseDto> {
    try {
      await this.minioStorageService.deleteFile(bucket, filename);
      
      return {
        filename,
        message: 'File deleted successfully',
      };
    } catch (error) {
      this.logger.error(`Error deleting file: ${error.message}`, error.stack);
      
      if (error.message.includes('not found')) {
        throw new NotFoundException(`File ${filename} not found`);
      } else {
        throw new BadRequestException(`Error deleting file: ${error.message}`);
      }
    }
  }

  private getContentType(filename: string): string {
    const extension = path.extname(filename).toLowerCase();
    const contentTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.txt': 'text/plain',
      '.csv': 'text/csv',
      '.html': 'text/html',
      '.htm': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.xml': 'application/xml',
      '.zip': 'application/zip',
      '.mp3': 'audio/mpeg',
      '.mp4': 'video/mp4',
      '.avi': 'video/x-msvideo',
      '.mov': 'video/quicktime',
      '.wmv': 'video/x-ms-wmv',
      '.webm': 'video/webm',
    };
    
    return contentTypes[extension] || 'application/octet-stream';
  }
}