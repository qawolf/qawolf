import { setFailed } from "@actions/core";
import { GitHub } from "@actions/github";
import { AggregatedResult } from "@jest/test-result";
import { CONFIG } from "@qawolf/config";
import { buildMarkdown } from "./buildMarkdown";

export const createCheckRun = async (): Promise<number | null> => {
  if (!CONFIG.gitHubToken || !CONFIG.gitHubRepo || !CONFIG.gitHubSha) {
    return null;
  }

  try {
    const [owner, repo] = CONFIG.gitHubRepo.split("/");
    const octokit = new GitHub(CONFIG.gitHubToken);

    const response = await octokit.checks.create({
      head_sha: CONFIG.gitHubSha,
      name: "QA Wolf",
      owner,
      repo,
      started_at: new Date().toISOString(),
      status: "in_progress"
    });

    return response.data.id;
  } catch (error) {
    setFailed(error.message);
    return null;
  }
};

export const updateCheckRun = async (
  checkRunId: number,
  results: AggregatedResult
): Promise<void> => {
  if (!CONFIG.gitHubRepo || !CONFIG.gitHubToken) {
    throw new Error("GitHub repo or token not specified");
  }

  try {
    const [owner, repo] = CONFIG.gitHubRepo.split("/");
    const octokit = new GitHub(CONFIG.gitHubToken);

    const conclusion = results.numFailedTestSuites ? "failure" : "success";
    const summary = buildMarkdown(results);

    await octokit.checks.update({
      check_run_id: checkRunId,
      completed_at: new Date().toISOString(),
      conclusion,
      output: { title: "QA Wolf", summary },
      owner,
      repo,
      status: "completed"
    });
  } catch (error) {
    setFailed(error.message);
  }
};
