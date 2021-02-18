import { connectDb } from "../server/db";
import environment from "../server/environment";
import { cuid } from "../server/utils";

(async () => {
  const db = connectDb();

  const teams = await db("teams").select("*");

  await db.transaction(async (trx) => {
    await Promise.all(
      teams.map(async (team) => {
        if (team.inbox) return;

        return trx("teams")
          .update({ inbox: `${cuid()}@${environment.EMAIL_DOMAIN}` })
          .where({ id: team.id });
      })
    );
  });

  console.log("success");

  await db.destroy();
})();
