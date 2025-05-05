
import { Logger, ConsoleLogger } from "@agent-infra/logger";
import { IrisBrowser } from "./IrisBrowser";
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { BrowserOperator, BrowserOperatorOptions } from "@app/packages/browser-operator";


export class IrisBrowserOperator extends BrowserOperator {
    private static instance: IrisBrowserOperator | null = null;
    private static browser: IrisBrowser | null = null;
    private static browserPath: {
        executable: string;
        userDataDir: string;
    };
    private static logger: Logger | null = null;

    private constructor(options: BrowserOperatorOptions) {
        super(options);
    }

    private static ensureDirectoryExists(dirPath: string): void {
        if (!fs.existsSync(dirPath)) {
            try {
                fs.mkdirSync(dirPath, { recursive: true });
                if (this.logger) {
                    this.logger.info(`Created directory: ${dirPath}`);
                }
            } catch (error) {
                if (this.logger) {
                    this.logger.error(`Failed to create directory ${dirPath}: ${error}`);
                }
                throw error;
            }
        }
    }

    public static async getInstance(
        highlight = false,
        showActionInfo = false,
        isCallUser = false,
    ): Promise<IrisBrowserOperator> {
        if (!this.instance) {
            if (!this.logger) {
                this.logger = new ConsoleLogger('[DefaultBrowserOperator]');
            }

            if (!this.browser) {
                // Use home directory instead of /opt/iris
                const homeDir = os.homedir();
                const irisDir = path.join(homeDir, '.iris');
                const downloadPath = path.join(irisDir, 'downloads');
                const userDataDir = path.join(irisDir, 'user-data');
                
                // Ensure directories exist before launching browser
                this.ensureDirectoryExists(downloadPath);
                this.ensureDirectoryExists(userDataDir);
                
                this.browser = new IrisBrowser({ logger: this.logger });
                await this.browser.launch({
                    downloadPath,
                    userDataDir,
                    downloadPolicy: 'allow',
                }).catch(console.error);
            }

            this.instance = new IrisBrowserOperator({
                browser: this.browser,
                logger: this.logger,
                highlightClickableElements: highlight,
                showActionInfo: showActionInfo,
            });
        }

        if (!isCallUser) {
            const openingPage = await this.browser?.createPage();
            await openingPage?.goto('https://www.google.com/', {
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
