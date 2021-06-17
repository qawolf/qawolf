import { Logger } from "../../../server/Logger";
import * as awsStorage from "../../../server/services/aws/storage";
import {
  ensureEmailAllowed,
  ensureIpAllowed,
} from "../../../server/services/block";

const logger = new Logger();

afterEach(() => jest.restoreAllMocks());

describe("ensureEmailAllowed", () => {
  beforeEach(() => {
    jest
      .spyOn(awsStorage, "getS3Set")
      .mockResolvedValue(new Set(["school.edu"]));
  });

  it("blocks domains on the block list", async () => {
    await expect(
      ensureEmailAllowed("jon@school.edu", logger)
    ).rejects.toThrowError();
  });

  it("allows domains off the block list", async () => {
    await expect(
      ensureEmailAllowed("jon@google.com", logger)
    ).resolves.not.toThrowError();
  });
});

describe("ensureIpAllowed", () => {
  beforeEach(() => {
    jest.spyOn(awsStorage, "getS3Set").mockResolvedValue(new Set(["1.1.1.1"]));
  });

  it("blocks ips on the block list", async () => {
    await expect(ensureIpAllowed("1.1.1.1", logger)).rejects.toThrowError();
  });

  it("allows ips off the block list", async () => {
    await expect(
      ensureIpAllowed("8.8.8.8", logger)
    ).resolves.not.toThrowError();
  });
});
