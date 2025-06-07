/* eslint-disable @typescript-eslint/no-explicit-any */
/*
 * Copyright (c) 2025 Bytedance, Inc. and its affiliates.
 * SPDX-License-Identifier: Apache-2.0
 */
import { LocalBrowser } from '@agent-infra/browser';
import { ConsoleLogger, Logger, defaultLogger } from '@agent-infra/logger';

import type {
    Page,
    KeyInput,
    BrowserType,
    BrowserInterface,
} from '@agent-infra/browser';

import { BrowserFinder } from '@agent-infra/browser';
import { BrowserOperator, BrowserOperatorOptions, SearchEngine } from '@app/packages/ui-tars/operators/browser-operator/src';
import { IrisBrowser } from './IrisBrowser';
import * as os from 'os';
import * as filePath from 'path';

export class IrisBrowserOperator extends BrowserOperator {
    private static instance: IrisBrowserOperator | null = null;
    private static browser: IrisBrowser | null = null;
    private static browserPath: string;
    private static browserType: BrowserType;
    private static logger: Logger | null = null;

    private constructor(options: BrowserOperatorOptions) {
        super(options);
    }

    /**
     * Check whether the local environment has a browser available
     * @returns {boolean}
     */
    public static hasBrowser(browser?: BrowserType): boolean {
        try {
            if (this.browserPath) {
                return true;
            }

            if (!this.logger) {
                this.logger = new ConsoleLogger('[DefaultBrowserOperator]');
            }

            const browserFinder = new BrowserFinder(this.logger);
            const browserData = browserFinder.findBrowser(browser);
            this.browserPath = browserData.path;
            this.browserType = browserData.type;

            return true;
        } catch (error) {
            if (this.logger) {
                this.logger.error('No available browser found:', error);
            }
            return false;
        }
    }

    public static async getInstance(
        highlight = false,
        showActionInfo = false,
        isCallUser = false,
        searchEngine = 'google' as SearchEngine,
    ): Promise<IrisBrowserOperator> {
        if (!this.logger) {
            this.logger = new ConsoleLogger('[DefaultBrowserOperator]');
        }

        if (this.browser) {
            const isAlive = await this.browser.isBrowserAlive();
            if (!isAlive) {
                this.browser = null;
                this.instance = null;
            }
        }

        if (!this.browser) {
            const home = filePath.join(os.homedir(), '.iris');
            this.browser = new IrisBrowser({ logger: this.logger });
            await this.browser.launch({
                executablePath: this.browserPath,
                browserType: this.browserType,
                userDataDir: filePath.join(home, 'user-data')
            });
        }

        if (!this.instance) {
            this.instance = new IrisBrowserOperator({
                browser: this.browser,
                browserType: this.browserType,
                logger: this.logger,
                highlightClickableElements: highlight,
                showActionInfo: showActionInfo,
            });
        }

        if (!isCallUser) {
            const openingPage = await this.browser?.createPage();
            const searchEngineUrls = {
                [SearchEngine.GOOGLE]: 'https://www.google.com/',
                [SearchEngine.BING]: 'https://www.bing.com/',
                [SearchEngine.BAIDU]: 'https://www.baidu.com/',
            };
            const targetUrl = searchEngineUrls[searchEngine];
            await openingPage?.goto(targetUrl, {
                waitUntil: 'networkidle2',
            });
        }

        this.instance.setHighlightClickableElements(highlight);

        return this.instance;
    }

    public static async destroyInstance(): Promise<void> {
        if (this.instance) {
            await this.instance.cleanup();
            if (this.browser) {
                await this.browser.close();
                this.browser = null;
            }
            this.instance = null;
        }
    }
}
