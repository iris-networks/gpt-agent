/*
 * Copyright (c) 2025 Bytedance, Inc. and its affiliates.
 * SPDX-License-Identifier: Apache-2.0
 */
import {
  Operator,
  useContext,
  parseBoxToScreenCoords,
  StatusEnum,
  type ScreenshotOutput,
  type ExecuteParams,
  type ExecuteOutput,
} from '../../../sdk/src/core';
import * as os from 'os';
import robot from '@hurdlegroup/robotjs';
import Big from 'big.js';
import { screenshotWithRobotjs, screenshotWithScrot } from './iris_scrot';

const moveStraightTo = (startX: number | null, startY: number | null) => {
  if (startX === null || startY === null) {
    return;
  }
  robot.moveMouse(startX, startY);
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export class NutJSOperator extends Operator {
  static MANUAL = {
    ACTION_SPACES: [
      `click(start_box='[x1, y1, x2, y2]')`,
      `left_double(start_box='[x1, y1, x2, y2]')`,
      `right_single(start_box='[x1, y1, x2, y2]')`,
      `drag(start_box='[x1, y1, x2, y2]', end_box='[x3, y3, x4, y4]')`,
      `hotkey(key='')`,
      `type(content='') #If you want to submit your input, use "\\n" at the end of \`content\`.`,
      `scroll(start_box='[x1, y1, x2, y2]', direction='down or up or right or left')`,
      `wait() #Sleep for 5s and take a screenshot to check for any changes.`,
      `finished()`,
      `call_user() # Submit the task and call the user when the task is unsolvable, or when you need the user's help.`,
    ],
  };

  public async screenshot(): Promise<ScreenshotOutput> {
    const { logger } = useContext();
  
    if (os.platform() === 'linux') {
      return await screenshotWithScrot(logger);
    } else {
      return await screenshotWithRobotjs(logger);
    }
  }

  async execute(params: ExecuteParams): Promise<ExecuteOutput> {
    const { logger } = useContext();
    const { parsedPrediction, screenWidth, screenHeight, scaleFactor } = params;

    const { action_type, action_inputs } = parsedPrediction;
    const startBoxStr = action_inputs?.start_box || '';

    logger.info('[NutjsOperator] execute', scaleFactor);
    const { x: startX, y: startY } = parseBoxToScreenCoords({
      boxStr: startBoxStr,
      screenWidth,
      screenHeight,
    });

    logger.info(`[NutjsOperator Position]: (${startX}, ${startY})`);

    // execute configs
    robot.setMouseDelay(2);

    // if (startBoxStr) {
    //   const region = await nutScreen.highlight(
    //     new Region(startX, startY, 100, 100),
    //   );
    //   logger.info('[execute] [Region]', region);
    // }

    const getHotkeys = (keyStr: string | undefined): string[] => {
      if (keyStr) {
        const platformCommandKey =
          process.platform === 'darwin' ? 'command' : 'meta';
        const platformCtrlKey =
          process.platform === 'darwin' ? 'command' : 'control';
        const keyMap: Record<string, string> = {
          return: 'enter',
          enter: 'enter',
          backspace: 'backspace',
          delete: 'delete',
          ctrl: platformCtrlKey,
          shift: 'shift',
          alt: 'alt',
          space: 'space',
          'page down': 'pagedown',
          pagedown: 'pagedown',
          'page up': 'pageup',
          pageup: 'pageup',
          meta: platformCommandKey,
          win: platformCommandKey,
          command: platformCommandKey,
          cmd: platformCommandKey,
          comma: 'comma',
          ',': 'comma',
          up: 'up',
          down: 'down',
          left: 'left',
          right: 'right',
          arrowup: 'up',
          arrowdown: 'down',
          arrowleft: 'left',
          arrowright: 'right',
        };

        const keys = keyStr
          .split(/[\s+]/)
          .map(
            (k) =>
              keyMap[k.toLowerCase()] ||
              k.toLowerCase(),
          );
        logger.info('[NutjsOperator] hotkey: ', keys);
        return keys;
      } else {
        logger.error(
          '[NutjsOperator] hotkey error: ',
          `${keyStr} is not a valid key`,
        );
        return [];
      }
    };

    switch (action_type) {
      case 'wait':
        logger.info('[NutjsOperator] wait', action_inputs);
        await sleep(5000);
        break;

      case 'mouse_move':
      case 'hover':
        logger.info('[NutjsOperator] mouse_move');
        moveStraightTo(startX, startY);
        break;

      case 'click':
      case 'left_click':
      case 'left_single':
        logger.info('[NutjsOperator] left_click');
        moveStraightTo(startX, startY);
        await sleep(100);
        robot.mouseClick('left');
        break;

      case 'left_double':
      case 'double_click':
        logger.info(`[NutjsOperator] ${action_type}(${startX}, ${startY})`);
        moveStraightTo(startX, startY);
        await sleep(100);
        robot.mouseClick('left', true);
        break;

      case 'right_click':
      case 'right_single':
        logger.info('[NutjsOperator] right_click');
        moveStraightTo(startX, startY);
        await sleep(100);
        robot.mouseClick('right');
        break;

      case 'middle_click':
        logger.info('[NutjsOperator] middle_click');
        moveStraightTo(startX, startY);
        robot.mouseClick('middle');
        break;

      case 'left_click_drag':
      case 'drag':
      case 'select': {
        logger.info('[NutjsOperator] drag', action_inputs);
        // end_box
        if (action_inputs?.end_box) {
          const { x: endX, y: endY } = parseBoxToScreenCoords({
            boxStr: action_inputs.end_box,
            screenWidth,
            screenHeight,
          });

          if (startX && startY && endX && endY) {
            // calculate x and y direction difference
            const diffX = Big(endX).minus(startX).toNumber();
            const diffY = Big(endY).minus(startY).toNumber();

            robot.dragMouse(endX, endY);
          }
        }
        break;
      }

      case 'type': {
        const content = action_inputs.content?.trim();
        logger.info('[NutjsOperator] type', content);
        if (content) {
          const stripContent = content.replace(/\\n$/, '').replace(/\n$/, '').replace(/\\/g, '');
          robot.typeString(stripContent);

          if (content.endsWith('\n') || content.endsWith('\\n')) {
            robot.keyTap('enter');
          }
        }
        break;
      }

      case 'hotkey': {
        const keyStr = action_inputs?.key || action_inputs?.hotkey;
        const keys = getHotkeys(keyStr);
        if (keys.length > 0) {
          if (keys.length === 1) {
            robot.keyTap(keys[0]);
          } else {
            robot.keyTap(keys[keys.length - 1], keys.slice(0, -1));
          }
        }
        break;
      }

      case 'press': {
        const keyStr = action_inputs?.key || action_inputs?.hotkey;
        const keys = getHotkeys(keyStr);
        if (keys.length > 0) {
          keys.forEach(key => robot.keyToggle(key, 'down'));
        }
        break;
      }

      case 'release': {
        const keyStr = action_inputs?.key || action_inputs?.hotkey;
        const keys = getHotkeys(keyStr);
        if (keys.length > 0) {
          keys.forEach(key => robot.keyToggle(key, 'up'));
        }
        break;
      }

      case 'scroll': {
        const { direction } = action_inputs;
        // if startX and startY is not null, move mouse to startX, startY
        if (startX !== null && startY !== null) {
          moveStraightTo(startX, startY);
        }

        switch (direction?.toLowerCase()) {
          case 'up':
            robot.scrollMouse(0, -5);
            break;
          case 'down':
            robot.scrollMouse(0, 5);
            break;
          default:
            console.warn(
              `[NutjsOperator] Unsupported scroll direction: ${direction}`,
            );
        }
        break;
      }

      case 'error_env':
      case 'call_user':
      case 'finished':
      case 'user_stop':
        return { status: StatusEnum.END };

      default:
        logger.warn(`Unsupported action: ${action_type}`);
    }
  }
}
