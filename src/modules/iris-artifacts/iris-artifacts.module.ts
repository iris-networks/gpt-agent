import { Module } from '@nestjs/common';
import { IrisArtifactsController } from './controllers/iris-artifacts.controller';
import { IrisArtifactsService } from './services/iris-artifacts.service';

@Module({
  controllers: [IrisArtifactsController],
  providers: [IrisArtifactsService],
  exports: [IrisArtifactsService]
})
export class IrisArtifactsModule {}