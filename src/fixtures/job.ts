import { BrowserStep, Job } from "../types";
import { CONFIG } from "../config";

export const loginSteps: BrowserStep[] = [
  {
    locator: {
      xpath: '//*[@id="username"]'
    },
    type: "type",
    value: "tomsmith"
  },
  {
    locator: {
      xpath: '//*[@id="password"]'
    },
    type: "type",
    value: "SuperSecretPassword!"
  },
  {
    locator: {
      xpath: '//*[@id="login"]/button'
    },
    type: "click"
  }
];

export const loginJob: Job = {
  name: "Log in",
  steps: loginSteps,
  url: `${CONFIG.testUrl}/login`
};

export const redirectJob: Job = {
  name: "Redirect",
  steps: [
    {
      locator: {
        xpath: '//*[@id="content"]/ul/li[32]/a'
      },
      type: "click"
    },
    {
      locator: {
        xpath: '//*[@id="redirect"]'
      },
      type: "click"
    }
  ],
  url: CONFIG.testUrl
};
