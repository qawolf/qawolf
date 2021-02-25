import React from "react";
import ExternalLink from "./ExternalLink";

type Props = {
  browser?: boolean;
  context?: boolean;
  devices?: boolean;
  launch?: boolean;
  newContext?: boolean;
  page?: boolean;
  permission?: boolean;
};

const options = {
  browser: {
    href: "https://playwright.dev/docs/api/class-browser",
    text: "Browser",
  },
  context: {
    href: "https://playwright.dev/docs/api/class-browsercontext",
    text: "Context",
  },
  devices: {
    href:
      "https://github.com/microsoft/playwright/blob/v1.8.0/src/server/deviceDescriptors.js",
    text: "devices",
  },
  launch: {
    href:
      "https://playwright.dev/docs/api/class-browsertype#browsertypelaunchoptions",
    text: "launch",
  },
  newContext: {
    href:
      "https://playwright.dev/docs/api/class-browser#browsernewcontextoptions",
    text: "newContext",
  },
  page: {
    href: "https://playwright.dev/docs/api/class-page",
    text: "Page",
  },
  permission: {
    href:
      "https://playwright.dev/docs/api/class-browsercontext#browsercontextgrantpermissionspermissions-options",
    text: "permission",
  },
};

export default function Playwright(props: Props): JSX.Element {
  const key = Object.keys(props)[0];
  const { href, text } = options[key];
  return <ExternalLink href={href}>{text}</ExternalLink>;
}
