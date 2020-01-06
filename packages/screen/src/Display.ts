import { logger } from "@qawolf/logger";
import { Size } from "./types";
const Xvfb = require("xvfb");

export class Display {
  private _xvfb: any;

  protected constructor(xvfb: any) {
    this._xvfb = xvfb;
    logger.debug(`Display: created ${this.screen}`);
  }

  public get screen() {
    return `${this.value}.0`;
  }

  public get value() {
    return this._xvfb.display();
  }

  public static async start(size: Size) {
    logger.debug(`Display: start ${JSON.stringify(size)}`);

    return new Promise<Display | null>((resolve, reject) => {
      const xvfb = new Xvfb({
        xvfb_args: [
          "-shmem",
          "-screen",
          "0",
          `${size.width}x${size.height}x24`,
          // do not listen on a unix socket to prevent
          // "_XSERVTransmkdir: ERROR: euid != 0,directory /tmp/.X11-unix will not be created"
          // https://phabricator.wikimedia.org/T202710
          "-nolisten",
          "unix"
        ]
      });

      xvfb.start(function(err: any) {
        if (err) {
          logger.error(`Display: could not start ${JSON.stringify(err)}`);
          reject(null);
        } else {
          resolve(new Display(xvfb));
        }
      });
    });
  }

  public stop() {
    logger.debug(`Display: stop ${this.screen}`);

    return new Promise((resolve, reject) => {
      this._xvfb.stop(function(err: any) {
        if (err) {
          logger.error(`Display: could not stop ${JSON.stringify(err)}`);
          reject(null);
        } else {
          resolve();
        }
      });
    });
  }
}
