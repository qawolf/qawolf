/**
 * Run this file with Deno to spin up a development environment with
 * all the necessary services, file watching, and hot reloading.
 */
import { serve } from "https://deno.land/std@0.73.0/http/server.ts";
import debounce from "https://raw.githubusercontent.com/lodash/lodash/master/debounce.js";

type RunAppOptions = {
  afterStart?: () => Promise<void>;
  initialLog: string;
  logName: string;
};

class CappedLog {
  private _maxLines = 1000;
  private _lines: string[] = [];

  append(text: string) {
    const lines = text.split("\n");
    this._lines.push(...lines);
    const overage = this._lines.length - this._maxLines;
    if (overage > 0) this._lines.splice(0, overage);
  }

  get lines() {
    return this._lines;
  }
}

const RECORDER_BUILD_FILE = "./recorder/build/qawolf.recorder.js";
const RECORDER_FILE_RUNNER_COPY = "./runner/qawolf.recorder.js";
const RUNNER_SOURCE_FILES = "./runner/src";
const BROWSER_LOGS_PORT = 8787;
const projects = ["app", "runner"];
const logs = new Map<string, CappedLog>();
const decoder = new TextDecoder();
const activeRuns = new Set<Deno.Process>([]);

if (
  Deno.env.get("QAWOLF_REBUILD") ||
  Deno.env.get("QAWOLF_RECORDER_HOT_RELOAD")
) {
  projects.push("recorder");
}

const getLoggerForProject = (projectName: string) => {
  const runLog = logs.get(projectName) || new CappedLog();
  if (!logs.has(projectName)) logs.set(projectName, runLog);
  return runLog;
};

const getRunnerContainerId = async () => {
  const dockerPs = Deno.run({
    cwd: await Deno.realPath("./"),
    cmd: "docker ps -q -f ancestor=runner".split(" "),
    stdout: "piped",
  });

  const result = await dockerPs.output();
  const containerId = new TextDecoder()
    .decode(result)
    .replace(/\n/g, "")
    .trim(); // 'd45fe9aa7f44';

  if (containerId.length === 0) {
    throw new Error("No running runner container found");
  }

  return containerId;
};

const copyRecorderToRunner = debounce(async () => {
  await Deno.copyFile(RECORDER_BUILD_FILE, RECORDER_FILE_RUNNER_COPY);
}, 2000);

const copyRunnerRecorderIntoContainer = debounce(async () => {
  const containerId = await getRunnerContainerId();

  const app = Deno.run({
    cwd: await Deno.realPath("./"),
    cmd: `docker cp ${RECORDER_FILE_RUNNER_COPY} ${containerId}:./qawolf.recorder.js`.split(
      " "
    ),
  });

  await app.status();
}, 2000);

const rebuildAndRestartRunner = debounce(async () => {
  const runnerLogs = getLoggerForProject("runner");
  runnerLogs.append(
    "Rebuilding and copying changed files in to the runner container..."
  );

  const containerId = await getRunnerContainerId();

  const doCopy = Deno.run({
    cwd: await Deno.realPath("./"),
    cmd: `docker cp ${RUNNER_SOURCE_FILES}/. ${containerId}:./src`.split(" "),
  });
  await doCopy.status();
  runnerLogs.append("Finished copy");

  const doBuild = Deno.run({
    cwd: await Deno.realPath("./"),
    cmd: `docker exec -it ${containerId} sh -c`
      .split(" ")
      .concat(["npm run build:tsc"]),
  });
  await doBuild.status();
  runnerLogs.append("Finished build");

  const doRestart = Deno.run({
    cwd: await Deno.realPath("./"),
    cmd: `docker exec -it ${containerId} scripts/restart-node.sh`.split(" "),
  });
  await doRestart.status();
  runnerLogs.append("Finished restart");
}, 2000);

const fileExists = async (filePath: string): Promise<boolean> => {
  let fileInfo: Deno.FileInfo;
  try {
    fileInfo = await Deno.stat(filePath);
  } catch (error) {
    return false;
  }

  return fileInfo.isFile;
};

const runApp = async (
  command: string,
  relativePath: string,
  { afterStart, initialLog, logName }: RunAppOptions
) => {
  const appPath = await Deno.realPath(relativePath);

  const app = Deno.run({
    cwd: appPath,
    cmd: command.split(" "),
    stdout: "piped",
    stderr: "piped",
  });

  activeRuns.add(app);

  const runLog = getLoggerForProject(logName);

  runLog.append(initialLog);

  app
    .status()
    .then(async ({ code }) => {
      activeRuns.delete(app);
      if (code !== 0) {
        const rawError = await app.stderrOutput();
        runLog.append(decoder.decode(rawError));
      }
      runLog.append(
        `${command} in directory ${relativePath} finished with exit code ${code}`
      );
    })
    .catch((error: Error) => {
      runLog.append(error.message);
    });

  if (afterStart) {
    afterStart().catch((error: Error) => {
      runLog.append(error.message);
    });
  }

  for await (const data of Deno.iter(app.stdout)) {
    runLog.append(decoder.decode(data));
  }
};

const runDevelopServer = async () => {
  const server = serve({ hostname: "0.0.0.0", port: BROWSER_LOGS_PORT });

  const styles = `
  <style type="text/css">
    .logBox {
      background-color: black;
      box-sizing: border-box;
      color: white;
      height: 200px;
      overflow-x: auto;
      overflow-y: scroll;
      padding: 20px;
      width: 100%;
    }
  </style>`;

  const jsScript = `
  <script>
    for (const element of document.getElementsByClassName("logBox")) {
      element.scrollTop = element.scrollHeight;
    }
    setTimeout(() => {
      window.location.reload();
    }, 5000);
  </script>`;

  for await (const request of server) {
    let body = `<html><head></head><body style="margin: 50px;">${styles}`;
    for (const project of projects) {
      const log = logs.get(project);
      body += `<h3>${project}</h3>`;
      body += `<div class="logBox">${
        log ? log.lines.join("<br />") : ""
      }</div>`;
    }
    body += `${jsScript}</body></html>`;

    request.respond({ status: 200, body });
  }
};

runDevelopServer();

console.log("Starting QA Wolf development environment...");
console.log(`  ✓ View logs at http://localhost:${BROWSER_LOGS_PORT}/`);
console.log("  ✓ Press CTRL+C to stop everything");

if (Deno.env.get("QAWOLF_REBUILD")) {
  console.log(
    "  ✓ QAWOLF_REBUILD=1 detected. Reinstalling deps and rebuilding the `runner` image."
  );

  await Promise.all([
    runApp("npm install", "./app", {
      initialLog: "Installing dependencies...",
      logName: "app",
    }),
    runApp("npm install", "./recorder", {
      initialLog: "Installing dependencies...",
      logName: "recorder",
    }),
    runApp("npm install", "./runner", {
      initialLog: "Installing dependencies...",
      logName: "runner",
    }),
  ]);

  await runApp("npm run build", "./recorder", {
    initialLog: "Building recorder script...",
    logName: "recorder",
  });

  await runApp("npm run copy-recorder-script", "./runner", {
    initialLog: "Copying recorder script in to runner folder...",
    logName: "runner",
  });

  await runApp("docker build -t runner .", "./runner", {
    initialLog: "Building Docker image for runner...",
    logName: "runner",
  });
} else {
  console.log(
    "  ✓ If something doesn't work, try `QAWOLF_REBUILD=1 deno run --unstable -A develop.ts`"
  );
}

/**
 * When anything in `/runner/src` changes, copy it in to the
 * running container, rebuild in the container, and restart the
 * runner server.
 */
const watchRunner = async () => {
  for await (const event of Deno.watchFs(RUNNER_SOURCE_FILES)) {
    try {
      await rebuildAndRestartRunner();
    } catch (error) {
      console.error(error);
    }
  }
};

const runnerPromises = [
  runApp("npm run dev", "./app", {
    initialLog: "Starting project...",
    logName: "app",
  }),
  runApp(
    'docker run --rm -it -p 26367:26367 -e QAWOLF_API_URL="http://host.docker.internal:7071" runner',
    "./runner",
    {
      initialLog: "Starting project...",
      logName: "runner",
      afterStart: watchRunner,
    }
  ),
];

if (Deno.env.get("QAWOLF_RECORDER_HOT_RELOAD")) {
  console.log(
    "  ✓ QAWOLF_RECORDER_HOT_RELOAD=1 detected. Hot reload enabled for the runner recorder."
  );

  const recorderLogs = getLoggerForProject("recorder");

  /**
   * When recorder/build/qawolf.recorder.js changes, copy it into
   * the runner folder.
   */
  const watchRecorder = async () => {
    for await (const event of Deno.watchFs(RECORDER_BUILD_FILE)) {
      // Copy built file from recorder/build to runner
      try {
        await copyRecorderToRunner();
        recorderLogs.append(
          `${RECORDER_BUILD_FILE} changed. Copied to runner project.`
        );
      } catch (error) {
        console.error(error);
      }
    }
  };

  /**
   * When runner/qawolf.recorder.js changes, probably as a result
   * of `watchRecorder`, copy it into the running runner container.
   *
   * Note that this is ephemeral so you'll still want to run `docker build`
   * for the runner image after you've finished making changes.
   */
  const watchRecorderCopy = async () => {
    if (!(await fileExists(RECORDER_FILE_RUNNER_COPY))) {
      await copyRecorderToRunner();
    }

    for await (const event of Deno.watchFs(RECORDER_FILE_RUNNER_COPY)) {
      try {
        await copyRunnerRecorderIntoContainer();
        recorderLogs.append(
          `${RECORDER_FILE_RUNNER_COPY} changed. Copied to running Docker container.`
        );
      } catch (error) {
        console.error(error);
      }
    }
  };

  runnerPromises.push(
    runApp("npm run build:watch", "./recorder", {
      initialLog: "Watching recorder...",
      logName: "recorder",
    }),
    watchRecorder(),
    watchRecorderCopy()
  );
} else {
  console.log(
    "  ✓ If you are modifying the recorder, consider setting `QAWOLF_RECORDER_HOT_RELOAD=1` to auto-reload it in runner."
  );
}

runnerPromises.push(
  (async () => {
    for await (const _ of Deno.signal(Deno.Signal.SIGINT)) {
      console.log("\nStopping...");
      activeRuns.forEach((app) => {
        app.kill(Deno.Signal.SIGINT);
      });
      Deno.exit();
    }
  })()
);

await Promise.all(runnerPromises);
