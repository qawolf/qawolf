import { db } from "../server/db";
import { encrypt } from "../server/models/encrypt";
import { buildApiKey, cuid } from "../server/utils";

(async () => {
  const teams = await db("teams").select("*");

  await db.transaction(async (trx) => {
    await Promise.all(
      teams.map((team) => {
        return (async () => {
          if (team.api_key && team.next_trigger_id) return;

          return trx("teams")
            .update({
              api_key: encrypt(buildApiKey()),
              next_trigger_id: cuid(),
            })
            .where({ id: team.id });
        })();
      })
    );
  });

  console.log("success");
})();
