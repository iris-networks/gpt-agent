import { execFile } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import { Jimp } from 'jimp';
import { ScreenshotOutput } from '../../../sdk/src/types';
import robot from '@hurdlegroup/robotjs';

const execFileAsync = promisify(execFile);

export async function screenshotWithScrot(logger: any): Promise<ScreenshotOutput> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const tmpFile = `/tmp/scrot_screenshot_${timestamp}.png`;
    try {
        await execFileAsync('scrot', ['-q', '100', '-o', tmpFile], {
            env: { ...process.env, DISPLAY: ':1' },
        });

        logger.info('[NutjsOperator]', `Screenshot saved to ${tmpFile}`);

        const imgBuffer = await fs.readFile(tmpFile);
        const base64Image = imgBuffer.toString('base64');
        const scaleFactor = 1;

        logger.info(
            `[NutjsOperator] screenshot taken with scrot, scaleFactor: ${scaleFactor}`,
        );

        return { base64: base64Image, scaleFactor };
    } catch (error) {
        logger.error('[NutjsOperator] scrot screenshot error', error);
        throw error;
    }
}

export async function screenshotWithRobotjs(logger: any): Promise<ScreenshotOutput> {
    const screenSize = robot.getScreenSize();
    const screenshot = robot.screen.capture(0, 0, screenSize.width, screenSize.height);
    
    const scaleFactor = 1; // robotjs doesn't handle pixel density scaling

    logger.info(
      '[NutjsOperator]',
      'screenshot size:',
      screenSize.width,
      'x',
      screenSize.height,
    );

    const screenImage = await Jimp.fromBitmap({
      width: screenshot.width,
      height: screenshot.height,
      data: Buffer.from(screenshot.image),
    });

    const physicalScreenImage = await screenImage
      .getBuffer('image/png'); // Use png format to avoid compression

    const output = {
      base64: physicalScreenImage.toString('base64'),
      scaleFactor,
    };

    logger?.info(
      `[NutjsOperator] screenshot: ${screenSize.width}x${screenSize.height}, scaleFactor: ${scaleFactor}`,
    );
    return output;
}

