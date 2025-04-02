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

  const width = dimensions.width;
  const height = dimensions.height;

  // Send as JSON payload instead of form-data
  const response = await axios.post<OcularResponse>(
    `${serverUrl}/process_screenshot_data_uri/`,
    {
      image_data_uri: dataURI,
      screen_width: width,
      screen_height: height
    },
    {
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }
  );

  if (response.status !== 200) {
    throw new Error(`Ocular API error: ${response.statusText}`);
  }

  return response.data;
}