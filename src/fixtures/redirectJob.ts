import { Job } from "../types";

export const redirectJob: Job = {
  name: "redirect",
  size: "desktop",
  steps: [
    {
      action: "click",
      target: {
        xpath: '//*[@id="content"]/ul/li[32]/a'
      }
    },
    {
      action: "click",
      target: {
        xpath: '//*[@id="redirect"]'
      }
    }
  ],
  url: "http://localhost:5000/"
};
