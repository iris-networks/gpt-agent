#!/bin/bash

# Fix imports in all files
find src -type f -name "*.ts" -exec sed -i '' 's/import { Screenshot /import { ScreenshotDto as Screenshot /g' {} \;
find src -type f -name "*.ts" -exec sed -i '' 's/import { CaptionData /import { CaptionDataDto as CaptionData /g' {} \;
find src -type f -name "*.ts" -exec sed -i '' 's/import { VideoRecording /import { VideoRecordingDto as VideoRecording /g' {} \;
find src -type f -name "*.ts" -exec sed -i '' 's/import { SessionData /import { SessionDataDto as SessionData /g' {} \;
find src -type f -name "*.ts" -exec sed -i '' 's/import { CreateSessionRequest /import { CreateSessionRequestDto as CreateSessionRequest /g' {} \;
find src -type f -name "*.ts" -exec sed -i '' 's/import { SessionResponse /import { SessionResponseDto as SessionResponse /g' {} \;
find src -type f -name "*.ts" -exec sed -i '' 's/import { IrisConfig /import { IrisConfigDto as IrisConfig /g' {} \;
find src -type f -name "*.ts" -exec sed -i '' 's/import { VideoData /import { VideoDataDto as VideoData /g' {} \;

# Fix imports with multiple entities on one line
find src -type f -name "*.ts" -exec sed -i '' 's/import { \(.*\)VideoRecording\(.*\) } from/import { \1VideoRecordingDto as VideoRecording\2 } from/g' {} \;
find src -type f -name "*.ts" -exec sed -i '' 's/import { \(.*\)CaptionData\(.*\) } from/import { \1CaptionDataDto as CaptionData\2 } from/g' {} \;
find src -type f -name "*.ts" -exec sed -i '' 's/import { \(.*\)Screenshot\(.*\) } from/import { \1ScreenshotDto as Screenshot\2 } from/g' {} \;
find src -type f -name "*.ts" -exec sed -i '' 's/import { \(.*\)SessionData\(.*\) } from/import { \1SessionDataDto as SessionData\2 } from/g' {} \;
find src -type f -name "*.ts" -exec sed -i '' 's/import { \(.*\)CreateSessionRequest\(.*\) } from/import { \1CreateSessionRequestDto as CreateSessionRequest\2 } from/g' {} \;
find src -type f -name "*.ts" -exec sed -i '' 's/import { \(.*\)SessionResponse\(.*\) } from/import { \1SessionResponseDto as SessionResponse\2 } from/g' {} \;
find src -type f -name "*.ts" -exec sed -i '' 's/import { \(.*\)IrisConfig\(.*\) } from/import { \1IrisConfigDto as IrisConfig\2 } from/g' {} \;
find src -type f -name "*.ts" -exec sed -i '' 's/import { \(.*\)VideoData\(.*\) } from/import { \1VideoDataDto as VideoData\2 } from/g' {} \;

# Handle local variable declarations that use the imported types
find src -type f -name "*.ts" -exec sed -i '' 's/\(.*\): Map<string, Screenshot\[\]>/\1: Map<string, Screenshot[]>/g' {} \;
find src -type f -name "*.ts" -exec sed -i '' 's/\(.*\): Screenshot\[\]/\1: Screenshot[]/g' {} \;
find src -type f -name "*.ts" -exec sed -i '' 's/\(.*\): Screenshot /\1: Screenshot /g' {} \;
find src -type f -name "*.ts" -exec sed -i '' 's/\(.*\): CaptionData\[\]/\1: CaptionData[]/g' {} \;
find src -type f -name "*.ts" -exec sed -i '' 's/\(.*\): VideoRecording /\1: VideoRecording /g' {} \;
find src -type f -name "*.ts" -exec sed -i '' 's/\(.*\): VideoData /\1: VideoData /g' {} \;

echo "Fixed imports in all files"