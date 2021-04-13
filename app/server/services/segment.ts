import Analytics from "analytics-node";

import environment from "../environment";

type User = {
  email?: string;
  id: string;
};

type TrackSegmentEvent = {
  active?: boolean;
  event: string;
  properties?: Record<string, unknown>;
  user: User;
};

type TrackSegmentGroup = {
  active?: boolean;
  groupId: string;
  traits?: Record<string, unknown>;
  user: User;
};

const analytics = environment.SEGMENT_WRITE_KEY
  ? new Analytics(environment.SEGMENT_WRITE_KEY)
  : null;

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

export const trackSegmentEvent = ({
  active,
  event,
  properties: originalProperties,
  user,
}: TrackSegmentEvent): void => {
  if (!analytics) return;

  const properties = { ...originalProperties };
  if (user.email) properties.email = user.email;

  analytics.track({
    context: {
      // default to false
      active: !!active,
    },
    event,
    properties,
    userId: user.id,
  });
};

export const trackSegmentGroup = ({
  active,
  groupId,
  traits: originalTraits,
  user,
}: TrackSegmentGroup): void => {
  if (!analytics) return;

  const traits = { ...originalTraits };
  if (user.email) traits.email = user.email;

  analytics.group({
    context: {
      // default to false
      active: !!active,
    },
    groupId,
    traits,
    userId: user.id,
  });
};
