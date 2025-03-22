import { ImageProcessorType } from '../../../interfaces/screen-interfaces';

interface ImageProcessorConfig {
  type: ImageProcessorType;
  apiUrl?: string;
  timeoutMs?: number;
}

const defaultConfig: ImageProcessorConfig = {
  type: ImageProcessorType.OCULAR,
  apiUrl: 'https://oculus-server.fly.dev',
  timeoutMs: 10000
};

// Load config from environment variables or use defaults
export const getImageProcessorConfig = (): ImageProcessorConfig => {
  return {
    type: (process.env.IMAGE_PROCESSOR_TYPE as ImageProcessorType) || defaultConfig.type,
    apiUrl: process.env.IMAGE_PROCESSOR_API_URL || defaultConfig.apiUrl,
    timeoutMs: process.env.IMAGE_PROCESSOR_TIMEOUT_MS ? 
      parseInt(process.env.IMAGE_PROCESSOR_TIMEOUT_MS, 10) : 
      defaultConfig.timeoutMs
  };
};

export { ImageProcessorConfig };