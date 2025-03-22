import type { PlatformStrategy } from "../../interfaces/platform-strategy-screen";
import { MacOSStrategy } from "./strategies/macos-strategy";
import { LinuxStrategy } from "./strategies/linux-strategy";

export class PlatformStrategyFactory {
  static createStrategy(): PlatformStrategy {
    const platform = process.platform;
    
    if (platform === 'darwin') {
      return new MacOSStrategy();
    } else if (platform === 'linux') {
      return new LinuxStrategy();
    } else {
      throw new Error(`Unsupported platform: ${platform}`);
    }
  }
}
