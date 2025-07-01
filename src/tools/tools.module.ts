import { Module } from '@nestjs/common';
import { GuiAgentTool } from './GuiAgentTool';
import { ExcelTool } from './ExcelTool';
import { HumanLayerTool } from './HumanLayerTool';
import { ApplicationLauncherTool } from './ApplicationLauncherTool';
import { ToolsFactory } from './ToolsFactory';
import { FileSystemAgentTool } from 'tools/fileSystem/FileSystemAgentTool';

@Module({
  providers: [
    GuiAgentTool,
    FileSystemAgentTool,
    ExcelTool,
    HumanLayerTool,
    ApplicationLauncherTool,
    ToolsFactory
  ],
  exports: [
    GuiAgentTool,
    FileSystemAgentTool,
    ExcelTool,
    HumanLayerTool,
    ApplicationLauncherTool,
    ToolsFactory
  ],
})
export class ToolsModule {}