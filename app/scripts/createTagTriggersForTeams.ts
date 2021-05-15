import { connectDb } from "../server/db";
import { cuid } from "../server/utils";
import { minutesFromNow } from "../shared/utils";

(async () => {
  const db = connectDb();

  const triggers = await db("triggers").where({ deleted_at: null });

  await db.transaction(async (trx) => {
    await Promise.all(
      triggers.map(async (trigger) => {
        // try to find a tag with the trigger name for the team
        const existingTag = await trx("tags")
          .select("*")
          .where({ name: trigger.name, team_id: trigger.team_id })
          .first();

        let tag_id = existingTag?.id;
        if (!tag_id) {
          console.log(
            "insert tag for trigger",
            trigger.id,
            trigger.name,
            "team",
            trigger.team_id
          );

          // if none exists, create a tag for trigger
          // use the same id as the trigger for api backwards compatibility
          tag_id = trigger.id;

          await trx("tags").insert({
            color: trigger.color,
            id: tag_id,
            name: trigger.name,
            team_id: trigger.team_id,
          });
        }

        // associate trigger with its tag
        await trx("tag_triggers").insert({
          id: cuid(),
          tag_id,
          trigger_id: trigger.id,
        });

        // add associated tests to tag
        const tests = await trx
          .select("tests.*")
          .from("tests")
          .innerJoin("test_triggers", "tests.id", "test_triggers.test_id")
          .where({ deleted_at: null, "test_triggers.trigger_id": trigger.id });

        const tagTests = tests.map(({ id }: { id: string }) => {
          return {
            id: cuid(),
            tag_id,
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
