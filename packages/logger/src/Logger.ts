import { CONFIG } from "@qawolf/config";
import { ensureDirSync } from "fs-extra";
import winston from "winston";

export class Logger {
  private _logger: winston.Logger;

  constructor() {
    this._logger = winston.createLogger({
      transports: [
        CONFIG.artifactPath
          ? createFileTransport(CONFIG.artifactPath)
          : createConsoleTransport()
      ]
    });
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
  ensureDirSync(path);

  return new winston.transports.File({
    filename: `${path}/${Date.now()}.log`,
    format: winston.format.combine(winston.format.timestamp(), formatPrint),
    level: CONFIG.logLevel || "verbose"
  });
};
