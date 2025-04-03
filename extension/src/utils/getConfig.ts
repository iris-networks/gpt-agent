
import { ProviderType } from '../browser-agent/modelProviders';

/**
 * Get configuration from Chrome storage
 * @returns Promise<{[key: string]: any}>
 */
export async function getConfig(): Promise<{ 
    apiKey: string;
    providerType?: ProviderType; 
    modelName?: string;
    ocularImageBaseUrl?: string;
    [key: string]: any 
}> {
    if (typeof chrome === 'undefined' || !chrome.storage) {
        throw new Error('Chrome storage API not available');
    }

    return new Promise((resolve) => {
        chrome.storage.sync.get(['apiKey', 'ocularImageBaseUrl', 'modelName', 'providerType'], (result) => {
            // Default provider type if not set
            if (!result.providerType) {
                result.providerType = ProviderType.ANTHROPIC;
            }
            
            resolve(result);
        });
    });
}
