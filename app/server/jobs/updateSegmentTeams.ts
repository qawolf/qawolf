import { minutesFromNow } from "../../shared/utils";
import { findTeamsSeenAfter } from "../models/team";
import { countTestsForTeam } from "../models/test";
import { flushSegment, trackSegmentGroup } from "../services/segment";
import { ModelOptions } from "../types";

export const updateSegmentTeams = async (
  options: ModelOptions
): Promise<void> => {
  const seenTeams = await findTeamsSeenAfter(minutesFromNow(-30), options);

  const promises = seenTeams.map(async ({ name, plan, team_id, user_id }) => {
    const counts = await countTestsForTeam(team_id, options);

    trackSegmentGroup(team_id, user_id, { name, plan, ...counts });
  });

  await Promise.all(promises);

  await flushSegment();
};
