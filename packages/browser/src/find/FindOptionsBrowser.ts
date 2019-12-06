import { FindOptions } from "@qawolf/types";
import { DecoratedBrowser } from "../browser/Browser";
import { DecoratedPage } from "../page/Page";

export interface FindOptionsBrowser extends FindOptions {
  browser?: DecoratedBrowser;
  page?: DecoratedPage;
}
