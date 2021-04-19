/* eslint-disable jest/expect-expect */
import { updateTeam } from "../../../server/models/team";
import {
  createGitHubIntegrationsResolver,
  gitHubBranchesResolver,
} from "../../../server/resolvers/github";
import * as gitHubService from "../../../server/services/gitHub/app";
import * as branchService from "../../../server/services/gitHub/branch";
import { prepareTestDb } from "../db";
import { buildIntegration, buildTeam, buildUser, testContext } from "../utils";

const db = prepareTestDb();
const context = { ...testContext, db };

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
      context
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

describe("gitHubBranchesResolver", () => {
  beforeAll(() =>
    db("integrations").insert(buildIntegration({ type: "github_sync" }))
  );

  afterAll(() => db("integrations").del());

  it("returns null if team does not have GitHub sync integration", async () => {
    const branches = await gitHubBranchesResolver(
      {},
      { team_id: "teamId" },
      context
    );

    expect(branches).toBeNull();
  });

  it("returns list of GitHub branches otherwise", async () => {
    const updatedTeam = await updateTeam(
      { git_sync_integration_id: "integrationId", id: "teamId" },
      { db, logger: testContext.logger }
    );
    jest.spyOn(branchService, "findBranchesForIntegration").mockResolvedValue([
      { is_default: false, name: "feature" },
      { is_default: true, name: "main" },
    ]);

    const branches = await gitHubBranchesResolver(
      {},
      { team_id: "teamId" },
      { ...context, teams: [updatedTeam] }
    );

    expect(branches).toEqual([
      { is_default: false, name: "feature" },
      { is_default: true, name: "main" },
    ]);

    await updateTeam(
      { git_sync_integration_id: null, id: "teamId" },
      { db, logger: testContext.logger }
    );
  });
});
