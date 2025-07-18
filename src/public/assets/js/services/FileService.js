// File Service for handling file uploads and management
export class FileService {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.baseUrl = '/api/files';
    this.uploadedFiles = new Map();
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
    this.allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'text/plain',
      'text/csv',
      'application/pdf',
      'application/json',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
  }
  
  // File upload methods
  async uploadFile(file, onProgress = null) {
    try {
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }
      
      const formData = new FormData();
      formData.append('file', file);
      
      // Create XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable && onProgress) {
            const percentComplete = (e.loaded / e.total) * 100;
            onProgress(percentComplete);
          }
        });
        
        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            try {
              const response = JSON.parse(xhr.responseText);
              this.uploadedFiles.set(response.fileId, {
                ...response,
                uploadedAt: new Date().toISOString()
              });
              
              this.eventBus.emit('fileUploaded', response);
              resolve(response);
            } catch (error) {
              reject(new Error('Invalid response from server'));
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });
        
        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });
        
        xhr.addEventListener('timeout', () => {
          reject(new Error('Upload timeout'));
        });
        
        xhr.open('POST', `${this.baseUrl}/upload`);
        xhr.timeout = 300000; // 5 minutes timeout
        xhr.send(formData);
      });
    } catch (error) {
      console.error('File upload error:', error);
      this.eventBus.emit('fileUploadError', { file, error: error.message });
      throw error;
    }
  }
  
  async uploadMultipleFiles(files, onProgress = null) {
    const results = [];
    const errors = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        const result = await this.uploadFile(file, (progress) => {
          if (onProgress) {
            const totalProgress = ((i / files.length) * 100) + (progress / files.length);
            onProgress(totalProgress, i, file.name);
          }
        });
        
        results.push(result);
      } catch (error) {
        errors.push({ file: file.name, error: error.message });
      }
    }
    
    return { results, errors };
  }
  
  // File validation
  validateFile(file) {
    if (!file) {
      return { valid: false, error: 'No file provided' };
    }
    
    if (file.size > this.maxFileSize) {
      return { 
        valid: false, 
        error: `File size exceeds ${this.formatFileSize(this.maxFileSize)} limit` 
      };
    }
    
    if (!this.allowedTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: `File type ${file.type} is not supported` 
      };
    }
    
    // Check for video files specifically
    if (file.type.startsWith('video/')) {
      return { 
        valid: false, 
        error: 'Video files are not supported' 
      };
    }
    
    return { valid: true };
  }
  
  // File management methods
  async getFileList() {
    try {
      const response = await fetch(`${this.baseUrl}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch file list: ${response.status}`);
      }
      
      const files = await response.json();
      
      // Update local cache
      files.forEach(file => {
        this.uploadedFiles.set(file.fileId, file);
      });
      
      this.eventBus.emit('fileListUpdated', files);
      return files;
    } catch (error) {
      console.error('Error fetching file list:', error);
      this.eventBus.emit('error', { message: 'Failed to fetch file list' });
      throw error;
    }
  }
  
  async getFileInfo(fileId) {
    try {
      const response = await fetch(`${this.baseUrl}/${fileId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch file info: ${response.status}`);
      }
      
      const fileInfo = await response.json();
      this.uploadedFiles.set(fileId, fileInfo);
      
      return fileInfo;
    } catch (error) {
      console.error('Error fetching file info:', error);
      throw error;
    }
  }
  
  async deleteFile(fileId) {
    try {
      const response = await fetch(`${this.baseUrl}/${fileId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete file: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Remove from local cache
      this.uploadedFiles.delete(fileId);
      
      this.eventBus.emit('fileDeleted', { fileId, result });
      return result;
    } catch (error) {
      console.error('Error deleting file:', error);
      this.eventBus.emit('error', { message: 'Failed to delete file' });
      throw error;
    }
  }
  
  getDownloadUrl(filename) {
    return `${this.baseUrl}/download/${filename}`;
  }
  
  // File utility methods
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  getFileIcon(mimeType) {
    if (mimeType.startsWith('image/')) {
      return '🖼️';
    } else if (mimeType.startsWith('text/')) {
      return '📄';
    } else if (mimeType === 'application/pdf') {
      return '📕';
    } else if (mimeType.includes('word') || mimeType.includes('document')) {
      return '📝';
    } else if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
      return '📊';
    } else if (mimeType === 'application/json') {
      return '📋';
    } else {
      return '📎';
    }
  }
  
  isImageFile(mimeType) {
    return mimeType.startsWith('image/');
  }
  
  // Local cache management
  getCachedFile(fileId) {
    return this.uploadedFiles.get(fileId);
  }
  
  getCachedFiles() {
    return Array.from(this.uploadedFiles.values());
  }
  
  clearCache() {
    this.uploadedFiles.clear();
  }
  
  // Create file metadata for session
  createFileMetadata(fileResponse) {
    return {
      fileId: fileResponse.fileId,
      fileName: fileResponse.fileName,
      originalName: fileResponse.originalName,
      mimeType: fileResponse.mimeType,
      fileSize: fileResponse.fileSize
    };
  }
  
  // Bulk operations
  async deleteMultipleFiles(fileIds) {
    const results = [];
    const errors = [];
    
    for (const fileId of fileIds) {
      try {
        const result = await this.deleteFile(fileId);
        results.push({ fileId, result });
      } catch (error) {
        errors.push({ fileId, error: error.message });
      }
    }
    
    return { results, errors };
  }
  
  // File preview methods
  async getFilePreview(fileId) {
    try {
      const fileInfo = await this.getFileInfo(fileId);
      
      if (this.isImageFile(fileInfo.mimeType)) {
        return {
          type: 'image',
          url: this.getDownloadUrl(fileInfo.fileName),
          alt: fileInfo.originalName
        };
      } else if (fileInfo.mimeType === 'text/plain') {
        // For text files, we could fetch and show a preview
        return {
          type: 'text',
          url: this.getDownloadUrl(fileInfo.fileName)
        };
      } else {
        return {
          type: 'file',
          icon: this.getFileIcon(fileInfo.mimeType),
          name: fileInfo.originalName,
          size: this.formatFileSize(fileInfo.fileSize)
        };
      }
    } catch (error) {
      console.error('Error getting file preview:', error);
      return null;
    }
  }
}