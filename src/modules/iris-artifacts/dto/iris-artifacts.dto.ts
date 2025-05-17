import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ListArtifactsDto {
  @ApiProperty({
    description: 'Path relative to .iris folder (optional)',
    example: 'code/my-project'
  })
  @IsString()
  @IsOptional()
  path?: string;
}

export class ArtifactItemDto {
  @ApiProperty({
    description: 'Name of the file or directory',
    example: 'my-project'
  })
  name: string;

  @ApiProperty({
    description: 'Type of the item (file or directory)',
    enum: ['file', 'directory'],
    example: 'directory'
  })
  type: 'file' | 'directory';

  @ApiProperty({
    description: 'Size of the item in bytes (for files only)',
    example: 1024,
    required: false
  })
  size?: number;

  @ApiProperty({
    description: 'Last modified timestamp',
    example: '2023-05-15T14:30:00.000Z'
  })
  modifiedAt: string;

  @ApiProperty({
    description: 'Full path relative to .iris folder',
    example: 'code/my-project'
  })
  path: string;

  @ApiProperty({
    description: 'File extension (for files only)',
    example: '.js',
    required: false
  })
  extension?: string;
}

export class ArtifactsContentDto {
  @ApiProperty({
    description: 'Current path being listed',
    example: 'code/my-project'
  })
  currentPath: string;

  @ApiProperty({
    description: 'Parent path if available',
    example: 'code',
    required: false
  })
  parentPath?: string;

  @ApiProperty({
    description: 'List of files and directories',
    type: [ArtifactItemDto]
  })
  items: ArtifactItemDto[];
}