import { daysFromNow, minutesFromNow } from "../../shared/utils";
import { logger } from "../../test/server/utils";
import { countRunsForTeam } from "../models/run";
import { findTeamsToSync, updateTeam } from "../models/team";
import { countTestsForTeam } from "../models/test";
import { findUsersForTeam } from "../models/user";
import { flushSegment, trackSegmentGroup } from "../services/segment";
import { updateStripeUsage } from "../services/stripe";
import { ModelOptions, Team } from "../types";

const freePlanLimit = 100;

export const shouldRenew = (
  team: Team,
  logger: ModelOptions["logger"]
): boolean => {
  const log = logger.prefix("shouldRenew");
  log.debug("team", team.id, "renewed at", team.renewed_at);

  const isExpired = new Date(team.renewed_at) < new Date(daysFromNow(-30));
  const renew = team.plan === "free" && isExpired;

  log.debug("should renew?", renew);

  return renew;
};

export const renewTeam = async (
  team: Team,
  options: ModelOptions
): Promise<Team> => {
  if (!shouldRenew(team, logger)) return team;

  return updateTeam(
    { id: team.id, limit_reached_at: null, renewed_at: minutesFromNow() },
    options
  );
};

export const syncTeam = async (
  originalTeam: Team,
  options: ModelOptions
): Promise<void> => {
  const log = options.logger.prefix("syncTeam");
  // renew team if needed before we count runs
  const team = await renewTeam(originalTeam, options);

  const runCount = await countRunsForTeam(team, options);
  const testCounts = await countTestsForTeam(team.id, options);

  if (team.plan === "business") {
    await updateStripeUsage({ logger: options.logger, runCount, team });
  }

  const free_limit_reached = team.plan === "free" && runCount >= freePlanLimit;

  const updates = {
    last_synced_at: minutesFromNow(),
    limit_reached_at: free_limit_reached ? minutesFromNow() : null,
  };
  await updateTeam({ id: team.id, ...updates }, options);

  const traits = {
    free_limit_reached,
    monthly_run_count: runCount,
    name: team.name,
    plan: team.plan,
    ...testCounts,
  };
  log.debug("track segment group", team.id, traits);

  const users = await findUsersForTeam(team.id, options);
  users.forEach((user) => trackSegmentGroup(team.id, user.id, traits));
};

export const syncTeams = async (options: ModelOptions): Promise<void> => {
  const log = options.logger.prefix("syncTeams");
  const teams = await findTeamsToSync(500, options);

  const promises = teams.map(async (team) => {
    return syncTeam(team, options);
  });

  await Promise.all(promises);
  log.debug("updated");

  await flushSegment();
  log.debug("flushed");
};
