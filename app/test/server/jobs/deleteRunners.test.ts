import { deleteRunners } from "../../../server/jobs/deleteRunners";
import * as runnerModel from "../../../server/models/runner";
import * as azureContainer from "../../../server/services/azure/container";
import { minutesFromNow } from "../../../shared/utils";
import { buildRunner, logger } from "../utils";

describe("deleteRunners", () => {
  let deleteContainerGroup: jest.SpyInstance;

  beforeAll(async () => {
    jest.spyOn(azureContainer, "getRunnerContainerGroups").mockResolvedValue([
      { containers: [], name: "runner-runnerId", osType: "linux" },
      { containers: [], name: "runner-runner2Id", osType: "linux" },
    ]);

    jest
      .spyOn(runnerModel, "findRunners")
      .mockResolvedValue([buildRunner({ deleted_at: minutesFromNow() })]);

    deleteContainerGroup = jest
      .spyOn(azureContainer, "deleteContainerGroup")
      .mockResolvedValue(null);

    await deleteRunners(null, { db: null, logger });
  });

  afterAll(() => jest.restoreAllMocks());

  it("deletes containers for deleted runners", async () => {
    expect(deleteContainerGroup).toBeCalledWith({
      client: null,
      logger,
      name: "runner-runnerId",
    });
  });

  it("deletes containers for non-existant runners", () => {
    expect(deleteContainerGroup).toBeCalledWith({
      client: null,
      logger,
      name: "runner-runner2Id",
    });
  });
});
