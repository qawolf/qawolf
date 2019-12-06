import { registry } from "./registry";

export const close = async () => {
  /**
   * Close all browsers
   */
  await Promise.all(registry.browsers.map(browser => browser.close()));
  registry.clear();
};
