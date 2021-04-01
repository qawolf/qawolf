import { minutesFromNow } from "../../shared/utils";
import { findTeamsSeenAfter } from "../models/team";
import { countTestsForTeam } from "../models/test";
import { flushSegment, trackSegmentGroup } from "../services/segment";
import { ModelOptions } from "../types";

export const updateSegmentTeams = async (
  options: ModelOptions
): Promise<void> => {
  const log = options.logger.prefix("updateSegmentTeams");
  const seenTeams = await findTeamsSeenAfter(minutesFromNow(-100), options);

  const promises = seenTeams.map(async ({ name, plan, team_id, user_id }) => {
    const counts = await countTestsForTeam(team_id, options);

    const traits = { name, plan, ...counts };
    log.debug("track segment group", team_id, traits);
    trackSegmentGroup(team_id, user_id, traits);
  });

  await Promise.all(promises);

  await flushSegment();
};
