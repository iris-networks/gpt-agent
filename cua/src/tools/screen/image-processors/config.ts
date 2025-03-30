import { ImageProcessorType } from '../../../interfaces/screen-interfaces';

export interface ImageProcessorConfig {
  type: ImageProcessorType;
  apiUrl?: string;
  timeoutMs?: number;
}

const defaultConfig: ImageProcessorConfig = {
  type: ImageProcessorType.OCULAR,
  apiUrl: 'https://oculus-server.fly.dev',
  timeoutMs: 20000
};
