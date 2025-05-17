/**
 * Status enum for the application
 */
const StatusEnum = {
  INIT: 'init',
  RUNNING: 'running',
  PAUSE: 'pause',
  END: 'end',
  CALL_USER: 'call_user',
  MAX_LOOP: 'max_loop',
  USER_STOPPED: 'user_stopped',
  ERROR: 'error',
};

/**
 * API endpoints
 */
const API_ENDPOINTS = {
  // RPA endpoints
  RPA: '/api/rpa',
  RPA_EXECUTE: '/api/rpa/execute',
  RPA_STATUS: (executionId) => `/api/rpa/${executionId}/status`,
  RPA_STOP: (executionId) => `/api/rpa/${executionId}/stop`,
};

// Export constants
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { StatusEnum, API_ENDPOINTS };
}