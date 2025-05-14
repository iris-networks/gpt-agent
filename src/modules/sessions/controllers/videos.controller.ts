/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Res,
  Body,
  Query,
  NotFoundException,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiBody, 
  ApiQuery,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiAcceptedResponse,
  ApiProduces
} from '@nestjs/swagger';
import { VideoStorageService } from '../services/video-storage.service';
import { SessionManagerService } from '../services/session-manager.service';
import { SessionScreenshotsService } from '../services/session-screenshots.service';
import { VideoGeneratorService } from '../services/video-generator.service';
import { VideoRecordingDto, VideoGenerationStatus } from '@app/shared/dto';
import { sessionLogger } from '@app/common/services/logger.service';
import { createReadStream } from 'fs';
import { basename, extname } from 'path';
import {
  GenerateVideoDto,
  GenerateVideoResponseDto,
  VideoStatusResponseDto,
  VideoStreamInProgressResponseDto,
  VideoStreamFailedResponseDto,
  RecordingListResponseDto,
  RecordingResponseDto,
  SaveSessionRecordingResponseDto,
  CurrentSessionVideoDataResponseDto,
  DeleteRecordingResponseDto
} from '../dto/videos.dto';
import { SessionReplayDataResponseDto } from '../dto/replay.dto';

@ApiTags('Videos')
@Controller('videos')
export class VideosController {
  constructor(
    private readonly videoStorage: VideoStorageService,
    private readonly sessionManager: SessionManagerService,
    private readonly screenshotsService: SessionScreenshotsService,
    private readonly videoGenerator: VideoGeneratorService
  ) {}

  /**
   * Get list of all recordings
   */
  @ApiOperation({ 
    summary: 'List all recordings', 
    description: 'Returns a list of all video recordings available in the system'
  })
  @ApiOkResponse({ 
    description: 'List of all recordings',
    type: RecordingListResponseDto
  })
  @Get()
  async listRecordings(): Promise<RecordingListResponseDto> {
    const recordings = await this.videoStorage.listRecordings();
    return { recordings };
  }

  /**
   * Get recording metadata by ID
   */
  @ApiOperation({ 
    summary: 'Get recording metadata', 
    description: 'Returns detailed metadata about a specific recording'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'The ID of the recording to retrieve',
    required: true
  })
  @ApiOkResponse({ 
    description: 'Recording metadata retrieved successfully', 
    type: RecordingResponseDto
  })
  @ApiNotFoundResponse({ description: 'Recording not found' })
  @Get(':id')
  async getRecordingMetadata(@Param('id') id: string): Promise<RecordingResponseDto> {
    try {
      const recording = await this.videoStorage.getRecording(id);
      return { success: true, recording };
    } catch (error) {
      sessionLogger.error(`Error getting recording ${id}:`, error);
      throw new NotFoundException(`Recording with ID ${id} not found`);
    }
  }
  
  /**
   * Get video generation status
   */
  @ApiOperation({
    summary: 'Get video generation status',
    description: 'Returns the current status of video generation for a recording. ' +
      'This endpoint provides detailed information about the video generation process, ' +
      'including whether it is pending, in progress, completed, or failed. ' +
      'Additional information is provided based on the status, such as start time, ' +
      'completion time, file format, size, and error messages if applicable.'
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the recording to check video status for',
    required: true
  })
  @ApiOkResponse({
    description: 'Video generation status information',
    type: VideoStatusResponseDto
  })
  @ApiNotFoundResponse({ description: 'Recording not found' })
  @Get(':id/video-status')
  async getVideoStatus(@Param('id') id: string): Promise<VideoStatusResponseDto> {
    try {
      const recording = await this.videoStorage.getRecording(id);
      
      // Default status information
      const statusInfo: VideoStatusResponseDto = {
        recordingId: id,
        hasVideo: !!recording.hasVideo,
        status: recording.videoGenerationStatus || VideoGenerationStatus.PENDING,
        message: 'Video generation has not started yet'
      };
      
      // Add additional information based on status
      if (recording.videoGenerationStatus === VideoGenerationStatus.IN_PROGRESS) {
        statusInfo.startedAt = recording.videoGenerationStartedAt;
        statusInfo.message = 'Video generation is in progress';
        statusInfo.elapsedSeconds = recording.videoGenerationStartedAt
          ? Math.round((Date.now() - recording.videoGenerationStartedAt) / 1000)
          : 0;
      } else if (recording.videoGenerationStatus === VideoGenerationStatus.COMPLETED) {
        statusInfo.completedAt = recording.videoGenerationCompletedAt;
        statusInfo.format = recording.videoFormat;
        statusInfo.sizeMB = recording.videoSize 
          ? Math.round(recording.videoSize / (1024 * 1024) * 100) / 100
          : 0;
        statusInfo.message = 'Video generation is complete';
      } else if (recording.videoGenerationStatus === VideoGenerationStatus.FAILED) {
        statusInfo.error = recording.videoGenerationError;
        statusInfo.message = 'Video generation failed';
      }
      
      return statusInfo;
    } catch (error) {
      sessionLogger.error(`Error getting video status for recording ${id}:`, error);
      throw new NotFoundException(`Recording with ID ${id} not found`);
    }
  }

  /**
   * Get recording thumbnail by ID
   */
  @ApiOperation({
    summary: 'Get recording thumbnail',
    description: 'Returns the thumbnail image for a recording as a PNG file. ' +
      'This is typically the first frame of the recording.'
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the recording to get the thumbnail for',
    required: true
  })
  @ApiOkResponse({
    description: 'Thumbnail image returned successfully',
    content: {
      'image/png': {
        schema: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Thumbnail not found' })
  @ApiProduces('image/png')
  @Get(':id/thumbnail')
  async getRecordingThumbnail(@Param('id') id: string, @Res() response: Response) {
    try {
      const thumbnail = await this.videoStorage.getRecordingThumbnail(id);
      const imgBuffer = Buffer.from(thumbnail, 'base64');
      
      response.set({
        'Content-Type': 'image/png',
        'Content-Length': imgBuffer.length,
      });
      
      return response.send(imgBuffer);
    } catch (error) {
      sessionLogger.error(`Error getting thumbnail for recording ${id}:`, error);
      throw new NotFoundException(`Thumbnail for recording ${id} not found`);
    }
  }

  /**
   * Save current session as a recording
   */
  @ApiOperation({
    summary: 'Save current session as a recording',
    description: 'Saves the current active session as a video recording. ' +
      'This endpoint captures all screenshots collected during the session, ' +
      'stores them on disk, and initiates automatic video generation in the background. ' +
      'The video generation process happens asynchronously and can be monitored via the video-status endpoint. ' +
      'This recording captures both visual states and action contexts, creating a complete task record ' +
      'that can be analyzed, modified, or transformed into reusable automation workflows.'
  })
  @ApiCreatedResponse({
    description: 'Session saved as recording successfully',
    type: SaveSessionRecordingResponseDto
  })
  @ApiBadRequestResponse({ description: 'Error saving session or no active session found' })
  @Post('save-current-session')
  @HttpCode(HttpStatus.CREATED)
  async saveCurrentSession(): Promise<SaveSessionRecordingResponseDto> {
    try {
      const recording = await this.sessionManager.saveSessionRecording();
      return { 
        success: true, 
        recording 
      };
    } catch (error) {
      sessionLogger.error('Error saving session recording:', error);
      throw new BadRequestException(error.message || 'Failed to save recording');
    }
  }

  /**
   * Get video data for current session
   */
  @ApiOperation({
    summary: 'Get video data for current session',
    description: 'Returns the raw frames and captions for the current active session. ' +
      'This endpoint is primarily used for diagnostic purposes or custom video processing. ' +
      'Most clients should use the generated video file instead of raw frames.'
  })
  @ApiOkResponse({
    description: 'Video data retrieved successfully',
    type: CurrentSessionVideoDataResponseDto
  })
  @ApiBadRequestResponse({ description: 'Error retrieving video data or no active session found' })
  @Get('current-session/video-data')
  async getCurrentSessionVideoData(): Promise<CurrentSessionVideoDataResponseDto> {
    try {
      const videoData = await this.sessionManager.getSessionVideoData();

      // Transform the response to use our DTOs
      return {
        success: true,
        videoData: {
          frames: videoData.frames,
          captions: videoData.captions.map(caption => ({
            timestamp: caption.timestamp,
            conversation: caption.conversation,
            frameIndex: caption.frameIndex
          }))
        }
      };
    } catch (error) {
      sessionLogger.error('Error getting current session video data:', error);
      throw new BadRequestException(error.message || 'Failed to get video data');
    }
  }

  /**
   * Get video data for a specific recording
   */
  @ApiOperation({
    summary: 'Get video data for a specific recording',
    description: 'Returns the raw frames and captions for a specific recording. ' +
      'This endpoint is primarily used for replaying recordings in the UI.'
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the recording to get video data for',
    required: true
  })
  @ApiOkResponse({
    description: 'Video data retrieved successfully',
    type: SessionReplayDataResponseDto
  })
  @ApiNotFoundResponse({ description: 'Recording not found' })
  @Get(':id/video-data')
  async getRecordingVideoData(@Param('id') id: string): Promise<SessionReplayDataResponseDto> {
    try {
      // Get frames and captions for the recording
      const frames = await this.videoStorage.getRecordingFrames(id);
      const captions = await this.videoStorage.getRecordingCaptions(id);

      // Transform the response to use our DTOs
      return {
        success: true,
        replayData: {
          frames,
          captions: captions.map(caption => ({
            timestamp: caption.timestamp,
            conversation: caption.conversation,
            frameIndex: caption.frameIndex
          }))
        }
      };
    } catch (error) {
      sessionLogger.error(`Error getting video data for recording ${id}:`, error);
      throw new NotFoundException(`Recording with ID ${id} not found or error retrieving data`);
    }
  }

  /**
   * Download recording as ZIP file
   */
  @ApiOperation({
    summary: 'Download recording as ZIP file',
    description: 'Downloads a recording as a ZIP archive containing all frames, captions, and metadata. ' +
      'This is useful for backup purposes or offline processing. ' +
      'For normal video playback, use the video endpoint instead.'
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the recording to download',
    required: true
  })
  @ApiOkResponse({
    description: 'ZIP file returned successfully',
    content: {
      'application/zip': {
        schema: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Recording not found' })
  @ApiProduces('application/zip')
  @Get(':id/download')
  async downloadRecording(@Param('id') id: string, @Res() response: Response) {
    try {
      const recording = await this.videoStorage.getRecording(id);
      const zipPath = await this.videoStorage.createRecordingZip(id);
      
      response.set({
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${recording.title || 'recording'}.zip"`,
      });
      
      const fileStream = createReadStream(zipPath);
      fileStream.pipe(response);
      
      // Cleanup happens in the VideoStorageService
    } catch (error) {
      sessionLogger.error(`Error downloading recording ${id}:`, error);
      throw new NotFoundException(`Recording with ID ${id} not found or error creating download`);
    }
  }
  
  /**
   * Generate a video from the recording frames
   */
  @ApiOperation({ 
    summary: 'Generate a video from the recording frames', 
    description: 'Creates a video file from the frames of a recording with customizable options. ' +
      'This endpoint allows you to specify frame rate, caption settings, output format, and quality level. ' +
      'By default, videos play at 0.2 frames per second (5 seconds per frame) to allow time to read the captions. ' +
      'Videos are generated asynchronously, and you can check the status using the video-status endpoint. ' +
      'Note that videos are also generated automatically when a recording is created, so this endpoint ' +
      'is mostly useful for regenerating with different settings. ' +
      'The generated video will have the correct duration with each screenshot displayed for the specified amount of time.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'The ID of the recording to generate a video for',
    required: true
  })
  @ApiBody({ 
    type: GenerateVideoDto, 
    description: 'Options for video generation',
    required: false
  })
  @ApiCreatedResponse({ 
    description: 'Video generation initiated or completed successfully', 
    type: GenerateVideoResponseDto
  })
  @ApiNotFoundResponse({ description: 'Recording not found' })
  @ApiBadRequestResponse({ description: 'Invalid options or error during video generation' })
  @Post(':id/generate-video')
  @HttpCode(HttpStatus.CREATED)
  async generateVideo(
    @Param('id') id: string,
    @Body() options: GenerateVideoDto = {}
  ): Promise<GenerateVideoResponseDto> {
    try {
      const videoPath = await this.videoGenerator.generateVideo(id, options);
      const recording = await this.videoStorage.getRecording(id);
      
      return {
        success: true,
        recording,
        videoPath
      };
    } catch (error) {
      sessionLogger.error(`Error generating video for recording ${id}:`, error);
      throw new BadRequestException(error.message || 'Failed to generate video');
    }
  }
  
  /**
   * Stream the generated video file
   */
  @ApiOperation({
    summary: 'Stream the generated video file',
    description: 'Streams the generated video file for a recording. ' +
      'This endpoint can be used directly in video players, such as in an HTML5 video tag. ' +
      'By default, videos play at 0.2 frames per second (5 seconds per frame) to allow time to read the captions. ' +
      'If the video has not been generated yet, it will attempt to generate it on-demand. ' +
      'If generation is already in progress, it returns a status update instead of the video. ' +
      'The endpoint supports both streaming (default) and download modes. ' +
      'The video duration will be correctly calculated based on the frame rate and number of screenshots.'
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the recording to stream video for',
    required: true
  })
  @ApiQuery({
    name: 'download',
    description: 'Set to "true" to download the video instead of streaming it',
    required: false,
    type: Boolean
  })
  @ApiOkResponse({
    description: 'Video file streamed successfully',
    content: {
      'video/mp4': {
        schema: {
          type: 'string',
          format: 'binary'
        }
      },
      'video/webm': {
        schema: {
          type: 'string',
          format: 'binary'
        }
      },
      'image/gif': {
        schema: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  @ApiAcceptedResponse({
    description: 'Video generation is in progress',
    type: VideoStreamInProgressResponseDto
  })
  @ApiResponse({
    status: 500,
    description: 'Video generation failed',
    type: VideoStreamFailedResponseDto
  })
  @ApiNotFoundResponse({ description: 'Recording not found or video file not found' })
  @ApiProduces('video/mp4', 'video/webm', 'image/gif')
  @Get(':id/video')
  async streamVideo(
    @Param('id') id: string,
    @Res() response: Response,
    @Query('download') download?: string
  ) {
    try {
      let recording = await this.videoStorage.getRecording(id);
      
      // Check if video generation is still in progress
      if (recording.videoGenerationStatus === VideoGenerationStatus.IN_PROGRESS) {
        return response.status(202).json({
          status: 'in_progress',
          message: 'Video generation is in progress. Please try again later.',
          startedAt: recording.videoGenerationStartedAt
        });
      }
      
      // Check if video generation failed
      if (recording.videoGenerationStatus === VideoGenerationStatus.FAILED) {
        return response.status(500).json({
          status: 'failed',
          message: 'Video generation failed.',
          error: recording.videoGenerationError || 'Unknown error'
        });
      }
      
      // Check if video is ready
      if (!recording.hasVideo || !recording.videoPath) {
        // If video was never generated or status is still PENDING, try to generate it now
        if (recording.videoGenerationStatus !== VideoGenerationStatus.COMPLETED) {
          try {
            // Trigger video generation
            await this.videoGenerator.generateVideo(id);
            
            // Get updated recording
            const updatedRecording = await this.videoStorage.getRecording(id);
            
            // If still not ready, tell client it's in progress
            if (!updatedRecording.hasVideo || !updatedRecording.videoPath) {
              return response.status(202).json({
                status: 'in_progress',
                message: 'Video generation has been started. Please try again later.',
                startedAt: updatedRecording.videoGenerationStartedAt
              });
            }
            
            // Otherwise continue with the updated recording
            recording = updatedRecording;
          } catch (error) {
            return response.status(500).json({
              status: 'failed',
              message: 'Failed to generate video.',
              error: error.message || 'Unknown error'
            });
          }
        } else {
          throw new NotFoundException('No video file found for this recording.');
        }
      }
      
      // Set content type based on video format
      const contentType = recording.videoFormat === 'mp4' 
        ? 'video/mp4' 
        : recording.videoFormat === 'webm' 
          ? 'video/webm' 
          : 'image/gif';
      
      // Set headers
      const headers: Record<string, string> = {
        'Content-Type': contentType,
      };
      
      // If download parameter is provided, set Content-Disposition to attachment
      if (download === 'true') {
        const filename = `${recording.title || 'recording'}.${recording.videoFormat}`;
        headers['Content-Disposition'] = `attachment; filename="${filename}"`;
      } else {
        headers['Content-Disposition'] = 'inline';
      }
      
      response.set(headers);
      
      // Stream the file
      const fileStream = createReadStream(recording.videoPath);
      fileStream.pipe(response);
    } catch (error) {
      sessionLogger.error(`Error streaming video for recording ${id}:`, error);
      
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new NotFoundException('Video file not found or error streaming video');
    }
  }

  /**
   * Delete recording by ID
   */
  @ApiOperation({
    summary: 'Delete recording by ID',
    description: 'Permanently deletes a recording and all associated files. ' +
      'This operation cannot be undone. ' +
      'It removes all frames, captions, metadata, and the generated video file.'
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the recording to delete',
    required: true
  })
  @ApiOkResponse({
    description: 'Recording deleted successfully',
    type: DeleteRecordingResponseDto
  })
  @ApiNotFoundResponse({ description: 'Recording not found or could not be deleted' })
  @Delete(':id')
  async deleteRecording(@Param('id') id: string): Promise<DeleteRecordingResponseDto> {
    try {
      const success = await this.videoStorage.deleteRecording(id);
      
      if (!success) {
        throw new NotFoundException(`Recording with ID ${id} not found or could not be deleted`);
      }
      
      return { success: true };
    } catch (error) {
      sessionLogger.error(`Error deleting recording ${id}:`, error);
      throw new NotFoundException(`Recording with ID ${id} not found or could not be deleted`);
    }
  }
}