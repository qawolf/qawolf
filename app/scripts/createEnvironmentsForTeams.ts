import { db } from "../server/db";
import { cuid } from "../server/utils";

(async () => {
  const teams = await db("teams").select("*");

  await db.transaction(async (trx) => {
    await Promise.all(
      teams.map(async (team) => {
        console.log(`updating team ${team.id}`);

        // only create environments for triggers that have environment variables
        const triggers = await trx("triggers")
          .select("triggers.*" as "*")
          .where({ "triggers.deleted_at": null, "triggers.team_id": team.id })
          .innerJoin(
            "environment_variables",
            "environment_variables.trigger_id",
            "triggers.id"
          )
          .groupBy("triggers.id");

        const environmentVariables = await trx("environment_variables")
          .select("*")
          .whereIn(
            "trigger_id",
            triggers.map((t) => t.id)
          );

        const environments = triggers.map((trigger) => {
          return {
            id: cuid(),
            name: trigger.name,
            team_id: team.id,
          };
        });

        // create environments for each trigger
        await trx("environments").insert(environments);

        // update environment variables to point to environment
        await Promise.all(
          environmentVariables.map((variable) => {
            const trigger = triggers.find((t) => t.id === variable.trigger_id);
            const environment = environments.find(
              (e) => e.name === trigger.name
            );

            return trx("environment_variables")
              .where({ id: variable.id })
              .update({ environment_id: environment.id });
          })
        );

        // update trigger to point to environment
        await Promise.all(
          triggers.map((trigger) => {
            const environment = environments.find(
              (e) => e.name === trigger.name
            );

            return trx("triggers")
              .where({ id: trigger.id })
              .update({ environment_id: environment.id });
          })
        );

        console.log(`updated team ${team.id}`);
      })
    );
  });

  console.log("success");
})();
