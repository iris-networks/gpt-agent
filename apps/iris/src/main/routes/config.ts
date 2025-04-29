/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { Router } from 'express';
import { ConfigService } from '../services/config';
import { API_ENDPOINTS } from '../../shared/constants';
import { apiLogger } from '../utils/logger';
import { ConfigUpdateRequest } from '../../shared/types';

const router: Router = Router();
const configService = ConfigService.getInstance();

/**
 * Get current configuration
 * GET /api/config
 */
router.get(API_ENDPOINTS.CONFIG, (req, res) => {
  try {
    const config = configService.getConfig();

    // Mask sensitive data like API keys
    const safeConfig = {
      ...config,
      vlmApiKey: config.vlmApiKey ? '******' : '',
    };

    res.json(safeConfig);
  } catch (error: any) {
    apiLogger.error('Failed to get configuration:', error);
    res
      .status(500)
      .json({ error: error.message || 'Failed to get configuration' });
  }
});

/**
 * Update configuration
 * PUT /api/config
 */
router.put(API_ENDPOINTS.CONFIG, (req, res) => {
  try {
    const request: ConfigUpdateRequest = req.body;

    if (!request.config) {
      return res.status(400).json({ error: 'Config object is required' });
    }

    const updatedConfig = configService.updateConfig(request.config);

    // Mask sensitive data like API keys
    const safeConfig = {
      ...updatedConfig,
      vlmApiKey: updatedConfig.vlmApiKey ? '******' : '',
    };

    apiLogger.info('Configuration updated');
    res.json(safeConfig);
  } catch (error: any) {
    apiLogger.error('Failed to update configuration:', error);
    res
      .status(500)
      .json({ error: error.message || 'Failed to update configuration' });
  }
});

export default router;
