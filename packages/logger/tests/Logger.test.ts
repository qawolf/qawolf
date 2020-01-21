import { logger } from "../src/index";

it("create transport before first log, so empty log files are not created", () => {
  expect(logger.numTransports).toEqual(0);
  logger.debug("should create transport");
  expect(logger.numTransports).toEqual(1);
  logger.debug("should not create transport");
  expect(logger.numTransports).toEqual(1);
});
