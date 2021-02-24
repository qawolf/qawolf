import { connectDb } from "../server/db";

(async () => {
  const db = connectDb();

  const defaultTriggers = await db("triggers").where({ name: "All Tests" });
  console.log(`found ${defaultTriggers.length} default triggers`);

  const defaultTriggerIds = defaultTriggers.map((t) => t.id);

  await db.transaction(async (trx) => {
    await trx("suites")
      .update({ trigger_id: null })
      .whereIn("trigger_id", defaultTriggerIds);

    await trx("test_triggers").whereIn("trigger_id", defaultTriggerIds).del();

    await trx("triggers").whereIn("id", defaultTriggerIds).del();
  });

  console.log("success");

  await db.destroy();
})();
