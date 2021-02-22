import { connectDb } from "../server/db";

(async () => {
  const db = connectDb();

  const defaultTriggers = await db("triggers").where({ name: "All Tests" });
  console.log(`found ${defaultTriggers.length} default triggers`);

  const defaultTriggerIds = defaultTriggers.map((t) => t.id);

  await db("test_triggers").whereIn("trigger_id", defaultTriggerIds).del();

  await db("triggers").whereIn("id", defaultTriggerIds).del();

  console.log("success");

  await db.destroy();
})();
