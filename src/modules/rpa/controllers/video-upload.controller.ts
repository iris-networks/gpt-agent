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
  Body,
  HttpStatus,
  HttpCode,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiResponse } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { homedir } from 'os';
import { Response } from 'express';
import { VideoProcessorService } from '../services/video-processor.service';
import { GeminiAnalyzerService } from '../services/gemini-analyzer.service';
import { RpaStepsDto, VideoAnalysisResponseDto, VideoUploadDto } from '../dto/video-upload.dto';
import { RpaService } from '../services/rpa.service';

@ApiTags('video')
@Controller('video')
export class VideoUploadController {
  private readonly logger = new Logger(VideoUploadController.name);
  private readonly uploadDir = path.join(homedir(), '.iris', 'uploads');

  constructor(
    private readonly videoProcessorService: VideoProcessorService,
    private readonly geminiAnalyzerService: GeminiAnalyzerService,
    private readonly rpaService: RpaService,
  ) {
    // Ensure .iris and uploads directory exists
    const irisDir = path.join(homedir(), '.iris');
    if (!fs.existsSync(irisDir)) {
      fs.mkdirSync(irisDir, { recursive: true });
    }
    
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  @Post('upload')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Upload a video for RPA analysis',
    description: 'Upload a video recording of any task to automatically generate RPA workflows. The system learns from visual demonstration by analyzing screen recordings through computer vision. It identifies and extracts patterns of interaction including mouse movements, clicks, typing actions, and navigation sequences, converting them directly into executable automation without requiring manual scripting or programming.'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Video file upload',
    type: VideoUploadDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Video uploaded and processing started',
    type: VideoAnalysisResponseDto,
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadDir = path.join(homedir(), '.iris');
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
        // Accept only video files
        const validMimeTypes = ['video/mp4', 'video/webm', 'video/avi'];
        if (validMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Invalid file type. Only MP4, WebM, and AVI videos are allowed.'), false);
        }
      },
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
      },
    }),
  )
  async uploadVideo(@UploadedFile() file: Express.Multer.File): Promise<VideoAnalysisResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      this.logger.log(`Video uploaded: ${file.filename} (${file.size} bytes)`);
      
      // Process the video to remove idle parts
      const processedVideoPath = await this.videoProcessorService.processVideo(file.path);
      
      // Generate RPA steps using Gemini
      const rpaSteps = await this.geminiAnalyzerService.generateRPASteps(processedVideoPath);
      
      // Create a unique ID for this analysis
      const analysisId = Date.now().toString();
      
      // Store the results
      const resultsPath = path.join(this.uploadDir, `analysis-${analysisId}.json`);
      const results = {
        originalVideo: file.path,
        processedVideo: processedVideoPath,
        rpaSteps: rpaSteps,
        timestamp: new Date().toISOString(),
      };
      
      fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
      
      return {
        analysisId,
        originalVideo: path.basename(file.path),
        processedVideo: path.basename(processedVideoPath),
        message: 'Video uploaded and analyzed successfully',
      };
    } catch (error) {
      this.logger.error(`Error processing video: ${error.message}`, error.stack);
      throw new BadRequestException(`Error processing video: ${error.message}`);
    }
  }

  @Get('analysis/:id')
  @ApiOperation({ summary: 'Get analysis results for a video' })
  @ApiResponse({
    status: 200,
    description: 'Analysis results',
    type: RpaStepsDto,
  })
  async getAnalysisResults(@Param('id') id: string): Promise<RpaStepsDto> {
    const resultsPath = path.join(this.uploadDir, `analysis-${id}.json`);
    
    if (!fs.existsSync(resultsPath)) {
      throw new NotFoundException(`Analysis with ID ${id} not found`);
    }
    
    try {
      const rawData = fs.readFileSync(resultsPath, 'utf8');
      const results = JSON.parse(rawData);
      
      return {
        analysisId: id,
        rpaSteps: results.rpaSteps,
        processedVideoUrl: `/api/video/processed/${path.basename(results.processedVideo)}`,
        originalVideoUrl: `/api/video/original/${path.basename(results.originalVideo)}`,
      };
    } catch (error) {
      this.logger.error(`Error retrieving analysis results: ${error.message}`, error.stack);
      throw new BadRequestException('Error retrieving analysis results');
    }
  }

  @Post('execute/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Execute RPA steps from video analysis',
    description: 'Executes automation steps extracted from video analysis. This endpoint enables the system to perform actions it learned through visual observation. Using a reasoning-based approach, the automation adapts to dynamic UI elements and handles environmental variations while following the core workflow pattern. This creates resilient processes that maintain functionality even when the target system has minor visual or layout changes.'
  })
  @ApiResponse({
    status: 200,
    description: 'Execution started',
  })
  async executeRpaSteps(@Param('id') id: string, @Body() body: { sessionId: string }): Promise<{ message: string }> {
    if (!body.sessionId) {
      throw new BadRequestException('sessionId is required');
    }
    
    const resultsPath = path.join(this.uploadDir, `analysis-${id}.json`);
    
    if (!fs.existsSync(resultsPath)) {
      throw new NotFoundException(`Analysis with ID ${id} not found`);
    }
    
    try {
      const rawData = fs.readFileSync(resultsPath, 'utf8');
      const results = JSON.parse(rawData);
      
      // Send the RPA steps to the reAct agent via the RPA service
      await this.rpaService.executeRPASteps(body.sessionId, results.rpaSteps);
      
      return {
        message: 'RPA execution started successfully',
      };
    } catch (error) {
      this.logger.error(`Error executing RPA steps: ${error.message}`, error.stack);
      throw new BadRequestException('Error executing RPA steps');
    }
  }
  
  @Get('processed/:filename')
  streamProcessedVideo(@Param('filename') filename: string, @Res() res: Response) {
    const videoPath = path.join(this.uploadDir, 'processed', filename);
    this.streamVideo(videoPath, res);
  }

  @Get('original/:filename')
  streamOriginalVideo(@Param('filename') filename: string, @Res() res: Response) {
    const videoPath = path.join(this.uploadDir, filename);
    this.streamVideo(videoPath, res);
  }

  private streamVideo(videoPath: string, res: Response) {
    // Check if file exists
    if (!fs.existsSync(videoPath)) {
      return res.status(404).send('Video not found');
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = res.req.headers.range;

    // Handle range requests (for video seeking)
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      });
      
      file.pipe(res);
    } else {
      // For non-range requests, serve the whole file
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      });
      
      fs.createReadStream(videoPath).pipe(res);
    }
  }
}