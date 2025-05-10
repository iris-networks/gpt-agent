/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  NotFoundException,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiBody, 
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiAcceptedResponse
} from '@nestjs/swagger';
import { promises as fs } from 'fs';
import { join } from 'path';
import { VideoStorageService } from '../services/video-storage.service';
import { VideoGeneratorService } from '../services/video-generator.service';
import { sessionLogger } from '@app/common/services/logger.service';

// DTOs for request and response objects
class UpdateCaptionDto {
  caption?: any; // Full caption object with predictionParsed and other data
  text?: string; // For backward compatibility
}

class SuccessResponseDto {
  success: boolean;
}

class FramesAndCaptionsResponseDto {
  success: boolean;
  frames: string[];
  captions: any[];
}

@ApiTags('Video Editing')
@Controller('videos')
export class VideoEditController {
  constructor(
    private readonly videoStorage: VideoStorageService,
    private readonly videoGenerator: VideoGeneratorService,
  ) {
    sessionLogger.info('VideoEditController initialized');
  }

  /**
   * Get frames and captions for a session
   * @param id Recording ID
   */
  @ApiOperation({
    summary: 'Get frames and captions for editing',
    description: 'Returns all frames and their associated captions for a recording to be edited'
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the recording to get frames and captions for',
    required: true
  })
  @ApiOkResponse({
    description: 'Frames and captions retrieved successfully',
    type: FramesAndCaptionsResponseDto
  })
  @ApiNotFoundResponse({ description: 'Recording not found' })
  @Get(':id/frames')
  async getFramesAndCaptions(@Param('id') id: string): Promise<FramesAndCaptionsResponseDto> {
    try {
      // Get frames and captions for the recording
      const frames = await this.videoStorage.getRecordingFrames(id);
      const captions = await this.videoStorage.getRecordingCaptions(id);
      
      return {
        success: true,
        frames,
        captions
      };
    } catch (error) {
      sessionLogger.error(`Error getting frames and captions for recording ${id}:`, error);
      throw new NotFoundException(`Recording with ID ${id} not found or error retrieving data`);
    }
  }

  /**
   * Delete a frame
   * @param id Recording ID
   * @param frameIndex Frame index to delete
   */
  @ApiOperation({
    summary: 'Delete a frame',
    description: 'Deletes a specific frame from a recording and updates captions accordingly'
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the recording',
    required: true
  })
  @ApiParam({
    name: 'frameIndex',
    description: 'The index of the frame to delete',
    required: true
  })
  @ApiOkResponse({
    description: 'Frame deleted successfully',
    type: SuccessResponseDto
  })
  @ApiNotFoundResponse({ description: 'Recording or frame not found' })
  @Delete(':id/frames/:frameIndex')
  async deleteFrame(
    @Param('id') id: string,
    @Param('frameIndex') frameIndex: number,
  ): Promise<SuccessResponseDto> {
    try {
      const recording = await this.videoStorage.getRecording(id);
      const recordingDir = recording.filePath;
      const frameFiles = await this.getFrameFiles(recordingDir);
      
      if (frameIndex >= 0 && frameIndex < frameFiles.length) {
        // Delete the frame file
        await fs.unlink(frameFiles[frameIndex]);
        
        // Update captions.json by removing or adjusting the frameIndex values
        await this.updateCaptionsAfterFrameDeletion(recordingDir, frameIndex);
        
        // Rename subsequent frames to maintain sequence
        await this.renameFramesAfterDeletion(recordingDir, frameIndex);
        
        // Update recording metadata to reflect new frame count
        await this.updateRecordingMetadata(id, frameFiles.length - 1);
        
        return { success: true };
      }
      
      throw new NotFoundException('Frame not found');
    } catch (error) {
      sessionLogger.error(`Error deleting frame ${frameIndex} for recording ${id}:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to delete frame: ${error.message}`);
    }
  }

  /**
   * Update caption for a frame
   * @param id Recording ID
   * @param frameIndex Frame index to update caption for
   * @param updateData New caption text
   */
  @ApiOperation({
    summary: 'Update caption for a frame',
    description: 'Updates the caption text for a specific frame'
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the recording',
    required: true
  })
  @ApiParam({
    name: 'frameIndex',
    description: 'The index of the frame to update caption for',
    required: true
  })
  @ApiBody({
    type: UpdateCaptionDto,
    description: 'New caption text'
  })
  @ApiOkResponse({
    description: 'Caption updated successfully',
    type: SuccessResponseDto
  })
  @ApiNotFoundResponse({ description: 'Recording or caption not found' })
  @Put(':id/captions/:frameIndex')
  async updateCaption(
    @Param('id') id: string,
    @Param('frameIndex') frameIndex: number,
    @Body() updateData: UpdateCaptionDto,
  ): Promise<SuccessResponseDto> {
    try {
      sessionLogger.info(`Updating caption for recording ${id}, frameIndex ${frameIndex}`);
      sessionLogger.debug(`Update data: ${JSON.stringify(updateData, null, 2).substring(0, 300)}...`);
      
      const recording = await this.videoStorage.getRecording(id);
      const recordingDir = recording.filePath;
      const captionsPath = join(recordingDir, 'captions.json');
      
      // Read existing captions
      const captionsContent = await fs.readFile(captionsPath, 'utf8');
      const captions = JSON.parse(captionsContent);
      
      sessionLogger.debug(`Found ${captions.length} captions in file. Looking for frameIndex ${frameIndex}`);
      
      // Find the caption to update
      const captionIndex = captions.findIndex(
        (c) => c.frameIndex === parseInt(frameIndex.toString(), 10)
      );
      
      sessionLogger.debug(`Caption index for frameIndex ${frameIndex}: ${captionIndex}`);
      
      if (captionIndex !== -1) {
        if (updateData.caption) {
          // If a full caption object is provided, use it (but preserve frameIndex)
          const frameIdx = captions[captionIndex].frameIndex;
          captions[captionIndex] = {
            ...updateData.caption,
            frameIndex: frameIdx // Make sure we preserve the original frameIndex
          };
          
          sessionLogger.info(`Updated full caption for frame ${frameIndex} with predictionParsed data`);
        } else if (updateData.text) {
          // Backward compatibility: Just update the text
          captions[captionIndex].conversation.value = updateData.text;
          
          // Update predictionParsed.thought as well if it exists
          if (captions[captionIndex].conversation.predictionParsed?.[0]?.thought) {
            captions[captionIndex].conversation.predictionParsed[0].thought = updateData.text;
          }
          
          sessionLogger.info(`Updated caption text for frame ${frameIndex}`);
        } else {
          throw new BadRequestException('Neither caption object nor text provided');
        }
        
        // Save updated captions
        await fs.writeFile(captionsPath, JSON.stringify(captions, null, 2), 'utf8');
        
        return { success: true };
      }
      
      throw new NotFoundException('Caption not found');
    } catch (error) {
      sessionLogger.error(`Error updating caption for frame ${frameIndex} in recording ${id}:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to update caption: ${error.message}`);
    }
  }

  /**
   * Regenerate video after edits
   * @param id Recording ID
   */
  @ApiOperation({
    summary: 'Regenerate video after edits',
    description: 'Regenerates the video file after frames or captions have been edited'
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the recording to regenerate video for',
    required: true
  })
  @ApiCreatedResponse({
    description: 'Video regeneration initiated successfully',
    type: SuccessResponseDto
  })
  @ApiNotFoundResponse({ description: 'Recording not found' })
  @Post(':id/regenerate')
  @HttpCode(HttpStatus.CREATED)
  async regenerateVideo(@Param('id') id: string): Promise<SuccessResponseDto> {
    try {
      // Use existing video generator service to recreate the video
      await this.videoGenerator.generateVideo(id, {
        captionsEnabled: true,
        format: 'mp4',
        quality: 'medium',
      });
      
      return { success: true };
    } catch (error) {
      sessionLogger.error(`Error regenerating video for recording ${id}:`, error);
      throw new BadRequestException(`Failed to regenerate video: ${error.message}`);
    }
  }

  /**
   * Helper method to get frame files sorted by index
   * @param recordingDir Path to the recording directory
   * @private
   */
  private async getFrameFiles(recordingDir: string): Promise<string[]> {
    const files = await fs.readdir(recordingDir);
    return files
      .filter(file => file.startsWith('frame_') && file.endsWith('.png'))
      .sort()
      .map(file => join(recordingDir, file));
  }

  /**
   * Helper method to update captions after frame deletion
   * @param recordingDir Path to the recording directory
   * @param deletedFrameIndex Index of the deleted frame
   * @private
   */
  private async updateCaptionsAfterFrameDeletion(
    recordingDir: string,
    deletedFrameIndex: number,
  ): Promise<void> {
    const captionsPath = join(recordingDir, 'captions.json');
    const captionsContent = await fs.readFile(captionsPath, 'utf8');
    const captions = JSON.parse(captionsContent);
    
    // Find captions with the deleted frameIndex and remove them
    const updatedCaptions = captions.filter(
      (caption) => caption.frameIndex !== deletedFrameIndex
    );
    
    // Update frameIndex values for captions after the deleted frame
    updatedCaptions.forEach((caption) => {
      if (caption.frameIndex > deletedFrameIndex) {
        caption.frameIndex -= 1;
      }
    });
    
    // Save updated captions
    await fs.writeFile(captionsPath, JSON.stringify(updatedCaptions, null, 2), 'utf8');
  }

  /**
   * Helper method to rename frames after deletion to maintain sequence
   * @param recordingDir Path to the recording directory
   * @param deletedFrameIndex Index of the deleted frame
   * @private
   */
  private async renameFramesAfterDeletion(
    recordingDir: string,
    deletedFrameIndex: number,
  ): Promise<void> {
    const frameFiles = await this.getFrameFiles(recordingDir);
    
    // Only process files after the deleted frame
    for (let i = deletedFrameIndex + 1; i < frameFiles.length; i++) {
      const currentPath = frameFiles[i];
      const newFrameIndex = i - 1;
      const newFileName = `frame_${String(newFrameIndex).padStart(6, '0')}.png`;
      const newPath = join(recordingDir, newFileName);
      
      await fs.rename(currentPath, newPath);
    }
  }

  /**
   * Helper method to update recording metadata after frame changes
   * @param recordingId Recording ID
   * @param newFrameCount New frame count
   * @private
   */
  private async updateRecordingMetadata(
    recordingId: string,
    newFrameCount: number,
  ): Promise<void> {
    try {
      const recording = await this.videoStorage.getRecording(recordingId);
      
      // Update frame count and duration
      const updatedRecording = {
        ...recording,
        frameCount: newFrameCount,
        duration: newFrameCount * 1000, // Estimate 1 second per frame
        videoGenerationStatus: null, // Reset so video will be regenerated on access
        hasVideo: false // Reset so video will be regenerated on access
      };
      
      // Save updated metadata
      const metadataPath = join(recording.filePath, '..', 'metadata', `${recordingId}.json`);
      await fs.writeFile(metadataPath, JSON.stringify(updatedRecording), 'utf8');
      
      sessionLogger.info(`Updated recording metadata for ${recordingId} with new frame count: ${newFrameCount}`);
    } catch (error) {
      sessionLogger.error(`Error updating recording metadata for ${recordingId}:`, error);
      throw error;
    }
  }
}