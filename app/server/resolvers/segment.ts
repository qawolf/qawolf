import Analytics from "analytics-node";

import environment from "../environment";
import { User } from "../types";

const analytics = environment.SEGMENT_WRITE_KEY
  ? new Analytics(environment.SEGMENT_WRITE_KEY)
  : null;

export const trackSegmentEvent = (
  user: User,
  event: string,
  properties: Record<string, unknown> = {}
): void => {
  if (!analytics) return;

  analytics.track({
    event,
    properties: { ...properties, email: user.email },
    userId: user.id,
  });
};
