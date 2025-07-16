import { Module } from '@nestjs/common';
import { GuiAgentTool } from './GuiAgentTool';
import { ToolsFactory } from './ToolsFactory';
import { TerminalAgentTool } from './TerminalAgentTool';
import { PlaywrightAgentTool } from './PlaywrightAgentTool';
import { ExcelAgent } from './ExcelAgent';


@Module({
  providers: [
    GuiAgentTool,
    ExcelAgent,
    ToolsFactory,
    TerminalAgentTool,
    PlaywrightAgentTool
  ],
  exports: [
    GuiAgentTool,
    ExcelAgent,
    ToolsFactory,
    TerminalAgentTool,
    PlaywrightAgentTool
  ],
})
export class ToolsModule {}