
/**
 * Get configuration from Chrome storage
 * @returns Promise<{[key: string]: any}>
 */
export async function getConfig(): Promise<{ [key: string]: any }> {
    if (typeof chrome === 'undefined' || !chrome.storage) {
        throw new Error('Chrome storage API not available');
    }

    return new Promise((resolve) => {
        chrome.storage.sync.get(['apiKey', 'ocularImageBaseUrl', 'modelName'], (result) => {
            resolve(result);
        });
    });
}
