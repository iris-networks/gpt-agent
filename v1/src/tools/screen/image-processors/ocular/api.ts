import FormData from 'form-data';
import fs from 'fs';
import axios from 'axios';
import type { ElementAction } from '../../../../interfaces/screen-interfaces';
import type { NextToolInput } from '../../../next-action/nextActionTool';

export interface OcularElement {
  type: string;
  bbox: number[];
  confidence: number;
  id: string;
  normalized_bbox: number[];
  code: string;
  text?: string;
  words?: Array<{ // Updated words to be an array of objects
    text: string;
    id: string;
    bbox: number[];
    normalized_bbox: number[];
  }>;
  line_confidence?: number;
}

export interface OcularResponse {
  elements: OcularElement[];
  total_elements: number;
  image_dimensions: {
    width: number;
    height: number;
  };
  processing_info: { // Added processing_info field
    device: string;
    device_name: string;
    acceleration_used: boolean;
  };
  annotated_image_path: string; // Added annotated_image_path field
}

export async function detectElements(imageBuffer: Buffer) {
  const formData = new FormData();
  formData.append('file', imageBuffer, { filename: 'image.png' }); // Use image buffer
  formData.append('include_annotated_image', 'false');
  formData.append('include_legend', 'false');
  formData.append('max_horizontal_distance', '100');
  formData.append('exclude_shapes_in_text', 'true');
  formData.append('include_ocr_boxes', 'false');
  formData.append('device', 'auto');

  const response = await axios.post<OcularResponse>('https://oculus-server.fly.dev/detect', formData, {
    headers: formData.getHeaders()
  });

  if (response.status !== 200) {
    throw new Error(`Ocular API error: ${response.statusText}`);
  }

  return response.data;
}

