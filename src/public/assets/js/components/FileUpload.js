// File Upload Component with drag-and-drop support
export class FileUpload {
  constructor(eventBus, fileService) {
    this.eventBus = eventBus;
    this.fileService = fileService;
    this.attachedFiles = [];
    this.uploadedFiles = [];
    this.dragCounter = 0;
    
    this.dropZone = null;
    this.fileInput = null;
    this.fileList = null;
  }
  
  init() {
    this.dropZone = document.getElementById('file-drop-zone');
    this.fileInput = document.getElementById('file-input');
    this.fileList = document.getElementById('file-list');
    
    if (!this.dropZone || !this.fileInput || !this.fileList) {
      console.error('File upload elements not found');
      return;
    }
    
    this.setupEventListeners();
    this.loadUploadedFiles();
    
    console.log('FileUpload component initialized');
  }
  
  setupEventListeners() {
    // Drop zone events
    this.dropZone.addEventListener('click', () => this.fileInput.click());
    this.dropZone.addEventListener('dragover', this.handleDragOver.bind(this));
    this.dropZone.addEventListener('dragenter', this.handleDragEnter.bind(this));
    this.dropZone.addEventListener('dragleave', this.handleDragLeave.bind(this));
    this.dropZone.addEventListener('drop', this.handleDrop.bind(this));
    
    // File input events
    this.fileInput.addEventListener('change', this.handleFileSelect.bind(this));
    
    // Service events
    this.eventBus.on('fileUploaded', this.handleFileUploaded.bind(this));
    this.eventBus.on('fileUploadError', this.handleFileUploadError.bind(this));
    this.eventBus.on('fileDeleted', this.handleFileDeleted.bind(this));
    this.eventBus.on('fileListUpdated', this.handleFileListUpdated.bind(this));
    
    // Prevent default drag behaviors on window
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      document.addEventListener(eventName, this.preventDefaults.bind(this), false);
    });
  }
  
  preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  // Drag and drop handlers
  handleDragEnter(e) {
    this.preventDefaults(e);
    this.dragCounter++;
    this.dropZone.classList.add('drag-over');
  }
  
  handleDragLeave(e) {
    this.preventDefaults(e);
    this.dragCounter--;
    
    if (this.dragCounter === 0) {
      this.dropZone.classList.remove('drag-over');
    }
  }
  
  handleDragOver(e) {
    this.preventDefaults(e);
    e.dataTransfer.dropEffect = 'copy';
  }
  
  handleDrop(e) {
    this.preventDefaults(e);
    this.dragCounter = 0;
    this.dropZone.classList.remove('drag-over');
    
    const files = Array.from(e.dataTransfer.files);
    this.handleFiles(files);
  }
  
  handleFileSelect(e) {
    const files = Array.from(e.target.files);
    this.handleFiles(files);
  }
  
  async handleFiles(files) {
    if (files.length === 0) return;
    
    // Validate files
    const validFiles = [];
    const invalidFiles = [];
    
    files.forEach(file => {
      const validation = this.fileService.validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        invalidFiles.push({ file, error: validation.error });
      }
    });
    
    // Show validation errors
    if (invalidFiles.length > 0) {
      this.showValidationErrors(invalidFiles);
    }
    
    // Upload valid files
    if (validFiles.length > 0) {
      await this.uploadFiles(validFiles);
    }
  }
  
  async uploadFiles(files) {
    const uploadPromises = files.map(file => this.uploadSingleFile(file));
    
    try {
      const results = await Promise.allSettled(uploadPromises);
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          this.addToAttachedFiles(result.value);
        } else {
          console.error(`Upload failed for ${files[index].name}:`, result.reason);
          this.showError(`Failed to upload ${files[index].name}: ${result.reason.message}`);
        }
      });
      
      this.updateFileList();
    } catch (error) {
      console.error('Upload error:', error);
      this.showError('Upload failed');
    }
  }
  
  async uploadSingleFile(file) {
    return new Promise((resolve, reject) => {
      const fileItem = this.createFileItem(file, 'uploading');
      this.fileList.appendChild(fileItem);
      
      const progressBar = fileItem.querySelector('.progress');
      
      this.fileService.uploadFile(file, (progress) => {
        if (progressBar) {
          progressBar.value = progress;
        }
      }).then(response => {
        // Update file item with uploaded info
        this.updateFileItem(fileItem, response, 'uploaded');
        resolve(response);
      }).catch(error => {
        // Update file item with error
        this.updateFileItem(fileItem, null, 'error', error.message);
        reject(error);
      });
    });
  }
  
  createFileItem(file, status = 'pending') {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.dataset.status = status;
    
    const fileIcon = this.fileService.getFileIcon(file.type);
    const fileSize = this.fileService.formatFileSize(file.size);
    
    fileItem.innerHTML = `
      <div class="file-info">
        <span class="file-icon text-2xl">${fileIcon}</span>
        <div class="file-details">
          <div class="file-name">${file.name}</div>
          <div class="file-size">${fileSize}</div>
        </div>
      </div>
      <div class="file-status">
        ${status === 'uploading' ? `
          <progress class="progress progress-primary w-20" value="0" max="100"></progress>
        ` : ''}
        <div class="file-actions">
          <button class="btn btn-sm btn-circle btn-error remove-file">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    `;
    
    // Add remove button handler
    const removeBtn = fileItem.querySelector('.remove-file');
    removeBtn.addEventListener('click', () => this.removeFileItem(fileItem));
    
    return fileItem;
  }
  
  updateFileItem(fileItem, response, status, errorMessage = null) {
    fileItem.dataset.status = status;
    
    const statusDiv = fileItem.querySelector('.file-status');
    
    if (status === 'uploaded' && response) {
      fileItem.dataset.fileId = response.fileId;
      statusDiv.innerHTML = `
        <div class="badge badge-success badge-sm">Uploaded</div>
        <div class="file-actions">
          <button class="btn btn-sm btn-circle btn-error remove-file">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      `;
    } else if (status === 'error') {
      statusDiv.innerHTML = `
        <div class="badge badge-error badge-sm" title="${errorMessage}">Error</div>
        <div class="file-actions">
          <button class="btn btn-sm btn-circle btn-error remove-file">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      `;
    }
    
    // Re-attach remove button handler
    const removeBtn = fileItem.querySelector('.remove-file');
    removeBtn.addEventListener('click', () => this.removeFileItem(fileItem));
  }
  
  removeFileItem(fileItem) {
    const fileId = fileItem.dataset.fileId;
    
    if (fileId) {
      // Remove from attached files
      this.attachedFiles = this.attachedFiles.filter(f => f.fileId !== fileId);
      
      // Optionally delete from server
      if (confirm('Delete this file from server?')) {
        this.fileService.deleteFile(fileId).catch(error => {
          console.error('Error deleting file:', error);
        });
      }
    }
    
    fileItem.remove();
    this.updateAttachedFilesList();
  }
  
  addToAttachedFiles(fileResponse) {
    const fileMetadata = this.fileService.createFileMetadata(fileResponse);
    this.attachedFiles.push(fileMetadata);
    this.updateAttachedFilesList();
  }
  
  updateAttachedFilesList() {
    this.eventBus.emit('attachedFilesUpdated', this.attachedFiles);
  }
  
  updateFileList() {
    // This method can be extended to show a different view of files
    // For now, the individual file items handle their own updates
  }
  
  // File management
  async loadUploadedFiles() {
    try {
      const files = await this.fileService.getFileList();
      this.uploadedFiles = files;
      this.updateUploadedFilesList();
    } catch (error) {
      console.error('Error loading uploaded files:', error);
    }
  }
  
  updateUploadedFilesList() {
    const uploadedFilesList = document.getElementById('uploaded-files-list');
    if (!uploadedFilesList) return;
    
    if (this.uploadedFiles.length === 0) {
      uploadedFilesList.innerHTML = '<p class="text-sm text-base-content/50">No files uploaded</p>';
      return;
    }
    
    uploadedFilesList.innerHTML = this.uploadedFiles.map(file => `
      <div class="file-item bg-base-200 p-2 rounded">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <span class="text-lg">${this.fileService.getFileIcon(file.mimeType)}</span>
            <div>
              <div class="text-sm font-medium">${file.originalName}</div>
              <div class="text-xs opacity-70">${this.fileService.formatFileSize(file.fileSize)}</div>
            </div>
          </div>
          <div class="flex space-x-1">
            <button class="btn btn-xs btn-primary" onclick="window.open('${this.fileService.getDownloadUrl(file.fileName)}', '_blank')">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </button>
            <button class="btn btn-xs btn-error" onclick="this.deleteUploadedFile('${file.fileId}')">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }
  
  async deleteUploadedFile(fileId) {
    if (!confirm('Are you sure you want to delete this file?')) return;
    
    try {
      await this.fileService.deleteFile(fileId);
      this.uploadedFiles = this.uploadedFiles.filter(f => f.fileId !== fileId);
      this.updateUploadedFilesList();
    } catch (error) {
      console.error('Error deleting file:', error);
      this.showError('Failed to delete file');
    }
  }
  
  // Public methods
  getAttachedFiles() {
    return this.attachedFiles;
  }
  
  clearAttachedFiles() {
    this.attachedFiles = [];
    this.fileList.innerHTML = '';
    this.updateAttachedFilesList();
  }
  
  addExistingFile(fileInfo) {
    const fileMetadata = this.fileService.createFileMetadata(fileInfo);
    this.attachedFiles.push(fileMetadata);
    
    // Create file item for display
    const fileItem = this.createFileItem({
      name: fileInfo.originalName,
      size: fileInfo.fileSize,
      type: fileInfo.mimeType
    }, 'uploaded');
    
    fileItem.dataset.fileId = fileInfo.fileId;
    this.fileList.appendChild(fileItem);
    
    this.updateAttachedFilesList();
  }
  
  // Error handling
  showValidationErrors(invalidFiles) {
    const errorMessages = invalidFiles.map(({ file, error }) => 
      `${file.name}: ${error}`
    ).join('\n');
    
    this.showError(`File validation errors:\n${errorMessages}`);
  }
  
  showError(message) {
    this.eventBus.emit('error', { message });
  }
  
  showSuccess(message) {
    this.eventBus.emit('success', { message });
  }
  
  // Event handlers
  handleFileUploaded(response) {
    console.log('File uploaded:', response);
    this.showSuccess(`File "${response.originalName}" uploaded successfully`);
  }
  
  handleFileUploadError(data) {
    console.error('File upload error:', data);
    this.showError(`Failed to upload "${data.file.name}": ${data.error}`);
  }
  
  handleFileDeleted(data) {
    console.log('File deleted:', data);
    this.uploadedFiles = this.uploadedFiles.filter(f => f.fileId !== data.fileId);
    this.updateUploadedFilesList();
    this.showSuccess('File deleted successfully');
  }
  
  handleFileListUpdated(files) {
    this.uploadedFiles = files;
    this.updateUploadedFilesList();
  }
}

// Make deleteUploadedFile available globally for onclick handlers
window.deleteUploadedFile = function(fileId) {
  if (window.zenobiaApp && window.zenobiaApp.fileUpload) {
    window.zenobiaApp.fileUpload.deleteUploadedFile(fileId);
  }
};