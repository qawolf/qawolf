import { encrypt } from "../../../server/models/encrypt";
import {
  teamResolver,
  updateTeamResolver,
} from "../../../server/resolvers/team";
import { prepareTestDb } from "../db";
import {
  buildIntegration,
  buildTeam,
  buildTeamUser,
  buildUser,
  testContext,
} from "../utils";

const db = prepareTestDb();
const context = { ...testContext, db };

describe("teamResolver", () => {
  beforeAll(async () => {
    await db("teams").insert(buildTeam({}));
    await db("teams").update({ api_key: encrypt("qawolf_api_key") });

    await db("users").insert(buildUser({}));

    return db("team_users").insert(buildTeamUser({}));
  });

  afterAll(async () => {
    await db("team_users").del();
    await db("users").del();

    return db("teams").del();
  });

  it("finds a team", async () => {
    const team = await teamResolver({}, { id: "teamId" }, context);
    expect(team).toMatchObject({ api_key: "qawolf_api_key", id: "teamId" });
  });
});

describe("updateTeamResolver", () => {
  beforeAll(async () => {
    await db("teams").insert(buildTeam({}));
    await db("teams").update({ api_key: encrypt("qawolf_api_key") });

    await db("users").insert(buildUser({}));
    await db("integrations").insert(buildIntegration({}));

    return db("team_users").insert(buildTeamUser({}));
  });

  afterAll(async () => {
    await db("integrations").del();
    await db("team_users").del();
    await db("users").del();

    return db("teams").del();
  });

  it("updates a team alert settings", async () => {
    const team = await updateTeamResolver(
      {},
      {
        alert_integration_id: "integrationId",
        id: "teamId",
        is_email_alert_enabled: false,
      },
      context
    );

    expect(team).toMatchObject({
      alert_integration_id: "integrationId",
      api_key: "qawolf_api_key",
      is_email_alert_enabled: false,
    });
  });

  it("updates a team helpers", async () => {
    const team = await updateTeamResolver(
      {},
      { helpers: "helpers", helpers_version: 1, id: "teamId" },
      context
    );

    expect(team).toMatchObject({
      api_key: "qawolf_api_key",
      helpers: "helpers",
      helpers_version: 1,
    });
  });

  it("updates a team name", async () => {
    const team = await updateTeamResolver(
      {},
      { id: "teamId", name: "another name" },
      context
    );

    expect(team).toMatchObject({
      api_key: "qawolf_api_key",
      name: "another name",
    });
  });
});
