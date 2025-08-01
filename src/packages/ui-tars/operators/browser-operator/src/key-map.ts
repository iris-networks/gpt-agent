/*
 * Copyright (c) 2025 Bytedance, Inc. and its affiliates.
 * SPDX-License-Identifier: Apache-2.0
 */
import * as os from 'os';
import type { KeyInput } from '@agent-infra/browser';
import type { ScreenshotOutput, ExecuteParams } from '../../../sdk/src/core';
export type { ScreenshotOutput, ExecuteParams };
export type ParsedPrediction = ExecuteParams['parsedPrediction'];
/**
 * Search engine options
 */

const isMac = os.platform() === 'darwin';

const ControlOrMeta = isMac ? 'Meta' : 'Control';

export const KEY_MAPPINGS: Record<string, KeyInput> = {
  enter: 'Enter',
  tab: 'Tab',
  escape: 'Escape',
  up: 'ArrowUp',
  down: 'ArrowDown',
  left: 'ArrowLeft',
  right: 'ArrowRight',
  arrowup: 'ArrowUp',
  arrowdown: 'ArrowDown',
  arrowleft: 'ArrowLeft',
  arrowright: 'ArrowRight',
  backspace: 'Backspace',
  delete: 'Delete',
  f1: 'F1',
  f2: 'F2',
  f3: 'F3',
  f4: 'F4',
  f5: 'F5',
  f6: 'F6',
  f7: 'F7',
  f8: 'F8',
  f9: 'F9',
  f10: 'F10',
  f11: 'F11',
  f12: 'F12',
  shift: 'Shift',
  alt: 'Alt',
  control: ControlOrMeta, // This mapping also has issues, but on macOS, the Command key essentially replaces the Control key.
  ctrl: ControlOrMeta,
  cmd: ControlOrMeta,
  command: ControlOrMeta,

  // a-z
  a: 'KeyA',
  b: 'KeyB',
  c: 'KeyC',
  d: 'KeyD',
  e: 'KeyE',
  f: 'KeyF',
  g: 'KeyG',
  h: 'KeyH',
  i: 'KeyI',
  j: 'KeyJ',
  k: 'KeyK',
  l: 'KeyL',
  m: 'KeyM',
  n: 'KeyN',
  o: 'KeyO',
  p: 'KeyP',
  q: 'KeyQ',
  r: 'KeyR',
  s: 'KeyS',
  t: 'KeyT',
  u: 'KeyU',
  v: 'KeyV',
  w: 'KeyW',
  x: 'KeyX',
  y: 'KeyY',
  z: 'KeyZ',

  // number
  '0': '0',
  '1': '1',
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
  '6': '6',
  '7': '7',
  '8': '8',
  '9': '9',

  //
  '.': '.',
  ',': ',',
  '!': '!',
  '?': '?',
  ';': ';',
  ':': ':',
  "'": "'",
  '"': '"',
  '(': '(',
  ')': ')',
  '[': '[',
  ']': ']',
  '{': '{',
  '}': '}',
  '<': '<',
  '>': '>',
  '-': '-',
  _: '_',
  '+': '+',
  '=': '=',
  '/': '/',
  '\\': '\\',
  '@': '@',
  '#': '#',
  $: '$',
  '%': '%',
  '^': '^',
  '&': '&',
  '*': '*',
  '|': '|',
  '~': '~',
  '`': '`',
  ' ': ' ',
};
