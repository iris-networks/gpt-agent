import FormData from 'form-data';
import axios from 'axios';

export interface OcularResponse {
  output: string;
  image_url: string;
}

export async function detectElements(imageBuffer: Buffer, dimensions: {
  width: number;
  height: number;
  scalingFactor: number;
}) {
  const formData = new FormData();
  formData.append('file', imageBuffer, { filename: 'image.png' });
  const width = dimensions.width/dimensions.scalingFactor;
  const height = dimensions.height/dimensions.scalingFactor;

  const response = await axios.post<OcularResponse>(
    `${process.env.OCULAR_IMAGE_BASE_URL}/process_screenshot_string/?screen_width=${width}&screen_height=${height}`,
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

