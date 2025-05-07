# Session Management and Video Capture Implementation Plan

## Overview

This document outlines a plan to improve session management in the Zenobia project and implement a feature to create video-like data from session screenshots with agent thought captions. The implementation will include persistent storage of video recordings on disk and an API to list and download them.

## Current Architecture Analysis

The current system has:
1. A `SessionManagerService` that handles a single active session
2. A `ReactAgent` class that interacts with operators (browser/computer)
3. A `GuiAgentTool` that processes GUI commands and collects screenshots
4. A basic UI in `index.html` with session controls

The flow for screenshots is:
- The agent takes screenshots using `takeScreenshotWithBackoff()`
- The GuiAgentTool receives screenshots in `onData` callback
- Currently, these screenshots are not being stored or processed for video generation

## Implementation Plan

### 1. Enhance the SessionData Model

Update the `SessionData` interface in `src/shared/types.ts` to include a screenshots array:

```typescript
export interface Screenshot {
  base64: string;
  timestamp: number;
  thought?: string; // Agent's thought at this point
}

export interface SessionData {
  // Existing fields...
  screenshots: Screenshot[]; // Add this new field
}

// Video recording metadata
export interface VideoRecording {
  id: string;
  sessionId: string;
  title: string;
  description?: string;
  createdAt: number;
  duration: number;
  frameCount: number;
  thumbnailPath?: string;
  filePath: string;
  size: number;
}
```

### 2. Modify ReactAgent to Collect Screenshots

Update the `ReactAgent` class in `src/agents/reAct.ts` to:
- Store screenshots with the agent's thoughts
- Add methods to access the screenshot history

### 3. Modify GuiAgentTool to Save Screenshots

Update the `createGuiAgentTool` function in `tools/guiAgentTool.ts` to:
- Save screenshots with their associated agent thoughts
- Add a reference to the session to store the screenshots

### 4. Create a VideoStorageService

Create a new service to handle persistent storage of video recordings:

```typescript
// src/modules/sessions/services/video-storage.service.ts
import { homedir } from 'os';
import { join } from 'path';

@Injectable()
export class VideoStorageService implements OnModuleInit {
  private readonly storagePath: string;
  
  constructor(private readonly configService: ConfigService) {
    const homeDir = homedir();
    const irisDir = join(homeDir, '.iris');
    this.storagePath = join(irisDir, 'videos');
  }
  
  async onModuleInit() {
    // Ensure .iris directory exists
    const homeDir = homedir();
    const irisDir = join(homeDir, '.iris');
    await fs.promises.mkdir(irisDir, { recursive: true });
    
    // Ensure videos directory exists
    await fs.promises.mkdir(this.storagePath, { recursive: true });
    
    // Create metadata directory
    await fs.promises.mkdir(join(this.storagePath, 'metadata'), { recursive: true });
  }
  
  // Store a video recording
  async storeRecording(sessionId: string, frames: string[], captions: string[]): Promise<VideoRecording> {
    // Generate unique ID
    const recordingId = randomUUID();
    
    // Create directory for this recording
    const recordingPath = join(this.storagePath, recordingId);
    await fs.promises.mkdir(recordingPath, { recursive: true });
    
    // Save frames and metadata
    const metadata: VideoRecording = {
      id: recordingId,
      sessionId,
      title: `Session ${sessionId.substring(0, 8)} Recording`,
      createdAt: Date.now(),
      duration: frames.length * 1000, // Estimate 1 second per frame
      frameCount: frames.length,
      filePath: recordingPath,
      size: 0 // Will update after saving
    };
    
    // Save frames to disk
    await Promise.all(frames.map(async (base64, index) => {
      const buffer = Buffer.from(base64, 'base64');
      const framePath = join(recordingPath, `frame_${index.toString().padStart(6, '0')}.png`);
      await fs.promises.writeFile(framePath, buffer);
    }));
    
    // Save captions
    const captionsPath = join(recordingPath, 'captions.json');
    await fs.promises.writeFile(captionsPath, JSON.stringify(captions), 'utf8');
    
    // Create thumbnail (first frame)
    if (frames.length > 0) {
      const thumbnailPath = join(recordingPath, 'thumbnail.png');
      await fs.promises.writeFile(thumbnailPath, Buffer.from(frames[0], 'base64'));
      metadata.thumbnailPath = thumbnailPath;
    }
    
    // Calculate size of all files
    const stats = await this.getDirectorySize(recordingPath);
    metadata.size = stats.size;
    
    // Save metadata
    const metadataPath = join(this.storagePath, 'metadata', `${recordingId}.json`);
    await fs.promises.writeFile(metadataPath, JSON.stringify(metadata), 'utf8');
    
    return metadata;
  }
  
  // List all recordings
  async listRecordings(): Promise<VideoRecording[]> {
    const metadataDir = join(this.storagePath, 'metadata');
    const files = await fs.promises.readdir(metadataDir);
    
    const recordings: VideoRecording[] = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const metadataPath = join(metadataDir, file);
          const metadataContent = await fs.promises.readFile(metadataPath, 'utf8');
          const metadata = JSON.parse(metadataContent) as VideoRecording;
          recordings.push(metadata);
        } catch (error) {
          console.error(`Error reading metadata file ${file}:`, error);
        }
      }
    }
    
    // Sort by creation date, newest first
    return recordings.sort((a, b) => b.createdAt - a.createdAt);
  }
  
  // Get a specific recording by ID
  async getRecording(id: string): Promise<VideoRecording> {
    const metadataPath = join(this.storagePath, 'metadata', `${id}.json`);
    try {
      const metadataContent = await fs.promises.readFile(metadataPath, 'utf8');
      return JSON.parse(metadataContent) as VideoRecording;
    } catch (error) {
      throw new Error(`Recording with ID ${id} not found`);
    }
  }
  
  // Get all frames for a recording
  async getRecordingFrames(id: string): Promise<string[]> {
    const recording = await this.getRecording(id);
    const frameFiles = await fs.promises.readdir(recording.filePath);
    
    // Filter to only include frame files (not metadata or captions)
    const framePaths = frameFiles
      .filter(file => file.startsWith('frame_') && file.endsWith('.png'))
      .sort(); // Ensure frames are in order
    
    const frames: string[] = [];
    
    for (const framePath of framePaths) {
      const fullPath = join(recording.filePath, framePath);
      const buffer = await fs.promises.readFile(fullPath);
      frames.push(buffer.toString('base64'));
    }
    
    return frames;
  }
  
  // Get captions for a recording
  async getRecordingCaptions(id: string): Promise<string[]> {
    const recording = await this.getRecording(id);
    const captionsPath = join(recording.filePath, 'captions.json');
    
    try {
      const captionsContent = await fs.promises.readFile(captionsPath, 'utf8');
      return JSON.parse(captionsContent) as string[];
    } catch (error) {
      return [];
    }
  }
  
  // Delete a recording
  async deleteRecording(id: string): Promise<boolean> {
    try {
      const recording = await this.getRecording(id);
      
      // Delete all files in the recording directory
      await fs.promises.rm(recording.filePath, { recursive: true, force: true });
      
      // Delete metadata file
      const metadataPath = join(this.storagePath, 'metadata', `${id}.json`);
      await fs.promises.unlink(metadataPath);
      
      return true;
    } catch (error) {
      console.error(`Error deleting recording ${id}:`, error);
      return false;
    }
  }
  
  // Utility method to get directory size
  private async getDirectorySize(directoryPath: string): Promise<{ size: number, files: number }> {
    const files = await fs.promises.readdir(directoryPath);
    let totalSize = 0;
    let fileCount = 0;
    
    for (const file of files) {
      const fullPath = join(directoryPath, file);
      const stats = await fs.promises.stat(fullPath);
      
      if (stats.isDirectory()) {
        const subDirStats = await this.getDirectorySize(fullPath);
        totalSize += subDirStats.size;
        fileCount += subDirStats.files;
      } else {
        totalSize += stats.size;
        fileCount += 1;
      }
    }
    
    return { size: totalSize, files: fileCount };
  }
}
```

### 5. Enhance SessionManagerService

Update `SessionManagerService` in `src/modules/sessions/services/session-manager.service.ts` to:
- Initialize the screenshots array
- Add methods to access and manage the screenshots
- Add functionality to store recordings using VideoStorageService

```typescript
// src/modules/sessions/services/session-manager.service.ts
@Injectable()
export class SessionManagerService implements OnModuleInit {
  // Existing code...
  
  constructor(
    private readonly configService: ConfigService,
    private readonly operatorFactoryService: OperatorFactoryService,
    private readonly sessionEvents: SessionEventsService,
    private readonly videoStorage: VideoStorageService // Add this
  ) {
    sessionLogger.info('Session Manager initialized');
  }
  
  // ...existing methods...
  
  // Add method to save recording
  public async saveSessionRecording(): Promise<VideoRecording> {
    if (!this.activeSession) {
      throw new Error('No active session found');
    }
    
    if (!this.activeSession.screenshots || this.activeSession.screenshots.length === 0) {
      throw new Error('No screenshots available for video export');
    }
    
    const frames = this.activeSession.screenshots.map(s => s.base64);
    const captions = this.activeSession.screenshots.map(s => s.thought || '');
    
    // Store recording and return metadata
    return this.videoStorage.storeRecording(
      this.activeSession.id,
      frames,
      captions
    );
  }
}
```

### 6. Create Video API Controller

Create a dedicated video controller for managing video recordings:

```typescript
// src/modules/sessions/controllers/videos.controller.ts
@Controller('api/videos')
export class VideosController {
  constructor(
    private readonly sessionManager: SessionManagerService,
    private readonly videoStorage: VideoStorageService
  ) {}
  
  // List all recordings
  @Get()
  async listRecordings(): Promise<VideoRecording[]> {
    return this.videoStorage.listRecordings();
  }
  
  // Get recording metadata
  @Get(':id')
  async getRecordingMetadata(@Param('id') id: string) {
    try {
      const recording = await this.videoStorage.getRecording(id);
      return { success: true, recording };
    } catch (error) {
      throw new NotFoundException(`Recording with ID ${id} not found`);
    }
  }
  
  // Save current session as recording
  @Post('save-current-session')
  async saveCurrentSession() {
    try {
      const recording = await this.sessionManager.saveSessionRecording();
      return { success: true, recording };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  
  // Get recording frames
  @Get(':id/frames')
  async getRecordingFrames(@Param('id') id: string) {
    try {
      const frames = await this.videoStorage.getRecordingFrames(id);
      const captions = await this.videoStorage.getRecordingCaptions(id);
      return { success: true, frames, captions };
    } catch (error) {
      throw new NotFoundException(`Recording with ID ${id} not found`);
    }
  }
  
  // Download recording as ZIP file
  @Get(':id/download')
  async downloadRecording(@Param('id') id: string, @Res() response: Response) {
    try {
      const recording = await this.videoStorage.getRecording(id);
      
      // Create a temporary zip file
      const zipFilePath = join(tmpdir(), `recording_${id}.zip`);
      const output = createWriteStream(zipFilePath);
      const archive = archiver('zip', { zlib: { level: 9 } });
      
      // Pipe output to response
      archive.pipe(output);
      
      // Add all files from recording directory to zip
      archive.directory(recording.filePath, false);
      
      // Finalize zip
      await archive.finalize();
      
      // When zip is ready, send it to client
      output.on('close', () => {
        response.download(zipFilePath, `${recording.title}.zip`, (err) => {
          if (err) console.error('Error sending zip file:', err);
          
          // Delete temp file after download
          unlink(zipFilePath, (unlinkErr) => {
            if (unlinkErr) console.error('Error deleting temp zip file:', unlinkErr);
          });
        });
      });
    } catch (error) {
      throw new NotFoundException(`Recording with ID ${id} not found or error creating download: ${error.message}`);
    }
  }
  
  // Delete recording
  @Delete(':id')
  async deleteRecording(@Param('id') id: string) {
    const success = await this.videoStorage.deleteRecording(id);
    if (!success) {
      throw new NotFoundException(`Recording with ID ${id} not found or could not be deleted`);
    }
    return { success };
  }
}
```

### 7. Update the WebSocket Gateway

Add video-related event handlers to the sessions gateway:

```typescript
// src/modules/sessions/gateways/sessions.gateway.ts
@SubscribeMessage('listRecordings')
async handleListRecordings(client: Socket) {
  try {
    const recordings = await this.videoStorage.listRecordings();
    return { 
      success: true,
      recordings
    };
  } catch (error) {
    return { 
      success: false, 
      error: error.message
    };
  }
}

@SubscribeMessage('getRecording')
async handleGetRecording(client: Socket, recordingId: string) {
  try {
    const recording = await this.videoStorage.getRecording(recordingId);
    const frames = await this.videoStorage.getRecordingFrames(recordingId);
    const captions = await this.videoStorage.getRecordingCaptions(recordingId);
    
    return { 
      success: true,
      recording,
      frames,
      captions
    };
  } catch (error) {
    return { 
      success: false, 
      error: error.message
    };
  }
}

@SubscribeMessage('saveSessionRecording')
async handleSaveSessionRecording(client: Socket) {
  try {
    const recording = await this.sessionManager.saveSessionRecording();
    return { 
      success: true,
      recording
    };
  } catch (error) {
    return { 
      success: false, 
      error: error.message
    };
  }
}
```

### 8. Update UI in index.html

Add a new component in the React UI for listing and viewing recordings:

```jsx
function RecordingsList({ onSelectRecording }) {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Fetch recordings on mount
  useEffect(() => {
    fetchRecordings();
  }, []);
  
  const fetchRecordings = () => {
    setLoading(true);
    socket.emit('listRecordings', (response) => {
      setLoading(false);
      if (response.success) {
        setRecordings(response.recordings);
      } else {
        alert("Failed to fetch recordings: " + (response.error || "Unknown error"));
      }
    });
  };
  
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };
  
  const formatDuration = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  const downloadRecording = (id, title) => {
    window.open(`/api/videos/${id}/download`, '_blank');
  };
  
  if (loading) {
    return <div className="flex justify-center p-4">Loading recordings...</div>;
  }
  
  if (recordings.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-500 mb-4">No recordings found</p>
        <button 
          onClick={fetchRecordings}
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>
    );
  }
  
  return (
    <div className="recordings-list">
      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-semibold">Recordings ({recordings.length})</h3>
        <button 
          onClick={fetchRecordings}
          className="text-blue-600 hover:text-blue-800"
        >
          Refresh
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recordings.map(recording => (
          <div 
            key={recording.id}
            className="bg-white border rounded-lg shadow-sm overflow-hidden"
          >
            {recording.thumbnailPath ? (
              <div className="h-32 bg-gray-100 flex items-center justify-center">
                <img 
                  src={`/api/videos/${recording.id}/thumbnail`}
                  alt={recording.title}
                  className="max-h-32 object-contain"
                />
              </div>
            ) : (
              <div className="h-32 bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400">No thumbnail</span>
              </div>
            )}
            
            <div className="p-3">
              <h4 className="font-medium truncate">{recording.title}</h4>
              <div className="text-xs text-gray-500 mt-1">
                <div>Created: {formatDate(recording.createdAt)}</div>
                <div>Duration: {formatDuration(recording.duration)}</div>
                <div>Size: {formatFileSize(recording.size)}</div>
              </div>
              
              <div className="mt-3 flex justify-between">
                <button
                  onClick={() => onSelectRecording(recording.id)}
                  className="text-blue-600 text-sm hover:text-blue-800"
                >
                  View
                </button>
                
                <button
                  onClick={() => downloadRecording(recording.id, recording.title)}
                  className="text-green-600 text-sm hover:text-green-800"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

Enhance the App component to include recording management:

```jsx
function App() {
  // Existing state...
  const [videoData, setVideoData] = useState(null);
  const [showRecordingsList, setShowRecordingsList] = useState(false);
  const [selectedRecordingId, setSelectedRecordingId] = useState(null);
  
  // Add function to fetch video data for current session
  const fetchVideoData = () => {
    if (!socket || !connected || !sessionId) {
      alert("No active session or not connected");
      return;
    }
    
    socket.emit('getVideoData', (response) => {
      if (response.success && response.videoData) {
        setVideoData(response.videoData);
      } else {
        alert("Failed to get video data: " + (response.error || "Unknown error"));
      }
    });
  };
  
  // Add function to fetch recording data
  const fetchRecording = (recordingId) => {
    if (!socket || !connected) {
      alert("Not connected");
      return;
    }
    
    socket.emit('getRecording', recordingId, (response) => {
      if (response.success) {
        setVideoData({
          frames: response.frames,
          captions: response.captions,
          metadata: response.recording
        });
        setSelectedRecordingId(recordingId);
      } else {
        alert("Failed to get recording: " + (response.error || "Unknown error"));
      }
    });
  };
  
  // Add function to save current session as recording
  const saveSessionAsRecording = () => {
    if (!socket || !connected || !sessionId) {
      alert("No active session or not connected");
      return;
    }
    
    socket.emit('saveSessionRecording', (response) => {
      if (response.success) {
        alert(`Recording saved: ${response.recording.title}`);
      } else {
        alert("Failed to save recording: " + (response.error || "Unknown error"));
      }
    });
  };
  
  // Handle recording selection from list
  const handleSelectRecording = (recordingId) => {
    setShowRecordingsList(false);
    fetchRecording(recordingId);
  };
  
  return (
    <div className="h-full flex flex-col">
      {/* Existing UI elements... */}
      
      {/* Recordings List Modal */}
      {showRecordingsList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-3/4 max-h-3/4 overflow-auto">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">Session Recordings</h2>
              <button 
                onClick={() => setShowRecordingsList(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
            
            <RecordingsList onSelectRecording={handleSelectRecording} />
          </div>
        </div>
      )}
      
      {/* Video Player Modal */}
      {videoData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-3/4 max-h-3/4 overflow-auto">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">
                {videoData.metadata ? videoData.metadata.title : "Current Session Recording"}
              </h2>
              <button 
                onClick={() => {
                  setVideoData(null);
                  setSelectedRecordingId(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
            
            <VideoPlayer 
              frames={videoData.frames} 
              captions={videoData.captions} 
            />
            
            {/* Only show save button for current session */}
            {!selectedRecordingId && sessionId && (
              <div className="mt-4">
                <button
                  onClick={saveSessionAsRecording}
                  className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                >
                  Save as Recording
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Add Video Controls and Recordings Button to main UI */}
      <div className="fixed bottom-6 right-20 z-40 flex gap-2">
        {sessionId && (
          <button
            onClick={fetchVideoData}
            className="bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700"
            title="View Current Session Recording"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5z"/>
            </svg>
          </button>
        )}
        
        <button
          onClick={() => setShowRecordingsList(true)}
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700"
          title="View Saved Recordings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path d="M12 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h8zM4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H4z"/>
            <path d="M8 4.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5zM8 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm-3.5 1.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
```

## Implementation Considerations

1. **Storage Planning**:
   - The disk storage approach should organize videos hierarchically
   - Each recording gets its own directory (UUID-based)
   - Frames stored as individual PNG files for better load time management
   - Metadata stored centrally for quick listing
   - Consider implementing a storage cleanup policy for old recordings

2. **Memory Management**:
   - Only load frames as needed, especially for long sessions
   - Implement server-side pagination for frame retrieval
   - Consider image compression or resizing for storage efficiency

3. **Performance**:
   - Use server-side caching for frequently accessed recordings
   - Implement streaming for large recordings instead of loading all at once
   - Consider using WebP format instead of PNG for better compression

4. **Security**:
   - Implement proper access control for video recordings
   - Consider encrypting sensitive recordings
   - Add session validation to ensure only authorized users can access recordings

5. **Error Handling**:
   - Implement robust error handling for storage operations
   - Add recovery mechanisms for interrupted recording saves
   - Consider backup and restore functionality for important recordings

## Future Enhancements

1. **Video Processing**:
   - Server-side video generation using ffmpeg to create actual MP4 files
   - Video compression options for different quality/size tradeoffs
   - Frame rate adjustment and time normalization

2. **Advanced Features**:
   - Video annotations with interactive timestamps
   - Session comparison tools to view multiple sessions side by side
   - Shareable session recordings via unique URLs
   - Custom labeling and tagging for recordings
   - Search functionality based on session content or agent thoughts

3. **Integration**:
   - Integration with existing analytics platforms
   - Export options to common video formats
   - Webhook notifications when recordings are created

4. **Administration**:
   - Storage quota management
   - Bulk operations on recordings (delete, archive)
   - Recording metadata editing