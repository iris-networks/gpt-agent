import FormData from 'form-data';
import axios from 'axios';

export interface OcularResponse {
  output: string;
  image_url: string;
}

/**
 * Get configuration from Chrome storage
 * @returns Promise<{[key: string]: any}>
 */
async function getConfig(): Promise<{[key: string]: any}> {
  if (typeof chrome === 'undefined' || !chrome.storage) {
    throw new Error('Chrome storage API not available');
  }
  
  return new Promise((resolve) => {
    chrome.storage.sync.get(['serverUrl'], (result) => {
      resolve(result);
    });
  });
}

export async function detectElements(dataURI: string, dimensions: {
  width: number;
  height: number;
  scalingFactor: number;
}) {
  const config = await getConfig();
  const serverUrl = config.serverUrl;
  
  if (!serverUrl) {
    throw new Error('serverUrl not configured. Please set it in extension settings.');
  }

  // Convert data URI to binary string
  const base64Data = dataURI.split(',')[1];
  const binaryString = atob(base64Data);
  const uint8Array = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    uint8Array[i] = binaryString.charCodeAt(i);
  }

  const formData = new FormData();
  formData.append('file', new Blob([uint8Array], { type: 'image/png' }), 'image.png');
  const width = dimensions.width/dimensions.scalingFactor;
  const height = dimensions.height/dimensions.scalingFactor;

  const response = await axios.post<OcularResponse>(
    `${serverUrl}/process_screenshot_string/?screen_width=${width}&screen_height=${height}`,
    formData,
    {
      headers: {
        ...formData.getHeaders(),
        'accept': 'application/json'
      }
    }
  );

  if (response.status !== 200) {
    throw new Error(`Ocular API error: ${response.statusText}`);
  }

  return response.data;
}