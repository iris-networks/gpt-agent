// Utility helper functions for the Zenobia Chat Application

class Helpers {
    // Debounce function to limit function calls
    static debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func.apply(this, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(this, args);
        };
    }

    // Format timestamp for display
    static formatTimestamp(date, options = {}) {
        const defaultOptions = {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        };
        
        const formatOptions = { ...defaultOptions, ...options };
        return date.toLocaleTimeString([], formatOptions);
    }

    // Format file size in human readable format
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Generate unique ID
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Escape HTML to prevent XSS
    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Get file icon emoji based on file type
    static getFileIcon(filename, mimeType = '') {
        const ext = filename.split('.').pop().toLowerCase();
        const type = mimeType.toLowerCase();
        
        // Image files
        if (type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(ext)) {
            return '🖼️';
        }
        
        // Document files
        if (type.includes('pdf') || ext === 'pdf') return '📕';
        if (type.includes('word') || type.includes('document') || ['doc', 'docx'].includes(ext)) return '📘';
        if (type.includes('sheet') || type.includes('excel') || ['xls', 'xlsx', 'csv'].includes(ext)) return '📊';
        if (type.includes('presentation') || type.includes('powerpoint') || ['ppt', 'pptx'].includes(ext)) return '📈';
        
        // Text files
        if (type.startsWith('text/') || ['txt', 'md', 'readme'].includes(ext)) return '📄';
        if (['json', 'xml', 'yaml', 'yml', 'toml'].includes(ext)) return '🔧';
        
        // Archive files
        if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)) return '🗜️';
        
        return '📎';
    }

    // Copy text to clipboard
    static async copyToClipboard(text) {
        if (navigator.clipboard && window.isSecureContext) {
            try {
                await navigator.clipboard.writeText(text);
                return true;
            } catch (error) {
                console.error('Failed to copy to clipboard:', error);
                return false;
            }
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                const result = document.execCommand('copy');
                textArea.remove();
                return result;
            } catch (error) {
                console.error('Failed to copy to clipboard:', error);
                textArea.remove();
                return false;
            }
        }
    }

    // Check if device is mobile
    static isMobile() {
        return window.innerWidth <= 768;
    }

    // Wait for specified time
    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export for use in other modules
window.Helpers = Helpers;