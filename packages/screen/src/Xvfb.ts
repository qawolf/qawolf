import { logger } from "@qawolf/logger";
import { waitUntil } from "@qawolf/web";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { pathExists } from "fs-extra";
import { Size } from "./types";

interface ConstructorOptions {
  display: number;
  process: ChildProcessWithoutNullStreams;
  timeoutMs?: number;
}

export class Xvfb {
  private _display: number;
  private _process: any;
  private _timeoutMs: number;

  protected constructor(options: ConstructorOptions) {
    this._display = options.display;
    this._process = options.process;
    this._timeoutMs = options.timeoutMs || 30000;

    logger.debug(`Xvfb: created ${this.display()}`);
  }

  public static async startWithArgs(
    args: string[] = [],
    timeoutMs: number = 30000
  ) {
    try {
      logger.debug(`Xvfb: start ${JSON.stringify(args)}`);

      const display = await getUnusedDisplay();

      const process = spawn("Xvfb", [`:${display}`].concat(args));

      process.stderr.on("data", data => {
        logger.debug(`Xvfb: ${data.toString()}`);
      });

      await waitUntil(() => displayExists(display), timeoutMs);

      return new Xvfb({ display, process, timeoutMs });
    } catch (e) {
      logger.error(`Display: could not start ${JSON.stringify(e)}`);
      return null;
    }
  }

  public static async start(size: Size) {
    return Xvfb.startWithArgs([
      "-shmem",
      "-screen",
      "0",
      `${size.width}x${size.height}x24`,
      // do not listen on a unix socket to prevent
      // "_XSERVTransmkdir: ERROR: euid != 0,directory /tmp/.X11-unix will not be created"
      // https://phabricator.wikimedia.org/T202710
      "-nolisten",
      "unix"
    ]);
  }

  public display() {
    return `:${this._display}`;
  }

  public screen() {
    return `${this.display()}.0`;
  }

  public async stop() {
    if (!this._process) {
      return;
    }

    try {
      logger.debug(`Xvfb: stop`);

      this._process.kill();
      this._process = null;

      await waitUntil(
        async () => !(await displayExists(this._display)),
        this._timeoutMs
      );
    } catch (e) {
      throw new Error("Xvfb: could not stop");
    }
  }
}

const getLockFile = (display: number) => `/tmp/.X${display}-lock`;

const displayExists = async (display: number) =>
  pathExists(getLockFile(display));

const getUnusedDisplay = async (): Promise<number> => {
  let display = 98;

  while (await displayExists(display)) {
    display++;
  }

  return display;
};
