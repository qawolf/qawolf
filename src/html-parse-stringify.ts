/* eslint-disable */
declare module 'html-parse-stringify' {
  interface Doc {
    attrs?: any;
    children?: Doc[];
    content?: string;
    name?: string;
    type: string;
    voidElement?: boolean;
  }

  export interface IOptions {
    components: string[];
  }

  export function parse_tag(tag: string): Doc;

  export function parse(html: string, options?: IOptions): Array<any>;

  export function stringify(docs: Doc[]): string;
}
