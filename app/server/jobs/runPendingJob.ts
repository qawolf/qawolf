import { minutesFromNow } from "../../shared/utils";
import { claimPendingJob, countPendingJobs, updateJob } from "../models/job";
import { sendAlert } from "../services/alert/send";
import { updateCommitStatus } from "../services/gitHub/app";
import { updateCommentForSuite } from "../services/gitHub/pullRequest";
import { ModelOptions } from "../types";

export const runPendingJob = async (options: ModelOptions): Promise<number> => {
  const log = options.logger.prefix("runPendingJob");

  const job = await claimPendingJob(options);
  if (!job) {
    log.debug("no job to run");
    return 0;
  }

  if (job.name === "alert") {
    await sendAlert(job.suite_id, options);
  } else if (job.name === "github_commit_status") {
    await updateCommitStatus(job.suite_id, options);
  } else if (job.name === "pull_request_comment") {
    await updateCommentForSuite(job.suite_id, options);
  } else {
    const message = `unsupported job ${job.name}`;
    log.alert(message);
    throw new Error(message);
  }

  await updateJob({ completed_at: minutesFromNow(), id: job.id }, options);
  const pendingJobCount = await countPendingJobs(options);

  log.debug("success");

  return pendingJobCount;
};
