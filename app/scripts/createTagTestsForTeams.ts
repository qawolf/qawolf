import { connectDb } from "../server/db";
import { cuid } from "../server/utils";

(async () => {
  const db = connectDb();

  const tests = await db("tests").select("*").whereNotNull("group_id");

  await db.transaction(async (trx) => {
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
