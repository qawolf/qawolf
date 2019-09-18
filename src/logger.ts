import { createLogger, format, transports } from "winston";
import { CONFIG } from "./config";

const loggerFormat = CONFIG.jsonLogging
  ? format.json()
  : format.combine(
      format.colorize(),
      format.timestamp(),
      format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
    );

export const logger = createLogger({
  transports: [
    new transports.Console({
      format: loggerFormat,
      level: "debug"
    })
  ]
});
