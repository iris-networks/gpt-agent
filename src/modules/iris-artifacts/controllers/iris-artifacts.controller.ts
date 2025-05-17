import { Controller, Get, Query, Param, Res, HttpStatus, UseInterceptors, StreamableFile } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { IrisArtifactsService } from '../services/iris-artifacts.service';
import { ArtifactsContentDto, ListArtifactsDto } from '../dto/iris-artifacts.dto';

@ApiTags('iris-artifacts')
@Controller('api/iris-artifacts')
export class IrisArtifactsController {
  constructor(private readonly irisArtifactsService: IrisArtifactsService) {}

  @Get('list')
  @ApiOperation({ summary: 'List artifacts in a directory within the .iris folder' })
  @ApiQuery({ name: 'path', required: false, description: 'Path relative to .iris folder' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Artifacts retrieved successfully', type: ArtifactsContentDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Directory not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid path requested' })
  async listArtifacts(@Query() query: ListArtifactsDto): Promise<ArtifactsContentDto> {
    return this.irisArtifactsService.listArtifacts(query.path || '');
  }

  @Get('download/file/:path(*)')
  @ApiOperation({ summary: 'Download a file artifact from the .iris folder' })
  @ApiParam({ name: 'path', description: 'Path to the file relative to .iris folder' })
  @ApiResponse({ status: HttpStatus.OK, description: 'File downloaded successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'File not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid path or not a file' })
  async downloadArtifactFile(
    @Param('path') filePath: string,
    @Res() res: Response
  ): Promise<void> {
    return this.irisArtifactsService.downloadArtifactFile(filePath, res);
  }

  @Get('download/folder/:path(*)')
  @ApiOperation({ summary: 'Download a directory of artifacts as a zip file' })
  @ApiParam({ name: 'path', description: 'Path to the directory relative to .iris folder' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Directory downloaded as zip successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Directory not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid path or not a directory' })
  async downloadArtifactFolder(
    @Param('path') folderPath: string,
    @Res() res: Response
  ): Promise<void> {
    return this.irisArtifactsService.downloadArtifactFolder(folderPath, res);
  }
}