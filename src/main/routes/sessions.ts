/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { Router } from 'express';
import { SessionManager } from '../services/session-manager';
import { API_ENDPOINTS } from '../../shared/constants';
import { apiLogger } from '../utils/logger';
import { CreateSessionRequest } from '../../shared/types';

const router: Router = Router();
const sessionManager = SessionManager.getInstance();

/**
 * Create a new session
 * POST /api/sessions
 */
router.post(API_ENDPOINTS.SESSIONS, async (req, res) => {
  try {
    const request: CreateSessionRequest = req.body;

    if (!request.instructions) {
      return res.status(400).json({ error: 'Instructions are required' });
    }

    const sessionId = await sessionManager.createSession(request);

    apiLogger.info(`Session created: ${sessionId}`);
    res.status(201).json({ sessionId });
  } catch (error: any) {
    apiLogger.error('Failed to create session:', error);
    res
      .status(500)
      .json({ error: error.message || 'Failed to create session' });
  }
});

/**
 * Get session status
 * GET /api/sessions/:sessionId
 */
router.get(API_ENDPOINTS.SESSION, (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const session = sessionManager.getSession(sessionId);
    res.json(session);
  } catch (error: any) {
    apiLogger.error(`Failed to get session: ${req.params.sessionId}`, error);

    if (error.message === 'Session not found') {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.status(500).json({ error: error.message || 'Failed to get session' });
  }
});

/**
 * Cancel a session
 * POST /api/sessions/:sessionId/cancel
 */
router.post(API_ENDPOINTS.CANCEL_SESSION, (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const result = sessionManager.cancelSession(sessionId);
    apiLogger.info(`Session cancelled: ${sessionId}`);
    res.json({ success: result });
  } catch (error: any) {
    apiLogger.error(`Failed to cancel session: ${req.params.sessionId}`, error);

    if (error.message === 'Session not found') {
      return res.status(404).json({ error: 'Session not found' });
    }

    res
      .status(500)
      .json({ error: error.message || 'Failed to cancel session' });
  }
});

/**
 * Get a screenshot
 * GET /api/sessions/:sessionId/screenshot
 */
router.get(API_ENDPOINTS.SCREENSHOT, async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const screenshot = await sessionManager.takeScreenshot(sessionId);
    res.json({
      success: true,
      screenshot,
    });
  } catch (error: any) {
    apiLogger.error(
      `Failed to take screenshot for session: ${req.params.sessionId}`,
      error,
    );

    if (error.message === 'Session not found') {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to take screenshot',
    });
  }
});

export default router;
