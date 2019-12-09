import { CONFIG } from "@qawolf/config";
import { basename } from "path";
import winston from "winston";

export class Logger {
  private _logger: winston.Logger;
  private _path: string = "";

  constructor() {
    // name the logger based on the main filename
    this.setName(basename(require.main!.filename));
  }

  setName(name?: string | null) {
    if (CONFIG.logPath) {
      this._path = `${CONFIG.logPath}${name ? `/${name}` : ""}`;
    }

    this._logger = winston.createLogger({
      transports: [
        this._path ? createFileTransport(this._path) : createConsoleTransport()
      ]
    });
  }

  get path() {
    return this._path;
  }

  debug(message: string) {
    this._logger.debug(message);
  }

  error(message: string) {
    this._logger.error(message);
  }

  info(message: string) {
    this._logger.info(message);
  }

  verbose(message: string) {
    this._logger.verbose(message);
  }
}

const formatPrint = winston.format.printf(
  ({ level, message, timestamp }) => `${timestamp} ${level}: ${message}`
);

const createConsoleTransport = () =>
  new winston.transports.Console({
    level: CONFIG.logLevel || "error",
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp(),
      formatPrint
    )
  });

const createFileTransport = (path: string) => {
  return new winston.transports.File({
    filename: `${path}/${Date.now()}.log`,
    format: winston.format.combine(winston.format.timestamp(), formatPrint),
    level: CONFIG.logLevel || "verbose"
  });
};
