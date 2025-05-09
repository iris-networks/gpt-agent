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