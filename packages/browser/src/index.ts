export { Page as PuppeteerPage } from "puppeteer";

// public API
export { click } from "./actions/click";
export { scroll } from "./actions/scroll";
export { select } from "./actions/select";
export { type } from "./actions/type";

export { Browser } from "./browser/Browser";
export { close } from "./browser/close";
export { launch, LaunchOptions } from "./browser/launch";

export { findProperty } from "./find/findProperty";
export { hasText } from "./find/hasText";

export { Page } from "./page/Page";

// internal API
export * from "./strokes";
