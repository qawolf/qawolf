/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRouter } from "next/router";
import { useEffect } from "react";

import { isServer } from "../lib/detection";

const hasIntercom = !isServer() && (window as any).Intercom;

const bootOptions = {
  app_id: process.env.NEXT_PUBLIC_INTERCOM_APP_ID,
  custom_launcher_selector: ".open-intercom",
};

export const resetIntercom = (): void => {
  if (!hasIntercom) return;

  (window as any).Intercom("shutdown");
  (window as any).Intercom("boot", bootOptions);
};

export const updateIntercomUser = (email: string): void => {
  if (!hasIntercom) return;

  (window as any).Intercom("boot", {
    ...bootOptions,
    email,
  });
};

export const useBootIntercom = (): void => {
  const { asPath } = useRouter();

  useEffect(() => {
    if (!hasIntercom) return;

    (window as any).Intercom("boot", bootOptions);
  }, []);

  useEffect(() => {
    if (!hasIntercom) return;

    (window as any).Intercom("update");
  }, [asPath]);
};
