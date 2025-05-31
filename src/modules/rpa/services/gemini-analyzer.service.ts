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

        The output should be a numbered list of actions. Here is an example of the desired format:
        1. navigate to https://www.google.com
        2. click on the search input field
        3. type "RPA automation"
        4. click on the button with text "Google Search"
        5. wait for 2 seconds
        6. scroll down
        7. click on the link with text "RPA - Wikipedia"

        For each step:
        1. Describe the action (e.g., navigate, click, type, press key, scroll, wait).
        2. For click actions, identify the UI element by its visible text, label, or a brief visual description (e.g., "click on the button 'Submit'", "click on the link 'Read More'", "click on the text input field with current value 'username'").
        3. For keyboard actions (type, press key), specify the exact keys.
        4. For navigation, provide the full URL.
        5. For scrolling, specify direction (e.g., scroll down, scroll up) and approximate amount if discernible.
        6. Include any necessary wait conditions or timing considerations (e.g., wait for X seconds, wait for page to load).
        
        The steps should be compatible with guiAgent for browser automation using ONLY mouse and keyboard interactions.
        DO NOT use coordinates. Focus on identifying elements by their text or visual characteristics.
        DO NOT include element selectors (like CSS selectors or XPath) as they are not supported.
        Focus ONLY on the actions performed and provide them as a numbered list.
        Your response MUST contain ONLY the numbered list of steps and nothing else. Do not include any introductory text, concluding text, or any other commentary.
      `;

      const uploadedFile = await this.googleai.files.upload({
        file: videoPath
      })

      // Generate text using AI SDK with exponential backoff for retries
      let result;
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts) {
        try {
          result = await generateText({
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

          // If we got here, the API call succeeded
          break;
        } catch (error) {
          attempts++;
          if (attempts >= maxAttempts) {
            // If we've reached max attempts, rethrow the error
            this.logger.error(`Failed to generate text after ${maxAttempts} attempts: ${error.message}`);
            throw error;
          }

          // Calculate delay with exponential backoff (1s, 2s, 4s, etc.)
          const delay = Math.pow(2, attempts - 1) * 1000;
          this.logger.warn(`Error calling Gemini API, retrying in ${delay}ms (attempt ${attempts}/${maxAttempts}): ${error.message}`);

          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
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