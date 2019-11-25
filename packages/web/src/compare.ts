import { IDoc } from "html-parse-stringify";
import { cleanText } from "./lang";

export interface Comparison {
  [K: string]: boolean | Comparison;
}

export interface ComparisonCount {
  matches: string[];
  total: number;
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
      result[`children[${index}]`] = compareDoc(
        childA,
        b ? b.children[index] : null
      );
    });
  }

  result.name = b ? a.name === b.name : false;

  return result;
};

export const countComparison = (
  comparison: Comparison,
  prefix: string = ""
): ComparisonCount => {
  const count: ComparisonCount = {
    matches: [],
    total: 0
  };

  Object.keys(comparison).forEach(k => {
    // prefix the key with the provided prefix
    const key = prefix + k;
    const value = comparison[k];
    if (typeof value === "boolean") {
      count.total += 1;
      if (value === true) count.matches.push(key);
    } else {
      // append "." to the prefix
      // eg. children[0]class -> children[0].class
      const subcount = countComparison(value, key + ".");
      count.matches = count.matches.concat(subcount.matches);
      count.total += subcount.total;
    }
  });

  return count;
};

// TODO: make Target more explicit -> HtmlTarget, DocTarget
// // { html: "<a>sup</a>", ancestors: ["", ""] }

// // TODO strong matches
// // can strong matches be on ancestors instead of the target?

// type Match = {};

// export const matchDocs = (aDocs: IDoc[], bDocs: IDoc[]): Match => {
//   aDocs.forEach((aDoc, index) => {
//     const bDoc = bDocs[index];
//     const comparison = compareDoc(aDoc, bDoc);
//     const reduced = countComparison(comparison);
//   });
// };
