/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as https from 'https';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class MinioStorageService {
  private readonly logger = new Logger(MinioStorageService.name);
  private readonly endpoint: string;
  private readonly port: number;
  private readonly useSSL: boolean;
  private readonly accessKey: string;
  private readonly secretKey: string;
  private readonly region: string;
  private readonly tmpDir: string;

  constructor(private configService: ConfigService) {
    this.endpoint = this.configService.get('MINIO_ENDPOINT', 'play.min.io');
    this.port = parseInt(this.configService.get('MINIO_PORT', '443'));
    this.useSSL = this.configService.get('MINIO_USE_SSL', 'true') === 'true';
    this.accessKey = this.configService.get('MINIO_ACCESS_KEY', 'minioadmin');
    this.secretKey = this.configService.get('MINIO_SECRET_KEY', 'minioadmin');
    this.region = this.configService.get('MINIO_REGION', 'us-east-1');
    this.tmpDir = path.join(process.cwd(), 'tmp');

    // Create tmp directory if it doesn't exist
    if (!fs.existsSync(this.tmpDir)) {
      fs.mkdirSync(this.tmpDir, { recursive: true });
    }
  }

  /**
   * Upload a file to Minio using the REST API
   * @param bucketName The bucket to upload to
   * @param objectName The name of the object in the bucket
   * @param filePath The local file path to upload
   */
  async uploadFile(bucketName: string, objectName: string, filePath: string): Promise<string> {
    try {
      // Check if bucket exists, create if not
      await this.ensureBucketExists(bucketName);

      // Read file
      const fileContent = fs.readFileSync(filePath);
      const contentLength = fileContent.length;
      const contentType = this.getContentType(filePath);
      
      // Generate the URL for the object
      const resource = `/${bucketName}/${objectName}`;
      const date = new Date().toUTCString();
      
      // Create the signature for authentication
      const stringToSign = `PUT\n\n${contentType}\n${date}\n${resource}`;
      const signature = crypto
        .createHmac('sha1', this.secretKey)
        .update(stringToSign)
        .digest('base64');
      
      // Set up the request options
      const options = {
        hostname: this.endpoint,
        port: this.port,
        path: resource,
        method: 'PUT',
        headers: {
          'Content-Length': contentLength,
          'Content-Type': contentType,
          'Date': date,
          'Authorization': `AWS ${this.accessKey}:${signature}`
        }
      };
      
      // Send the upload request
      return new Promise((resolve, reject) => {
        const req = (this.useSSL ? https : http).request(options, (res) => {
          if (res.statusCode === 200) {
            const objectUrl = `${this.useSSL ? 'https' : 'http'}://${this.endpoint}:${this.port}${resource}`;
            this.logger.log(`File uploaded successfully: ${objectUrl}`);
            resolve(objectUrl);
          } else {
            let errorData = '';
            res.on('data', (chunk) => {
              errorData += chunk;
            });
            res.on('end', () => {
              reject(new Error(`Failed to upload file: ${res.statusCode} - ${errorData}`));
            });
          }
        });
        
        req.on('error', (error) => {
          reject(new Error(`Error uploading file: ${error.message}`));
        });
        
        // Send the file content
        req.write(fileContent);
        req.end();
      });
    } catch (error) {
      this.logger.error(`Error in uploadFile: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Download a file from Minio
   * @param bucketName The bucket to download from
   * @param objectName The name of the object in the bucket
   * @returns The local path to the downloaded file
   */
  async downloadFile(bucketName: string, objectName: string): Promise<string> {
    try {
      // Generate the URL for the object
      const resource = `/${bucketName}/${objectName}`;
      const date = new Date().toUTCString();
      
      // Create the signature for authentication
      const stringToSign = `GET\n\n\n${date}\n${resource}`;
      const signature = crypto
        .createHmac('sha1', this.secretKey)
        .update(stringToSign)
        .digest('base64');
      
      // Set up the request options
      const options = {
        hostname: this.endpoint,
        port: this.port,
        path: resource,
        method: 'GET',
        headers: {
          'Date': date,
          'Authorization': `AWS ${this.accessKey}:${signature}`
        }
      };
      
      // Create a temporary file path
      const tmpFilePath = path.join(this.tmpDir, objectName);
      
      // Send the download request
      return new Promise((resolve, reject) => {
        const req = (this.useSSL ? https : http).request(options, (res) => {
          if (res.statusCode === 200) {
            const fileStream = fs.createWriteStream(tmpFilePath);
            res.pipe(fileStream);
            
            fileStream.on('finish', () => {
              this.logger.log(`File downloaded successfully: ${tmpFilePath}`);
              resolve(tmpFilePath);
            });
            
            fileStream.on('error', (error) => {
              reject(new Error(`Error writing file: ${error.message}`));
            });
          } else {
            let errorData = '';
            res.on('data', (chunk) => {
              errorData += chunk;
            });
            res.on('end', () => {
              reject(new Error(`Failed to download file: ${res.statusCode} - ${errorData}`));
            });
          }
        });
        
        req.on('error', (error) => {
          reject(new Error(`Error downloading file: ${error.message}`));
        });
        
        req.end();
      });
    } catch (error) {
      this.logger.error(`Error in downloadFile: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Delete a file from Minio
   * @param bucketName The bucket containing the file
   * @param objectName The name of the object in the bucket
   */
  async deleteFile(bucketName: string, objectName: string): Promise<void> {
    try {
      // Generate the URL for the object
      const resource = `/${bucketName}/${objectName}`;
      const date = new Date().toUTCString();
      
      // Create the signature for authentication
      const stringToSign = `DELETE\n\n\n${date}\n${resource}`;
      const signature = crypto
        .createHmac('sha1', this.secretKey)
        .update(stringToSign)
        .digest('base64');
      
      // Set up the request options
      const options = {
        hostname: this.endpoint,
        port: this.port,
        path: resource,
        method: 'DELETE',
        headers: {
          'Date': date,
          'Authorization': `AWS ${this.accessKey}:${signature}`
        }
      };
      
      // Send the delete request
      return new Promise((resolve, reject) => {
        const req = (this.useSSL ? https : http).request(options, (res) => {
          if (res.statusCode === 204) {
            this.logger.log(`File deleted successfully: ${objectName}`);
            resolve();
          } else {
            let errorData = '';
            res.on('data', (chunk) => {
              errorData += chunk;
            });
            res.on('end', () => {
              reject(new Error(`Failed to delete file: ${res.statusCode} - ${errorData}`));
            });
          }
        });
        
        req.on('error', (error) => {
          reject(new Error(`Error deleting file: ${error.message}`));
        });
        
        req.end();
      });
    } catch (error) {
      this.logger.error(`Error in deleteFile: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * List objects in a bucket
   * @param bucketName The bucket to list objects from
   * @returns Array of object names
   */
  async listObjects(bucketName: string): Promise<string[]> {
    try {
      // Generate the URL for the bucket listing
      const resource = `/${bucketName}`;
      const date = new Date().toUTCString();
      
      // Create the signature for authentication
      const stringToSign = `GET\n\n\n${date}\n${resource}`;
      const signature = crypto
        .createHmac('sha1', this.secretKey)
        .update(stringToSign)
        .digest('base64');
      
      // Set up the request options
      const options = {
        hostname: this.endpoint,
        port: this.port,
        path: resource,
        method: 'GET',
        headers: {
          'Date': date,
          'Authorization': `AWS ${this.accessKey}:${signature}`
        }
      };
      
      // Send the list request
      return new Promise((resolve, reject) => {
        const req = (this.useSSL ? https : http).request(options, (res) => {
          let data = '';
          
          res.on('data', (chunk) => {
            data += chunk;
          });
          
          res.on('end', () => {
            if (res.statusCode === 200) {
              try {
                // Parse XML response to extract object names
                // This is a simplified XML parsing, you might want to use an XML parser
                const objectNames = [];
                const keyRegex = /<Key>(.*?)<\/Key>/g;
                let match;
                
                while ((match = keyRegex.exec(data)) !== null) {
                  objectNames.push(match[1]);
                }
                
                this.logger.log(`Listed ${objectNames.length} objects in bucket: ${bucketName}`);
                resolve(objectNames);
              } catch (error) {
                reject(new Error(`Error parsing response: ${error.message}`));
              }
            } else {
              reject(new Error(`Failed to list objects: ${res.statusCode} - ${data}`));
            }
          });
        });
        
        req.on('error', (error) => {
          reject(new Error(`Error listing objects: ${error.message}`));
        });
        
        req.end();
      });
    } catch (error) {
      this.logger.error(`Error in listObjects: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Ensure a bucket exists, create it if it doesn't
   * @param bucketName The bucket to check/create
   */
  private async ensureBucketExists(bucketName: string): Promise<void> {
    try {
      // Try to list the bucket to see if it exists
      const resource = `/${bucketName}`;
      const date = new Date().toUTCString();
      
      // Create the signature for authentication
      const stringToSign = `GET\n\n\n${date}\n${resource}`;
      const signature = crypto
        .createHmac('sha1', this.secretKey)
        .update(stringToSign)
        .digest('base64');
      
      // Set up the request options
      const options = {
        hostname: this.endpoint,
        port: this.port,
        path: resource,
        method: 'GET',
        headers: {
          'Date': date,
          'Authorization': `AWS ${this.accessKey}:${signature}`
        }
      };
      
      // Send the request to check if bucket exists
      return new Promise((resolve, reject) => {
        const req = (this.useSSL ? https : http).request(options, (res) => {
          if (res.statusCode === 200) {
            // Bucket exists
            this.logger.log(`Bucket exists: ${bucketName}`);
            resolve();
          } else if (res.statusCode === 404) {
            // Bucket doesn't exist, create it
            this.createBucket(bucketName)
              .then(() => resolve())
              .catch(error => reject(error));
          } else {
            let errorData = '';
            res.on('data', (chunk) => {
              errorData += chunk;
            });
            res.on('end', () => {
              reject(new Error(`Failed to check bucket: ${res.statusCode} - ${errorData}`));
            });
          }
        });
        
        req.on('error', (error) => {
          reject(new Error(`Error checking bucket: ${error.message}`));
        });
        
        req.end();
      });
    } catch (error) {
      this.logger.error(`Error in ensureBucketExists: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Create a new bucket
   * @param bucketName The bucket to create
   */
  private async createBucket(bucketName: string): Promise<void> {
    try {
      // Generate the URL for the bucket
      const resource = `/${bucketName}`;
      const date = new Date().toUTCString();
      
      // Create the signature for authentication
      const stringToSign = `PUT\n\n\n${date}\n${resource}`;
      const signature = crypto
        .createHmac('sha1', this.secretKey)
        .update(stringToSign)
        .digest('base64');
      
      // Set up the request options
      const options = {
        hostname: this.endpoint,
        port: this.port,
        path: resource,
        method: 'PUT',
        headers: {
          'Date': date,
          'Authorization': `AWS ${this.accessKey}:${signature}`,
          'x-amz-acl': 'public-read' // Make bucket publicly readable
        }
      };
      
      // Send the create bucket request
      return new Promise((resolve, reject) => {
        const req = (this.useSSL ? https : http).request(options, (res) => {
          if (res.statusCode === 200) {
            this.logger.log(`Bucket created successfully: ${bucketName}`);
            resolve();
          } else {
            let errorData = '';
            res.on('data', (chunk) => {
              errorData += chunk;
            });
            res.on('end', () => {
              reject(new Error(`Failed to create bucket: ${res.statusCode} - ${errorData}`));
            });
          }
        });
        
        req.on('error', (error) => {
          reject(new Error(`Error creating bucket: ${error.message}`));
        });
        
        req.end();
      });
    } catch (error) {
      this.logger.error(`Error in createBucket: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get the content type based on file extension
   * @param filePath The path to the file
   * @returns The MIME type for the file
   */
  private getContentType(filePath: string): string {
    const extension = path.extname(filePath).toLowerCase();
    const contentTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.txt': 'text/plain',
      '.csv': 'text/csv',
      '.html': 'text/html',
      '.htm': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.xml': 'application/xml',
      '.zip': 'application/zip',
      '.mp3': 'audio/mpeg',
      '.mp4': 'video/mp4',
      '.avi': 'video/x-msvideo',
      '.mov': 'video/quicktime',
      '.wmv': 'video/x-ms-wmv',
      '.webm': 'video/webm',
    };
    
    return contentTypes[extension] || 'application/octet-stream';
  }
}