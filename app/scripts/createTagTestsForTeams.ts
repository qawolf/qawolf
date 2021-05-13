import { connectDb } from "../server/db";
import { cuid } from "../server/utils";

(async () => {
  const db = connectDb();

  await db.transaction(async (trx) => {
    const tests = await trx("tests")
      .select("*")
      .where({ deleted_at: null })
      .whereNotNull("group_id");

    await Promise.all(
      tests.map(async (test) => {
        return trx("tag_tests").insert({
          id: cuid(),
          tag_id: test.group_id,
          test_id: test.id,
        });
      })
    );
  });

  console.log("success");

  await db.destroy();
})();
