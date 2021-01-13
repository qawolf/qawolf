import { db, dropTestDb, migrateDb } from "../../../server/db";
import { Logger } from "../../../server/Logger";
import { createGitHubIntegrationsResolver } from "../../../server/resolvers/github";
import * as gitHubService from "../../../server/services/gitHub/app";
import { buildIntegration, buildTeam, buildUser, testContext } from "../utils";

beforeAll(async () => {
  await migrateDb();

  await db("users").insert(buildUser({}));
  await db("teams").insert(buildTeam({}));
});

afterAll(() => dropTestDb());

describe("createGitHubIntegrationsResolver", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    return db("integrations").del();
  });

  it("reconciles integrations based on installed repos for GitHub app", async () => {
    await db("integrations").insert(
      buildIntegration({ github_installation_id: 123 })
    );

    jest
      .spyOn(gitHubService, "findGitHubReposForInstallation")
      .mockResolvedValue([
        { full_name: "qawolf/repo", id: 11 },
      ] as gitHubService.GitHubRepos);

    await createGitHubIntegrationsResolver(
      {},
      { installation_id: 123, team_id: "teamId" },
      testContext
    );

    const integrations = await db("integrations").select("*");

    expect(integrations).toMatchObject([
      {
        github_installation_id: 123,
        github_repo_id: 11,
        github_repo_name: "qawolf/repo",
      },
    ]);

    expect(gitHubService.findGitHubReposForInstallation).toBeCalledWith({
      installationId: 123,
      logger: expect.any(Logger),
    });
  });
});
