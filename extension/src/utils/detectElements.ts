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
    chrome.storage.sync.get(['ocularImageBaseUrl'], (result) => {
      resolve(result);
    });
  });
}

export async function detectElements(imageBuffer: Buffer, dimensions: {
  width: number;
  height: number;
  scalingFactor: number;
}) {
  const config = await getConfig();
  const ocularImageBaseUrl = config.ocularImageBaseUrl;
  
  if (!ocularImageBaseUrl) {
    throw new Error('OCULAR_IMAGE_BASE_URL not configured. Please set it in extension settings.');
  }
  
  const formData = new FormData();
  formData.append('file', imageBuffer, { filename: 'image.png' });
  const width = dimensions.width/dimensions.scalingFactor;
  const height = dimensions.height/dimensions.scalingFactor;

  const response = await axios.post<OcularResponse>(
    `${ocularImageBaseUrl}/process_screenshot_string/?screen_width=${width}&screen_height=${height}`,
    formData,
    {
      headers: {
        ...formData.getHeaders(),
        'accept': 'application/json'  // Add accept header
      }
    }
  );

  if (response.status !== 200) {
    throw new Error(`Ocular API error: ${response.statusText}`);
  }

  return response.data;
}