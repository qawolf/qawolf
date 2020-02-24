import { BrowserContext } from "playwright-core";
import { registry } from "@qawolf/repl";
import { pageEventRegistry } from "./page/PageEventRegistry";

export const register = (context: BrowserContext) => {
  // decorate? pages ($page)
  // recorder registry
  // pageEventRegistry.register();

  // TODO capture logs?

  // XXX move repl helper to jest-playwright
  registry.setContextKey("browser", context);
};
