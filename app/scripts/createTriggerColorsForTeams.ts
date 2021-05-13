import { connectDb } from "../server/db";
import { Logger } from "../server/Logger";
import { findTriggersForTeam } from "../server/models/trigger";
import { COLORS } from "../server/models/utils";

(async () => {
  const db = connectDb();
  const logger = new Logger();

  const teams = await db("teams").select("*");

  await db.transaction(async (trx) => {
    await Promise.all(
      teams.map(async (team) => {
        const triggers = await findTriggersForTeam(team.id, {
          db: trx,
          logger,
        });

        await Promise.all(
          triggers.map(async (trigger, i) => {
            const index = i === 0 ? 0 : i % COLORS.length;

            return trx("triggers")
              .update({ color: COLORS[index] })
              .where({ id: trigger.id });
          })
        );
      })
    );
  });

  console.log("success");

  await db.destroy();
})();
