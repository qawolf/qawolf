import {
  buildDeploymentUrlForTeam,
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

describe("buildDeploymentUrlForTeam", () => {
  beforeAll(() => db("teams").insert(buildTeam({})));

  afterAll(() => db("teams").del());

  it("returns deployment url if there are multiple branches", async () => {
    const url = await buildDeploymentUrlForTeam(
      {
        branches: ["hello", "world"],
        deploymentUrl: "deploymenturl",
        team_id: "teamId",
      },
      { db, logger }
    );

    expect(url).toBe("deploymenturl");
  });

  it("returns deployment url if no vercel team on team", async () => {
    const url = await buildDeploymentUrlForTeam(
      {
        branches: ["hello"],
        deploymentUrl: "deploymenturl",
        team_id: "teamId",
      },
      { db, logger }
    );

    expect(url).toBe("deploymenturl");
  });

  it("builds url based on branch name otherwise", async () => {
    await db("teams").update({ vercel_team: "team" });

    // check the same project name and team
    const url = await buildDeploymentUrlForTeam(
      {
        branches: ["hello"],
        deploymentUrl: "https://team-slug-team.vercel.app",
        team_id: "teamId",
      },
      { db, logger }
    );
    expect(url).toBe("https://team-git-hello-team.vercel.app");

    // check a different project name and team
    const url2 = await buildDeploymentUrlForTeam(
      {
        branches: ["hello-world"],
        deploymentUrl: "https://project-name-slug-team.vercel.app",
        team_id: "teamId",
      },
      { db, logger }
    );
    expect(url2).toBe("https://project-name-git-hello-world-team.vercel.app");

    // check it works with a longer team name
    await db("teams").update({ vercel_team: "team-qawolf-spirit" });

    const url3 = await buildDeploymentUrlForTeam(
      {
        branches: ["hello-world"],
        deploymentUrl: "https://project-slug-team-qawolf-spirit.vercel.app",
        team_id: "teamId",
      },
      { db, logger }
    );
    expect(url3).toBe(
      "https://project-git-hello-world-team-qawolf-spirit.vercel.app"
    );
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
      .spyOn(gitHubService, "findBranchesForCommit")
      .mockResolvedValue(["feature"]);

    const createCommitStatusSpy = jest
      .spyOn(gitHubService, "createCommitStatus")
      .mockResolvedValue({
        context: "context",
      } as gitHubService.GitHubCommitStatus);

    await createSuitesForDeployment(
      {
        deploymentUrl: "url",
        installationId: 123,
        repoId: 1,
        repoFullName: "qawolf/repo",
        sha: "sha",
      },
      { db, logger }
    );

    const suites = await db("suites").select("*");
    expect(suites).toMatchObject([
      { team_id: "teamId", trigger_id: "triggerId" },
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
  it("returns true if specified branches match trigger", () => {
    expect(
      shouldRunTriggerOnDeployment({
        branches: ["main", "develop"],
        trigger: buildTrigger({ deployment_branches: "main,production" }),
      })
    ).toBe(true);

    expect(
      shouldRunTriggerOnDeployment({
        branches: ["main"],
        trigger: buildTrigger({}),
      })
    ).toBe(true);

    expect(
      shouldRunTriggerOnDeployment({
        branches: ["main", "develop"],
        environment: "preview",
        trigger: buildTrigger({ deployment_branches: "main,production" }),
      })
    ).toBe(true);
  });

  it("returns false if specified branches do not match trigger", () => {
    expect(
      shouldRunTriggerOnDeployment({
        branches: ["main", "develop"],
        trigger: buildTrigger({ deployment_branches: "feature" }),
      })
    ).toBe(false);

    expect(
      shouldRunTriggerOnDeployment({
        branches: ["main", "develop"],
        environment: "preview",
        trigger: buildTrigger({
          deployment_branches: "feature",
          deployment_environment: "preview",
        }),
      })
    ).toBe(false);
  });

  it("returns false if environment does not match", () => {
    expect(
      shouldRunTriggerOnDeployment({
        branches: ["develop"],
        environment: "production",
        trigger: buildTrigger({ deployment_environment: "preview" }),
      })
    ).toBe(false);

    expect(
      shouldRunTriggerOnDeployment({
        branches: ["main"],
        environment: "production",
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
        branches: ["develop"],
        environment: "preview",
        trigger: buildTrigger({ deployment_environment: "preview" }),
      })
    ).toBe(true);

    expect(
      shouldRunTriggerOnDeployment({
        branches: ["main"],
        environment: "preview",
        trigger: buildTrigger({
          deployment_branches: "main",
          deployment_environment: "preview",
        }),
      })
    ).toBe(true);
  });
});
