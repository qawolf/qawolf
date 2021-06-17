import { deployRunners } from "../../../server/jobs/deployRunners";
import * as azureContainer from "../../../server/services/azure/container";
import { prepareTestDb } from "../db";
import { buildEnvironmentVariable, buildRunner, logger } from "../utils";

const createRunnerContainerGroup = jest
  .spyOn(azureContainer, "createRunnerContainerGroup")
  .mockResolvedValue(null);

const db = prepareTestDb();

beforeAll(async () => {
  await db("environment_variables").insert({
    ...buildEnvironmentVariable({ name: "AZURE_ENV" }),
    environment_id: null,
    is_system: true,
    team_id: null,
    value: JSON.stringify({}),
  });

  await db("runners").insert([buildRunner({}), buildRunner({ i: 2 })]);

  await deployRunners(null, {
    db,
    logger,
  });
});

it("updates the runner models", async () => {
  const runners = await db("runners");

  expect(runners).toMatchObject([
    { deployed_at: expect.any(Date) },
    { deployed_at: expect.any(Date) },
  ]);
});

it("creates the runner container groups", async () => {
  expect(createRunnerContainerGroup).toBeCalledTimes(2);

  expect(createRunnerContainerGroup).toBeCalledWith({
    azureEnv: {},
    client: null,
    logger,
    runner: expect.objectContaining({ id: "runnerId" }),
  });

  expect(createRunnerContainerGroup).toBeCalledWith({
    azureEnv: {},
    client: null,
    logger,
    runner: expect.objectContaining({ id: "runner2Id" }),
  });
});
