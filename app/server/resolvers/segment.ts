import Analytics from "analytics-node";

import environment from "../environment";
import { User } from "../types";

const analytics = environment.SEGMENT_WRITE_KEY
  ? new Analytics(environment.SEGMENT_WRITE_KEY)
  : null;

export const trackSegmentEvent = (user: User, event: string): void => {
  if (!analytics) return;

  analytics.track({
    event,
    properties: { email: user.email },
    userId: user.id,
  });
};
