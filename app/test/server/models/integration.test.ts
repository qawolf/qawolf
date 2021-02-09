import { db, dropTestDb, migrateDb } from "../../../server/db";
import {
  createIntegration,
  createIntegrations,
  deleteIntegrations,
  findIntegration,
  findIntegrationsForTeam,
} from "../../../server/models/integration";
import { Integration } from "../../../server/types";
import {
  buildIntegration,
  buildTeam,
  buildTrigger,
  buildUser,
  logger,
} from "../utils";

const team = buildTeam({});

beforeAll(async () => {
  await migrateDb();

  await db("teams").insert(team);
});

afterAll(() => dropTestDb());

const gitHubIntegrationOptions = {
  github_installation_id: 123,
  github_repo_id: 456,
  github_repo_name: "qawolf/repo",
  settings_url: "settingsUrl",
  team_id: team.id,
  team_name: "QA Wolf",
  type: "github" as const,
};

const slackIntegrationOptions = {
  settings_url: "settingsUrl",
  slack_channel: "#channel",
  team_id: team.id,
  team_name: "QA Wolf",
  type: "slack" as const,
  webhook_url: "webhookUrl",
};

describe("createIntegration", () => {
  afterEach(() => db("integrations").del());

  it("creates a GitHub integration", async () => {
    await createIntegration(gitHubIntegrationOptions, { logger });

    const integrations = await db.select("*").from("integrations");

    expect(integrations).toEqual([
      {
        ...gitHubIntegrationOptions,
        created_at: expect.any(Date),
        id: expect.any(String),
        slack_channel: null,
        updated_at: expect.any(Date),
        webhook_url: null,
      },
    ]);
  });

  it("creates a Slack integration", async () => {
    await createIntegration(slackIntegrationOptions, { logger });

    const integrations = await db.select("*").from("integrations");

    expect(integrations).toEqual([
      {
        ...slackIntegrationOptions,
        created_at: expect.any(Date),
        github_installation_id: null,
        github_repo_id: null,
        github_repo_name: null,
        id: expect.any(String),
        updated_at: expect.any(Date),
      },
    ]);
  });
});

describe("createIntegrations", () => {
  afterEach(() => db("integrations").del());

  it("creates multiple integrations", async () => {
    const integrations = await createIntegrations(
      [gitHubIntegrationOptions, slackIntegrationOptions],
      { logger }
    );

    expect(integrations).toMatchObject([{ type: "github" }, { type: "slack" }]);

    const dbIntegrations = await db("integrations")
      .select("*")
      .orderBy("type", "asc");

    expect(dbIntegrations).toEqual([
      {
        ...gitHubIntegrationOptions,
        created_at: expect.any(Date),
        id: expect.any(String),
        slack_channel: null,
        updated_at: expect.any(Date),
        webhook_url: null,
      },
      {
        ...slackIntegrationOptions,
        created_at: expect.any(Date),
        github_installation_id: null,
        github_repo_id: null,
        github_repo_name: null,
        id: expect.any(String),
        updated_at: expect.any(Date),
      },
    ]);
  });
});

describe("deleteIntegrations", () => {
  beforeAll(async () => {
    await db("integrations").insert([
      buildIntegration({}),
      buildIntegration({ i: 2 }),
      buildIntegration({ i: 3 }),
    ]);

    await db("users").insert(buildUser({}));

    await db("triggers").insert(
      buildTrigger({
        deployment_branches: "main",
        deployment_integration_id: "integrationId",
        repeat_minutes: null,
      })
    );
  });

  afterAll(async () => {
    await db("triggers").del();
    await db("users").del();
    return db("integrations").del();
  });

  it("deletes integrations and removes them from associated triggers", async () => {
    const deletedIntegrations = await deleteIntegrations(
      ["integrationId", "integration3Id"],
      { logger }
    );

    expect(deletedIntegrations).toMatchObject([
      { id: "integrationId" },
      { id: "integration3Id" },
    ]);

    const integrations = await db("integrations").select("*");

    expect(integrations).toMatchObject([{ id: "integration2Id" }]);

    const triggers = await db("triggers").select("*");

    expect(triggers).toMatchObject([
      {
        deployment_branches: null,
        deployment_environment: null,
        deployment_integration_id: null,
      },
    ]);
  });
});

describe("findIntegration", () => {
  beforeAll(async () => {
    await db("integrations").insert(buildIntegration({}));
  });

  afterAll(() => db("integrations").del());

  it("finds an integration", async () => {
    const integration = await findIntegration("integrationId", { logger });

    expect(integration).toMatchObject({
      id: "integrationId",
      type: "slack",
    });
  });

  it("throws an error if integration does not exist", async () => {
    const testFn = async (): Promise<Integration> => {
      return findIntegration("fakeId", { logger });
    };

    await expect(testFn()).rejects.toThrowError("not found");
  });
});

describe("findIntegrationsForTeam", () => {
  beforeAll(async () => {
    await db("teams").insert(buildTeam({ i: 2 }));
    await db("integrations").insert([
      buildIntegration({}),
      buildIntegration({ i: 2, team_id: "team2Id" }),
      buildIntegration({
        i: 3,
        slack_channel: "@spirit",
      }),
      buildIntegration({
        i: 4,
        slack_channel: "@melon",
      }),
      buildIntegration({
        github_installation_id: 123,
        github_repo_name: "qawolf/repo",
        i: 5,
      }),
      buildIntegration({
        github_installation_id: 456,
        github_repo_name: "someone_else/repo",
        i: 6,
      }),
    ]);
  });

  afterAll(() => db("integrations").del());

  it("finds integrations for a team", async () => {
    const integrations = await findIntegrationsForTeam(
      { team_id: "teamId" },
      { logger }
    );

    expect(integrations).toMatchObject([
      { github_repo_name: "qawolf/repo", id: "integration5Id" },
      { github_repo_name: "someone_else/repo", id: "integration6Id" },
      { id: "integrationId", slack_channel: "#channel" },
      { id: "integration4Id", slack_channel: "@melon" },
      { id: "integration3Id", slack_channel: "@spirit" },
    ]);
  });

  it("filters by github installation id if specified", async () => {
    const integrations = await findIntegrationsForTeam(
      { github_installation_id: 123, team_id: "teamId" },
      { logger }
    );

    expect(integrations).toMatchObject([
      { github_repo_name: "qawolf/repo", id: "integration5Id" },
    ]);
  });
});
