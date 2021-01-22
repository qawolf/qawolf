import { db } from "../server/db";
import { cuid } from "../server/utils";

(async () => {
  const teams = await db("teams").select("*");

  return db.transaction(async (trx) => {
    await Promise.all(
      teams.map(async (team) => {
        // only create environments for groups that have environment variables
        const groups = await trx("groups")
          .select("groups.*" as "*")
          .where({ "groups.team_id": team.id })
          .innerJoin(
            "environment_variables",
            "environment_variables.group_id",
            "groups.id"
          )
          .groupBy("groups.id");

        const environmentVariables = await trx("environment_variables")
          .select("*")
          .whereIn(
            "group_id",
            groups.map((g) => g.id)
          );

        const environments = groups.map((group) => {
          return {
            id: cuid(),
            name: group.name,
            team_id: team.id,
          };
        });

        // create environments for each group
        await trx("environments").insert(environments);

        // update environment variables to point to environment
        await Promise.all(
          environmentVariables.map((variable) => {
            const group = groups.find((g) => g.id === variable.group_id);
            const environment = environments.find((e) => e.name === group.name);

            return trx("environment_variables")
              .where({ id: variable.id })
              .update({ environment_id: environment.id });
          })
        );

        // update group to point to environment
        await Promise.all(
          groups.map((group) => {
            const environment = environments.find((e) => e.name === group.name);

            return trx("groups")
              .where({ id: group.id })
              .update({ environment_id: environment.id });
          })
        );
      })
    );
  });

  console.log("done");
})();
