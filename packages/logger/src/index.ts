import winston from "winston";
import { CONFIG } from "@qawolf/config";

const transports = [];

const formatPrint = winston.format.printf(
  ({ level, message, timestamp }) => `${timestamp} ${level}: ${message}`
);

if (CONFIG.logPath) {
  // set in runTest
  const testName = process.env.QAW_TEST_NAME;
  const logNamePrefix = testName ? `${testName}_` : "";

  transports.push(
    new winston.transports.File({
      filename: `${CONFIG.logPath}/${logNamePrefix}${Date.now()}.log`,
      format: winston.format.combine(winston.format.timestamp(), formatPrint),
      level: CONFIG.logLevel || "debug"
    })
  );
} else {
  transports.push(
    new winston.transports.Console({
      level: CONFIG.logLevel || "error",
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        formatPrint
      )
    })
  );
}

export const logger = winston.createLogger({
  transports
});
