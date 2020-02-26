import { selectors } from "playwright-core";

const specialFns = {
  dosomething() {
    console.log("DID IT");
  }
};

const createHtmlSelectorEngine = () => {
  return {
    name: "html",

    // Creates a selector that matches given target when queried at the root.
    // Can return undefined if unable to create one.
    create(root: any, target: any) {
      // unclear if this is necessary
      return undefined;
    },

    // Returns the first element matching given selector in the root's subtree.
    query(root: any, selector: any) {
      debugger;
      console.log((window as any).qawolf);
      return root.querySelector(selector);
    },

    // Returns all elements matching given selector in the root's subtree.
    queryAll(root: any, selector: any) {
      return Array.from(root.querySelectorAll(selector));
    }
  };
};

export const registerHtmlSelector = () => {
  selectors._sources.push("window.hello = { sup: 'yo' }");
  selectors.register(createHtmlSelectorEngine);
};

// this._sources.push(source);
// ++this._generation;
