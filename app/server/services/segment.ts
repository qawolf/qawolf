import Analytics from "analytics-node";

import environment from "../environment";
import { User } from "../types";

const analytics = environment.SEGMENT_WRITE_KEY
  ? new Analytics(environment.SEGMENT_WRITE_KEY)
  : null;

export const flushSegment = async (timeout = 100): Promise<void> => {
  if (!analytics) return;

  const flushPromise = await new Promise<void>((resolve) => {
    analytics.flush(() => resolve());
  });

  const timeoutPromise = await new Promise((resolve) =>
    setTimeout(resolve, timeout)
  );

  await Promise.race([flushPromise, timeoutPromise]);
};

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

export const trackSegmentGroup = (
  groupId: string,
  userId: string,
  traits: Record<string, unknown> = {}
): void => {
  if (!analytics) return;

  analytics.group({ groupId, traits, userId });
};
