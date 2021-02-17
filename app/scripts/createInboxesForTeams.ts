import { connectDb } from "../server/db";
import { cuid } from "../server/utils";

(async () => {
  const db = connectDb();

  const teams = await db("teams").select("*");

  await db.transaction(async (trx) => {
    await Promise.all(
      teams.map((team) => {
        return (async () => {
          if (team.inbox) return;

          return trx("teams").update({ inbox: cuid() }).where({ id: team.id });
        })();
      })
    );
  });

  console.log("success");

  await db.destroy();
})();
