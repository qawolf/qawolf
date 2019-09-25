import { createLogger, transports } from "winston";

export const logger = createLogger({
  transports: [new transports.File({ filename: "logs.log", level: "debug" })]
});
