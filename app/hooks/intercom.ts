/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";

import { isServer } from "../lib/detection";
import { routes } from "../lib/routes";

const hasIntercom = !isServer() && (window as any).Intercom;
const hideRoutes = [routes.guides];

const shouldInclude = (): boolean => {
  if (isServer() || !hasIntercom) return false;

  return !hideRoutes.some((r) => window.location.pathname.includes(r));
};

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
  if (!shouldInclude()) return;

  (window as any).Intercom("boot", {
    ...bootOptions,
    email,
  });
};

export const useBootIntercom = (): void => {
  const isBooted = useRef(false);
  const { asPath } = useRouter();

  useEffect(() => {
    if (!shouldInclude()) return;

    if (isBooted.current) {
      // update it when the path changes
      (window as any).Intercom("update");
    } else {
      (window as any).Intercom("boot", bootOptions);
      isBooted.current = true;
    }
  }, [asPath]);
};
