import { integrationsResolver } from "../../../server/resolvers/integration";
import { prepareTestDb } from "../db";
import {
  buildIntegration,
  buildTeam,
  buildTeamUser,
  buildUser,
  testContext,
} from "../utils";

const teams = [buildTeam({})];
const user = buildUser({});

const db = prepareTestDb();

beforeAll(async () => {
  await db("users").insert(user);
  await db("teams").insert(teams);
  await db("team_users").insert(buildTeamUser({}));

  await db("integrations").insert(buildIntegration({}));
});

describe("integrationsResolver", () => {
  it("returns integrations for a team", async () => {
    const integrations = await integrationsResolver(
      {},
      { team_id: "teamId" },
      { ...testContext, db }
    );

    expect(integrations).toMatchObject([{ id: "integrationId" }]);
  });
});
