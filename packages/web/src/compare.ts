import { parse, IDoc } from "html-parse-stringify";
import "./html-parse-stringify";
import { cleanText } from "./lang";

export interface Comparison {
  [K: string]: boolean | Comparison;
}

export const compareAttributes = (a: any, b: any): Comparison => {
  const result: Comparison = {};

  Object.keys(a || {}).forEach(key => {
    if (key === "class") {
      const aClasses: string[] = (a[key] || "").split(" ");
      const bClasses: string[] = (b[key] || "").split(" ");

      aClasses.forEach(name => {
        result[`class.${name}`] = bClasses.includes(name);
      });
    } else {
      result[key] = a[key] === b[key];
    }
  });

  return result;
};

export const compareContent = (
  a: string | undefined,
  b: string | undefined
) => {
  return cleanText(a || "") === cleanText(b || "");
};

export const compareDoc = (a: IDoc, b: IDoc | null): Comparison => {
  const result: Comparison = compareAttributes(a.attrs, b ? b.attrs : {});

  if (a.content) {
    result.content = compareContent(a.content, b ? b.content : "");
  }

  if (a.children) {
    a.children.forEach((childA, index) => {
      result[`child[${index}]`] = compareDoc(
        childA,
        b ? b.children[index] : null
      );
    });
  }

  result.name = b ? a.name === b.name : false;

  return result;
};

export const parseHtml = (html: string): IDoc => {
  const result = parse(html);
  if (result.length !== 1) {
    throw new Error("parseHtml: was not passed a single node string");
  }

  return result[0];
};
