/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class FileUploadDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'File to upload',
  })
  file: any;

  @ApiProperty({
    description: 'Custom filename (optional)',
    required: false,
    example: 'my-document.pdf',
  })
  @IsOptional()
  @IsString()
  filename?: string;

  @ApiProperty({
    description: 'Bucket name (optional, defaults to "uploads")',
    required: false,
    example: 'documents',
  })
  @IsOptional()
  @IsString()
  bucket?: string;
}

export class FileUploadResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the file',
    example: 'c4e17b8b-07c9-4f0a-9f1c-7c94d2057a2d',
  })
  fileId: string;

  @ApiProperty({
    description: 'File name',
    example: 'document-1682598432741.pdf',
  })
  filename: string;

  @ApiProperty({
    description: 'URL to access the file',
    example: 'https://minio.example.com/uploads/document-1682598432741.pdf',
  })
  fileUrl: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 1024567,
  })
  size: number;

  @ApiProperty({
    description: 'MIME type',
    example: 'application/pdf',
  })
  contentType: string;

  @ApiProperty({
    description: 'Status message',
    example: 'File uploaded successfully',
  })
  message: string;
}

export class FileInfoDto {
  @ApiProperty({
    description: 'File name',
    example: 'document-1682598432741.pdf',
  })
  filename: string;

  @ApiProperty({
    description: 'URL to access the file',
    example: 'https://minio.example.com/uploads/document-1682598432741.pdf',
  })
  fileUrl: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 1024567,
  })
  size: number;

  @ApiProperty({
    description: 'MIME type',
    example: 'application/pdf',
  })
  contentType: string;

  @ApiProperty({
    description: 'Upload timestamp',
    example: '2025-05-10T05:40:32.741Z',
  })
  uploadedAt: string;
}

export class FileListResponseDto {
  @ApiProperty({
    description: 'List of files',
    type: [FileInfoDto],
  })
  files: FileInfoDto[];

  @ApiProperty({
    description: 'Total number of files',
    example: 42,
  })
  total: number;

  @ApiProperty({
    description: 'Bucket name',
    example: 'uploads',
  })
  bucket: string;
}

export class DeleteFileResponseDto {
  @ApiProperty({
    description: 'Filename of the deleted file',
    example: 'document-1682598432741.pdf',
  })
  filename: string;

  @ApiProperty({
    description: 'Status message',
    example: 'File deleted successfully',
  })
  message: string;
}