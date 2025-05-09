import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { homedir } from 'os';

@Controller('api/video')
export class VideoStreamController {
  private readonly uploadDir = path.join(homedir(), '.iris', 'uploads');
  private readonly processedDir = path.join(homedir(), '.iris', 'uploads', 'processed');

  constructor() {
    // Ensure directories exist
    const irisDir = path.join(homedir(), '.iris');
    if (!fs.existsSync(irisDir)) {
      fs.mkdirSync(irisDir, { recursive: true });
    }
    
    [this.uploadDir, this.processedDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  @Get('processed/:filename')
  streamProcessedVideo(@Param('filename') filename: string, @Res() res: Response) {
    const videoPath = path.join(this.processedDir, filename);
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