/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { join, basename } from 'path';
import { sessionLogger } from '@app/common/services/logger.service';
import { Conversation } from '@ui-tars/shared/types';
import { CaptionDataDto, ProcessedCaptionDto } from '@app/shared/dto';

/**
 * Helper class for processing video captions
 */
export class VideoCaptionHelper {
  /**
   * Load captions from the captions.json file
   * @param recordingDir Path to the recording directory
   */
  public static async loadCaptions(recordingDir: string): Promise<ProcessedCaptionDto[]> {
    try {
      const captionsPath = join(recordingDir, 'captions.json');
      const captionsContent = await fs.readFile(captionsPath, 'utf8');
      const captionsData = JSON.parse(captionsContent);
      
      // Count how many frames we have to compare with caption count
      const frameFiles = await fs.readdir(recordingDir);
      const frameCount = frameFiles.filter(file => file.startsWith('frame_') && file.endsWith('.png')).length;
      
      // Log for debugging
      sessionLogger.debug(`Loading captions: found ${captionsData.length} captions and ${frameCount} frames`);
      
      // Extract caption and action details from conversation data
      const processedCaptions = captionsData.map((caption, index) => {
        let captionText = '';
        let actionType = '';
        let actionDetails = '';
        
        // Use the stored frameIndex if available, otherwise use the array index
        const frameIndex = (caption.frameIndex !== undefined) ? caption.frameIndex : index;
        
        // If the caption doesn't have a frameIndex property, try to add it to the original data
        // This helps ensure the captions.json file has frameIndex for future use
        if (caption.frameIndex === undefined) {
          try {
            // Update the caption object with the frameIndex - this is non-destructive
            caption.frameIndex = index;
          } catch (error) {
            // Ignore errors in case the object is read-only
          }
        }
        
        if (caption.conversation) {
          // Extract thought as the main caption
          if (caption.conversation.value && typeof caption.conversation.value === 'string') {
            const text = caption.conversation.value;
            // Remove the "Thought: " prefix if present
            captionText = text.replace(/^Thought:\s*/i, '');
            // Truncate to keep captions reasonable length
            captionText = captionText.substring(0, 100) + (captionText.length > 100 ? '...' : '');
          }
          
          // Extract action information if available
          if (caption.conversation.predictionParsed && 
              caption.conversation.predictionParsed.length > 0 && 
              caption.conversation.predictionParsed[0].action_type) {
            
            const prediction = caption.conversation.predictionParsed[0];
            actionType = prediction.action_type;
            
            // Format action details based on action type
            if (actionType === 'click' && prediction.action_inputs?.start_coords) {
              const coords = prediction.action_inputs.start_coords;
              actionDetails = `at position (${Math.round(coords[0])}, ${Math.round(coords[1])})`;
            } 
            else if (actionType === 'type' && prediction.action_inputs?.content) {
              actionDetails = `"${prediction.action_inputs.content}"`;
            }
            else if (actionType === 'hotkey' && prediction.action_inputs?.key) {
              actionDetails = `key "${prediction.action_inputs.key}"`;
            }
            else if (Object.keys(prediction.action_inputs || {}).length > 0) {
              actionDetails = JSON.stringify(prediction.action_inputs);
            }
          }
        }
        
        return {
          text: captionText,
          action: actionType,
          details: actionDetails,
          frameIndex // Use the frameIndex we determined
        };
      });
      
      // Handle issue where we might have a mismatch between frames and captions
      if (processedCaptions.length !== frameCount) {
        sessionLogger.warn(`Caption count (${processedCaptions.length}) doesn't match frame count (${frameCount})`);
      }
      
      // Return the processed captions
      return processedCaptions;
    } catch (error) {
      sessionLogger.error(`Error loading captions:`, error);
      return [];
    }
  }

  /**
   * Add captions to a frame
   * @param framePath Path to the source frame
   * @param captionedFramePath Path to the output captioned frame
   * @param caption Caption information
   * @param frameIndex Frame index (for logging)
   */
  public static async addCaptionToFrame(
    framePath: string, 
    captionedFramePath: string, 
    caption: ProcessedCaptionDto,
    frameIndex: number
  ): Promise<boolean> {
    try {
      // Skip if no caption text
      if (!caption.text && !caption.action) {
        // Just copy the frame without captions
        await fs.copyFile(framePath, captionedFramePath);
        return true;
      }
      
      // Prepare the caption texts
      const thoughtText = caption.text
        .replace(/'/g, "'\\''") // Escape single quotes for shell
        .replace(/"/g, '\\"');   // Escape double quotes
      
      // Create the ffmpeg filter for caption addition
      const filterExpr = `drawtext=text='${thoughtText}':fontcolor=white:fontsize=24:box=1:boxcolor=black@0.7:boxborderw=5:x=(w-text_w)/2:y=h-120${
        caption.action ? `,drawtext=text='Action: ${caption.action}${caption.details ? ' ' + caption.details : ''}':fontcolor=yellow:fontsize=20:box=1:boxcolor=black@0.7:boxborderw=5:x=(w-text_w)/2:y=h-60` : ''
      }`;
      
      // Execute the command to add captions
      return await new Promise<boolean>((resolve) => {
        const process = spawn('ffmpeg', [
          '-y',
          '-i', framePath,
          '-vf', filterExpr,
          captionedFramePath
        ]);
        
        process.on('close', (code) => {
          if (code === 0) {
            resolve(true);
          } else {
            sessionLogger.error(`Error adding caption to frame ${frameIndex}: exit code ${code}`);
            resolve(false);
          }
        });
        
        process.on('error', (err: any) => {
          sessionLogger.error(`Error adding caption to frame ${frameIndex}:`, err);
          resolve(false);
        });
      });
    } catch (error) {
      sessionLogger.error(`Error processing frame ${frameIndex}:`, error);
      return false;
    }
  }
}