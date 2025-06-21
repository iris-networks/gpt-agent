import os from 'os';
import { execFile } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import { Jimp } from 'jimp';
import { ScreenshotOutput } from '../../../sdk/src/types';
import { screen } from '@computer-use/nut-js';

const execFileAsync = promisify(execFile);

export async function screenshotWithScrot(logger: any): Promise<ScreenshotOutput> {
    const tmpFile = '/tmp/scrot_screenshot.png';
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

export async function screenshotWithNutjs(logger: any): Promise<ScreenshotOutput> {
    const grabImage = await screen.grab();
    const screenWithScale = await grabImage.toRGB(); // widthScale = screenWidth * scaleX

    const scaleFactor = screenWithScale.pixelDensity.scaleX;

    logger.info(
      '[NutjsOperator]',
      'scaleX',
      screenWithScale.pixelDensity.scaleX,
      'scaleY',
      screenWithScale.pixelDensity.scaleY,
    );

    const screenWithScaleImage = await Jimp.fromBitmap({
      width: screenWithScale.width,
      height: screenWithScale.height,
      data: Buffer.from(screenWithScale.data),
    });

    const width = screenWithScale.width / screenWithScale.pixelDensity.scaleX;
    const height = screenWithScale.height / screenWithScale.pixelDensity.scaleY;

    const physicalScreenImage = await screenWithScaleImage
      .resize({
        w: width,
        h: height,
      })
      .getBuffer('image/png'); // Use png format to avoid compression

    const output = {
      base64: physicalScreenImage.toString('base64'),
      scaleFactor,
    };

    logger?.info(
      `[NutjsOperator] screenshot: ${width}x${height}, scaleFactor: ${scaleFactor}`,
    );
    return output;
}

