import { db } from "../server/db";
import { encrypt } from "../server/models/encrypt";
import { buildApiKey } from "../server/utils";

(async () => {
  const teams = await db("teams").select("*");

  await db.transaction(async (trx) => {
    await Promise.all(
      teams.map((team) => {
        return trx("teams")
          .update({ api_key: encrypt(buildApiKey()) })
          .where({ id: team.id });
      })
    );
  });

  console.log("success");
})();
