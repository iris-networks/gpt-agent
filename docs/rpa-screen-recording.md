# RPA Screen Recording and Intelligent Processing

This document outlines the architecture and implementation plan for adding automatic screen recording capabilities to Zenobia, with intelligent processing to trim idle sections and generate RPA steps using LLM analysis.

## Overview

The current RPA system in Zenobia relies on manual user commands. The new feature will allow users to:

1. Upload videos of screen interactions
2. Process videos to intelligently trim idle sections
3. Extract key frames and actions from the processed recordings
4. Generate precise RPA steps from the processed recordings using LLMs

## System Architecture

### 1. Video Upload Component

- Add a new endpoint to accept video uploads
- Implement video processing and validation
- Support common video formats (MP4, WebM, AVI)
- Store uploaded videos for processing

### 2. Intelligent Video Processing

- **Change Detection System**:
  - Calculate pixel-based differences between successive frames
  - Use image hashing techniques to identify significant changes
  - Implement motion detection algorithms to determine activity periods
  
- **Idle Detection and Trimming**:
  - Define thresholds for "idle" periods based on:
    - Lack of visual changes
    - Static screen elements
    - Minimal pixel differences
  - Trim sequences where change metrics fall below thresholds
  - Preserve context by keeping minimal transition frames
  
- **Frame Selection Algorithm**:
  - Select key frames that illustrate significant state changes
  - Save timestamps and metadata for each key frame
  - Create an optimized video sequence containing only essential frames
  
- **FFmpeg Implementation**:
  ```
  ffmpeg -i "INPUT_SOURCE" \
       -vf "select='if(eq(n,0),1,gt(scene,0.01))',setpts=N/(2*TB),fps=2" \
       -r 20 \
       -c:v libx264 -profile:v main -pix_fmt yuv420p -movflags +faststart -crf 23 -preset medium -an \
       output.mp4
  ```
  
  This command:
  - Uses the `select` filter to keep only frames that:
    - Are the first frame (`eq(n,0)`)
    - OR have a scene change score > 0.01 (`gt(scene,0.01)`)
  - Adjusts the presentation timestamps with `setpts=N/(2*TB)`
  - Sets output frame rate to 2fps for processing
  - Encodes to H.264 at 20fps final output for smooth playback
  - Removes audio track (`-an`) as it's not needed for RPA analysis

### 3. LLM Integration for RPA Step Generation with Google AI Studio and Gemini

- Send processed video to Google AI Studio's Gemini model
- Generate structured prompts for Gemini to analyze the video:
  - Request step-by-step RPA instructions compatible with reAct agent
  - Specify mouse and keyboard interactions required to replicate the workflow
  - Include precise cursor positions and timing information
- Process Gemini's response to extract actionable RPA steps
- Format steps for display to user and for direct submission to reAct agent using guiAgent

## Implementation Plan

### Phase 1: Infrastructure Setup

1. Implement video upload endpoint and storage system
2. Create video processing pipeline for format validation
3. Set up integration with existing session management

### Phase 2: Video Analysis and Processing

1. Implement the FFmpeg processing pipeline using fluent-ffmpeg
   ```javascript
   const ffmpeg = require('fluent-ffmpeg');
   const ffmpegStatic = require('ffmpeg-static');
   
   // Set ffmpeg path
   ffmpeg.setFfmpegPath(ffmpegStatic);
   
   function processVideo(inputPath, outputPath) {
     return new Promise((resolve, reject) => {
       ffmpeg(inputPath)
         .videoFilters([
           // Select first frame and frames with scene change score > 0.01
           "select='if(eq(n,0),1,gt(scene,0.01))'",
           // Adjust presentation timestamps 
           'setpts=N/(2*TB)',
           // Set processing frame rate
           'fps=2'
         ])
         // Final output frame rate
         .outputOptions('-r', '20')
         // Video codec settings
         .outputOptions('-c:v', 'libx264')
         .outputOptions('-profile:v', 'main')
         .outputOptions('-pix_fmt', 'yuv420p')
         .outputOptions('-movflags', '+faststart')
         .outputOptions('-crf', '23')
         .outputOptions('-preset', 'medium')
         // Remove audio
         .outputOptions('-an')
         .output(outputPath)
         .on('end', () => resolve(outputPath))
         .on('error', (err) => reject(err))
         .run();
     });
   }
   ```
2. Create thumbnail extraction from key frames for LLM analysis
3. Implement metadata generation for processed videos
4. Build a queue system for processing multiple uploads

### Phase 3: LLM Integration and UI Development

1. Build user interface for displaying generated steps
2. Implement submission flow to execute steps through reAct agent
3. Develop error handling and validation for LLM responses

### Phase 4: Google AI Studio and Gemini Integration

1. Implement Google AI Studio API client for Gemini model access
   ```javascript
   const { GoogleGenerativeAI } = require('@google/generative-ai');
   const fs = require('fs');
   
   // Initialize the Google AI API with your API key
   const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
   
   async function generateRPASteps(videoPath) {
     try {
       // Access the Gemini Pro Vision model
       const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
       
       // Create a prompt that specifies the RPA task
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
       
       // Convert video to base64 or use a file stream approach depending on Gemini's API requirements
       const videoData = fs.readFileSync(videoPath);
       const videoBase64 = videoData.toString('base64');
       
       // Send to Gemini
       const result = await model.generateContent({
         contents: [
           {
             role: 'user',
             parts: [
               { text: prompt },
               { 
                 inlineData: { 
                   mimeType: 'video/mp4', 
                   data: videoBase64 
                 } 
               }
             ]
           }
         ]
       });
       
       // Process and return the response
       return result.response.text();
     } catch (error) {
       console.error('Error generating RPA steps:', error);
       throw error;
     }
   }
   ```

## Technical Details

### File Structure Modifications

```
src/
  ├── modules/
  │   ├── rpa/
  │   │   ├── controllers/
  │   │   │   ├── rpa.controller.ts
  │   │   │   └── video-upload.controller.ts (new)
  │   │   ├── services/
  │   │   │   ├── rpa.service.ts
  │   │   │   ├── video-processor.service.ts (new)
  │   │   │   └── gemini-analyzer.service.ts (new)
  │   ├── sessions/
  │   │   ├── services/
  │   │   │   ├── video-generator.service.ts (modify)
  │   │   │   └── video-optimization.service.ts (new)
  │   ├── agents/
  │   │   ├── services/
  │   │   │   ├── react-agent-executor.service.ts (new)
  │   │   │   └── gemini-to-react-adapter.service.ts (new)
  ├── shared/
  │   ├── interfaces/
  │   │   ├── video-metadata.interface.ts (new)
  │   │   ├── gemini-response.interface.ts (new)
  │   │   └── rpa-steps.interface.ts (new)
```

### Required Dependencies

- **Video Processing**: ffmpeg for frame extraction and video manipulation
  - Use fluent-ffmpeg npm package for Node.js integration
  - ffmpeg-static for easy deployment
- **Image Processing**: Most processing will be handled directly by FFmpeg
- **LLM Integration**: Google AI SDK for Node.js
  - @google/generative-ai for Gemini API access
  - Environment variables for secure API key management

### Integration Points

1. **Session Manager**: Extended to handle video processing sessions
2. **Video Processing**: Enhanced to support intelligent trimming
3. **Google AI Integration**: New service to send processed videos to Gemini
4. **reAct Agent Integration**: Connection between Gemini-generated steps and guiAgent
5. **User Interface**: Display steps and allow execution of the automation

## User Experience Flow

1. User uploads a video recording of screen interactions
2. System processes the video to identify and extract key frames
3. Idle periods are detected and trimmed using FFmpeg's scene detection
4. Processed video is reconstructed with only the essential segments
5. Google's Gemini model analyzes the processed video to generate RPA steps focusing on mouse and keyboard actions
6. System formats and displays the steps to the user in the UI
7. User can review, edit, and submit the steps for execution
8. The reAct agent with guiAgent executes the steps to recreate the workflow using precise mouse and keyboard interactions

## Performance Considerations

- **Storage Optimization**: Only store necessary frames to reduce storage requirements
- **Processing Efficiency**: Implement progressive processing to handle large videos
- **Video Optimization**: Balance between video quality and file size for efficient processing
- **Parallel Processing**: Use worker threads for intensive video analysis tasks

## Metrics and Monitoring

- Record processing time and efficiency metrics
- Track idle detection accuracy and optimization rates
- Monitor video compression and quality metrics
- Evaluate LLM performance in generating accurate RPA steps