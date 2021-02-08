import { db } from "../server/db";
import { Logger } from "../server/Logger";
import { createGroupTest } from "../server/models/test_trigger";

const logger = new Logger();

export const addDanglingTestsToGroup = async ({
  creator_id,
  group_id,
}: {
  creator_id: string;
  group_id: string;
}): Promise<void> => {
  const result = await db.raw(`
  SELECT id FROM tests
  WHERE creator_id = '${creator_id}' AND deleted_at IS NULL
  AND NOT EXISTS (
     SELECT FROM group_tests
     WHERE  test_id = tests.id
  )
  `);

  console.log("Found danging tests", result.rows.length);

  await db.transaction(async (trx) => {
    const promises = result.rows.map((row) =>
      createGroupTest({ group_id, test_id: row.id }, { logger, trx })
    );

    await Promise.all(promises);
  });

  console.log("Success!");
};

addDanglingTestsToGroup({
  creator_id: "",
  group_id: "",
});
