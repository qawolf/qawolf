import { CONFIG } from "@qawolf/config";
import { ensureDirSync } from "fs-extra";
import winston from "winston";

const LogLevels = ["debug", "error", "info", "verbose", "warn"];

export class Logger {
  private _logger: winston.Logger;
  private _name: string;

  constructor(name: string) {
    this._logger = winston.createLogger({ transports: [] });
    this._name = name;
  }

  private ensureTransport() {
    if (this._logger.transports.length) return;

    const transport = CONFIG.artifactPath
      ? createFileTransport(CONFIG.artifactPath, this._name)
      : createConsoleTransport();

    this._logger.add(transport);
  }

  public get numTransports() {
    return this._logger.transports.length;
  }

  public debug(message: string) {
    this.ensureTransport();
    this._logger.debug(message);
  }

  public error(message: string) {
    this.ensureTransport();
    this._logger.error(message);
  }

  public info(message: string) {
    this.ensureTransport();
    this._logger.info(message);
  }

  public log(level: string, message: string) {
    this.ensureTransport();
    const logLevel = LogLevels.includes(level) ? level : "info";
    this._logger.log(logLevel, message);
  }

  public verbose(message: string) {
    this.ensureTransport();
    this._logger.verbose(message);
  }

  public warn(message: string) {
    this.ensureTransport();
    this._logger.warn(message);
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

const createFileTransport = (path: string, name: string) => {
  ensureDirSync(path);

  return new winston.transports.File({
    filename: `${path}/${name}_${Date.now()}.log`,
    format: winston.format.combine(winston.format.timestamp(), formatPrint),
    level: CONFIG.logLevel || "verbose"
  });
};
