import * as Sentry from "@sentry/browser";
import { Integrations } from "@sentry/tracing";

import { isServer } from "./detection";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn && !isServer()) {
  Sentry.init({
    dsn,
    integrations: [new Integrations.BrowserTracing()],
    tracesSampleRate: 1.0,
  });
}

export const updateSentryUser = (email: string | null): void => {
  if (!dsn) return;

  if (email) {
    Sentry.setUser({ email });
  } else {
    Sentry.configureScope((scope) => scope.setUser(null));
  }
};
