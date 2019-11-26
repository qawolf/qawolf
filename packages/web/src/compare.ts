import { Doc, DocTarget } from "@qawolf/types";
import { cleanText } from "./lang";

export interface Comparison {
  [K: string]: boolean | Comparison;
}

export interface ComparisonCount {
  matches: string[];
  total: number;
}

// // TODO strong matches
// // can strong matches be on ancestors instead of the target?

export type DocMatch = {
  nodeComparison: Comparison;
  // ancestorsComparison: Comparison[];
  percent: number;
  strongKeys: string[];
};

// TODO strong matches:
// data attribute
// label
// action === click & xpath === /html || /html/body
const strongMatchKeys = [
  "alt",
  "content",
  "id",
  // TODO inline labels w/ serialization
  "labels",
  "name",
  "placeholder",
  "src",
  "title"
];

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

export const compareDoc = (a: Doc, b: Doc | null): Comparison => {
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

export const matchTarget = (a: DocTarget, b: DocTarget): DocMatch => {
  const nodeComparison = compareDoc(a.node, b.node);
  const nodeCount = countComparison(nodeComparison);

  const strongKeys = nodeCount.matches.filter(m => strongMatchKeys.includes(m));

  // TODO ancestors ...
  const percent = (nodeCount.matches.length / nodeCount.total) * 100;
  return { nodeComparison, percent, strongKeys };
};
