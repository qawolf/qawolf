import { Job } from "../types";

export const multipleWindowsJob: Job = {
  name: "multiple_windows",
  size: "desktop",
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
  url: "http://localhost:5000/windows"
};
