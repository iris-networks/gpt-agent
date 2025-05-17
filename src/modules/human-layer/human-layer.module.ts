import { Module } from '@nestjs/common';
import { HumanLayerController } from './human-layer.controller';

@Module({
  imports: [],
  controllers: [HumanLayerController],
  providers: [],
  exports: []
})
export class HumanLayerModule {}