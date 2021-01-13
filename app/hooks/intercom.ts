/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRouter } from "next/router";
import { useEffect } from "react";

const intercomAppId = process.env.NEXT_PUBLIC_INTERCOM_APP_ID;

const bootOptions = {
  app_id: intercomAppId,
  custom_launcher_selector: ".open-intercom",
};

export const resetIntercom = (): void => {
  if (!intercomAppId) return;

  (window as any).Intercom("shutdown");
  (window as any).Intercom("boot", bootOptions);
};

export const updateIntercomUser = (email: string): void => {
  if (!intercomAppId) return;

  (window as any).Intercom("boot", {
    ...bootOptions,
    email,
  });
};

export const useBootIntercom = (): void => {
  const { asPath } = useRouter();

  useEffect(() => {
    if (!intercomAppId) return;

    (window as any).Intercom("boot", bootOptions);
  }, []);

  useEffect(() => {
    if (!intercomAppId) return;

    (window as any).Intercom("update");
  }, [asPath]);
};
