import winston from "winston";
import { CONFIG } from "@qawolf/config";

const transports = [];

if (CONFIG.logPath) {
  transports.push(
    new winston.transports.File({
      filename: `${CONFIG.logPath}/${Date.now()}.log`,
      level: CONFIG.logLevel || "debug"
    })
  );
} else {
  transports.push(
    new winston.transports.Console({ level: CONFIG.logLevel || "error" })
  );
}

export const logger = winston.createLogger({
  transports
});
