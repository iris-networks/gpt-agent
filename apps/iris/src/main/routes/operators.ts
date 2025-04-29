/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { Router, Request, Response } from 'express';
import path from 'path';
import { OperatorFactory } from '../services/operator-factory';
import { OperatorType, API_ENDPOINTS } from '../../shared/constants';
import { GUIAgent } from '@ui-tars/sdk';
import { StatusEnum, UITarsModelVersion } from '@ui-tars/shared/types';
import { operatorLogger as logger } from '../utils/logger';
import { getSystemPrompt, getSystemPromptV1_5 } from './prompts';
import { Operator } from '@ui-tars/sdk/src/types';

// Define interfaces for complex types
interface VlmConfig {
  baseUrl?: string;
  apiKey?: string;
  modelName?: string;
  provider?: string;
}

interface OperatorSettings {
  maxLoopCount?: number;
  loopIntervalInMs?: number;
  language?: 'en' | 'zh';
}

interface OperatorData {
  id: string;
  type: OperatorType;
  instance: any; // Consider defining a more specific type for the operator instance
  abortController: AbortController;
  status: StatusEnum | 'READY' | 'INIT'; // Use a union of possible statuses
  vlmConfig: VlmConfig;
  settings: OperatorSettings;
  createdAt: string;
  conversations?: any[]; // Define a proper type for conversations if possible
  agent?: GUIAgent<Operator>;
  errorMsg: string;
}

interface HandleDataPayload {
  status: StatusEnum;
  conversations: any[]; // Define a proper type for conversations if possible
}

interface OnErrorPayload {
  error: { code?: string; message?: string; [key: string]: any }; // Allow other potential error properties
}

const router: Router = Router();

// Maintain a map of active operators
const activeOperators = new Map<string, OperatorData>();

// VLM provider options for dropdown
const VLM_PROVIDERS: {
  id: string;
  name: string;
  version: UITarsModelVersion;
}[] = [
  { id: 'ui_tars_1_5', name: 'UI-TARS 1.5', version: UITarsModelVersion.V1_5 },
  { id: 'ui_tars_1_0', name: 'UI-TARS 1.0', version: UITarsModelVersion.V1_0 },
  {
    id: 'doubao_1_5',
    name: 'Doubao 1.5 15B',
    version: UITarsModelVersion.DOUBAO_1_5_15B,
  },
];

// Operation mode options
const OPERATOR_MODES: { id: OperatorType; name: string }[] = [
  { id: OperatorType.BROWSER, name: 'Browser Automation' },
  { id: OperatorType.COMPUTER, name: 'Computer Automation (NutJS)' },
];

/**
 * Get available configurations
 */
router.get('/api/operators/configs', (req: Request, res: Response) => {
  res.json({
    providers: VLM_PROVIDERS,
    modes: OPERATOR_MODES,
    defaultSettings: {
      maxLoopCount: 10,
      loopIntervalInMs: 1000,
      language: 'en',
    },
  });
});

/**
 * Initialize an operator for use
 */
router.post('/api/operators/init', async (req: Request, res: Response) => {
  try {
    const {
      operatorType = OperatorType.BROWSER,
      vlmConfig = {} as VlmConfig, // Add type assertion
      settings = {} as OperatorSettings, // Add type assertion
    } = req.body;

    if (!Object.values(OperatorType).includes(operatorType)) {
      return res.status(400).json({ error: 'Invalid operator type' });
    }

    // Generate a unique operator ID
    const operatorId: string = Date.now().toString();

    // Set up abort controller for this operation
    const abortController = new AbortController();

    // Create the operator instance
    logger.info(`Initializing operator ${operatorId} of type ${operatorType}`);
    const operator = await OperatorFactory.createOperator(operatorType);

    // Store operator with its metadata
    const newOperatorData = <OperatorData>{
      id: operatorId,
      type: operatorType,
      instance: operator,
      abortController,
      status: 'READY',
      vlmConfig,
      settings,
      createdAt: new Date().toISOString(),
    };
    activeOperators.set(operatorId, newOperatorData);

    res.json({
      operatorId,
      status: 'READY',
      message: `${operatorType} operator initialized successfully`,
    });
  } catch (error: any) {
    // Add type for caught error
    logger.error('Failed to initialize operator:', error);
    res.status(500).json({
      error: 'Failed to initialize operator',
      message: error.message,
    });
  }
});

/**
 * Execute instructions with an operator
 */
router.post(
  '/api/operators/:operatorId/execute',
  async (req: Request, res: Response) => {
    try {
      const { operatorId } = req.params;
      const { instructions }: { instructions: string } = req.body; // Add type for instructions

      if (!instructions) {
        return res.status(400).json({ error: 'Instructions are required' });
      }

      if (!activeOperators.has(operatorId)) {
        return res.status(404).json({ error: 'Operator not found' });
      }

      const operatorData = activeOperators.get(operatorId);
      if (!operatorData) {
        // This case should ideally not happen due to the check above, but good for type safety
        return res
          .status(404)
          .json({ error: 'Operator data unexpectedly missing' });
      }
      const {
        instance: operator,
        abortController,
        vlmConfig,
        settings,
      } = operatorData;

      // Update operator status
      operatorData.status = StatusEnum.INIT;
      activeOperators.set(operatorId, operatorData);

      // Set up response object to track events (Type can be inferred or explicitly defined if needed)
      // const responseData = {
      //   operatorId,
      //   status: StatusEnum.INIT,
      //   conversations: [],
      //   events: []
      // };

      // Set up response
      res.json({
        operatorId,
        status: StatusEnum.INIT,
        message: 'Execution started',
      });

      // Create data handler to collect conversations and events
      const handleData = ({ data }: { data: HandleDataPayload }) => {
        // Add type for the destructured parameter
        const { status, conversations } = data;
        logger.info(`Operator ${operatorId} status update: ${status}`);

        // Update operator status
        operatorData.status = status;
        operatorData.conversations = conversations;
        activeOperators.set(operatorId, operatorData);
      };

      // Determine which system prompt to use based on VLM provider
      const getModelVersion = (
        provider: string | undefined,
      ): UITarsModelVersion => {
        // Add parameter and return types
        const providerObj = VLM_PROVIDERS.find((p) => p.id === provider);
        return providerObj ? providerObj.version : UITarsModelVersion.V1_5; // Default version
      };

      // Create GUI agent
      const guiAgent = new GUIAgent({
        model: {
          baseURL: vlmConfig.baseUrl || process.env.VLM_BASE_URL,
          apiKey: vlmConfig.apiKey || process.env.VLM_API_KEY,
          model: vlmConfig.modelName || process.env.VLM_MODEL_NAME || '',
        },
        systemPrompt:
          getModelVersion(vlmConfig.provider) === UITarsModelVersion.V1_5
            ? getSystemPromptV1_5(settings.language || 'en', 'normal')
            : getSystemPrompt(settings.language || 'en'),
        signal: abortController.signal,
        operator: operator,
        onData: handleData,
        onError: ({ data, error }) => {
          // Add type for the destructured parameter
          logger.error(`[Operator ${operatorId} error]`, error);
          operatorData.status = StatusEnum.ERROR;
          operatorData.errorMsg =
            `${error.code || ''} ${error.stack || 'Unknown error'}`.trim();
          activeOperators.set(operatorId, operatorData);
        },
        retry: {
          model: { maxRetries: 3 },
          screenshot: { maxRetries: 5 },
          execute: { maxRetries: 1 },
        },
        maxLoopCount: settings.maxLoopCount || 10,
        loopIntervalInMs: settings.loopIntervalInMs || 1000,
        uiTarsVersion: getModelVersion(vlmConfig.provider),
      });

      // Store the agent in operatorData
      operatorData.agent = guiAgent;
      activeOperators.set(operatorId, operatorData);

      // Run the agent with instructions
      guiAgent
        .run(instructions)
        .catch((e: Error) => {
          // Add type for caught error
          logger.error(`[Operator ${operatorId} run error]`, e);
          operatorData.status = StatusEnum.ERROR;
          operatorData.errorMsg = e.message;
          activeOperators.set(operatorId, operatorData);
        })
        .finally(() => {
          if (
            operatorData.status !== StatusEnum.ERROR &&
            operatorData.status !== StatusEnum.USER_STOPPED && // Check for CANCELLED status
            operatorData.status !== StatusEnum.END
          ) {
            // Also check for END status if applicable
            operatorData.status = StatusEnum.END;
            activeOperators.set(operatorId, operatorData);
          }
          logger.info(
            `Operator ${operatorId} execution finished with status: ${operatorData.status}`,
          );
        });
    } catch (error: any) {
      // Add type for caught error
      logger.error('Failed to execute instructions:', error);
      res.status(500).json({
        error: 'Failed to execute instructions',
        message: error.message,
      });
    }
  },
);

/**
 * Get operator status
 */
router.get('/api/operators/:operatorId', (req: Request, res: Response) => {
  const { operatorId } = req.params;

  if (!activeOperators.has(operatorId)) {
    return res.status(404).json({ error: 'Operator not found' });
  }

  const operatorData = activeOperators.get(operatorId);
  if (!operatorData) {
    // This case should ideally not happen due to the check above, but good for type safety
    return res
      .status(404)
      .json({ error: 'Operator data unexpectedly missing' });
  }

  // Return operator data without instance to avoid circular references
  // Use Omit to create a type that excludes specific properties
  const { instance, agent, abortController, ...safeData } = operatorData;

  res.json(safeData);
});

/**
 * Get operator conversations
 */
router.get(
  '/api/operators/:operatorId/conversations',
  (req: Request, res: Response) => {
    const { operatorId } = req.params;

    if (!activeOperators.has(operatorId)) {
      return res.status(404).json({ error: 'Operator not found' });
    }

    const operatorData = activeOperators.get(operatorId);
    if (!operatorData) {
      // This case should ideally not happen due to the check above, but good for type safety
      return res
        .status(404)
        .json({ error: 'Operator data unexpectedly missing' });
    }

    res.json({
      operatorId,
      conversations: operatorData.conversations || [],
    });
  },
);

/**
 * Cancel an operation
 */
router.post(
  '/api/operators/:operatorId/cancel',
  (req: Request, res: Response) => {
    const { operatorId } = req.params;

    if (!activeOperators.has(operatorId)) {
      return res.status(404).json({ error: 'Operator not found' });
    }

    const operatorData = activeOperators.get(operatorId);
    if (!operatorData) {
      // This case should ideally not happen due to the check above, but good for type safety
      return res
        .status(404)
        .json({ error: 'Operator data unexpectedly missing' });
    }
    operatorData.abortController.abort();
    operatorData.status = StatusEnum.USER_STOPPED; // Use CANCELLED status here
    activeOperators.set(operatorId, operatorData);

    res.json({
      operatorId,
      status: StatusEnum.USER_STOPPED,
      message: 'Operation cancelled successfully',
    });
  },
);

/**
 * Take a screenshot
 */
router.get(
  '/api/operators/:operatorId/screenshot',
  async (req: Request, res: Response) => {
    const { operatorId } = req.params;

    if (!activeOperators.has(operatorId)) {
      return res.status(404).json({ error: 'Operator not found' });
    }

    try {
      const operatorData = activeOperators.get(operatorId);
      if (!operatorData) {
        // This case should ideally not happen due to the check above, but good for type safety
        return res
          .status(404)
          .json({ error: 'Operator data unexpectedly missing' });
      }
      const { instance: operator } = operatorData;

      // Take screenshot
      const screenshot: Buffer = await operator.takeScreenshot(); // Add Buffer type

      res.json({
        operatorId,
        success: true,
        screenshot: screenshot.toString('base64'),
      });
    } catch (error: any) {
      // Add type for caught error
      logger.error(
        `Failed to take screenshot for operator ${operatorId}:`,
        error,
      );
      res.status(500).json({
        error: 'Failed to take screenshot',
        message: error.message,
      });
    }
  },
);

/**
 * Close and remove an operator
 */
router.delete(
  '/api/operators/:operatorId',
  async (req: Request, res: Response) => {
    const { operatorId } = req.params;

    if (!activeOperators.has(operatorId)) {
      return res.status(404).json({ error: 'Operator not found' });
    }

    try {
      const operatorData = activeOperators.get(operatorId);
      if (!operatorData) {
        // This case should ideally not happen due to the check above, but good for type safety
        return res
          .status(404)
          .json({ error: 'Operator data unexpectedly missing' });
      }
      const { instance: operator, type } = operatorData;

      // Cancel any ongoing operations
      operatorData.abortController.abort();

      // Close operator
      await OperatorFactory.closeOperator(operator, type);

      // Remove from active operators
      activeOperators.delete(operatorId);

      res.json({
        operatorId,
        success: true,
        message: 'Operator closed successfully',
      });
    } catch (error: any) {
      // Add type for caught error
      logger.error(`Failed to close operator ${operatorId}:`, error);
      res.status(500).json({
        error: 'Failed to close operator',
        message: error.message,
      });
    }
  },
);

// Serve the UI for operators
router.get('/operator-ui', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../../public/operator-ui.html'));
});

export default router;
