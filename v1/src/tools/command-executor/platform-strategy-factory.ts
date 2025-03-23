import type { PlatformStrategy } from "../../interfaces/platform-strategy";
import { LinuxStrategy } from "./strategies/linux-strategy";
import { MacOSStrategy } from "./strategies/macos-strategy";


/**
 * Factory to create the appropriate platform strategy
 */
export class PlatformStrategyFactory {
  static createStrategy(): PlatformStrategy {
    const platform = process.platform;
    
    switch (platform) {
      case 'darwin':
        return new MacOSStrategy();
      case 'linux':
        return new LinuxStrategy();
      default:
        throw new Error(`Platform ${platform} is not supported`);
    }
  }
}