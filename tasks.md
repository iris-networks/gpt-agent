## TASK 1
We currently keep the screenshots for ongoing session in memory, i want to change this logic, so we store these images in the folder and keep saving them as we take the screenshots, and later combine them when generateVideo is called. Captions too come from screenshot data, so you have to be mindful of that as well. Keeping them in memory is not a good idea. Save to disk and process later.

## TASK 2
Commit as shanur

## TASK 3
1. Session completion → session-manager.service.ts:186-198 (new sessions) or :331-346 (updates) automatically calls saveSessionRecording
We need to stop this, the user will send a command with session id to save a recording. The system will then use all screenshots saved in task 1 to generate a video by combining all the images and captions for this session. 

## TASK 4
commit as shanur

## TASK 5
Update the file system agent, and update its prompt so that it doesn't waste its time reading the entire file when the job can be done reading a few lines.



