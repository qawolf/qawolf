import { daysFromNow, minutesFromNow } from "../../shared/utils";
import { countRunsForTeam } from "../models/run";
import { findTeamsToSync, updateTeam } from "../models/team";
import { countTestsForTeam } from "../models/test";
import { findUsersForTeam } from "../models/user";
import { flushSegment, trackSegmentGroup } from "../services/segment";
import { ModelOptions, Team } from "../types";

export const renewTeam = async (
  team: Team,
  options: ModelOptions
): Promise<Team> => {
  const log = options.logger.prefix("updateTeamIfNeeded");

  if (team.plan !== "free") {
    log.debug("skip, plan", team.plan);
    return team;
  }

  if (team.renewed_at > daysFromNow(-30)) {
    log.debug("skip, renewed_at", team.renewed_at);
    return team;
  }

  return updateTeam(
    { id: team.id, limit_reached_at: null, renewed_at: minutesFromNow() },
    options
  );
};

export const updateSegmentTeam = async (
  originalTeam: Team,
  options: ModelOptions
): Promise<void> => {
  const log = options.logger.prefix("updateSegmentTeam");

  const team = await renewTeam(originalTeam, options);

  const runCount = await countRunsForTeam(team, options);
  const testCounts = await countTestsForTeam(team.id, options);

  const users = await findUsersForTeam(team.id, options);

  const traits = {
    name: team.name,
    plan: team.plan,
    monthly_run_count: runCount,
    ...testCounts,
  };
  log.debug("track segment group", team.id, traits);

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
