import Analytics from "analytics-node";

import environment from "../environment";

const analytics = environment.SEGMENT_WRITE_KEY
  ? new Analytics(environment.SEGMENT_WRITE_KEY)
  : null;

type Identify = {
  id: string;
  email?: string;
};

export const flushSegment = async (timeout = 1000): Promise<void> => {
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
  identify: Identify,
  event: string,
  properties: Record<string, unknown> = {}
): void => {
  if (!analytics) return;

  analytics.track({
    event,
    properties: identify.email
      ? { ...properties, email: identify.email }
      : properties,
    userId: identify.id,
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
