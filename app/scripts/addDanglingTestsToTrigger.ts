import { db } from "../server/db";
import { Logger } from "../server/Logger";
import { createTestTrigger } from "../server/models/test_trigger";

const logger = new Logger();

export const addDanglingTestsToTrigger = async ({
  creator_id,
  trigger_id,
}: {
  creator_id: string;
  trigger_id: string;
}): Promise<void> => {
  const result = await db.raw(`
  SELECT id FROM tests
  WHERE creator_id = '${creator_id}' AND deleted_at IS NULL
  AND NOT EXISTS (
     SELECT FROM test_triggers
     WHERE  test_id = tests.id
  )
  `);

  console.log("Found danging tests", result.rows.length);

  await db.transaction(async (trx) => {
    const promises = result.rows.map((row) =>
      createTestTrigger({ test_id: row.id, trigger_id }, { logger, trx })
    );

    await Promise.all(promises);
  });

  console.log("Success!");
};

addDanglingTestsToTrigger({
  creator_id: "",
  trigger_id: "",
});
