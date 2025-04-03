/**
 * Model providers implementation for the ReactAgent
 */

// External imports
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';

// Provider types
export enum ProviderType {
  ANTHROPIC = 'anthropic',
  OPENROUTER = 'openrouter'
}

// Provider configuration interface
export interface ProviderConfig {
  apiKey: string;
  providerType: ProviderType;
  modelName?: string;
}

/**
 * Model provider factory
 * Creates and returns the appropriate model provider based on configuration
 */
export function getModelProvider(config: ProviderConfig) {
  const { apiKey, providerType, modelName } = config;
  
  switch (providerType) {
    case ProviderType.ANTHROPIC:
      return createAnthropicProvider(apiKey, modelName);
    case ProviderType.OPENROUTER:
      return createOpenRouterProvider(apiKey, modelName);
    default:
      throw new Error(`Unsupported provider type: ${providerType}`);
  }
}

/**
 * Creates an Anthropic provider instance
 */
function createAnthropicProvider(apiKey: string, modelName?: string) {
  const anthropic = createAnthropic({
    apiKey,
    headers: {
      "anthropic-dangerous-direct-browser-access": "true"
    }
  });

  // Use provided model name or default to Claude 3 Sonnet
  const model = modelName || "claude-3-7-sonnet-20250219";
  
  return {
    generateText: async (messages: any[]) => {
      return generateText({
        model: anthropic(model as any, {}),
        messages,
        temperature: 0,
      });
    }
  };
}

/**
 * Creates an OpenRouter provider instance
 */
function createOpenRouterProvider(apiKey: string, modelName?: string) {
  const openrouter = createOpenRouter({
    apiKey,
    baseURL: "https://openrouter.ai/api/v1"
  });

  // Use provided model name or default to Claude 3 Sonnet
  const model = modelName || "anthropic/claude-3-sonnet";
  
  return {
    generateText: async (messages: any[]) => {
      return generateText({
        model: openrouter(model as any, {}),
        messages,
        temperature: 0,
      });
    }
  };
}