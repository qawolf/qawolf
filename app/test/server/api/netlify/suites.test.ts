/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest } from "next";

import {
  handleNetlifySuitesRequest,
  shouldCreateSuites,
} from "../../../../server/api/netlify/suites";
import { encrypt } from "../../../../server/models/encrypt";
import * as gitHubService from "../../../../server/services/gitHub/commitStatus";
import * as prService from "../../../../server/services/gitHub/pullRequest";
import { minutesFromNow } from "../../../../shared/utils";
import { prepareTestDb } from "../../db";
import {
  buildIntegration,
  buildPullRequestComment,
  buildSuite,
  buildTag,
  buildTagTrigger,
  buildTeam,
  buildTeamUser,
  buildTest,
  buildTrigger,
  buildUser,
  logger,
} from "../../utils";

const send = jest.fn();
const status = jest.fn().mockReturnValue({ send });
const res = { status };

const db = prepareTestDb();
const options = { db, logger };

describe("handleNetlifySuitesRequest", () => {
  beforeAll(async () => {
    await db("users").insert(buildUser({}));
    await db("teams").insert(buildTeam({ apiKey: "qawolf_api_key" }));
    await db("team_users").insert(buildTeamUser({}));

    await db("triggers").insert([
      buildTrigger({
        deployment_environment: null,
        deployment_provider: "netlify",
      }),
      buildTrigger({
        deployment_environment: "preview",
        deployment_provider: "netlify",
        i: 2,
      }),
    ]);
    await db("tests").insert(buildTest({}));

    await db("tags").insert(buildTag({}));
    await db("tag_triggers").insert(
      buildTagTrigger({ trigger_id: "trigger2Id" })
    );
  });

  afterEach(async () => {
    jest.clearAllMocks();

    await db("github_commit_statuses").del();
    await db("pull_request_comments").del();

    await db("runs").del();
    return db("suites").del();
  });

  afterAll(() => {
    jest.restoreAllMocks();

    return db.del();
  });

  it("returns 401 if api key not provided", async () => {
    await handleNetlifySuitesRequest(
      { body: {}, headers: {} } as NextApiRequest,
      res as any,
      { db, logger }
    );

    expect(status).toBeCalledWith(401);
    expect(send).toBeCalledWith("No API key provided");
  });

  it("returns 403 if invalid api key provided", async () => {
    await handleNetlifySuitesRequest(
      {
        body: {},
        headers: { authorization: "fake_api_key" },
      } as NextApiRequest,
      res as any,
      options
    );

    expect(status).toBeCalledWith(403);
    expect(send).toBeCalledWith("Invalid API Key");
  });

  it("returns 403 if team limit reached", async () => {
    await db("teams").update({ limit_reached_at: new Date().toISOString() });

    await handleNetlifySuitesRequest(
      {
        body: {},
        headers: { authorization: "qawolf_api_key" },
      } as NextApiRequest,
      res as any,
      options
    );

    expect(status).toBeCalledWith(403);
    expect(send).toBeCalledWith("Plan limit reached");

    await db("teams").update({ limit_reached_at: null });
  });

  it("does not create suites if unsupported deploy context", async () => {
    await handleNetlifySuitesRequest(
      {
        body: {
          deployment_environment: "branch-deploy",
          deployment_url: "url",
        },
        headers: { authorization: "qawolf_api_key" },
      } as NextApiRequest,
      res as any,
      options
    );

    expect(status).toBeCalledWith(200);
    expect(send).toBeCalledWith({ suite_ids: [] });

    const suites = await db("suites");
    expect(suites).toEqual([]);
  });

  it("creates suites and returns suite ids", async () => {
    await handleNetlifySuitesRequest(
      {
        body: {
          deployment_environment: "production",
          deployment_url: "url",
          message: "message",
          sha: "sha",
        },
        headers: { authorization: "qawolf_api_key" },
      } as NextApiRequest,
      res as any,
      options
    );

    expect(status).toBeCalledWith(200);

    const suites = await db("suites");

    expect(suites).toMatchObject([
      {
        branch: null,
        commit_message: "message",
        commit_url: null,
        environment_variables: encrypt(JSON.stringify({ URL: "url" })),
        trigger_id: "triggerId",
        pull_request_url: null,
      },
    ]);
    expect(send).toBeCalledWith({ suite_ids: [suites[0].id] });

    const commitStatuses = await db("github_commit_statuses");
    expect(commitStatuses).toEqual([]);
  });

  it("creates a GitHub commit status and comment if possible", async () => {
    jest.spyOn(gitHubService, "createCommitStatus").mockResolvedValue({
      context: "QA Wolf - trigger1",
    } as gitHubService.GitHubCommitStatus);
    jest.spyOn(prService, "createPullRequestComment").mockResolvedValue({
      id: 123,
    } as prService.GitHubPullRequestComment);

    const committed_at = "2021-04-01 12:28:54 -0600";

    await db("integrations").insert(
      buildIntegration({
        github_installation_id: 123,
        github_repo_id: 11,
        github_repo_name: "owner/repo",
        type: "github",
      })
    );
    await db("triggers")
      .where({ id: "triggerId" })
      .update({ deployment_integration_id: "integrationId" });

    await handleNetlifySuitesRequest(
      {
        body: {
          committed_at,
          deployment_environment: "deploy-preview",
          deployment_url: "url",
          git_branch: "feature",
          is_pull_request: "true",
          message: "message",
          pull_request_id: 11,
          sha: "sha",
        },
        headers: { authorization: "qawolf_api_key" },
      } as NextApiRequest,
      res as any,
      options
    );

    expect(status).toBeCalledWith(200);

    const suites = await db("suites");

    expect(suites).toMatchObject([
      {
        branch: "feature",
        commit_message: "message",
        commit_url: "https://github.com/owner/repo/pull/11/commits/sha",
        environment_variables: encrypt(JSON.stringify({ URL: "url" })),
        pull_request_url: "https://github.com/owner/repo/pull/11",
        trigger_id: "triggerId",
      },
    ]);
    expect(send).toBeCalledWith({ suite_ids: [suites[0].id] });

    expect(gitHubService.createCommitStatus).toBeCalledWith(
      {
        context: "QA Wolf - trigger1",
        installationId: 123,
        owner: "owner",
        repo: "repo",
        sha: "sha",
        suiteId: suites[0].id,
      },
      expect.anything()
    );

    const commitStatuses = await db("github_commit_statuses");

    expect(commitStatuses).toMatchObject([
      {
        context: "QA Wolf - trigger1",
        github_installation_id: 123,
        owner: "owner",
        repo: "repo",
        sha: "sha",
        suite_id: suites[0].id,
        trigger_id: "triggerId",
      },
    ]);

    expect(prService.createPullRequestComment).toBeCalled();

    const comments = await db("pull_request_comments");

    expect(comments).toMatchObject([
      {
        comment_id: 123,
        last_commit_at: new Date(committed_at),
        pull_request_id: 11,
        suite_id: suites[0].id,
        trigger_id: "triggerId",
        user_id: "userId",
      },
    ]);
    expect(comments[0].body).toMatch("## 🐺 QA Wolf - trigger1");

    await db("triggers")
      .where({ id: "triggerId" })
      .update({ deployment_integration_id: null });
    await db("integrations").del();
  });

  it("updates an existing GitHub comment if one exists", async () => {
    jest.spyOn(gitHubService, "createCommitStatus").mockResolvedValue({
      context: "QA Wolf - trigger1",
    } as gitHubService.GitHubCommitStatus);
    jest.spyOn(prService, "updatePullRequestComment").mockResolvedValue({
      id: 123,
    } as prService.GitHubPullRequestComment);

    const committed_at = minutesFromNow(10);

    await db("integrations").insert(
      buildIntegration({
        github_installation_id: 123,
        github_repo_id: 11,
        github_repo_name: "owner/repo",
        type: "github",
      })
    );
    await db("triggers")
      .where({ id: "triggerId" })
      .update({ deployment_integration_id: "integrationId" });

    await db("suites").insert(buildSuite({}));
    await db("pull_request_comments").insert(buildPullRequestComment({}));

    await handleNetlifySuitesRequest(
      {
        body: {
          committed_at,
          deployment_environment: "deploy-preview",
          deployment_url: "url",
          is_pull_request: "true",
          pull_request_id: 11,
          sha: "sha",
        },
        headers: { authorization: "qawolf_api_key" },
      } as NextApiRequest,
      res as any,
      options
    );

    expect(status).toBeCalledWith(200);

    const suites = await db("suites").orderBy("created_at", "desc");

    expect(prService.updatePullRequestComment).toBeCalled();

    const comments = await db("pull_request_comments");

    expect(comments).toMatchObject([
      {
        comment_id: 123,
        last_commit_at: new Date(committed_at),
        pull_request_id: 11,
        suite_id: suites[0].id,
        trigger_id: "triggerId",
        user_id: "userId",
      },
    ]);

    await db("triggers")
      .where({ id: "triggerId" })
      .update({ deployment_integration_id: null });
    await db("integrations").del();
  });

  it("does not update an existing GitHub comment if request is stale", async () => {
    jest.spyOn(gitHubService, "createCommitStatus").mockResolvedValue({
      context: "QA Wolf - trigger1",
    } as gitHubService.GitHubCommitStatus);
    jest.spyOn(prService, "updatePullRequestComment").mockResolvedValue({
      id: 123,
    } as prService.GitHubPullRequestComment);

    const committed_at = minutesFromNow(-10);

    await db("integrations").insert(
      buildIntegration({
        github_installation_id: 123,
        github_repo_id: 11,
        github_repo_name: "owner/repo",
        type: "github",
      })
    );
    await db("triggers")
      .where({ id: "triggerId" })
      .update({ deployment_integration_id: "integrationId" });

    await db("suites").insert(buildSuite({}));
    await db("pull_request_comments").insert(buildPullRequestComment({}));

    await handleNetlifySuitesRequest(
      {
        body: {
          committed_at,
          deployment_environment: "deploy-preview",
          deployment_url: "url",
          is_pull_request: "true",
          pull_request_id: 11,
          sha: "sha",
        },
        headers: { authorization: "qawolf_api_key" },
      } as NextApiRequest,
      res as any,
      options
    );

    expect(status).toBeCalledWith(200);

    expect(prService.updatePullRequestComment).not.toBeCalled();

    const comments = await db("pull_request_comments");

    expect(comments).toMatchObject([{ suite_id: "suiteId" }]);

    await db("triggers")
      .where({ id: "triggerId" })
      .update({ deployment_integration_id: null });
    await db("integrations").del();
  });
});

describe("shouldCreateSuites", () => {
  it("returns false if not production or deploy-preview", () => {
    expect(shouldCreateSuites("branch-deploy", options)).toBe(false);

    expect(shouldCreateSuites("staging", options)).toBe(false);
  });

  it("returns true otherwise", () => {
    expect(shouldCreateSuites("deploy-preview", options)).toBe(true);

    expect(shouldCreateSuites("production", options)).toBe(true);
  });
});
