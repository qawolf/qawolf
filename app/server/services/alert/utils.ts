import last from "lodash/last";

import { Suite, Trigger, User } from "../../types";

type BuildSuiteName = {
  suite: Suite;
  trigger: Trigger | null;
};

type BuildWolfImage = {
  isPass: boolean;
  user: User;
};

export const buildGitDetail = (suite: Suite): string => {
  if (!suite.commit_url) return "";

  const sha = last(suite.commit_url.split("/")).slice(0, 7);
  const pullRequestId = suite.pull_request_url
    ? last(suite.pull_request_url.split("/"))
    : null;

  const branch = suite.branch ? `${suite.branch}, ` : "";
  const commit = `<a href="${suite.commit_url}">${sha}</a>`;
  const pullRequest = pullRequestId
    ? ` <a href="${suite.pull_request_url}">(#${pullRequestId})</a>`
    : "";

  return `<br /><p>${commit}: ${branch}${
    suite.commit_message || ""
  }${pullRequest}</p>`;
};

export const buildSuiteName = ({ suite, trigger }: BuildSuiteName): string => {
  if (trigger?.name) return trigger.name;
  if (suite.tag_names) return suite.tag_names;

  return suite.is_api ? "API triggered" : "manually triggered";
};

export const buildWolfImage = ({ isPass, user }: BuildWolfImage): string => {
  return `<img src="https://qawolf-public.s3.us-east-2.amazonaws.com/wolf-${
    user.wolf_variant
  }${isPass ? "-party" : ""}-slack.png" width="32" />`;
};
