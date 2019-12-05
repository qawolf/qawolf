import { Browser } from "./Browser";

class Registry {
  private _browsers: Browser[] = [];

  public get browsers() {
    return this._browsers;
  }

  public register(browser: Browser) {
    this._browsers.push(browser);
  }
}

export const registry = new Registry();
