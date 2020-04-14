import Debug from 'debug';
import { join } from 'path';
import { BrowserContext } from 'playwright-core';
import { getFfmpegPath, saveVideo, PageVideoCapture } from 'playwright-video';
import { forEachPage } from './forEachPage';
import { saveConsoleLogs } from '../page/saveConsoleLogs';

const debug = Debug('qawolf:saveArtifacts');

const capturesToStop: PageVideoCapture[] = [];

export const saveArtifacts = (
  context: BrowserContext,
  saveDir: string,
): Promise<void> => {
  // only record a video if ffmpeg installed
  const includeVideo = !!getFfmpegPath();
  let pageCount = 0;

  return forEachPage(context, async (page) => {
    const timestamp = Date.now();
    const pageIndex = pageCount++;
    debug(`save artifacts for page ${pageIndex} at ${timestamp}`);

    try {
      await saveConsoleLogs(
        page,
        join(saveDir, `logs_${pageIndex}_${timestamp}.txt`),
      );

      if (includeVideo) {
        debug(`save video for page ${pageIndex}`);
        const capture = await saveVideo(
          page,
          join(saveDir, `video_${pageIndex}_${timestamp}.mp4`),
        );
        capturesToStop.push(capture);
      } else {
        debug(`ffmpeg not found, skipping video for page ${pageIndex}`);
      }
    } catch (error) {
      debug(`cannot save artifacts for page ${pageIndex}: ${error.message}`);
    }
  });
};

export const stopVideos = async (): Promise<void> => {
  await Promise.all(capturesToStop.map((capture) => capture.stop()));
};
