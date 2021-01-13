import {
  createSuitesForDeployment,
  shouldRunGroupOnDeployment,
} from "../../../../server/api/github/deployment";
import { db, dropTestDb, migrateDb } from "../../../../server/db";
import * as gitHubService from "../../../../server/services/gitHub/app";
import {
  buildGroup,
  buildGroupTest,
  buildIntegration,
  buildTeam,
  buildTest,
  buildUser,
  logger,
} from "../../utils";

beforeAll(() => migrateDb());

afterAll(() => dropTestDb());

describe("createSuitesForDeployment", () => {
  beforeAll(async () => {
    await db("users").insert(buildUser({}));
    await db("teams").insert(buildTeam({}));

    await db("integrations").insert(
      buildIntegration({ github_installation_id: 123, github_repo_id: 1 })
    );
    await db("groups").insert([
      buildGroup({ deployment_integration_id: "integrationId" }),
      buildGroup({ deployment_integration_id: "integrationId", i: 2 }),
    ]);

    await db("tests").insert(buildTest({}));
    await db("group_tests").insert(buildGroupTest());
  });

  afterAll(async () => {
    await db("group_tests").del();
    await db("tests").del();

    await db("groups").del();
    await db("integrations").del();

    await db("teams").del();
    await db("users").del();
  });

  it("creates suites for a deployment", async () => {
    jest
      .spyOn(gitHubService, "findBranchesForCommit")
      .mockResolvedValue(["feature"]);
    jest.spyOn(gitHubService, "createCommitStatus").mockResolvedValue({
      context: "context",
    } as gitHubService.GitHubCommitStatus);

    await createSuitesForDeployment({
      deploymentUrl: "url",
      installationId: 123,
      logger,
      repoId: 1,
      repoFullName: "qawolf/repo",
      sha: "sha",
    });

    const suites = await db("suites").select("*");
    expect(suites).toMatchObject([{ group_id: "groupId", team_id: "teamId" }]);

    const commitStatuses = await db("github_commit_statuses").select("*");
    expect(commitStatuses).toMatchObject([
      {
        context: "context",
        group_id: "groupId",
        sha: "sha",
        suite_id: suites[0].id,
      },
    ]);

    expect(gitHubService.findBranchesForCommit).toBeCalledWith({
      installationId: 123,
      owner: "qawolf",
      repo: "repo",
      sha: "sha",
    });

    expect(gitHubService.createCommitStatus).toBeCalledWith({
      context: "QA Wolf - group1",
      installationId: 123,
      owner: "qawolf",
      repo: "repo",
      sha: "sha",
      suiteId: suites[0].id,
    });
  });
});

describe("shouldRunGroupOnDeployment", () => {
  it("returns true if specified branches match group", () => {
    expect(
      shouldRunGroupOnDeployment({
        branches: ["main", "develop"],
        group: buildGroup({ deployment_branches: "main,production" }),
      })
    ).toBe(true);

    expect(
      shouldRunGroupOnDeployment({
        branches: ["main"],
        group: buildGroup({}),
      })
    ).toBe(true);

    expect(
      shouldRunGroupOnDeployment({
        branches: ["main", "develop"],
        environment: "preview",
        group: buildGroup({ deployment_branches: "main,production" }),
      })
    ).toBe(true);
  });

  it("returns false if specified branches do not match group", () => {
    expect(
      shouldRunGroupOnDeployment({
        branches: ["main", "develop"],
        group: buildGroup({ deployment_branches: "feature" }),
      })
    ).toBe(false);

    expect(
      shouldRunGroupOnDeployment({
        branches: ["main", "develop"],
        environment: "preview",
        group: buildGroup({
          deployment_branches: "feature",
          deployment_environment: "preview",
        }),
      })
    ).toBe(false);
  });

  it("returns false if environment does not match", () => {
    expect(
      shouldRunGroupOnDeployment({
        branches: ["develop"],
        environment: "production",
        group: buildGroup({ deployment_environment: "preview" }),
      })
    ).toBe(false);

    expect(
      shouldRunGroupOnDeployment({
        branches: ["main"],
        environment: "production",
        group: buildGroup({
          deployment_branches: "main",
          deployment_environment: "preview",
        }),
      })
    ).toBe(false);
  });

  it("returns true if environment matches group", () => {
    expect(
      shouldRunGroupOnDeployment({
        branches: ["develop"],
        environment: "preview",
        group: buildGroup({ deployment_environment: "preview" }),
      })
    ).toBe(true);

    expect(
      shouldRunGroupOnDeployment({
        branches: ["main"],
        environment: "preview",
        group: buildGroup({
          deployment_branches: "main",
          deployment_environment: "preview",
        }),
      })
    ).toBe(true);
  });
});
