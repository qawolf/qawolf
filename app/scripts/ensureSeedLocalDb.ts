import { connectDb } from "../server/db";
import { cuid } from "../server/utils";
import { minutesFromNow } from "../shared/utils";

const ensureSeedLocalDb = async (): Promise<void> => {
  const db = connectDb();

  const [{ count: envVarCount }] = await db("environment_variables").count(
    "id"
  );

  if (Number(envVarCount) === 0) {
    await db("environment_variables").insert({
      id: cuid(),
      is_system: true,
      name: "RUNNER_LOCATIONS",
      value: JSON.stringify({}),
    });
  }

  const [{ count: runnerCount }] = await db("runners").count(
    "id"
  );

  if (Number(runnerCount) === 0) {
    const timestamp = minutesFromNow();
    await db("runners").insert({
      api_key: "api-key",
      created_at: timestamp,
      id: cuid(),
      location: "local",
      ready_at: timestamp,
      updated_at: timestamp,
    });
  }

  console.log("Seeded local development database");

  await db.destroy();
};

ensureSeedLocalDb().catch((error) => {
  console.error(error);
});
