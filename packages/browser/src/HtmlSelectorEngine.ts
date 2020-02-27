import { selectors } from "playwright-core";
import { QAWOLF_WEB_SCRIPT } from "./page/buildScript";

const createHtmlSelectorEngine = () => {
  return {
    name: "html",

    create(root: any, target: any) {
      // unclear if this is necessary
      return undefined;
    },

    query(root: any, selector: any) {
      console.log((window as any).qawolf);
      // findHtml...
      return root.querySelector(selector);
    },

    queryAll(root: any, selector: any) {
      return Array.from(root.querySelectorAll(selector));
    }
  };
};

export const registerHtmlSelector = () => {
  selectors._sources.push(QAWOLF_WEB_SCRIPT);
  selectors._generation++;
  return selectors.register(createHtmlSelectorEngine);
};
