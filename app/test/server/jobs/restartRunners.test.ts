import { restartRunners } from "../../../server/jobs/restartRunners";
import { findRunner } from "../../../server/models/runner";
import * as azureContainer from "../../../server/services/azure/container";
import { minutesFromNow } from "../../../shared/utils";
import { prepareTestDb } from "../db";
import { buildRunner, logger } from "../utils";

const db = prepareTestDb();

const restartRunnerContainerGroup = jest
  .spyOn(azureContainer, "restartRunnerContainerGroup")
  .mockResolvedValue(null);

beforeAll(async () => {
  const now = minutesFromNow();

  await db("runners").insert(
    buildRunner({
      api_key: "apiKey",
      ready_at: now,
      session_expires_at: now,
    })
  );

  await restartRunners(null, { db, logger });
});

it("updates the expired runner models", async () => {
  const runner = await findRunner({ id: "runnerId" }, { db, logger });

  expect(runner).toMatchObject({
    api_key: null,
    health_checked_at: expect.any(Date),
    id: "runnerId",
    ready_at: null,
    restarted_at: expect.any(Date),
    session_expires_at: null,
  });
});

it("restarts the runners", () => {
  expect(restartRunnerContainerGroup).toBeCalledWith({
    client: null,
    logger,
    id: "runnerId",
  });
});
