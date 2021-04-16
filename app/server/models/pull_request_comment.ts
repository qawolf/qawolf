import { ModelOptions, PullRequestComment } from "../types";
import { cuid } from "../utils";

type CreatePullRequestComment = {
  body: string;
  comment_id: number;
  deployment_integration_id: string;
  last_commit_at: string;
  pull_request_id: number;
  suite_id: string;
  trigger_id: string;
  user_id: string;
};

type FindPullRequestCommentForTrigger = {
  deployment_integration_id;
  pull_request_id: number;
  trigger_id: string;
};

type UpdatePullRequestComment = {
  body: string;
  id: string;
  last_commit_at?: string;
  suite_id?: string;
};

export const createPullRequestComment = async (
  fields: CreatePullRequestComment,
  { db, logger }: ModelOptions
): Promise<PullRequestComment> => {
  const log = logger.prefix("createPullRequestComment");
  log.debug("suite", fields.suite_id);

  const pullRequestComment = {
    ...fields,
    id: cuid(),
  };
  await db("pull_request_comments").insert(pullRequestComment);

  log.debug("created", pullRequestComment.id);

  return pullRequestComment;
};

export const findPullRequestCommentForSuite = async (
  suite_id: string,
  { db, logger }: ModelOptions
): Promise<PullRequestComment | null> => {
  const log = logger.prefix("findPullRequestCommentForSuite");
  log.debug("suite", suite_id);

  const pullRequestComment = await db("pull_request_comments")
    .select("*")
    .where({ suite_id })
    .first();

  log.debug(
    pullRequestComment ? `found ${pullRequestComment.id}` : "not found"
  );

  return pullRequestComment || null;
};

export const findPullRequestCommentForTrigger = async (
  {
    deployment_integration_id,
    pull_request_id,
    trigger_id,
  }: FindPullRequestCommentForTrigger,
  { db, logger }: ModelOptions
): Promise<PullRequestComment | null> => {
  const log = logger.prefix("findPullRequestCommentForTrigger");
  log.debug("trigger", trigger_id, "pull request", pull_request_id);

  const pullRequestComment = await db("pull_request_comments")
    .select("*")
    .where({ deployment_integration_id, pull_request_id, trigger_id })
    .first();

  log.debug(
    pullRequestComment ? `found ${pullRequestComment.id}` : "not found"
  );

  return pullRequestComment || null;
};

export const updatePullRequestComment = async (
  { id, ...fields }: UpdatePullRequestComment,
  { db, logger }: ModelOptions
): Promise<PullRequestComment> => {
  const log = logger.prefix("updatePullRequestComment");
  log.debug(id);

  const pullRequestComment = await db("pull_request_comments")
    .select("*")
    .where({ id })
    .first();

  if (!pullRequestComment) {
    log.error("not found", id);
    throw new Error(`pull request comment not found ${id}`);
  }

  const updates: Partial<PullRequestComment> = {
    ...fields,
    updated_at: new Date().toISOString(),
  };
  await db("pull_request_comments").where({ id }).update(updates);

  log.debug("updated", updates);

  return { ...pullRequestComment, ...updates };
};
