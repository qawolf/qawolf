/* eslint-disable jest/expect-expect */
import { createGitHubIntegrationsResolver } from "../../../server/resolvers/github";
import * as gitHubService from "../../../server/services/gitHub/app";
import { prepareTestDb } from "../db";
import { buildIntegration, buildTeam, buildUser, testContext } from "../utils";

const db = prepareTestDb();

beforeAll(async () => {
  await db("users").insert(buildUser({}));
  await db("teams").insert(buildTeam({}));
});

describe("createGitHubIntegrationsResolver", () => {
  const testResolver = async (is_sync: boolean): Promise<void> => {
    await db("integrations").insert(
      buildIntegration({ github_installation_id: 123 })
    );

    const findGitHubReposForInstallationSpy = jest
      .spyOn(gitHubService, "findGitHubReposForInstallation")
      .mockResolvedValue([
        { full_name: "qawolf/repo", id: 11 },
      ] as gitHubService.GitHubRepos);

    await createGitHubIntegrationsResolver(
      {},
      { installation_id: 123, is_sync, team_id: "teamId" },
      { ...testContext, db }
    );

    const integrations = await db("integrations").select("*");

    expect(integrations).toMatchObject([
      {
        github_installation_id: 123,
        github_repo_id: 11,
        github_repo_name: "qawolf/repo",
        type: is_sync ? "github_sync" : "github",
      },
    ]);

    expect(findGitHubReposForInstallationSpy.mock.calls[0][0]).toEqual({
      installationId: 123,
      isSync: is_sync,
    });
  };

  afterEach(() => {
    jest.restoreAllMocks();
    return db("integrations").del();
  });

  it("reconciles integrations based on installed repos for GitHub app", async () => {
    await testResolver(false);
  });

  it("handles GitHub sync app", async () => {
    await testResolver(true);
  });
});
