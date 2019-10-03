import { Size } from "../browser/device";
import { CONFIG } from "../config";
import { BrowserStep, Job } from "../types";

export const loginSteps: BrowserStep[] = [
  {
    locator: {
      xpath: '//*[@id="username"]'
    },
    sourceEventId: 11,
    type: "type",
    value: "tomsmith"
  },
  {
    locator: {
      xpath: '//*[@id="password"]'
    },
    sourceEventId: 12,
    type: "type",
    value: "SuperSecretPassword!"
  },
  {
    locator: {
      xpath: '//*[@id="login"]/button'
    },
    sourceEventId: 13,
    type: "click"
  }
];

export const loginJob: Job = {
  name: "Log in",
  size: "desktop" as Size,
  steps: loginSteps,
  url: `${CONFIG.testUrl}/login`
};

export const redirectJob: Job = {
  name: "Redirect",
  size: "desktop" as Size,
  steps: [
    {
      locator: {
        xpath: '//*[@id="content"]/ul/li[32]/a'
      },
      sourceEventId: 11,
      type: "click"
    },
    {
      locator: {
        xpath: '//*[@id="redirect"]'
      },
      sourceEventId: 12,
      type: "click"
    }
  ],
  url: CONFIG.testUrl
};

export const windowsJob: Job = {
  name: "Multiple windows",
  size: "desktop" as Size,
  steps: [
    // open two windows
    {
      locator: {
        xpath: '//*[@id="content"]/div/a'
      },
      pageId: 0,
      sourceEventId: 11,
      type: "click"
    },
    {
      locator: {
        xpath: '//*[@id="content"]/div/a'
      },
      pageId: 0,
      sourceEventId: 12,
      type: "click"
    }
  ],
  url: `${CONFIG.testUrl}/windows`
};
