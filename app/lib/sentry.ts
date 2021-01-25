import * as Sentry from "@sentry/browser";
import { CaptureConsole } from "@sentry/integrations";
import { Integrations } from "@sentry/tracing";

import { isServer } from "./detection";

type UpdateSentryUser = {
  email: string | null;
  id?: string | null;
};

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn && !isServer()) {
  Sentry.init({
    dsn,
    integrations: [
      new Integrations.BrowserTracing(),
      new CaptureConsole({ levels: ["error", "warn"] }),
    ],
    tracesSampleRate: 1.0,
  });
}

export const updateSentryUser = ({ email, id }: UpdateSentryUser): void => {
  if (!dsn) return;

  if (email) {
    Sentry.setUser({ email, id });
  } else {
    Sentry.configureScope((scope) => scope.setUser(null));
  }
};
