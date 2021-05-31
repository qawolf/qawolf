import {
  buildUrl,
  createSuitesForDeployment,
  shouldRunTriggerOnDeployment,
} from "../../../../server/api/github/deployment";
import * as gitHubService from "../../../../server/services/gitHub/commitStatus";
import { prepareTestDb } from "../../db";
import {
  buildIntegration,
  buildTag,
  buildTagTrigger,
  buildTeam,
  buildTest,
  buildTrigger,
  buildUser,
  logger,
} from "../../utils";

const db = prepareTestDb();

describe("buildUrl", () => {
  it("returns deployment url if trigger does not have example url", () => {
    expect(
      buildUrl({
        deploymentUrl: "deploymentUrl",
        pullRequestId: 123,
        trigger: buildTrigger({}),
      })
    ).toBe("deploymentUrl");
  });

  it("returns deployment url if no have pull request", () => {
    expect(
      buildUrl({
        deploymentUrl: "deploymentUrl",
        pullRequestId: null,
        trigger: buildTrigger({ deployment_preview_url: "previewUrl" }),
      })
    ).toBe("deploymentUrl");
  });

  it("replaces pull request number otherwise", () => {
    expect(
      buildUrl({
        deploymentUrl: "deploymentUrl",
        pullRequestId: 123,
        trigger: buildTrigger({
          deployment_preview_url: "https://next-js-example-pr-4.onrender.com",
        }),
      })
    ).toBe("https://next-js-example-pr-123.onrender.com");

    expect(
      buildUrl({
        deploymentUrl: "deploymentUrl",
        pullRequestId: 11,
        trigger: buildTrigger({
          deployment_preview_url: "https://render2-pr-1633.onrender.com/",
        }),
      })
    ).toBe("https://render2-pr-11.onrender.com");
  });
});

describe("createSuitesForDeployment", () => {
  beforeAll(async () => {
    await db("users").insert(buildUser({}));
    await db("teams").insert(buildTeam({}));

    await db("integrations").insert(
      buildIntegration({ github_installation_id: 123, github_repo_id: 1 })
    );
    await db("triggers").insert([
      buildTrigger({ deployment_integration_id: "integrationId" }),
      buildTrigger({ deployment_integration_id: "integrationId", i: 2 }),
    ]);

    await db("tests").insert(buildTest({}));

    await db("tags").insert(buildTag({}));
    await db("tag_triggers").insert(
      buildTagTrigger({ trigger_id: "trigger2Id" })
    );
  });

  afterAll(async () => {
    await db("test_triggers").del();
    await db("tests").del();

    await db("triggers").del();
    await db("integrations").del();

    await db("teams").del();
    await db("users").del();
  });

  it("creates suites for a deployment", async () => {
    const findBranchesForCommitSpy = jest
      .spyOn(gitHubService, "findBranchForCommit")
      .mockResolvedValue({
        branch: "feature",
        message: "initial commit",
        pullRequestId: 123,
      });

    const createCommitStatusSpy = jest
      .spyOn(gitHubService, "createCommitStatus")
      .mockResolvedValue({
        context: "context",
      } as gitHubService.GitHubCommitStatus);

    await createSuitesForDeployment(
      {
        committedAt: new Date().toISOString(),
        deploymentUrl: "url",
        installationId: 123,
        ref: "feature",
        repoId: 1,
        repoFullName: "qawolf/repo",
        sha: "sha",
      },
      { db, logger }
    );

    const suites = await db("suites").select("*");
    expect(suites).toMatchObject([
      {
        commit_message: "initial commit",
        commit_url: "https://github.com/qawolf/repo/pull/123/commits/sha",
        pull_request_url: "https://github.com/qawolf/repo/pull/123",
        team_id: "teamId",
        trigger_id: "triggerId",
      },
    ]);

    const commitStatuses = await db("github_commit_statuses").select("*");
    expect(commitStatuses).toMatchObject([
      {
        context: "context",
        sha: "sha",
        suite_id: suites[0].id,
        trigger_id: "triggerId",
      },
    ]);

    expect(findBranchesForCommitSpy.mock.calls[0][0]).toEqual({
      installationId: 123,
      owner: "qawolf",
      ref: "feature",
      repo: "repo",
      sha: "sha",
    });

    expect(createCommitStatusSpy.mock.calls[0][0]).toEqual({
      context: "QA Wolf - trigger1",
      installationId: 123,
      owner: "qawolf",
      repo: "repo",
      sha: "sha",
      suiteId: suites[0].id,
    });
  });
});

describe("shouldRunTriggerOnDeployment", () => {
  it("returns true if specified branch matches trigger", () => {
    expect(
      shouldRunTriggerOnDeployment({
        branch: "main",
        pullRequestId: 123,
        trigger: buildTrigger({ deployment_branches: "main,production" }),
      })
    ).toBe(true);

    expect(
      shouldRunTriggerOnDeployment({
        branch: "main",
        pullRequestId: 123,
        trigger: buildTrigger({}),
      })
    ).toBe(true);
  });

  it("returns false if specified branch does not match trigger", () => {
    expect(
      shouldRunTriggerOnDeployment({
        branch: "main",
        pullRequestId: 123,
        trigger: buildTrigger({ deployment_branches: "feature" }),
      })
    ).toBe(false);
  });

  it("returns false if environment does not match", () => {
    expect(
      shouldRunTriggerOnDeployment({
        branch: "develop",
        environment: "production",
        pullRequestId: 123,
        trigger: buildTrigger({ deployment_environment: "preview" }),
      })
    ).toBe(false);

    expect(
      shouldRunTriggerOnDeployment({
        branch: "main",
        environment: "production",
        pullRequestId: 123,
        trigger: buildTrigger({
          deployment_branches: "main",
          deployment_environment: "preview",
        }),
      })
    ).toBe(false);
  });

  it("returns true if environment matches trigger", () => {
    expect(
      shouldRunTriggerOnDeployment({
        branch: "develop",
        environment: "preview",
        pullRequestId: 123,
        trigger: buildTrigger({ deployment_environment: "preview" }),
      })
    ).toBe(true);

    expect(
      shouldRunTriggerOnDeployment({
        branch: "main",
        environment: "preview",
        pullRequestId: 123,
        trigger: buildTrigger({
          deployment_branches: "main",
          deployment_environment: "preview",
        }),
      })
    ).toBe(true);
  });

  it("returns false if render and no pull request", () => {
    expect(
      shouldRunTriggerOnDeployment({
        branch: "develop",
        environment: "preview",
        pullRequestId: null,
        trigger: buildTrigger({ deployment_provider: "render" }),
      })
    ).toBe(false);
  });

  it("returns false if render and no environment match", () => {
    expect(
      shouldRunTriggerOnDeployment({
        branch: "develop",
        environment: "RENDER_ID - example PR #",
        pullRequestId: 123,
        trigger: {
          ...buildTrigger({ deployment_provider: "render" }),
          render_environment: "RENDER_ID - example-mongodb PR #123",
        },
      })
    ).toBe(false);
  });

  it("returs true if render and environment match", () => {
    expect(
      shouldRunTriggerOnDeployment({
        branch: "develop",
        environment: "RENDER_ID - example PR #123",
        pullRequestId: 123,
        trigger: {
          ...buildTrigger({ deployment_provider: "render" }),
          render_environment: "RENDER_ID - example PR #",
        },
      })
    ).toBe(true);
  });
});
