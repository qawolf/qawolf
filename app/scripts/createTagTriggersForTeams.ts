import { connectDb } from "../server/db";
import { cuid } from "../server/utils";
import { minutesFromNow } from "../shared/utils";

(async () => {
  const db = connectDb();

  const triggers = await db("triggers");

  await db.transaction(async (trx) => {
    await Promise.all(
      triggers.map(async (trigger) => {
        // create tag for trigger
        await trx("tags").insert({
          color: trigger.color,
          id: trigger.id,
          name: trigger.name,
          team_id: trigger.team_id,
        });

        // associate trigger with its tag
        await trx("tag_triggers").insert({
          id: cuid(),
          tag_id: trigger.id,
          trigger_id: trigger.id,
        });

        // add associated tests to tag
        const tests = await trx
          .select("tests.*")
          .from("tests")
          .innerJoin("test_triggers", "tests.id", "test_triggers.test_id")
          .where({ "test_triggers.trigger_id": trigger.id });

        const tagTests = tests.map(({ id }: { id: string }) => {
          return {
            id: cuid(),
            tag_id: trigger.id,
            test_id: id,
          };
        });

        await trx("tag_tests").insert(tagTests);

        // soft delete if API trigger
        if (!trigger.deployment_provider && !trigger.repeat_minutes) {
          await trx("triggers")
            .where({ id: trigger.id })
            .update({ deleted_at: minutesFromNow() });
        }
      })
    );
  });

  console.log("success");

  await db.destroy();
})();
