import { Size } from "../browser/device";
import { CONFIG } from "../config";
import { BrowserStep, Job } from "../types";

export const loginSteps: BrowserStep[] = [
  {
    action: "type",
    locator: {
      xpath: '//*[@id="username"]'
    },
    value: "tomsmith"
  },
  {
    action: "type",
    locator: {
      xpath: '//*[@id="password"]'
    },
    value: "SuperSecretPassword!"
  },
  {
    action: "click",
    locator: {
      xpath: '//*[@id="login"]/button'
    }
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
      action: "click",
      locator: {
        xpath: '//*[@id="content"]/ul/li[32]/a'
      }
    },
    {
      action: "click",
      locator: {
        xpath: '//*[@id="redirect"]'
      }
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
      action: "click",
      locator: {
        xpath: '//*[@id="content"]/div/a'
      },
      pageId: 0
    },
    {
      action: "click",
      locator: {
        xpath: '//*[@id="content"]/div/a'
      },
      pageId: 0
    }
  ],
  url: `${CONFIG.testUrl}/windows`
};
