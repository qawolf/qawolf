import Docker from "dockerode";
import { MultiBar, Presets, SingleBar } from "cli-progress";
import { DOCKER_IMAGE_NAME } from "./constants";

type DockerProgressDetail = {
  current: number;
  total: number;
};

type DockerProgressEvent = {
  id: string;
  progressDetail: DockerProgressDetail;
  status: string;
};

type ProgressFn = (event: DockerProgressEvent) => void;
type DoneFn = () => void;

const monitorStream = async (
  docker: Docker,
  stream: NodeJS.ReadableStream,
  onProgress: ProgressFn
) =>
  new Promise((resolve, reject) => {
    function onFinished(error: Error, output: any) {
      if (error) {
        reject(error);
      } else {
        resolve(output);
      }
    }

    docker.modem.followProgress(stream, onFinished, onProgress);
  });

export const prepareMultiProgressBar = (): [ProgressFn, DoneFn] => {
  const barsById = new Map<string, any>();

  const bars = new MultiBar(
    {
      format: "{id} [{bar}] {status}",
      hideCursor: true,
    },
    Presets.shades_grey
  );

  function onProgress(event: DockerProgressEvent) {
    const { id, progressDetail, status } = event;
    if (!id) return;

    let bar = barsById.get(id);
    if (bar) {
      if (status === "Pull complete") {
        bars.remove(bar);
        barsById.delete(id);
      } else if (progressDetail) {
        bar.setTotal(progressDetail.total);
        bar.update(progressDetail.current, { id, status });
      }
    } else if (progressDetail) {
      bar = bars.create(progressDetail.total, progressDetail.current, {
        id,
        status,
      });
      barsById.set(id, bar);
    }
  }

  function onDone() {
    bars.stop();
  }

  return [onProgress, onDone];
};

export const prepareSingleProgressBar = (): [ProgressFn, DoneFn] => {
  const progressById = new Map<string, any>();

  const bar = new SingleBar(
    {
      clearOnComplete: true,
      format: "    Downloading [{bar}] | {percentage}%",
      hideCursor: true,
    },
    Presets.shades_grey
  );

  let barIsStarted = false;
  let totalImages = 20; // A guess to start, to help prevent the progress bar going backward
  function onProgress(event: DockerProgressEvent) {
    const { id, progressDetail } = event;
    if (!id || !progressDetail || typeof progressDetail.current !== "number")
      return;

    progressById.set(id, progressDetail);

    let combinedCurrent = 0;
    let trackedImages = 0;
    for (const detail of progressById.values()) {
      trackedImages += 1;
      combinedCurrent += Math.round((detail.current / detail.total) * 100);
    }

    if (trackedImages > totalImages) totalImages = trackedImages;

    const total = totalImages * 100;

    if (combinedCurrent > 0) {
      if (barIsStarted) {
        bar.setTotal(total);
        bar.update(combinedCurrent);
      } else {
        bar.start(total, combinedCurrent);
        barIsStarted = true;
      }
    }
  }

  function onDone() {
    bar.setTotal(100);
    bar.update(100);
    bar.stop();
  }

  return [onProgress, onDone];
};

export default async function pullRunnerImage(
  docker: Docker,
  verbose = false
): Promise<void> {
  let onProgress: ProgressFn;
  let onDone: DoneFn;
  if (verbose) {
    [onProgress, onDone] = prepareMultiProgressBar();
  } else {
    [onProgress, onDone] = prepareSingleProgressBar();
  }

  try {
    const stream = await docker.pull(DOCKER_IMAGE_NAME);
    await monitorStream(docker, stream, onProgress);
  } catch (error) {
    console.log("Unable to pull the QA Wolf Docker image", error.message);
  }

  onDone();
}
