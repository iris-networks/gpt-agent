/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { ApiProperty } from '@nestjs/swagger';

export class FileUploadResponseDto {
  @ApiProperty({
    description: 'Unique ID for the uploaded file',
    example: '1682598432741',
  })
  fileId: string;

  @ApiProperty({
    description: 'The filename with timestamp',
    example: 'document-1682598432741.pdf',
  })
  fileName: string;

  @ApiProperty({
    description: 'Original filename without timestamp',
    example: 'document.pdf',
  })
  originalName: string;

  @ApiProperty({
    description: 'The full file path',
    example: '/Users/username/.iris/files/document-1682598432741.pdf',
  })
  filePath: string;

  @ApiProperty({
    description: 'URL to access the file',
    example: '/api/files/download/document-1682598432741.pdf',
  })
  fileUrl: string;

  @ApiProperty({
    description: 'Size of the file in bytes',
    example: 24560,
  })
  fileSize: number;

  @ApiProperty({
    description: 'MIME type of the file',
    example: 'application/pdf',
  })
  mimeType: string;

  @ApiProperty({
    description: 'Upload status message',
    example: 'File uploaded successfully',
  })
  message: string;
}

export class FileInfoDto {
  @ApiProperty({
    description: 'Unique ID for the file',
    example: '1682598432741',
  })
  fileId: string;

  @ApiProperty({
    description: 'The filename with timestamp',
    example: 'document-1682598432741.pdf',
  })
  fileName: string;

  @ApiProperty({
    description: 'Original filename without timestamp',
    example: 'document.pdf',
  })
  originalName: string;

  @ApiProperty({
    description: 'The full file path',
    example: '/Users/username/.iris/files/document-1682598432741.pdf',
  })
  filePath: string;

  @ApiProperty({
    description: 'URL to access the file',
    example: '/api/files/download/document-1682598432741.pdf',
  })
  fileUrl: string;

  @ApiProperty({
    description: 'Size of the file in bytes',
    example: 24560,
  })
  fileSize: number;

  @ApiProperty({
    description: 'MIME type of the file',
    example: 'application/pdf',
  })
  mimeType: string;

  @ApiProperty({
    description: 'File upload date',
    example: '2023-04-27T14:00:32.741Z',
  })
  uploadDate: string;
}

export class FileUploadDto {
  @ApiProperty({
    description: 'File to upload',
    type: 'string',
    format: 'binary',
    required: true,
  })
  file: Express.Multer.File;
}