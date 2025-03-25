import FormData from 'form-data';
import fs from 'fs';
import axios from 'axios';

export interface OcularElement {
  type: string;
  bbox: number[];
  confidence: number;
  normalized_bbox: number[];
  code?: string;
  text?: string;
  words?: string[];
  bounding_boxes?: number[][];
  line_confidence?: number;
}

export interface OcularResponse {
  elements: OcularElement[];
  total_elements: number;
  image_dimensions: {
    width: number;
    height: number;
  };
}

export async function detectElements(imagePath: string): Promise<OcularResponse> {
  const formData = new FormData();
  formData.append('file', fs.createReadStream(imagePath));
  formData.append('include_annotated_image', 'false');
  formData.append('include_legend', 'false');
  formData.append('max_horizontal_distance', '100');
  formData.append('exclude_shapes_in_text', 'true');
  formData.append('include_ocr_boxes', 'false');
  formData.append('device', 'auto');

  const response = await axios.post('https://oculus-server.fly.dev/detect', formData, {
    headers: formData.getHeaders()
  });

  if (response.status !== 200) {
    throw new Error(`Ocular API error: ${response.statusText}`);
  }

  return response.data;
}

export function generateElementCode(index: number, isText: boolean = false): string {
  const prefix = isText ? 'T' : 'E';
  return `${prefix}${index.toString().padStart(2, '0')}`;
}

export function processOcularElements(response: OcularResponse): Array<{
  code: string;
  type: string;
  bbox: number[];
  interactivity: boolean;
  content?: string;
}> {
  const elements: Array<{
    code: string;
    type: string;
    bbox: number[];
    interactivity: boolean;
    content?: string;
  }> = [];

  let elementIndex = 0;

  response.elements.forEach((element) => {
    if (element.type === 'text' && element.words) {
      // Process text elements word by word
      element.words.forEach((word, wordIndex) => {
        if (element.bounding_boxes && element.bounding_boxes[wordIndex]) {
          elements.push({
            code: generateElementCode(elementIndex++, true),
            type: 'text',
            bbox: element.bounding_boxes[wordIndex],
            interactivity: false,
            content: word
          });
        }
      });
    } else {
      // Process non-text elements
      elements.push({
        code: generateElementCode(elementIndex++),
        type: element.type,
        bbox: element.bbox,
        interactivity: ['button', 'input', 'link'].includes(element.type.toLowerCase()),
        content: element.text
      });
    }
  });

  return elements;
}