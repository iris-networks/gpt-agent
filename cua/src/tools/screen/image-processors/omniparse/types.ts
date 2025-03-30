export interface OmniParseElement {
  id: string;
  type: string;
  bbox: number[];
  interactivity: boolean;
  content: string;
}

export interface OmniParseOutput {
  elements: string;
  img: string;
}