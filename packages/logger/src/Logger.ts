import winston from "winston";
import { CONFIG } from "@qawolf/config";

export class Logger {
  private _logger: winston.Logger;

  constructor() {
    this.setName();
  }

  setName(name?: string | null) {
    this._logger = winston.createLogger({
      transports: [
        CONFIG.logPath ? createFileTransport(name) : createConsoleTransport()
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

const createFileTransport = (name?: string | null) => {
  const prefix = name ? `${name}_` : "";
  const filename = `${CONFIG.logPath}/${prefix}${Date.now()}.log`;

  return new winston.transports.File({
    filename,
    format: winston.format.combine(winston.format.timestamp(), formatPrint),
    level: CONFIG.logLevel || "debug"
  });
};
