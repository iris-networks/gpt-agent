// Status enum based on the backend
export const StatusEnum = {
  INITIALIZING: 'initializing',
  RUNNING: 'running',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  ERROR: 'error',
  CANCELLED: 'cancelled',
  END: 'end',
  MAX_LOOP: 'max_loop'
};

// Video recording status enum
export const VideoStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  READY: 'ready',
  ERROR: 'error'
};

// Helper functions
export const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
};