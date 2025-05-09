/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { createGoogleGenerativeAI, GoogleGenerativeAIProvider } from '@ai-sdk/google';
import { generateText } from 'ai';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class GeminiAnalyzerService {
  private readonly logger = new Logger(GeminiAnalyzerService.name);
  private readonly apiKey: string;
  private readonly google: GoogleGenerativeAIProvider;
  private readonly googleai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
  });

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!this.apiKey) {
      this.logger.warn('GEMINI_API_KEY is not set. LLM analysis will not be available.');
    } else {
      this.google = createGoogleGenerativeAI({
        apiKey: this.apiKey
      });
    }
  }

  /**
   * Generate RPA steps from a processed video using Google's Gemini API via AI SDK
   * @param videoPath Path to the processed video file
   * @returns Generated RPA steps as text
   */
  async generateRPASteps(videoPath: string): Promise<string> {
    if (!this.apiKey || !this.google) {
      throw new Error('GEMINI_API_KEY is not set. Cannot analyze video.');
    }

    try {
      this.logger.log(`Analyzing video with Gemini: ${videoPath}`);
      
      // First check if the file exists
      if (!fs.existsSync(videoPath)) {
        throw new Error(`Video file not found at path: ${videoPath}`);
      }
      
      // Read the video file
      const videoData = fs.readFileSync(videoPath);
      
      // Determine MIME type based on file extension
      const ext = path.extname(videoPath).toLowerCase();
      let mimeType = 'video/mp4'; // Default
      
      if (ext === '.webm') {
        mimeType = 'video/webm';
      } else if (ext === '.avi') {
        mimeType = 'video/x-msvideo';
      } else if (ext === '.mov') {
        mimeType = 'video/quicktime';
      }
      
      // Create the prompt for Gemini
      const prompt = `
        Analyze this screen recording video and generate precise RPA steps that can be used with a reAct agent.
        For each step:
        1. Describe the action (mouse move, mouse click, key press, etc.)
        2. Provide exact cursor coordinates for mouse actions (x, y)
        3. Provide exact keys to press for keyboard actions
        4. Include any wait conditions or timing considerations
        5. Format the output as a numbered list of actions
        
        The steps should be compatible with guiAgent for browser automation using ONLY mouse and keyboard interactions.
        DO NOT include element selectors as they are not supported.
      `;

      const uploadedFile = await this.googleai.files.upload({
        file: videoPath
      })
      
      // Generate text using AI SDK
      const result = await generateText({
        model: this.google('gemini-2.5-pro-preview-05-06'), // Using stable model with video support
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt,
              },
              {
                type: 'file',
                data: uploadedFile.uri,
                mimeType: uploadedFile.mimeType,
              },
            ],
          },
        ],
        temperature: 0.2,
        maxTokens: 8192,
      });
      
      const generatedSteps = result.text;
      
      if (!generatedSteps) {
        throw new Error('Empty response from Gemini API');
      }
      
      this.logger.log('Successfully generated RPA steps from video');
      return generatedSteps;
    } catch (error) {
      this.logger.error(`Error generating RPA steps: ${error.message}`, error.stack);
      throw error;
    }
  }
}