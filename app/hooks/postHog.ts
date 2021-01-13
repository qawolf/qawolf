/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";

import { isServer } from "../lib/detection";
import { User } from "../lib/types";

export const sendPostHogEvent = (event: string): void => {
  if (isServer() || !(window as any).posthog) return;

  (window as any).posthog.capture(event);
};

export const useIdentifyPostHog = (user: User | null): void => {
  useEffect(() => {
    if (isServer() || !(window as any).posthog || !user) return;

    (window as any).posthog.identify(user.id);
    (window as any).posthog.people.set({ email: user.email });
  }, [user]);
};

export const useSendPostHogEvent = (event: string): void => {
  useEffect(() => {
    sendPostHogEvent(event);
  }, [event]);
};
