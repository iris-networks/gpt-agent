/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { Router } from 'express';
import sessionRoutes from './sessions';
import configRoutes from './config';
import operatorsRoutes from './operators';

const router: Router = Router();

// Mount routes
router.use(sessionRoutes);
router.use(configRoutes);
router.use(operatorsRoutes);

export default router;
