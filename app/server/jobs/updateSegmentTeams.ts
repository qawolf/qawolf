import { daysFromNow, minutesFromNow } from "../../shared/utils";
import { countRunsForTeam } from "../models/run";
import { findTeamsToSync, updateTeam } from "../models/team";
import { countTestsForTeam } from "../models/test";
import { findUsersForTeam } from "../models/user";
import { flushSegment, trackSegmentGroup } from "../services/segment";
import { ModelOptions, Team } from "../types";

const freePlanLimit = 100;

export const syncTeam = async (
  team: Team,
  options: ModelOptions
): Promise<Team> => {
  const log = options.logger.prefix("syncTeam");
  const timestamp = minutesFromNow();

  const shouldRenew =
    team.plan === "free" && team.renewed_at < daysFromNow(-30);
  log.debug("should renew?", shouldRenew);

  const renewFields = shouldRenew
    ? { limit_reached_at: null, renewed_at: timestamp }
    : {};

  return updateTeam(
    { id: team.id, ...renewFields, last_synced_at: timestamp },
    options
  );
};

export const updateSegmentTeam = async (
  originalTeam: Team,
  options: ModelOptions
): Promise<void> => {
  const log = options.logger.prefix("updateSegmentTeam");

  const team = await syncTeam(originalTeam, options);

  const runCount = await countRunsForTeam(team, options);
  const testCounts = await countTestsForTeam(team.id, options);

  const free_limit_reached = team.plan === "free" && runCount >= freePlanLimit;

  if (free_limit_reached) {
    await updateTeam(
      { id: team.id, limit_reached_at: minutesFromNow() },
      options
    );
  }

  const traits = {
    free_limit_reached,
    name: team.name,
    plan: team.plan,
    monthly_run_count: runCount,
    ...testCounts,
  };
  log.debug("track segment group", team.id, traits);

  const users = await findUsersForTeam(team.id, options);
  users.forEach((user) => trackSegmentGroup(team.id, user.id, traits));
};

export const updateSegmentTeams = async (
  options: ModelOptions
): Promise<void> => {
  const log = options.logger.prefix("updateSegmentTeams");
  const teams = await findTeamsToSync(500, options);

  const promises = teams.map(async (team) => {
    return updateSegmentTeam(team, options);
  });

  await Promise.all(promises);
  log.debug("updated");

  await flushSegment();
  log.debug("flushed");
};
