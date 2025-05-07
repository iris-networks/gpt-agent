/*
 * Copyright (c) 2025 Bytedance, Inc. and its affiliates.
 * SPDX-License-Identifier: Proprietary
 */
import { BaseBrowser, BrowserFinder, LaunchOptions } from '@agent-infra/browser';
import * as puppeteer from 'puppeteer-core';

// Create a custom interface that extends LaunchOptions
interface IrisBrowserLaunchOptions extends LaunchOptions {
    userDataDir?: string;
    downloadPolicy?: 'allow' | 'deny' | 'default';
    downloadPath?: string;
}

/**
 * LocalBrowser class for controlling locally installed browsers
 * Extends the BaseBrowser with functionality specific to managing local browser instances
 * @extends BaseBrowser
 */
export class IrisBrowser extends BaseBrowser {
    /**
     * Launches a local browser instance with specified options
     * Automatically detects installed browsers if no executable path is provided
     * @param {IrisBrowserLaunchOptions} options - Configuration options for launching the browser
     * @returns {Promise<void>} Promise that resolves when the browser is successfully launched
     * @throws {Error} If the browser cannot be launched
     */
    async launch(options: IrisBrowserLaunchOptions = {}): Promise<void> {
        this.logger.info('Launching browser with options:', options);

        const browserOptions = new BrowserFinder(this.logger).findBrowser();

        this.logger.info('Using executable path:', browserOptions.executable);

        const viewportWidth = options?.defaultViewport?.width ?? 1280;
        const viewportHeight = options?.defaultViewport?.height ?? 800;

        const puppeteerLaunchOptions: puppeteer.LaunchOptions = {
            executablePath: browserOptions.executable,
            headless: options?.headless ?? false,
            defaultViewport: {
                width: viewportWidth,
                height: viewportHeight,
            },
            args: [
                '--no-sandbox',
                '--mute-audio',
                '--disable-gpu',
                '--disable-http2',
                '--disable-blink-features=AutomationControlled',
                '--disable-infobars',
                '--disable-background-timer-throttling',
                '--disable-popup-blocking',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding',
                '--disable-window-activation',
                '--disable-focus-on-load',
                '--no-default-browser-check',
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process',
                '--disable-site-isolation-trials',
                `--user-data-dir=${options.userDataDir ?? '/tmp/shanur'}`,
                // `--profile-directory=/tmp/shanur`,
                `--window-size=${viewportWidth},${viewportHeight + 90}`,
                options?.proxy ? `--proxy-server=${options.proxy}` : '',
            ].filter(Boolean),
            ignoreDefaultArgs: ['--enable-automation'],
            timeout: options.timeout ?? 0,
            downloadBehavior: {
                policy: options.downloadPolicy ?? 'allow',
                downloadPath: options.downloadPath ?? '/tmp/downloads'
            },
        };


        this.logger.info('Launch options:', puppeteerLaunchOptions);

        try {
            this.browser = await puppeteer.launch(puppeteerLaunchOptions);
            await this.setupPageListener();
            this.logger.success('Browser launched successfully');
        } catch (error) {
            this.logger.error('Failed to launch browser:', error);
            throw error;
        }
    }
}
