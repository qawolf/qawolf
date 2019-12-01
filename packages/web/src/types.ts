declare module "html-parse-stringify" {
  import { Doc } from "@qawolf/types";

  export interface IOptions {
    components: string[];
  }

  export function parse_tag(tag: string): Doc;

  export function parse(html: string, options?: IOptions): Array<any>;

  export function stringify(docs: Doc[]): string;
}
