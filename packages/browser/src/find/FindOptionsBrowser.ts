import { FindOptions } from "@qawolf/types";
import { Browser } from "../browser/Browser";
import { Page } from "../page/Page";

export interface FindOptionsBrowser extends FindOptions {
  browser?: Browser;
  page?: Page;
}
