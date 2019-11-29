import { Doc, DocSelector } from "@qawolf/types";
import { cleanText } from "../lang";

type BooleanDict = { [K: string]: boolean };

export type DocComparison = {
  attrs: BooleanDict;
  children: DocComparison[];
  content?: boolean;
  matches: string[];
  name: boolean;
  total: number;
};

export type DocMatch = {
  comparison: {
    node: DocComparison;
    ancestors: DocComparison[];
  };
  percent: number;
  strongKeys: string[];
};

const strongMatchKeys = [
  "alt",
  "children[0].content",
  "id",
  "name",
  "placeholder",
  "src",
  "title"
];

export const compareAttributes = (a: any, b: any) => {
  const attrs: BooleanDict = {};
  const matches: string[] = [];
  let total = 0;

  Object.keys(a || {}).forEach(key => {
    const bValue = (b || {})[key];

    if (key === "class") {
      const aClasses: string[] = (a[key] || "").split(" ");
      const bClasses: string[] = (bValue || "").split(" ");

      aClasses.forEach(name => {
        const matchKey = `class.${name}`;
        attrs[matchKey] = bClasses.includes(name);

        total += 1;
        if (attrs[matchKey]) matches.push(matchKey);
      });
    } else {
      attrs[key] = a[key] === bValue;

      total += 1;
      if (attrs[key]) matches.push(key);
    }
  });

  return { attrs, matches, total };
};

export const compareContent = (
  a: string | undefined,
  b: string | undefined
): boolean => {
  return cleanText(a || "") === cleanText(b || "");
};

export const compareDoc = (a: Doc, b: Doc | null): DocComparison => {
  const attrComparison = compareAttributes(a.attrs, b ? b.attrs : {});

  const result: DocComparison = {
    attrs: attrComparison.attrs,
    children: [],
    matches: attrComparison.matches,
    name: b ? a.name === b.name : false,
    total: attrComparison.total + 1 // name
  };

  if (result.name) {
    // name it tag to not conflict with attrs.name
    result.matches.push("tag");
  }

  if (a.content) {
    result.content = compareContent(a.content, b ? b.content : "");
    result.total += 1;

    if (result.content) {
      result.matches.push("content");
    }
  }

  if (a.children) {
    a.children.forEach((childA, index) => {
      const childComparison = compareDoc(
        childA,
        b && b.children ? b.children[index] : null
      );
      result.children.push(childComparison);

      result.matches = result.matches.concat(
        childComparison.matches.map(key => `children[${index}].${key}`)
      );
      result.total += childComparison.total;
    });
  }

  return result;
};

export const matchTarget = (
  a: DocSelector,
  b: DocSelector,
  dataAttribute?: string
): DocMatch => {
  // TODO if body/html return 100% --
  const ancestorsComparison: DocComparison[] = [];

  const nodeComparison = compareDoc(a.node, b.node);
  const strongKeys = nodeComparison.matches.filter(
    m => strongMatchKeys.includes(m) || dataAttribute === m
  );

  let matches = nodeComparison.matches.length;
  let total = nodeComparison.total;

  a.ancestors.forEach((ancestor, index) => {
    const ancestorComparison = compareDoc(ancestor, b.ancestors[index]);
    ancestorsComparison.push(ancestorComparison);

    // half the value of ancestor matches every level
    const weight = 1 / (index + 1 * 2);
    matches += ancestorComparison.matches.length * weight;
    total += ancestorComparison.total * weight;
  });

  const percent = (matches / total) * 100;
  return {
    comparison: { node: nodeComparison, ancestors: ancestorsComparison },
    percent,
    strongKeys
  };
};
