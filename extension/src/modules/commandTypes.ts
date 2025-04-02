// Type definitions for browser commands

export interface ClickCommand {
  type: 'click';
  x: number;
  y: number;
  button: number;
}

export interface DoubleClickCommand {
  type: 'doubleclick';
  x: number;
  y: number;
}

export interface MouseMoveCommand {
  type: 'mousemove';
  x: number;
  y: number;
}

export interface TypeCommand {
  type: 'type';
  text: string;
  x?: number;
  y?: number;
}

export interface KeyPressCommand {
  type: 'key';
  sequence: string;
  isMac: boolean;
}

export interface ScrollCommand {
  type: 'scroll';
  direction?: string;
  x?: number;
  y?: number;
}

export interface NavigateCommand {
  type: 'navigate';
  url: string;
}

export interface BackCommand {
  type: 'back';
}

export interface ForwardCommand {
  type: 'forward';
}

export interface ReloadCommand {
  type: 'reload';
}

export interface FocusCommand {
  type: 'focus';
  x: number;
  y: number;
}

export interface SelectCommand {
  type: 'select';
  x: number;
  y: number;
}

export interface SubmitCommand {
  type: 'submit';
  x: number;
  y: number;
}

export interface WaitCommand {
  type: 'wait';
  ms: number;
}

export type Command = 
  | ClickCommand
  | DoubleClickCommand
  | MouseMoveCommand
  | TypeCommand
  | KeyPressCommand
  | ScrollCommand
  | NavigateCommand
  | BackCommand
  | ForwardCommand
  | ReloadCommand
  | FocusCommand
  | SelectCommand
  | SubmitCommand
  | WaitCommand;