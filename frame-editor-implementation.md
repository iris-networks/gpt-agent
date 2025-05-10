# Frame and Caption Editor Implementation Plan

## Overview
This document outlines the implementation plan for a UI page that allows users to add/delete video frames and edit captions associated with those frames. The UI will update the captions.json file and regenerate the video after edits.

## Architecture

### Frontend Components
1. **FrameEditor Component**
   - Main component that integrates frame display, selection, and editing
   - Handles API calls to backend for frame/caption operations
   - Shows a preview of frames with captions

2. **CaptionEditor Component**
   - Allows editing the text of captions for selected frames
   - Shows both the thought text and action details
   - Provides a user-friendly interface for text editing

3. **Frame Management UI**
   - Controls for deleting frames
   - Visual indicators for selected frames
   - Buttons to regenerate video after edits

### Backend Components
1. **Video Edit Controller**
   - New controller focused on edit operations to keep existing controllers manageable
   - Endpoints for frame operations (list, delete)
   - Endpoints for caption operations (get, update)
   - Endpoint to trigger video regeneration

2. **Frame and Caption Services**
   - Refactored services for frame and caption manipulation
   - Handle file operations for frames (delete, rename)
   - Handle updating captions.json file structure

## API Endpoints

### Frame Management
- `GET /api/videos/:id/frames` - List all frames with their corresponding captions
- `DELETE /api/videos/:id/frames/:frameIndex` - Delete a specific frame and update captions

### Caption Management
- `PUT /api/videos/:id/captions/:frameIndex` - Update caption for a specific frame

### Video Regeneration
- `POST /api/videos/:id/regenerate` - Regenerate video after edits

## Implementation Steps

### Phase 1: Backend Implementation
1. Create the VideoEditController with required endpoints
2. Implement frame deletion with proper file renaming
3. Implement caption updating logic
4. Ensure video regeneration works after edits

### Phase 2: Frontend Implementation
1. Create the frame editor page and components
2. Implement frame selection and display
3. Add caption editing functionality
4. Connect to backend APIs

### Phase 3: Integration and Testing
1. Test all operations individually
2. Test end-to-end flow from editing to final video
3. Handle edge cases (e.g., deleting all frames, invalid edits)

## UI Mockup

```
+------------------------------------------------+
|               Video Frame Editor               |
+------------------------------------------------+
|                                                |
|  +------------------------------------------+  |
|  |                                          |  |
|  |                                          |  |
|  |             Current Frame                |  |
|  |                                          |  |
|  |                                          |  |
|  +------------------------------------------+  |
|                                                |
|  Caption: "I'm clicking on the search button"  |
|  +------------------------------------------+  |
|  | Edit Caption...                          |  |
|  +------------------------------------------+  |
|                                                |
|  Frame: [◀] 3/10 [▶]   [Delete Frame]         |
|                                                |
|  [Cancel]                [Regenerate Video]    |
|                                                |
+------------------------------------------------+
```

## File Structure Changes

1. **New Files:**
   - `/src/modules/sessions/controllers/video-edit.controller.ts`
   - `/src/public/components/FrameEditor.js`
   - `/src/public/components/CaptionEditor.js`
   - `/src/public/frame-editor.html`

2. **Modified Files:**
   - `/src/modules/sessions/sessions.module.ts` (register new controller)
   - `/src/public/components/VideoPlayer.js` (add editability support)
   - `/src/public/components/RecordingsList.js` (add edit button)

## Technical Considerations

1. **Caption Structure Preservation**
   - When editing caption text, ensure the structure of the caption object is maintained
   - Update both the conversation.value and predictionParsed fields

2. **Frame Sequence Integrity**
   - After deleting frames, renumber subsequent frame files
   - Update frameIndex references in the captions.json file

3. **Video Regeneration**
   - Use existing VideoGeneratorService for consistency
   - Ensure regeneration uses the updated frames and captions