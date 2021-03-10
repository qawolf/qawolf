import Analytics from "analytics-node";

import environment from "../environment";

const analytics = environment.SEGMENT_WRITE_KEY
  ? new Analytics(environment.SEGMENT_WRITE_KEY)
  : null;

export const trackSegmentEvent = (
  userId: string,
  event: string,
  properties?: Record<string, unknown>
): void => {
  if (!analytics) return;

  analytics.track({
    event,
    properties,
    userId,
  });
};
