import { DecoratedBrowser } from "./Browser";

class Registry {
  private _browsers: DecoratedBrowser[] = [];

  public get browsers() {
    return this._browsers;
  }

  public single() {
    if (this._browsers.length !== 1) {
      throw new Error(
        "You must specify the browser if there is not only 1 created"
      );
    }

    return this._browsers[0];
  }

  public register(browser: DecoratedBrowser) {
    this._browsers.push(browser);
  }
}

export const registry = new Registry();
