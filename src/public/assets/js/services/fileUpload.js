class FileUploadService {
    constructor() {
        this.apiBase = 'http://localhost:3000/api/files';
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.uploadedFiles = [];
        this.pendingFiles = [];
    }

    async uploadFile(file) {
        // Check file size
        if (file.size > this.maxFileSize) {
            throw new Error(`File "${file.name}" exceeds maximum size of 10MB`);
        }

        // Check if it's a video file (not allowed)
        if (file.type.startsWith('video/')) {
            throw new Error(`Video files are not allowed`);
        }

        const formData = new FormData();
        formData.append('files', file);

        try {
            const response = await fetch(`${this.apiBase}/upload`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Upload failed: ${errorText}`);
            }

            const result = await response.json();
            console.log('File uploaded successfully:', result);
            
            // Add to uploaded files list
            if (result.files && result.files.length > 0) {
                this.uploadedFiles.push(...result.files);
            }
            
            return result;
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    }

    async uploadMultipleFiles(files) {
        const uploadPromises = Array.from(files).map(file => this.uploadFile(file));
        
        try {
            const results = await Promise.all(uploadPromises);
            return results;
        } catch (error) {
            console.error('Multiple file upload error:', error);
            throw error;
        }
    }

    // File validation helpers
    isValidFileType(file) {
        return !file.type.startsWith('video/');
    }

    isValidFileSize(file) {
        return file.size <= this.maxFileSize;
    }

    validateFile(file) {
        const errors = [];
        
        if (!this.isValidFileSize(file)) {
            errors.push(`File "${file.name}" exceeds maximum size of 10MB`);
        }
        
        if (!this.isValidFileType(file)) {
            errors.push(`Video files are not allowed`);
        }
        
        return errors;
    }

    validateFiles(files) {
        const allErrors = [];
        
        Array.from(files).forEach(file => {
            const errors = this.validateFile(file);
            allErrors.push(...errors);
        });
        
        return allErrors;
    }

    // UI Helper methods
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    getFileIcon(file) {
        const type = file.type || '';
        
        if (type.startsWith('image/')) return '🖼️';
        if (type.startsWith('text/')) return '📄';
        if (type.includes('pdf')) return '📕';
        if (type.includes('word') || type.includes('document')) return '📘';
        if (type.includes('sheet') || type.includes('excel')) return '📊';
        if (type.includes('presentation') || type.includes('powerpoint')) return '📈';
        if (type.includes('zip') || type.includes('archive')) return '🗜️';
        if (type.includes('json') || type.includes('xml')) return '🔧';
        
        return '📎';
    }

    // Manage pending files for current session
    addPendingFile(file, fileInfo) {
        this.pendingFiles.push({
            file: file,
            info: fileInfo,
            uploaded: false
        });
    }

    removePendingFile(fileName) {
        this.pendingFiles = this.pendingFiles.filter(item => item.file.name !== fileName);
    }

    clearPendingFiles() {
        this.pendingFiles = [];
    }

    getPendingFiles() {
        return this.pendingFiles;
    }

    // Get file references for session creation
    getFileReferencesForSession() {
        return this.uploadedFiles.map(file => ({
            id: file.id,
            filename: file.filename,
            originalName: file.originalName,
            mimeType: file.mimeType,
            size: file.size || 0
        }));
    }
}

// Export for use in other modules
window.FileUploadService = FileUploadService;