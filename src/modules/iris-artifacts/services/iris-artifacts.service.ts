import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import * as path from 'path';
import { homedir } from 'os';
import { ArtifactItemDto, ArtifactsContentDto } from '../dto/iris-artifacts.dto';
import * as archiver from 'archiver';
import { Response } from 'express';

@Injectable()
export class IrisArtifactsService {
  private readonly logger = new Logger(IrisArtifactsService.name);
  private readonly irisBaseDir: string;

  constructor() {
    this.irisBaseDir = path.join(homedir(), '.iris');
    this.ensureIrisDirExists();
  }

  /**
   * Ensure the .iris directory exists
   */
  private ensureIrisDirExists(): void {
    if (!fs.existsSync(this.irisBaseDir)) {
      this.logger.log('Creating .iris directory');
      fs.mkdirSync(this.irisBaseDir, { recursive: true });
    }
  }

  /**
   * Normalize and validate the requested path is within .iris directory
   */
  private normalizePath(requestedPath: string = ''): string {
    // Normalize the path to prevent directory traversal attacks
    const normalizedPath = path.normalize(requestedPath).replace(/^(\.\.(\/|\\|$))+/, '');
    
    // Calculate the full absolute path
    const fullPath = path.join(this.irisBaseDir, normalizedPath);
    
    // Ensure the path is still within the .iris directory
    if (!fullPath.startsWith(this.irisBaseDir)) {
      throw new BadRequestException('Invalid path requested');
    }
    
    return fullPath;
  }

  /**
   * List contents of a directory within .iris folder
   */
  async listArtifacts(relativePath: string = ''): Promise<ArtifactsContentDto> {
    const fullPath = this.normalizePath(relativePath);
    
    try {
      // Check if path exists
      const stats = await fsPromises.stat(fullPath);
      
      if (!stats.isDirectory()) {
        throw new BadRequestException('Requested path is not a directory');
      }
      
      // Read directory contents
      const items = await fsPromises.readdir(fullPath);
      
      // Get information for each item
      const itemDetails: ArtifactItemDto[] = await Promise.all(
        items.map(async item => {
          const itemPath = path.join(fullPath, item);
          const itemStats = await fsPromises.stat(itemPath);
          const relativeItemPath = path.relative(this.irisBaseDir, itemPath);
          
          return {
            name: item,
            type: itemStats.isDirectory() ? 'directory' : 'file',
            size: itemStats.isDirectory() ? undefined : itemStats.size,
            modifiedAt: itemStats.mtime.toISOString(),
            path: relativeItemPath,
            extension: itemStats.isDirectory() ? undefined : path.extname(item)
          };
        })
      );
      
      // Sort by type (directories first) and then by name
      itemDetails.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'directory' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
      
      // Calculate parent path if we're not at the root
      let parentPath: string | undefined;
      if (relativePath) {
        const parentDir = path.dirname(relativePath);
        parentPath = parentDir === '.' ? '' : parentDir;
      }
      
      return {
        currentPath: relativePath,
        parentPath,
        items: itemDetails
      };
    } catch (error) {
      this.logger.error(`Error listing directory: ${error.message}`, error.stack);
      if (error.code === 'ENOENT') {
        throw new NotFoundException(`Path not found: ${relativePath}`);
      }
      throw error;
    }
  }

  /**
   * Download a file artifact from the .iris folder
   */
  async downloadArtifactFile(relativePath: string, res: Response): Promise<void> {
    const fullPath = this.normalizePath(relativePath);
    
    try {
      const stats = await fsPromises.stat(fullPath);
      
      if (!stats.isFile()) {
        throw new BadRequestException('Requested path is not a file');
      }
      
      const filename = path.basename(fullPath);
      
      // Set response headers for file download
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Length', stats.size);
      
      // Stream the file to response
      const fileStream = fs.createReadStream(fullPath);
      fileStream.pipe(res);
    } catch (error) {
      this.logger.error(`Error downloading file: ${error.message}`, error.stack);
      if (error.code === 'ENOENT') {
        throw new NotFoundException(`File not found: ${relativePath}`);
      }
      throw error;
    }
  }

  /**
   * Download a directory of artifacts as a zip file
   */
  async downloadArtifactFolder(relativePath: string, res: Response): Promise<void> {
    const fullPath = this.normalizePath(relativePath);
    
    try {
      const stats = await fsPromises.stat(fullPath);
      
      if (!stats.isDirectory()) {
        throw new BadRequestException('Requested path is not a directory');
      }
      
      const folderName = path.basename(fullPath) || 'iris-artifacts';
      const zipFileName = `${folderName}.zip`;
      
      // Set headers for zip file download
      res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);
      res.setHeader('Content-Type', 'application/zip');
      
      // Create a zip archive
      const archive = archiver('zip', {
        zlib: { level: 9 } // Compression level
      });
      
      // Pipe archive data to response
      archive.pipe(res);
      
      // Add directory to the archive
      archive.directory(fullPath, folderName);
      
      // Finalize archive
      await archive.finalize();
    } catch (error) {
      this.logger.error(`Error zipping directory: ${error.message}`, error.stack);
      if (error.code === 'ENOENT') {
        throw new NotFoundException(`Directory not found: ${relativePath}`);
      }
      throw error;
    }
  }
}